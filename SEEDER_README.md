# 🌱 Database Seeder - Mobile HRD System

## 📋 Overview
Seeder ini akan mengisi database dengan data lengkap untuk testing aplikasi Mobile HRD, termasuk:

- **8 User** (2 HR + 6 Karyawan) dengan data lengkap
- **13 Departemen** dan **14 Jabatan**
- **KPI & Rating** untuk setiap karyawan (multi-year data)
- **8 Pelatihan** dengan peserta dan skor
- **5 Penghargaan** untuk karyawan terpilih

## 🚀 Cara Menjalankan Seeder

### 1. Pastikan Database MySQL Running
```bash
# Pastikan XAMPP/WAMP/LAMP running
# Atau MySQL service running
```

### 2. Set Environment Variables
Buat file `.env` di folder `express/`:
```env
DATABASE_URL="mysql://root:@localhost:3306/mobile_hrd_db"
JWT_SECRET="your-secret-key-here"
```

### 3. Jalankan Seeder
```bash
cd express
npm run seed
```

Atau manual:
```bash
cd express
npx prisma migrate dev
npx prisma db seed
```

## 👥 Test Accounts

### HR Accounts (Full Access)
| Email | Password | Role | Nama |
|-------|----------|------|------|
| hr.manager@company.com | hr123 | HR | Sarah Johnson |
| hr.specialist@company.com | hr123 | HR | Michael Chen |

### Karyawan Accounts (Limited Access)
| Email | Password | Role | Nama | Departemen | Jabatan |
|-------|----------|------|------|------------|---------|
| john.doe@company.com | karyawan123 | KARYAWAN | John Doe | Technology | Developer |
| jane.smith@company.com | karyawan123 | KARYAWAN | Jane Smith | Sales & Marketing | Manager |
| budi.santoso@company.com | karyawan123 | KARYAWAN | Budi Santoso | Finance | Analyst |
| sari.dewi@company.com | karyawan123 | KARYAWAN | Sari Dewi | Technology | Designer |
| ahmad.rizki@company.com | karyawan123 | KARYAWAN | Ahmad Rizki | Operations | Supervisor |
| lisa.wong@company.com | karyawan123 | KARYAWAN | Lisa Wong | Analytics | Lead |

## 📊 Data yang Disediakan

### Karyawan Data
- ✅ **Profil Lengkap**: Nama, gender, alamat, no. telepon, tanggal lahir, pendidikan
- ✅ **Data Kerja**: Tanggal masuk, jalur rekrutmen, departemen, jabatan
- ✅ **Perhitungan Otomatis**: Umur dan masa kerja

### KPI & Rating
- ✅ **Multi-year Data**: 2020-2024 untuk beberapa karyawan
- ✅ **Realistic Scores**: KPI (78-96.5), Rating (3.8-4.8)
- ✅ **Detailed Notes**: Catatan performa untuk setiap tahun

### Pelatihan
- ✅ **8 Pelatihan Berbeda**: Leadership, Analytics, Marketing, dll.
- ✅ **Peserta & Skor**: Setiap pelatihan memiliki peserta dengan skor
- ✅ **Lokasi & Tanggal**: Data lengkap untuk setiap pelatihan

### Penghargaan
- ✅ **5 Penghargaan**: Employee of the Year, Best Team Player, dll.
- ✅ **Multiple Winners**: Beberapa karyawan mendapat penghargaan

## 🔐 Security Features

### Role-Based Access Control
- **HR Role**: Bisa melihat semua data karyawan, mengelola master data
- **Karyawan Role**: Hanya bisa melihat data milik sendiri

### Endpoint Protection
- **`/api/karyawan/me`**: Data karyawan yang login
- **`/api/karyawan`**: Semua data (HR only)
- **`/api/pelatihan/my`**: Pelatihan karyawan yang login
- **`/api/pelatihan`**: Semua pelatihan (HR only)

## 🧪 Testing

### 1. Test Login
```bash
# Test HR login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"hr.manager@company.com","password":"hr123"}'

# Test Karyawan login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@company.com","password":"karyawan123"}'
```

### 2. Test Data Access
```bash
# Get karyawan data (with token)
curl -X GET http://localhost:3000/api/karyawan/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get all karyawan (HR only)
curl -X GET http://localhost:3000/api/karyawan \
  -H "Authorization: Bearer HR_TOKEN"
```

## 📱 Mobile App Testing

1. **Start Backend**: `npm run dev` di folder `express/`
2. **Start Mobile**: `npm start` di folder `mobilehrd/`
3. **Login** dengan salah satu test account
4. **Verify Data**: Pastikan data yang ditampilkan sesuai dengan user yang login

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check MySQL service
# Verify DATABASE_URL in .env
# Check if database exists
```

### Seeder Error
```bash
# Reset database
npx prisma migrate reset
npm run seed
```

### Migration Error
```bash
# Generate new migration
npx prisma migrate dev --name add_unique_constraints
```

## 📈 Next Steps

1. **Test Mobile App**: Login dengan berbagai account
2. **Verify Data Filtering**: Pastikan data ter-filter berdasarkan user
3. **Test Role Access**: Pastikan HR bisa akses semua, karyawan hanya milik sendiri
4. **Add More Data**: Jika perlu, tambahkan data karyawan lain

---

**Happy Testing! 🎉**

