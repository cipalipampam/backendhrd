# API Documentation - Kehadiran (Attendance)

## Endpoints Kehadiran

Base URL: `http://localhost:5000/api/kehadiran`

Semua endpoint memerlukan authentication token di header:
```
Authorization: Bearer <token>
```

---

## 1. Check In

**Endpoint:** `POST /kehadiran/check-in`

**Description:** Karyawan melakukan check-in untuk hari ini

**Request Body:**
```json
{
  "lokasi": "Kantor Pusat Jakarta",
  "keterangan": "Check in melalui mobile app"
}
```

**Response Success (201):**
```json
{
  "status": 201,
  "message": "Check-in berhasil",
  "data": {
    "id": "abc123",
    "karyawanId": "k001",
    "tanggal": "2025-11-25T00:00:00.000Z",
    "waktuMasuk": "2025-11-25T07:45:00.000Z",
    "waktuKeluar": null,
    "status": "HADIR",
    "lokasi": "Kantor Pusat Jakarta",
    "keterangan": "Check in melalui mobile app",
    "createdAt": "2025-11-25T07:45:00.000Z",
    "updatedAt": "2025-11-25T07:45:00.000Z",
    "karyawan": {
      "id": "k001",
      "nama": "John Doe"
    }
  }
}
```

**Status Logic:**
- `HADIR`: Check-in sebelum atau tepat jam 08:00
- `TERLAMBAT`: Check-in setelah jam 08:00

---

## 2. Check Out

**Endpoint:** `POST /kehadiran/check-out`

**Description:** Karyawan melakukan check-out untuk hari ini

**Request Body:**
```json
{
  "keterangan": "Check out melalui mobile app"
}
```

**Response Success (200):**
```json
{
  "status": 200,
  "message": "Check-out berhasil",
  "data": {
    "id": "abc123",
    "karyawanId": "k001",
    "tanggal": "2025-11-25T00:00:00.000Z",
    "waktuMasuk": "2025-11-25T07:45:00.000Z",
    "waktuKeluar": "2025-11-25T17:30:00.000Z",
    "status": "HADIR",
    "lokasi": "Kantor Pusat Jakarta",
    "keterangan": "Check out melalui mobile app",
    "createdAt": "2025-11-25T07:45:00.000Z",
    "updatedAt": "2025-11-25T17:30:00.000Z",
    "karyawan": {
      "id": "k001",
      "nama": "John Doe"
    }
  }
}
```

---

## 3. Get Kehadiran Hari Ini

**Endpoint:** `GET /kehadiran/today`

**Description:** Mendapatkan data kehadiran user yang login untuk hari ini

**Response Success (200):**
```json
{
  "status": 200,
  "message": "Kehadiran found",
  "data": {
    "id": "abc123",
    "karyawanId": "k001",
    "tanggal": "2025-11-25T00:00:00.000Z",
    "waktuMasuk": "2025-11-25T07:45:00.000Z",
    "waktuKeluar": null,
    "status": "HADIR",
    "lokasi": "Kantor Pusat Jakarta",
    "keterangan": "Check in melalui mobile app",
    "createdAt": "2025-11-25T07:45:00.000Z",
    "updatedAt": "2025-11-25T07:45:00.000Z",
    "karyawan": {
      "id": "k001",
      "nama": "John Doe"
    }
  }
}
```

**Response jika belum ada kehadiran:**
```json
{
  "status": 200,
  "message": "Belum ada kehadiran hari ini",
  "data": null
}
```

---

## 4. Get Riwayat Kehadiran

**Endpoint:** `GET /kehadiran/history?month=11&year=2025`

**Description:** Mendapatkan riwayat kehadiran user yang login

**Query Parameters:**
- `month` (optional): Bulan (1-12)
- `year` (optional): Tahun (e.g., 2025)

**Response Success (200):**
```json
{
  "status": 200,
  "message": "Riwayat kehadiran found",
  "data": [
    {
      "id": "abc123",
      "karyawanId": "k001",
      "tanggal": "2025-11-25T00:00:00.000Z",
      "waktuMasuk": "2025-11-25T07:45:00.000Z",
      "waktuKeluar": "2025-11-25T17:30:00.000Z",
      "status": "HADIR",
      "lokasi": "Kantor Pusat Jakarta",
      "keterangan": "Check in melalui mobile app",
      "createdAt": "2025-11-25T07:45:00.000Z",
      "updatedAt": "2025-11-25T17:30:00.000Z",
      "karyawan": {
        "id": "k001",
        "nama": "John Doe"
      }
    }
  ],
  "stats": {
    "total": 22,
    "hadir": 16,
    "terlambat": 3,
    "izin": 2,
    "sakit": 1,
    "alpa": 0,
    "belumAbsen": 0
  }
}
```

---

## 5. Get All Kehadiran (HR Only)

**Endpoint:** `GET /kehadiran?karyawanId=k001&month=11&year=2025&status=HADIR`

**Description:** Mendapatkan semua data kehadiran (hanya untuk HR)

**Query Parameters:**
- `karyawanId` (optional): Filter berdasarkan ID karyawan
- `month` (optional): Bulan (1-12)
- `year` (optional): Tahun (e.g., 2025)
- `status` (optional): Filter berdasarkan status (HADIR, TERLAMBAT, IZIN, SAKIT, ALPA, BELUM_ABSEN)

**Response Success (200):**
```json
{
  "status": 200,
  "message": "Kehadiran found",
  "data": [
    {
      "id": "abc123",
      "karyawanId": "k001",
      "tanggal": "2025-11-25T00:00:00.000Z",
      "waktuMasuk": "2025-11-25T07:45:00.000Z",
      "waktuKeluar": "2025-11-25T17:30:00.000Z",
      "status": "HADIR",
      "lokasi": "Kantor Pusat Jakarta",
      "keterangan": null,
      "createdAt": "2025-11-25T07:45:00.000Z",
      "updatedAt": "2025-11-25T17:30:00.000Z",
      "karyawan": {
        "id": "k001",
        "nama": "John Doe",
        "departemen": [{ "id": "d001", "nama": "Technology" }],
        "jabatan": [{ "id": "j001", "nama": "Developer" }]
      }
    }
  ]
}
```

---

## 6. Create Kehadiran Manual (HR Only)

**Endpoint:** `POST /kehadiran`

**Description:** Membuat data kehadiran manual (hanya untuk HR)

**Request Body:**
```json
{
  "karyawanId": "k001",
  "tanggal": "2025-11-25",
  "status": "IZIN",
  "waktuMasuk": "2025-11-25T08:00:00.000Z",
  "waktuKeluar": "2025-11-25T17:00:00.000Z",
  "lokasi": "Kantor Pusat Jakarta",
  "keterangan": "Izin keperluan keluarga"
}
```

**Response Success (201):**
```json
{
  "status": 201,
  "message": "Kehadiran created",
  "data": {
    "id": "abc123",
    "karyawanId": "k001",
    "tanggal": "2025-11-25T00:00:00.000Z",
    "waktuMasuk": "2025-11-25T08:00:00.000Z",
    "waktuKeluar": "2025-11-25T17:00:00.000Z",
    "status": "IZIN",
    "lokasi": "Kantor Pusat Jakarta",
    "keterangan": "Izin keperluan keluarga",
    "createdAt": "2025-11-25T10:00:00.000Z",
    "updatedAt": "2025-11-25T10:00:00.000Z",
    "karyawan": {
      "id": "k001",
      "nama": "John Doe"
    }
  }
}
```

---

## 7. Update Kehadiran (HR Only)

**Endpoint:** `PUT /kehadiran/:id`

**Description:** Update data kehadiran (hanya untuk HR)

**Request Body:**
```json
{
  "status": "SAKIT",
  "waktuMasuk": "2025-11-25T08:00:00.000Z",
  "waktuKeluar": "2025-11-25T17:00:00.000Z",
  "keterangan": "Sakit flu"
}
```

**Response Success (200):**
```json
{
  "status": 200,
  "message": "Kehadiran updated",
  "data": {
    "id": "abc123",
    "karyawanId": "k001",
    "tanggal": "2025-11-25T00:00:00.000Z",
    "waktuMasuk": "2025-11-25T08:00:00.000Z",
    "waktuKeluar": "2025-11-25T17:00:00.000Z",
    "status": "SAKIT",
    "lokasi": "Kantor Pusat Jakarta",
    "keterangan": "Sakit flu",
    "createdAt": "2025-11-25T07:45:00.000Z",
    "updatedAt": "2025-11-25T10:00:00.000Z",
    "karyawan": {
      "id": "k001",
      "nama": "John Doe"
    }
  }
}
```

---

## 8. Delete Kehadiran (HR Only)

**Endpoint:** `DELETE /kehadiran/:id`

**Description:** Hapus data kehadiran (hanya untuk HR)

**Response Success (200):**
```json
{
  "status": 200,
  "message": "Kehadiran deleted"
}
```

---

## 9. Get Laporan Summary (HR Only)

**Endpoint:** `GET /kehadiran/report/summary?month=11&year=2025`

**Description:** Mendapatkan laporan summary kehadiran per karyawan (hanya untuk HR)

**Query Parameters:**
- `month` (optional): Bulan (1-12)
- `year` (optional): Tahun (e.g., 2025)

**Response Success (200):**
```json
{
  "status": 200,
  "message": "Laporan kehadiran summary",
  "data": [
    {
      "karyawan": {
        "id": "k001",
        "nama": "John Doe",
        "departemen": [{ "id": "d001", "nama": "Technology" }],
        "jabatan": [{ "id": "j001", "nama": "Developer" }]
      },
      "total": 22,
      "hadir": 16,
      "terlambat": 3,
      "izin": 2,
      "sakit": 1,
      "alpa": 0,
      "belumAbsen": 0,
      "persentaseKehadiran": 86
    }
  ]
}
```

---

## Status Kehadiran

Enum `kehadiran_status`:
- `HADIR`: Karyawan hadir tepat waktu (sebelum/tepat jam 08:00)
- `TERLAMBAT`: Karyawan terlambat (setelah jam 08:00)
- `IZIN`: Karyawan izin
- `SAKIT`: Karyawan sakit
- `ALPA`: Karyawan tidak hadir tanpa keterangan
- `BELUM_ABSEN`: Belum melakukan absensi

---

## Error Responses

**400 Bad Request:**
```json
{
  "message": "Anda sudah check-in hari ini",
  "data": { ... }
}
```

**401 Unauthorized:**
```json
{
  "message": "Unauthorized"
}
```

**404 Not Found:**
```json
{
  "message": "Kehadiran not found"
}
```

**500 Internal Server Error:**
```json
{
  "status": 500,
  "message": "Internal server error",
  "error": "Error message details"
}
```
