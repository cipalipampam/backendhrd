# RINGKASAN PROJECT - Backend HRD

## 📋 Deskripsi Umum

Backend HRD adalah sistem backend REST API untuk aplikasi manajemen sumber daya manusia (HRD) yang dikembangkan menggunakan Node.js dan Express.js. Sistem ini menyediakan layanan pengelolaan data karyawan, penilaian kinerja (KPI), kehadiran, pelatihan, serta fitur AI untuk rekomendasi promosi jabatan.

## 🎯 Tujuan Project

Menyediakan backend yang robust dan terstruktur untuk mendukung aplikasi HRD dengan fitur:
- Manajemen data master (departemen, jabatan, karyawan)
- Sistem penilaian kinerja (KPI) dan rating karyawan
- Pencatatan kehadiran dan permohonan izin
- Manajemen pelatihan dan penghargaan
- Prediksi dan rekomendasi promosi menggunakan AI/Machine Learning

## 🛠 Teknologi yang Digunakan

### Framework & Runtime
- **Node.js** - Runtime environment
- **Express.js v5.1.0** - Web framework

### Database & ORM
- **MySQL** - Database relasional
- **Prisma ORM v6.17.1** - Object-Relational Mapping untuk manajemen database
- **mysql2** - MySQL client untuk Node.js

### Keamanan & Autentikasi
- **JWT (jsonwebtoken)** - Token-based authentication
- **bcrypt v6.0.0** - Password hashing
- **cors** - Cross-Origin Resource Sharing

### Machine Learning
- **ml-matrix** - Library untuk operasi matriks dalam machine learning
- **Python (predict.py)** - Script untuk prediksi menggunakan model XGBoost

### Utilities
- **express-validator** - Validasi input request
- **multer** - Upload file handling
- **pdfkit** - Generasi dokumen PDF
- **nodemon** - Development auto-reload

## 📁 Struktur Project

```
backendhrd/
├── prisma/                      # Database schema & migrasi
│   ├── schema.prisma           # Definisi model database
│   ├── seed.js                 # Data seeding
│   └── migrations/             # Riwayat migrasi database
├── src/
│   ├── index.js                # Entry point aplikasi
│   ├── bootstrap.js            # Inisialisasi database
│   ├── prismaClient.js         # Konfigurasi Prisma client
│   ├── constants/              # Konstanta aplikasi
│   │   ├── roles.js           # Definisi role pengguna
│   │   └── xgboost-labels.js  # Label untuk model ML
│   ├── middleware/             # Express middleware
│   │   ├── access-validation.js      # Validasi JWT token
│   │   └── role-authorization.js     # Otorisasi berdasarkan role
│   ├── router/                 # Route handlers
│   │   ├── auth/              # Autentikasi
│   │   ├── data-master/       # Data master (departemen, jabatan, user)
│   │   ├── karyawan/          # Karyawan, KPI, kehadiran, izin, profil
│   │   ├── pelatihan/         # Manajemen pelatihan
│   │   └── promotion-ai/      # AI model & prediksi promosi
│   ├── modules/
│   │   └── promotion-ai/      # Modul AI untuk rekomendasi promosi
│   ├── jobs/                   # Background jobs
│   │   ├── nightly-scoring.job.js    # Penilaian otomatis malam hari
│   │   └── retrain-xgboost.job.js   # Re-training model ML
│   ├── utils/
│   │   └── response.js        # Utility response API
│   └── validators/             # Validasi request
│       ├── promotion.validators.js
│       └── xgboost.validators.js
├── scripts/                    # Utility scripts
│   ├── migrate-jabatan-data.js
│   └── verify-migration.js
├── uploads/                    # Folder upload file
│   ├── izin/                  # Dokumen izin
│   └── profile/               # Foto profil
└── predict.py                  # Script Python untuk prediksi ML
```

## 🗄 Model Database Utama

### 1. **User**
- Sistem autentikasi pengguna
- Role-based access (HR, Karyawan)
- Password terenkripsi

### 2. **Departemen & Jabatan**
- Struktur organisasi perusahaan
- Hierarki jabatan dengan level (Junior, Staff, Senior, Lead, Manager, Director)

### 3. **Karyawan**
- Data lengkap karyawan (biodata, pendidikan, masa kerja)
- Relasi dengan departemen dan jabatan
- Foto profil

### 4. **KPI (Key Performance Indicator)**
- Penilaian kinerja tahunan
- KPI detail dengan indikator spesifik
- Target, realisasi, dan skor
- Periode penilaian yang fleksibel

### 5. **KPI Indicator**
- Indikator penilaian per departemen
- Bobot perhitungan
- Target dan realisasi

### 6. **Rating**
- Penilaian karyawan per periode
- Skor dan komentar

### 7. **Kehadiran**
- Pencatatan kehadiran harian
- Waktu check-in dan check-out
- Koordinat GPS lokasi
- Status (hadir, izin, sakit, alpha)

### 8. **Izin Request**
- Permohonan izin/cuti
- Status approval
- Upload dokumen pendukung

### 9. **Pelatihan & Pelatihan Detail**
- Program pelatihan karyawan
- Peserta dan nilai pelatihan
- Sertifikat

### 10. **Penghargaan**
- Pencatatan penghargaan karyawan
- Jenis dan tanggal penghargaan

### 11. **Model AI (ModelVersion, FeatureSnapshot)**
- Versioning model machine learning
- Snapshot fitur untuk training
- Metadata model

## 🔑 Fitur Utama

### 1. **Autentikasi & Otorisasi**
- Login dengan username/password
- JWT token-based authentication
- Role-based access control (HR & Karyawan)
- Middleware validasi akses

### 2. **Manajemen Data Master**
- CRUD Departemen
- CRUD Jabatan (dengan level hierarki)
- CRUD User
- Relasi departemen-jabatan

### 3. **Manajemen Karyawan**
- CRUD data karyawan
- Pengelolaan profil karyawan
- Upload foto profil
- Riwayat jabatan

### 4. **Sistem KPI**
- Input KPI tahunan
- KPI detail dengan multiple indikator
- Perhitungan skor otomatis: `(realisasi/target) × bobot × 100`
- KPI bulanan
- Laporan KPI per karyawan

### 5. **Manajemen Kehadiran**
- Check-in/check-out dengan GPS
- Pencatatan lokasi kehadiran
- Laporan kehadiran
- Rekapitulasi kehadiran bulanan

### 6. **Manajemen Izin**
- Pengajuan izin/cuti
- Upload dokumen pendukung
- Approval/reject izin
- Riwayat izin

### 7. **Manajemen Pelatihan**
- CRUD pelatihan
- Pendaftaran peserta
- Input nilai pelatihan
- Download sertifikat (PDF)

### 8. **Penghargaan**
- Pencatatan achievement karyawan
- Jenis penghargaan
- Riwayat penghargaan per karyawan

### 9. **AI - Rekomendasi Promosi**
- Ekstraksi fitur karyawan (KPI, rating, pelatihan, penghargaan, kehadiran)
- Prediksi promosi menggunakan XGBoost
- Rekomendasi jabatan target
- Batch processing untuk semua karyawan
- Model versioning
- Re-training model otomatis

### 10. **Background Jobs**
- Nightly scoring - Penilaian otomatis setiap malam
- Re-training model ML secara berkala

## 🔐 Sistem Keamanan

### Role-Based Access Control
- **HR Role**: Akses penuh ke semua fitur
- **Karyawan Role**: Akses terbatas ke data pribadi

### Autentikasi
- Password hashing dengan bcrypt
- JWT token dengan expiry
- Token validation middleware

### Validasi Input
- Express-validator untuk validasi request
- Custom validators untuk business logic

## 📡 API Endpoints

### Auth
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register user baru

### Data Master (HR Only)
- `/api/departemen` - CRUD departemen
- `/api/jabatan` - CRUD jabatan
- `/api/user` - CRUD user

### Karyawan
- `/api/karyawan` - CRUD karyawan
- `/api/karyawan/:id/profile` - Profil karyawan
- `/api/karyawan-features` - Ekstraksi fitur karyawan

### KPI
- `/api/kpi` - CRUD KPI
- `/api/kpi/bulanan` - KPI bulanan
- `/api/karyawan/kpi-bulanan` - KPI karyawan tertentu

### Kehadiran
- `/api/kehadiran` - CRUD kehadiran
- `/api/kehadiran/check-in` - Check-in kehadiran
- `/api/kehadiran/check-out` - Check-out kehadiran

### Izin
- `/api/izin` - CRUD izin request
- `/api/izin/:id/approve` - Approve izin
- `/api/izin/:id/reject` - Reject izin

### Pelatihan
- `/api/pelatihan` - CRUD pelatihan
- `/api/pelatihan/:id/peserta` - Manajemen peserta
- `/api/pelatihan/:id/sertifikat` - Download sertifikat

### Penghargaan
- `/api/penghargaan` - CRUD penghargaan

### AI - Promotion
- `/api/promotion/recommend/:karyawanId` - Rekomendasi promosi untuk karyawan
- `/api/promotion/recommend-batch` - Rekomendasi batch untuk semua karyawan
- `/api/xgboost-model` - Manajemen model ML
- `/api/predict` - Prediksi promosi

## 🚀 Cara Menjalankan

### Prerequisites
- Node.js (v16+)
- MySQL database
- Python 3.x (untuk predict.py)

### Instalasi

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env dengan konfigurasi database

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npm run seed
```

### Menjalankan Aplikasi

```bash
# Development mode
npm run dev

# Production mode
npm start
```

### Background Jobs

```bash
# Nightly scoring
npm run score:nightly

# Retrain model
npm run train:decision
```

## 📊 Machine Learning - Prediksi Promosi

### Fitur yang Diekstrak
1. **KPI Metrics**
   - Rata-rata KPI score (3 tahun terakhir)
   - Tren KPI (naik/turun)
   - Konsistensi kinerja

2. **Rating Performance**
   - Rata-rata rating
   - Rating tertinggi

3. **Pelatihan**
   - Jumlah pelatihan yang diikuti
   - Rata-rata nilai pelatihan

4. **Penghargaan**
   - Jumlah penghargaan yang diterima

5. **Kehadiran**
   - Tingkat kehadiran (%)
   - Konsistensi kehadiran

6. **Demografis**
   - Masa kerja (tahun)
   - Level jabatan saat ini

### Model ML
- **Algoritma**: XGBoost (Extreme Gradient Boosting)
- **Output**: Prediksi kelayakan promosi (layak/tidak layak)
- **Rekomendasi**: Jabatan target berdasarkan level saat ini

### Feature Engineering
- Normalisasi nilai
- Encoding kategorikal
- Feature scaling
- Handle missing values

## 🔄 Migration & Seeding

### Migrasi Database
Project ini menggunakan Prisma untuk manajemen migrasi database. Semua perubahan schema dicatat dalam folder `migrations/`.

**Major Migrations:**
1. Init - Setup awal database
2. Add kehadiran - Penambahan tabel kehadiran
3. Add departemen_id to jabatan - Relasi jabatan-departemen
4. Add izin request - Sistem permohonan izin
5. Add KPI periode fields - Fleksibilitas periode KPI
6. Add GPS coordinates - Tracking lokasi kehadiran
7. Add foto profil - Upload foto profil user

### Seeding
File `seed.js` berisi data dummy untuk:
- Departemen & Jabatan
- User & Karyawan
- KPI & Rating
- Pelatihan & Penghargaan
- Kehadiran

## 📝 Catatan Pengembangan

### Best Practices
- Gunakan Prisma untuk query database (type-safe)
- Middleware untuk validasi dan authorization
- Error handling yang konsisten
- Logging untuk debugging
- Validasi input di setiap endpoint

### Potential Improvements
- Implementasi caching (Redis)
- Rate limiting
- API documentation (Swagger)
- Unit testing & integration testing
- WebSocket untuk real-time notification
- Microservices architecture untuk scalability
- Docker containerization
- CI/CD pipeline

## 👥 Role & Permission

### HR (Human Resources)
✅ Full access ke semua data
✅ CRUD data master (departemen, jabatan, user)
✅ CRUD semua karyawan
✅ Approval izin
✅ Manajemen KPI semua karyawan
✅ Akses AI prediction & recommendation

### Karyawan
✅ Lihat dan edit profil sendiri
✅ Lihat KPI dan rating sendiri
✅ Check-in/check-out kehadiran
✅ Ajukan izin/cuti
✅ Lihat pelatihan sendiri
✅ Lihat penghargaan sendiri
❌ Tidak bisa akses data karyawan lain
❌ Tidak bisa approval izin
❌ Tidak bisa CRUD data master

## 📈 Skalabilitas & Performa

### Optimasi Database
- Index pada foreign keys
- Unique constraints
- Cascade delete/update
- Query optimization dengan Prisma

### Background Processing
- Scheduled jobs untuk task berat
- Batch processing untuk bulk operations
- Async/await untuk non-blocking operations

## 🔗 Integrasi

### Frontend Integration
- **Website HRD**: Admin dashboard untuk HR
- **Mobile HRD**: Aplikasi mobile untuk karyawan

### API Response Format
```json
{
  "status": 200,
  "message": "Success message",
  "data": { }
}
```

## 📞 Kontak & Support

Untuk pertanyaan atau issue terkait backend HRD system, silakan hubungi tim development.

---

**Last Updated**: Desember 2025
**Version**: 1.0.0
**Status**: Active Development
