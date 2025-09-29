-- CreateTable
CREATE TABLE `User` (
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `role` ENUM('KARYAWAN', 'HR') NOT NULL DEFAULT 'KARYAWAN',
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`username`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Departemen` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Departemen_nama_key`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Jabatan` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Jabatan_nama_key`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KPI` (
    `id` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `score` DOUBLE NOT NULL,
    `notes` VARCHAR(191) NULL,
    `karyawanId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rating` (
    `id` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `score` DOUBLE NOT NULL,
    `notes` VARCHAR(191) NULL,
    `karyawanId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Penghargaan` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `tahun` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pelatihan` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL,
    `lokasi` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PelatihanDetail` (
    `id` VARCHAR(191) NOT NULL,
    `pelatihanId` VARCHAR(191) NOT NULL,
    `karyawanId` VARCHAR(191) NOT NULL,
    `skor` DOUBLE NULL,
    `catatan` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PelatihanDetail_pelatihanId_karyawanId_key`(`pelatihanId`, `karyawanId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Karyawan` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `gender` ENUM('Pria', 'Wanita') NOT NULL,
    `alamat` VARCHAR(191) NULL,
    `no_telp` VARCHAR(191) NULL,
    `tanggal_lahir` DATETIME(3) NULL,
    `pendidikan` VARCHAR(191) NOT NULL,
    `tanggal_masuk` DATETIME(3) NOT NULL,
    `jalur_rekrut` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Karyawan_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ModelVersion` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `version` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `storagePath` VARCHAR(191) NOT NULL,
    `metrics` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FeatureSnapshot` (
    `id` VARCHAR(191) NOT NULL,
    `karyawanId` VARCHAR(191) NOT NULL,
    `features` JSON NOT NULL,
    `modelVersionId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PromotionRecommendation` (
    `id` VARCHAR(191) NOT NULL,
    `karyawanId` VARCHAR(191) NOT NULL,
    `modelVersionId` VARCHAR(191) NOT NULL,
    `score` DOUBLE NOT NULL,
    `recommend` BOOLEAN NOT NULL,
    `reasons` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_DepartemenOnKaryawan` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_DepartemenOnKaryawan_AB_unique`(`A`, `B`),
    INDEX `_DepartemenOnKaryawan_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_JabatanOnKaryawan` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_JabatanOnKaryawan_AB_unique`(`A`, `B`),
    INDEX `_JabatanOnKaryawan_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PenghargaanOnKaryawan` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_PenghargaanOnKaryawan_AB_unique`(`A`, `B`),
    INDEX `_PenghargaanOnKaryawan_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `KPI` ADD CONSTRAINT `KPI_karyawanId_fkey` FOREIGN KEY (`karyawanId`) REFERENCES `Karyawan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rating` ADD CONSTRAINT `Rating_karyawanId_fkey` FOREIGN KEY (`karyawanId`) REFERENCES `Karyawan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PelatihanDetail` ADD CONSTRAINT `PelatihanDetail_pelatihanId_fkey` FOREIGN KEY (`pelatihanId`) REFERENCES `Pelatihan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PelatihanDetail` ADD CONSTRAINT `PelatihanDetail_karyawanId_fkey` FOREIGN KEY (`karyawanId`) REFERENCES `Karyawan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Karyawan` ADD CONSTRAINT `Karyawan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeatureSnapshot` ADD CONSTRAINT `FeatureSnapshot_modelVersionId_fkey` FOREIGN KEY (`modelVersionId`) REFERENCES `ModelVersion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PromotionRecommendation` ADD CONSTRAINT `PromotionRecommendation_modelVersionId_fkey` FOREIGN KEY (`modelVersionId`) REFERENCES `ModelVersion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DepartemenOnKaryawan` ADD CONSTRAINT `_DepartemenOnKaryawan_A_fkey` FOREIGN KEY (`A`) REFERENCES `Departemen`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DepartemenOnKaryawan` ADD CONSTRAINT `_DepartemenOnKaryawan_B_fkey` FOREIGN KEY (`B`) REFERENCES `Karyawan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_JabatanOnKaryawan` ADD CONSTRAINT `_JabatanOnKaryawan_A_fkey` FOREIGN KEY (`A`) REFERENCES `Jabatan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_JabatanOnKaryawan` ADD CONSTRAINT `_JabatanOnKaryawan_B_fkey` FOREIGN KEY (`B`) REFERENCES `Karyawan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PenghargaanOnKaryawan` ADD CONSTRAINT `_PenghargaanOnKaryawan_A_fkey` FOREIGN KEY (`A`) REFERENCES `Karyawan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PenghargaanOnKaryawan` ADD CONSTRAINT `_PenghargaanOnKaryawan_B_fkey` FOREIGN KEY (`B`) REFERENCES `Penghargaan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
