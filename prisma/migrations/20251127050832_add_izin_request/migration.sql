-- CreateTable
CREATE TABLE `izinRequest` (
    `id` VARCHAR(191) NOT NULL,
    `karyawanId` VARCHAR(191) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL,
    `jenis` ENUM('IZIN', 'SAKIT') NOT NULL,
    `keterangan` VARCHAR(191) NULL,
    `fileUrl` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `approvedBy` VARCHAR(191) NULL,
    `approvedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `IzinRequest_karyawanId_idx`(`karyawanId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `izinRequest` ADD CONSTRAINT `IzinRequest_karyawanId_fkey` FOREIGN KEY (`karyawanId`) REFERENCES `karyawan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
