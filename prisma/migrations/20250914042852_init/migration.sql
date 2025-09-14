-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('KARYAWAN', 'HR');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('Pria', 'Wanita');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'KARYAWAN',
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Departemen" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Departemen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Jabatan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Jabatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."KPI" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "karyawanId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KPI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Rating" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "karyawanId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Penghargaan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tahun" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Penghargaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Pelatihan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "lokasi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pelatihan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PelatihanDetail" (
    "id" TEXT NOT NULL,
    "pelatihanId" TEXT NOT NULL,
    "karyawanId" TEXT NOT NULL,
    "skor" DOUBLE PRECISION,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PelatihanDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Karyawan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "alamat" TEXT,
    "no_telp" TEXT,
    "tanggal_lahir" TIMESTAMP(3),
    "pendidikan" TEXT NOT NULL,
    "tanggal_masuk" TIMESTAMP(3) NOT NULL,
    "jalur_rekrut" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Karyawan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_DepartemenOnKaryawan" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DepartemenOnKaryawan_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_JabatanOnKaryawan" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_JabatanOnKaryawan_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_PenghargaanOnKaryawan" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PenghargaanOnKaryawan_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Departemen_nama_key" ON "public"."Departemen"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "Jabatan_nama_key" ON "public"."Jabatan"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "PelatihanDetail_pelatihanId_karyawanId_key" ON "public"."PelatihanDetail"("pelatihanId", "karyawanId");

-- CreateIndex
CREATE UNIQUE INDEX "Karyawan_userId_key" ON "public"."Karyawan"("userId");

-- CreateIndex
CREATE INDEX "_DepartemenOnKaryawan_B_index" ON "public"."_DepartemenOnKaryawan"("B");

-- CreateIndex
CREATE INDEX "_JabatanOnKaryawan_B_index" ON "public"."_JabatanOnKaryawan"("B");

-- CreateIndex
CREATE INDEX "_PenghargaanOnKaryawan_B_index" ON "public"."_PenghargaanOnKaryawan"("B");

-- AddForeignKey
ALTER TABLE "public"."KPI" ADD CONSTRAINT "KPI_karyawanId_fkey" FOREIGN KEY ("karyawanId") REFERENCES "public"."Karyawan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Rating" ADD CONSTRAINT "Rating_karyawanId_fkey" FOREIGN KEY ("karyawanId") REFERENCES "public"."Karyawan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PelatihanDetail" ADD CONSTRAINT "PelatihanDetail_pelatihanId_fkey" FOREIGN KEY ("pelatihanId") REFERENCES "public"."Pelatihan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PelatihanDetail" ADD CONSTRAINT "PelatihanDetail_karyawanId_fkey" FOREIGN KEY ("karyawanId") REFERENCES "public"."Karyawan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Karyawan" ADD CONSTRAINT "Karyawan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_DepartemenOnKaryawan" ADD CONSTRAINT "_DepartemenOnKaryawan_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Departemen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_DepartemenOnKaryawan" ADD CONSTRAINT "_DepartemenOnKaryawan_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Karyawan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_JabatanOnKaryawan" ADD CONSTRAINT "_JabatanOnKaryawan_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Jabatan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_JabatanOnKaryawan" ADD CONSTRAINT "_JabatanOnKaryawan_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Karyawan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_PenghargaanOnKaryawan" ADD CONSTRAINT "_PenghargaanOnKaryawan_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Karyawan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_PenghargaanOnKaryawan" ADD CONSTRAINT "_PenghargaanOnKaryawan_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Penghargaan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
