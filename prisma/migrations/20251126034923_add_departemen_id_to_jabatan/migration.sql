/*
  Warnings:

  - A unique constraint covering the columns `[nama,departemenId]` on the table `jabatan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `departemenId` to the `jabatan` table without a default value. This is not possible if the table is not empty.

  Migration Strategy:
  1. Add columns as nullable first
  2. Set default departemenId for existing rows (HR department)
  3. Make departemenId required
  4. Add constraints
*/

-- Step 1: Add columns as NULLABLE first
ALTER TABLE `jabatan` ADD COLUMN `departemenId` VARCHAR(191) NULL,
    ADD COLUMN `deskripsi` TEXT NULL,
    ADD COLUMN `level` VARCHAR(191) NULL;

-- Step 2: Set default departemenId for existing jabatan
-- Map existing jabatan to appropriate departments (you can modify this mapping)
UPDATE `jabatan` 
SET `departemenId` = (SELECT `id` FROM `departemen` WHERE `nama` = 'HR' LIMIT 1)
WHERE `nama` = 'Manager';

UPDATE `jabatan` 
SET `departemenId` = (SELECT `id` FROM `departemen` WHERE `nama` = 'Technology' LIMIT 1)
WHERE `nama` = 'Staff';

UPDATE `jabatan` 
SET `departemenId` = (SELECT `id` FROM `departemen` WHERE `nama` = 'Operations' LIMIT 1)
WHERE `nama` = 'Supervisor';

UPDATE `jabatan` 
SET `departemenId` = (SELECT `id` FROM `departemen` WHERE `nama` = 'Technology' LIMIT 1)
WHERE `nama` = 'Developer';

-- Step 3: Set default level based on job title
UPDATE `jabatan` SET `level` = 'Manager' WHERE `nama` LIKE '%Manager%';
UPDATE `jabatan` SET `level` = 'Lead' WHERE `nama` LIKE '%Supervisor%' OR `nama` LIKE '%Lead%';
UPDATE `jabatan` SET `level` = 'Staff' WHERE `level` IS NULL AND (`nama` LIKE '%Developer%' OR `nama` = 'Staff');

-- Step 4: Make departemenId NOT NULL
ALTER TABLE `jabatan` MODIFY `departemenId` VARCHAR(191) NOT NULL;

-- Step 5: Drop old unique constraint on nama
DROP INDEX `Jabatan_nama_key` ON `jabatan`;

-- Step 6: Create indexes and new unique constraint
CREATE INDEX `Jabatan_departemenId_idx` ON `jabatan`(`departemenId`);
CREATE UNIQUE INDEX `Jabatan_nama_departemenId_key` ON `jabatan`(`nama`, `departemenId`);

-- Step 7: Add foreign key constraint
ALTER TABLE `jabatan` ADD CONSTRAINT `Jabatan_departemenId_fkey` FOREIGN KEY (`departemenId`) REFERENCES `departemen`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
