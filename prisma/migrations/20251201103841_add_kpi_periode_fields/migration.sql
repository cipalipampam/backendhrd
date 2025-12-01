-- AlterTable
ALTER TABLE `kpidetail` ADD COLUMN `periodeMonth` INTEGER NULL,
    ADD COLUMN `periodeYear` INTEGER NULL;

-- AlterTable
ALTER TABLE `pelatihandetail` ADD COLUMN `periodeMonth` INTEGER NULL,
    ADD COLUMN `periodeYear` INTEGER NULL;

-- CreateIndex
CREATE INDEX `KpiDetail_periode_idx` ON `kpiDetail`(`periodeYear`, `periodeMonth`);

-- CreateIndex
CREATE INDEX `PelatihanDetail_periode_idx` ON `pelatihandetail`(`periodeYear`, `periodeMonth`);
