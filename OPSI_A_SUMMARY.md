# Opsi A Implementation Summary - Jabatan ↔ Departemen (One-to-Many)

## ✅ Implementation Complete

Struktur **One-to-Many** antara `jabatan` dan `departemen` telah berhasil diimplementasi.

## 📁 Files Modified/Created

### 1. Schema & Migration
- ✅ **`prisma/schema.prisma`**
  - Added `departemenId` foreign key to `jabatan`
  - Added `level`, `deskripsi` fields
  - Changed unique constraint: `(nama, departemenId)` instead of global `nama`
  - Added index on `departemenId`

### 2. Seed Data
- ✅ **`prisma/seed.js`**
  - Replaced generic jabatan (4 roles) with **60+ department-specific roles**
  - Each role mapped to correct departemen with level
  - Covers 8 departments: Technology, Sales & Marketing, HR, Operations, Analytics, R&D, Procurement, Finance

### 3. Backend API
- ✅ **`src/router/data-master/jabatan.js`**
  - **GET** `/data-master/jabatan`: Added `?departemenId=` filter support
  - **POST** `/data-master/jabatan`: Now requires `departemenId`, supports `level` & `deskripsi`
  - **PUT** `/data-master/jabatan/:id`: Can update `departemenId`, `level`, `deskripsi`
  - All endpoints now include `departemen` relation in response

### 4. Documentation
- ✅ **`MIGRATION_JABATAN.md`**
  - Complete migration guide with before/after schema
  - Step-by-step migration instructions
  - API changes documentation
  - Frontend integration examples
  - Rollback plan
  
- ✅ **`SEEDER_README.md`** (updated)
  - Added Opsi A changes section
  - Listed all department roles
  
- ✅ **`scripts/migrate-jabatan-data.js`**
  - Helper script to migrate existing jabatan data
  - Manual mapping template
  - Auto-infer level from job title

## 🚀 Quick Start

### For NEW Projects (No existing data)
```bash
cd backendhrd

# 1. Create migration
npx prisma migrate dev --name add_departemenId_to_jabatan

# 2. Run seed
npm run seed

# 3. Verify
npx prisma studio
```

### For EXISTING Projects (Has jabatan data)
```bash
cd backendhrd

# 1. Backup database first!
mysqldump -u root -p backendhrd > backup_$(date +%Y%m%d).sql

# 2. Update mapping in scripts/migrate-jabatan-data.js
# Edit JABATAN_TO_DEPT_MAPPING to match your data

# 3. Run migration script
node scripts/migrate-jabatan-data.js

# 4. Create Prisma migration
npx prisma migrate dev --name add_departemenId_to_jabatan

# 5. (Optional) Run seed to add more roles
npm run seed
```

## 🔌 API Usage

### Get All Jabatan
```bash
GET /data-master/jabatan
```

**Response:**
```json
{
  "status": 200,
  "data": [
    {
      "id": "uuid",
      "nama": "Software Engineer",
      "level": "Staff",
      "departemenId": "dept-uuid",
      "deskripsi": null,
      "departemen": {
        "id": "dept-uuid",
        "nama": "Technology"
      }
    }
  ]
}
```

### Get Jabatan by Department
```bash
GET /data-master/jabatan?departemenId=dept-uuid
```

### Create Jabatan
```bash
POST /data-master/jabatan
Content-Type: application/json

{
  "nama": "Senior DevOps Engineer",
  "departemenId": "dept-uuid",
  "level": "Senior",
  "deskripsi": "Manage infrastructure and deployment"
}
```

### Update Jabatan
```bash
PUT /data-master/jabatan/:id
Content-Type: application/json

{
  "nama": "Lead DevOps Engineer",
  "level": "Lead"
}
```

## 🎨 Frontend Integration

### services/api.ts (Add/Update)
```typescript
export const jabatanAPI = {
  getAll: (params?: { departemenId?: string }) => 
    api.get('/data-master/jabatan', { params }),
  
  getByDepartemen: (departemenId: string) =>
    api.get('/data-master/jabatan', { params: { departemenId } }),
  
  create: (data: { 
    nama: string; 
    departemenId: string; 
    level?: string; 
    deskripsi?: string 
  }) => api.post('/data-master/jabatan', data),
  
  update: (id: string, data: Partial<Jabatan>) =>
    api.put(`/data-master/jabatan/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/data-master/jabatan/${id}`)
};
```

### Dependent Dropdown (Karyawan Form Example)
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
  <>
    <Select 
      value={selectedDeptId} 
      onChange={(e) => {
        setSelectedDeptId(e.target.value);
        setSelectedJabatanId(''); // Reset when dept changes
      }}
    >
      {departments.map(d => 
        <option key={d.id} value={d.id}>{d.nama}</option>
      )}
    </Select>

    <Select 
      value={selectedJabatanId} 
      onChange={(e) => setSelectedJabatanId(e.target.value)}
      disabled={!selectedDeptId}
    >
      {jabatanOptions.map(j => (
        <option key={j.id} value={j.id}>
          {j.nama} {j.level && `(${j.level})`}
        </option>
      ))}
    </Select>
  </>
);
```

## 📊 Seed Data Summary

| Departemen | Jumlah Jabatan | Levels |
|------------|----------------|--------|
| Technology | 9 | Junior → Manager |
| Sales & Marketing | 7 | Junior → Manager |
| HR | 6 | Junior → Manager |
| Operations | 5 | Junior → Manager |
| Analytics | 5 | Staff → Manager |
| R&D | 6 | Junior → Manager |
| Procurement | 5 | Junior → Manager |
| Finance | 6 | Junior → Manager |
| **TOTAL** | **49** | All levels |

## 🔍 Key Benefits

✅ **Filter by Department**: Easily get roles for specific department  
✅ **Level Support**: Track seniority (Junior/Staff/Senior/Lead/Manager/Director)  
✅ **No Name Conflicts**: Same role name allowed in different departments  
✅ **Cleaner CRUD**: Departemen → Jabatan → Karyawan hierarchy  
✅ **Scalable**: Easy to add new roles per department  

## ⚠️ Important Notes

1. **departemenId is REQUIRED** when creating jabatan
2. **Unique constraint**: `(nama, departemenId)` — can't have duplicate name in same dept
3. **Cascade**: Deleting departemen will fail if has jabatan (add `onDelete: Cascade` if needed)
4. **Frontend**: Always filter jabatan by selected departemen in Karyawan forms

## 📚 Full Documentation

- **Migration Guide**: See `MIGRATION_JABATAN.md`
- **API Details**: See `MIGRATION_JABATAN.md` → API Changes section
- **Seed Info**: See `SEEDER_README.md`

## 🛠️ Troubleshooting

### Error: "departemenId is required"
Make sure to pass `departemenId` in POST/PUT requests.

### Error: "Jabatan dengan nama ini sudah ada di departemen tersebut"
You're trying to create duplicate `(nama, departemenId)`. Either:
- Use different name
- Use different departemenId
- Update existing record instead

### Migration fails with constraint error
Existing jabatan data doesn't have `departemenId`. Run `scripts/migrate-jabatan-data.js` first.

### Can't find jabatan for department
Check filter: `GET /data-master/jabatan?departemenId=correct-uuid`

---

**Status**: ✅ Ready for production  
**Next Step**: Run migration → Update frontend → Test CRUD flows
