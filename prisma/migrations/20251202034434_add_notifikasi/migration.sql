-- CreateTable
CREATE TABLE `notifikasi` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `type` ENUM('INFO', 'WARNING', 'SUCCESS', 'TRAINING', 'PERFORMANCE', 'ATTENDANCE') NOT NULL DEFAULT 'INFO',
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `actionUrl` VARCHAR(191) NULL,
    `actionText` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Notifikasi_userId_idx`(`userId`),
    INDEX `Notifikasi_isRead_idx`(`isRead`),
    INDEX `Notifikasi_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `notifikasi` ADD CONSTRAINT `Notifikasi_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;
