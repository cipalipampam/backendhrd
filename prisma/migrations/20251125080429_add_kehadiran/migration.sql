-- CreateTable
CREATE TABLE `kehadiran` (
    `id` VARCHAR(191) NOT NULL,
    `karyawanId` VARCHAR(191) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `waktuMasuk` DATETIME(3) NULL,
    `waktuKeluar` DATETIME(3) NULL,
    `status` ENUM('HADIR', 'TERLAMBAT', 'IZIN', 'SAKIT', 'ALPA', 'BELUM_ABSEN') NOT NULL DEFAULT 'BELUM_ABSEN',
    `lokasi` VARCHAR(191) NULL,
    `keterangan` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Kehadiran_karyawanId_idx`(`karyawanId`),
    UNIQUE INDEX `Kehadiran_karyawanId_tanggal_key`(`karyawanId`, `tanggal`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `kehadiran` ADD CONSTRAINT `Kehadiran_karyawanId_fkey` FOREIGN KEY (`karyawanId`) REFERENCES `karyawan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
