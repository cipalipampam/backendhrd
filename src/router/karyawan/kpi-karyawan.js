import prisma from "../../prismaClient.js";
import { Router } from "express";
import { allowRoles } from "../../middleware/role-authorization.js";
import { ROLES } from "../../constants/roles.js";

const router = Router();

// Convert BigInt in query result → Number
function convertBigInt(obj) {
  return JSON.parse(
    JSON.stringify(obj, (_, v) =>
      typeof v === "bigint" ? Number(v) : v
    )
  );
}

// ================================
// GET /api/karyawan/kpi-bulanan
// KPI FINAL per karyawan per bulan
// ================================
router.get("/", allowRoles(ROLES.HR), async (req, res) => {
  try {
    const { bulan, karyawanId, departemenId } = req.query;

    // Validasi bulan
    const isValidMonth = (s) =>
      typeof s === "string" && /^\d{4}-\d{2}$/.test(s);

    if (bulan && !isValidMonth(bulan)) {
      return res.status(400).json({
        status: 400,
        message: "Query param 'bulan' must be in YYYY-MM format",
      });
    }

    // Parse bulan filter jika ada
    let filterYear = null;
    let filterMonth = null;
    if (bulan) {
      const [year, month] = bulan.split('-').map(Number);
      filterYear = year;
      filterMonth = month;
    }

    // Build filter conditions
    const whereConditions = [];
    const params = [];

    if (bulan) {
      whereConditions.push("p.tahun = ? AND p.bulan = ?");
      params.push(filterYear, filterMonth);
    }

    if (karyawanId) {
      whereConditions.push("k.id = ?");
      params.push(karyawanId);
    }

    if (departemenId) {
      whereConditions.push("d.id = ?");
      params.push(departemenId);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // ================================
    // QUERY KPI PER KARYAWAN / BULAN (tanpa CREATE VIEW)
    // ================================
    const query = `
      SELECT
    k.id AS karyawanId,
    k.nama AS namaKaryawan,
    d.id AS departemenId,
    d.nama AS departemen,

    kplain.periodeYear AS tahun,
    LPAD(kplain.periodeMonth, 2, '0') AS bulan,

    COALESCE(p.scorePresensi, 0) AS scorePresensi,
    COALESCE(t.avgPelatihan, 0) AS scorePelatihan,

    60 AS bobotPresensi,
    40 AS bobotPelatihan,

    kplain.totalBobotIndikatorLain,
    kplain.totalScoreIndikatorLain,
    kplain.kpiIndikatorLain,

    -- ======================================================
    -- RUMUS RESMI KPI FINAL
    -- ======================================================
    LEAST(100, GREATEST(0,

        CASE 
            -- m = 0 → KPI_final = KPI_inti
            WHEN kplain.kpiIndikatorLain IS NULL THEN
                (
                    (COALESCE(p.scorePresensi, 0) * 60) +
                    (COALESCE(t.avgPelatihan, 0) * 40)
                ) / 100

            -- m > 0 → kombinasi bobot (default 0.5 / 0.5)
            ELSE
                (
                    0.5 * (
                        (COALESCE(p.scorePresensi, 0) * 60) +
                        (COALESCE(t.avgPelatihan, 0) * 40)
                    ) / 100
                )
                +
                (
                    0.5 * kplain.kpiIndikatorLain
                )
        END

    )) AS kpiFinal
    -- ======================================================

FROM 
(
    -- KPI DETAIL (PERIODE UTAMA)
    SELECT
        kp.karyawanId,
        kd.periodeYear,
        kd.periodeMonth,
        SUM(ki.bobot) AS totalBobotIndikatorLain,
        SUM(kd.score) AS totalScoreIndikatorLain,
        AVG(kd.score) AS kpiIndikatorLain  -- KPI_lain = rata-rata skor mentah 
    FROM kpidetail kd
    JOIN kpi kp ON kp.id = kd.kpiId
    JOIN kpiindicator ki ON ki.id = kd.indikatorId
    WHERE ki.nama NOT IN ('presensi', 'pelatihan')
    GROUP BY kp.karyawanId, kd.periodeYear, kd.periodeMonth
) kplain

JOIN karyawan k 
    ON k.id = kplain.karyawanId
LEFT JOIN _departemenonkaryawan dok 
    ON dok.B = k.id
LEFT JOIN departemen d 
    ON d.id = dok.A

LEFT JOIN 
(
    SELECT
        kh.karyawanId,
        YEAR(kh.tanggal) AS periodeYear,
        MONTH(kh.tanggal) AS periodeMonth,
        SUM(
            CASE 
                WHEN kh.status = 'HADIR' THEN 100
                WHEN kh.status IN ('IZIN','SAKIT') THEN 80
                WHEN kh.status = 'TERLAMBAT' THEN 70
                WHEN kh.status = 'ALPA' THEN 0
                ELSE 0
            END
        ) / COUNT(*) AS scorePresensi
    FROM kehadiran kh
    GROUP BY kh.karyawanId, YEAR(kh.tanggal), MONTH(kh.tanggal)
) p
    ON p.karyawanId = kplain.karyawanId
   AND p.periodeYear = kplain.periodeYear
   AND p.periodeMonth = kplain.periodeMonth

LEFT JOIN
(
    SELECT
        pd.karyawanId,
        pd.periodeYear,
        pd.periodeMonth,
        AVG(pd.skor) AS avgPelatihan
    FROM pelatihandetail pd
    GROUP BY pd.karyawanId, pd.periodeYear, pd.periodeMonth
) t
    ON t.karyawanId = kplain.karyawanId
   AND t.periodeYear = kplain.periodeYear
   AND t.periodeMonth = kplain.periodeMonth;
    `;

    // Tambahkan parameter untuk subquery jika ada filter bulan
    const allParams = [];
    if (bulan) {
      // Untuk subquery pelatihan: 4 params (periodeYear, periodeMonth, YEAR, MONTH)
      allParams.push(filterYear, filterMonth, filterYear, filterMonth);
      // Untuk subquery kpiLain: 4 params (periodeYear, periodeMonth, YEAR, MONTH)
      allParams.push(filterYear, filterMonth, filterYear, filterMonth);
    }
    // Tambahkan params untuk WHERE clause utama
    allParams.push(...params);

    // Jalankan query
    const results = await prisma.$queryRawUnsafe(query, ...allParams);

    // Konversi BigInt
    const clean = convertBigInt(results);

    return res.json({
      status: 200,
      message: "KPI bulanan per karyawan retrieved",
      data: clean,
    });

  } catch (error) {
    console.error("Error KPI karyawan:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

export default router;