# Data Seeder - 10 Users

## Overview
Data seeder telah disesuaikan untuk mengisi database dengan 10 user saja (2 HR dan 8 karyawan) dengan data yang lebih sederhana dan tidak terlalu banyak.

## Data yang Tetap (Tidak Berubah)

### Departemen (8)
1. Technology
2. Sales & Marketing
3. HR
4. Operations
5. Analytics
6. R&D
7. Procurement
8. Finance

### Jabatan
Tetap lengkap sesuai dengan struktur awal untuk setiap departemen dengan berbagai level (Junior, Staff, Senior, Lead, Manager).

## Data Pengguna (10 Users)

### HR Accounts (2)
1. **Sarah Johnson** - HR Manager
   - Email: `hr.manager@company.com`
   - Password: `hr123`
   - Masuk: 2020-01-15
   
2. **Michael Chen** - Recruitment Specialist
   - Email: `hr.specialist@company.com`
   - Password: `hr123`
   - Masuk: 2021-03-10

### Karyawan Accounts (8)

3. **John Developer** - Software Engineer (Technology)
   - Email: `john.dev@company.com`
   - Password: `karyawan123`
   - Masuk: 2022-06-01

4. **Jane Smith** - Account Executive (Sales & Marketing)
   - Email: `jane.sales@company.com`
   - Password: `karyawan123`
   - Masuk: 2021-09-15

5. **David Wilson** - Junior Developer (Technology)
   - Email: `david.tech@company.com`
   - Password: `karyawan123`
   - Masuk: 2023-01-20

6. **Lisa Anderson** - Process Coordinator (Operations)
   - Email: `lisa.ops@company.com`
   - Password: `karyawan123`
   - Masuk: 2022-08-05

7. **Robert Martinez** - Data Analyst (Analytics)
   - Email: `robert.analyst@company.com`
   - Password: `karyawan123`
   - Masuk: 2021-05-15

8. **Emma Rodriguez** - Sales Representative (Sales & Marketing)
   - Email: `emma.sales@company.com`
   - Password: `karyawan123`
   - Masuk: 2022-11-10

9. **Alex Thompson** - Accountant (Finance)
   - Email: `alex.finance@company.com`
   - Password: `karyawan123`
   - Masuk: 2020-04-01

10. **Sophia Lee** - Research Assistant (R&D)
    - Email: `sophia.rd@company.com`
    - Password: `karyawan123`
    - Masuk: 2023-02-20

## Data KPI

### KPI Indicators
Hanya 3 departemen yang memiliki KPI Indicators:
- **Technology**: Project Delivery Rate (60%), Code Quality Score (40%)
- **Sales & Marketing**: Sales Revenue Achievement (70%), Customer Retention (30%)
- **HR**: Employee Retention Rate (50%), Training Completion Rate (50%)

### KPI Data (Simplified)
- Data KPI tahun 2023-2024 untuk karyawan yang relevan
- Tidak semua karyawan memiliki data KPI (disesuaikan dengan departemen yang memiliki indicators)

## Data Lainnya

### Rating Data
- 2-3 tahun data rating per karyawan (2023-2024)
- Score berkisar 3.8 - 4.7

### Pelatihan (3 Training Sessions)
1. **Leadership Development 2024** - Sarah, Jane
2. **Technical Skills Workshop** - John, David
3. **Sales Excellence Training** - Jane, Emma

### Penghargaan (3 Awards)
1. **Employee of the Year 2024** - Jane Smith
2. **Best Team Player 2024** - John, Lisa
3. **Leadership Excellence 2024** - Sarah Johnson

### Kehadiran Data
- 30 hari terakhir (excluding weekends)
- ~220 records total
- Distribusi:
  - 80% Hadir
  - 12% Terlambat
  - 5% Izin
  - 3% Sakit

## Cara Menjalankan

```bash
# Reset database dan jalankan migrations
npx prisma migrate reset

# Atau jika hanya ingin seed ulang
npx prisma db seed
```

## Catatan
- Departemen dan Jabatan tetap lengkap seperti requirement
- Data user, KPI, rating, pelatihan, dan penghargaan disederhanakan
- Beberapa departemen tidak memiliki KPI indicators (Operations, Analytics, Finance, R&D) untuk menyederhanakan data
