-- CreateTable
CREATE TABLE `departemen` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Departemen_nama_key`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `featuresnapshot` (
    `id` VARCHAR(191) NOT NULL,
    `karyawanId` VARCHAR(191) NOT NULL,
    `features` JSON NOT NULL,
    `modelVersionId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FeatureSnapshot_modelVersionId_fkey`(`modelVersionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jabatan` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Jabatan_nama_key`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `karyawan` (
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
CREATE TABLE `kpi` (
    `id` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `score` DOUBLE NOT NULL,
    `karyawanId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `KPI_karyawanId_year_key`(`karyawanId`, `year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kpiIndicator` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `deskripsi` VARCHAR(191) NULL,
    `bobot` DOUBLE NOT NULL,
    `departemenId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kpiDetail` (
    `id` VARCHAR(191) NOT NULL,
    `kpiId` VARCHAR(191) NOT NULL,
    `indikatorId` VARCHAR(191) NOT NULL,
    `target` DOUBLE NOT NULL,
    `realisasi` DOUBLE NULL,
    `score` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `KpiDetail_kpiId_idx`(`kpiId`),
    INDEX `KpiDetail_indikatorId_idx`(`indikatorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `modelversion` (
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
CREATE TABLE `pelatihan` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL,
    `lokasi` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pelatihandetail` (
    `id` VARCHAR(191) NOT NULL,
    `pelatihanId` VARCHAR(191) NOT NULL,
    `karyawanId` VARCHAR(191) NOT NULL,
    `skor` DOUBLE NULL,
    `catatan` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PelatihanDetail_karyawanId_fkey`(`karyawanId`),
    UNIQUE INDEX `PelatihanDetail_pelatihanId_karyawanId_key`(`pelatihanId`, `karyawanId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `penghargaan` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `tahun` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `promotionrecommendation` (
    `id` VARCHAR(191) NOT NULL,
    `karyawanId` VARCHAR(191) NOT NULL,
    `modelVersionId` VARCHAR(191) NOT NULL,
    `score` DOUBLE NOT NULL,
    `recommend` BOOLEAN NOT NULL,
    `reasons` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PromotionRecommendation_modelVersionId_fkey`(`modelVersionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rating` (
    `id` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `score` DOUBLE NOT NULL,
    `notes` VARCHAR(191) NULL,
    `karyawanId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Rating_karyawanId_year_key`(`karyawanId`, `year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
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
CREATE TABLE `_departemenonkaryawan` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_departemenonkaryawan_AB_unique`(`A`, `B`),
    INDEX `_departemenonkaryawan_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_jabatanonkaryawan` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_jabatanonkaryawan_AB_unique`(`A`, `B`),
    INDEX `_jabatanonkaryawan_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_penghargaanonkaryawan` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_penghargaanonkaryawan_AB_unique`(`A`, `B`),
    INDEX `_penghargaanonkaryawan_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `featuresnapshot` ADD CONSTRAINT `FeatureSnapshot_modelVersionId_fkey` FOREIGN KEY (`modelVersionId`) REFERENCES `modelversion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `karyawan` ADD CONSTRAINT `Karyawan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kpi` ADD CONSTRAINT `KPI_karyawanId_fkey` FOREIGN KEY (`karyawanId`) REFERENCES `karyawan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kpiDetail` ADD CONSTRAINT `KpiDetail_kpiId_fkey` FOREIGN KEY (`kpiId`) REFERENCES `kpi`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kpiDetail` ADD CONSTRAINT `KpiDetail_indikatorId_fkey` FOREIGN KEY (`indikatorId`) REFERENCES `kpiIndicator`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pelatihandetail` ADD CONSTRAINT `PelatihanDetail_karyawanId_fkey` FOREIGN KEY (`karyawanId`) REFERENCES `karyawan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pelatihandetail` ADD CONSTRAINT `PelatihanDetail_pelatihanId_fkey` FOREIGN KEY (`pelatihanId`) REFERENCES `pelatihan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `promotionrecommendation` ADD CONSTRAINT `PromotionRecommendation_modelVersionId_fkey` FOREIGN KEY (`modelVersionId`) REFERENCES `modelversion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rating` ADD CONSTRAINT `Rating_karyawanId_fkey` FOREIGN KEY (`karyawanId`) REFERENCES `karyawan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_departemenonkaryawan` ADD CONSTRAINT `_departemenonkaryawan_A_fkey` FOREIGN KEY (`A`) REFERENCES `departemen`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_departemenonkaryawan` ADD CONSTRAINT `_departemenonkaryawan_B_fkey` FOREIGN KEY (`B`) REFERENCES `karyawan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_jabatanonkaryawan` ADD CONSTRAINT `_jabatanonkaryawan_A_fkey` FOREIGN KEY (`A`) REFERENCES `jabatan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_jabatanonkaryawan` ADD CONSTRAINT `_jabatanonkaryawan_B_fkey` FOREIGN KEY (`B`) REFERENCES `karyawan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_penghargaanonkaryawan` ADD CONSTRAINT `_penghargaanonkaryawan_A_fkey` FOREIGN KEY (`A`) REFERENCES `karyawan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_penghargaanonkaryawan` ADD CONSTRAINT `_penghargaanonkaryawan_B_fkey` FOREIGN KEY (`B`) REFERENCES `penghargaan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
