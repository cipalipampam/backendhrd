/*
  Warnings:

  - A unique constraint covering the columns `[nama,departemenId]` on the table `kpiIndicator` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX `KpiIndicator_departemenId_idx` ON `kpiIndicator`(`departemenId`);

-- CreateIndex
CREATE UNIQUE INDEX `KpiIndicator_nama_departemenId_key` ON `kpiIndicator`(`nama`, `departemenId`);
