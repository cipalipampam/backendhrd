-- Ensure foreign key from KPI to karyawan still has supporting index
CREATE INDEX `KPI_karyawanId_idx` ON `kpi`(`karyawanId`);

-- Drop the old unique constraint that enforced single KPI per karyawan/year
DROP INDEX `KPI_karyawanId_year_key` ON `kpi`;
