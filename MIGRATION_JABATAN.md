# Migration Guide: Jabatan ↔ Departemen (One-to-Many)

## Overview
Struktur database telah diubah dari jabatan sebagai entitas independen menjadi **one-to-many relationship** dengan departemen. Setiap jabatan sekarang terikat ke satu departemen.

## Perubahan Schema

### Before (Old)
```prisma
model jabatan {
  id        String     @id
  nama      String     @unique
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  karyawan  karyawan[]
}
```

### After (New - Opsi A)
```prisma
model jabatan {
  id           String     @id
  nama         String
  level        String?    // "Junior", "Staff", "Senior", "Lead", "Manager", "Director"
  departemenId String
  deskripsi    String?
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  departemen   departemen @relation(fields: [departemenId], references: [id])
  karyawan     karyawan[]

  @@unique([nama, departemenId])  // Nama jabatan bisa sama, asalkan di departemen berbeda
  @@index([departemenId])
}
```

## Key Changes
1. **`departemenId` (required)**: Setiap jabatan harus terikat ke satu departemen
2. **`level` (optional)**: Level senioritas (Junior/Staff/Senior/Lead/Manager/Director)
3. **`deskripsi` (optional)**: Deskripsi pekerjaan
4. **Unique constraint**: `(nama, departemenId)` — jabatan dengan nama sama boleh ada di departemen berbeda
5. **No more global unique `nama`**: Jabatan "Manager" bisa ada di Technology, HR, Finance, dll

## Migration Steps

### Step 1: Backup Database
```bash
# Backup database sebelum migrasi
mysqldump -u root -p backendhrd > backup_before_migration.sql
```

### Step 2: Create Migration
```bash
cd backendhrd
npx prisma migrate dev --name add_departemenId_to_jabatan
```

Prisma akan:
- Menambahkan kolom `departemenId`, `level`, `deskripsi`
- Menghapus unique constraint pada `nama`
- Menambahkan unique constraint pada `(nama, departemenId)`
- Membuat foreign key ke `departemen`

⚠️ **PENTING**: Migration akan GAGAL jika ada data jabatan existing tanpa departemenId.

### Step 3: Handle Existing Data

#### Option A: Manual Mapping (Recommended)
Jika Anda punya data jabatan existing, tentukan mapping departemen secara manual:

```javascript
// scripts/migrate-jabatan-data.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function migrateJabatan() {
  // Mapping manual: jabatan -> departemen
  const mapping = {
    'Manager': 'HR',           // Sesuaikan dengan data Anda
    'Staff': 'Technology',
    'Supervisor': 'Operations',
    'Developer': 'Technology',
  };

  const jabatanList = await prisma.jabatan.findMany();
  const departemenList = await prisma.departemen.findMany();

  for (const jab of jabatanList) {
    const targetDeptName = mapping[jab.nama] || 'HR'; // Default ke HR jika tidak ada mapping
    const dept = departemenList.find(d => d.nama === targetDeptName);
    
    if (dept) {
      await prisma.jabatan.update({
        where: { id: jab.id },
        data: { departemenId: dept.id }
      });
      console.log(`✅ ${jab.nama} -> ${dept.nama}`);
    }
  }
}

migrateJabatan();
```

Run:
```bash
node scripts/migrate-jabatan-data.js
```

#### Option B: Drop & Reseed (Jika data test/development)
Jika data existing tidak penting:
```bash
# Reset database dan seed ulang
npx prisma migrate reset --force
npm run seed
```

### Step 4: Verify Migration
```bash
# Check schema applied correctly
npx prisma db pull

# Check seed data
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.jabatan.findMany({ include: { departemen: true } })
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .finally(() => prisma.\$disconnect());
"
```

## API Changes

### GET /data-master/jabatan
**New**: Supports `departemenId` query parameter

```bash
# Get all jabatan
GET /data-master/jabatan

# Get jabatan for specific departemen
GET /data-master/jabatan?departemenId=abc-123-def
```

**Response** (updated):
```json
{
  "status": 200,
  "message": "Jabatan found",
  "data": [
    {
      "id": "uuid",
      "nama": "Software Engineer",
      "level": "Staff",
      "departemenId": "uuid",
      "deskripsi": null,
      "departemen": {
        "id": "uuid",
        "nama": "Technology"
      }
    }
  ]
}
```

### POST /data-master/jabatan
**Required fields changed**:
```json
{
  "nama": "Tech Lead",
  "departemenId": "uuid",        // REQUIRED (new)
  "level": "Lead",                // optional
  "deskripsi": "Leading tech team" // optional
}
```

### PUT /data-master/jabatan/:id
Now supports updating `departemenId`, `level`, `deskripsi`:
```json
{
  "nama": "Senior Developer",
  "departemenId": "new-dept-uuid",
  "level": "Senior",
  "deskripsi": "Updated description"
}
```

## Frontend Integration

### services/api.ts (Update)
```typescript
export const jabatanAPI = {
  getAll: (params?: { departemenId?: string }) => 
    api.get('/data-master/jabatan', { params }),
  
  getByDepartemen: (departemenId: string) =>
    api.get('/data-master/jabatan', { params: { departemenId } }),
  
  create: (data: { nama: string; departemenId: string; level?: string; deskripsi?: string }) =>
    api.post('/data-master/jabatan', data),
  
  update: (id: string, data: Partial<Jabatan>) =>
    api.put(`/data-master/jabatan/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/data-master/jabatan/${id}`)
};
```

### Dependent Dropdown Example (Karyawan Form)
```tsx
const [selectedDeptId, setSelectedDeptId] = useState('');
const [jabatanOptions, setJabatanOptions] = useState([]);

useEffect(() => {
  if (!selectedDeptId) return;
  
  jabatanAPI.getByDepartemen(selectedDeptId)
    .then(res => setJabatanOptions(res.data))
    .catch(console.error);
}, [selectedDeptId]);

return (
  <form>
    <Select 
      value={selectedDeptId} 
      onChange={(e) => {
        setSelectedDeptId(e.target.value);
        setSelectedJabatanId(''); // Reset jabatan when dept changes
      }}
    >
      {departments.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
    </Select>

    <Select 
      value={selectedJabatanId} 
      onChange={(e) => setSelectedJabatanId(e.target.value)}
      disabled={!selectedDeptId}
    >
      {jabatanOptions.map(j => (
        <option key={j.id} value={j.id}>
          {j.nama} {j.level ? `(${j.level})` : ''}
        </option>
      ))}
    </Select>
  </form>
);
```

## Handling Duplicate Names

Sekarang jabatan dengan nama sama bisa ada di departemen berbeda:
- "Manager" di HR
- "Manager" di Technology
- "Manager" di Finance

**Display in UI** (disambiguate):
```tsx
// Option 1: Show department in label
{jabatan.nama} — {jabatan.departemen.nama}

// Option 2: Show level if available
{jabatan.nama} {jabatan.level && `(${jabatan.level})`}
```

## Rollback Plan

Jika perlu rollback:
```bash
# Restore from backup
mysql -u root -p backendhrd < backup_before_migration.sql

# Or revert migration
npx prisma migrate resolve --rolled-back 20241126_add_departemenId_to_jabatan
git checkout HEAD~1 prisma/schema.prisma
npx prisma migrate dev
```

## Testing Checklist

- [ ] Migration runs successfully
- [ ] Seed script populates jabatan with departemenId
- [ ] GET /data-master/jabatan returns all jabatan with departemen data
- [ ] GET /data-master/jabatan?departemenId=X filters correctly
- [ ] POST creates jabatan with departemenId
- [ ] PUT updates jabatan fields including departemenId
- [ ] DELETE removes jabatan
- [ ] Frontend dependent dropdown works (departemen → jabatan)
- [ ] Karyawan CRUD correctly associates jabatan from selected departemen
- [ ] Duplicate jabatan names in different departments work correctly

## Support

Jika ada masalah:
1. Check migration status: `npx prisma migrate status`
2. Check logs: Error messages will indicate constraint violations
3. Verify data: Query jabatan table directly in MySQL
4. Rollback jika perlu dan coba lagi dengan mapping yang benar

---

**Next Steps**: Setelah migration sukses, update frontend UI untuk:
1. Jabatan page: Add departemen selector
2. Karyawan Create/Edit: Implement dependent dropdown
3. Dashboard: Verify jabatan filtering by departemen works correctly
