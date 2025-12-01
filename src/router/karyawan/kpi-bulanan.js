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

// GET / -> KPI bulanan per departemen
router.get("/", allowRoles(ROLES.HR), async (req, res) => {
  try {
    const { bulan, departemenId } = req.query;

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

    if (departemenId) {
      whereConditions.push("d.id = ?");
      params.push(departemenId);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Query inline KPI per departemen (agregasi dari KPI karyawan)
    const query = `
      SELECT
          d.id AS departemenId,
          d.nama AS departemen,
          kpiData.tahun,
          LPAD(kpiData.bulan, 2, '0') AS bulan,
          
          AVG(kpiData.kpiFinal) AS kpiFinalDepartemen,
          AVG(kpiData.scorePresensi) AS avgScorePresensi,
          AVG(kpiData.scorePelatihan) AS avgScorePelatihan,
          AVG(kpiData.totalScoreIndikatorLain) AS avgIndicatorScore,
          AVG(kpiData.totalBobotIndikatorLain) AS avgIndicatorBobot
          
      FROM (
          SELECT
              k.id AS karyawanId,
              d.id AS departemenId,
              p.tahun,
              p.bulan,
              
              p.scorePresensi,
              COALESCE(t.avgPelatihan, 0) AS scorePelatihan,
              COALESCE(kpLain.totalBobotIndikatorLain, 0) AS totalBobotIndikatorLain,
              COALESCE(kpLain.totalScoreIndikatorLain, 0) AS totalScoreIndikatorLain,
              
              CASE
                  WHEN kpLain.kpiIndikatorLain IS NULL
                      THEN (
                          (p.scorePresensi * 60 + COALESCE(t.avgPelatihan, 0) * 40) / 100
                      )
                  ELSE (
                      (
                          (p.scorePresensi * 60 + COALESCE(t.avgPelatihan, 0) * 40) / 100
                      )
                      + kpLain.kpiIndikatorLain
                  ) / 2
              END AS kpiFinal

          FROM (
              SELECT 
                  kh.karyawanId,
                  YEAR(kh.tanggal) AS tahun,
                  MONTH(kh.tanggal) AS bulan,
                  (
                      SUM(
                          CASE 
                              WHEN kh.status = 'HADIR' THEN 100
                              WHEN kh.status IN ('IZIN','SAKIT') THEN 80
                              WHEN kh.status = 'TERLAMBAT' THEN 70
                              WHEN kh.status = 'ALPA' THEN 0
                              ELSE 0
                          END
                      ) / COUNT(*)
                  ) AS scorePresensi
              FROM kehadiran kh
              GROUP BY kh.karyawanId, YEAR(kh.tanggal), MONTH(kh.tanggal)
          ) p

          LEFT JOIN (
              SELECT
                  pd.karyawanId,
                  COALESCE(pd.periodeYear, YEAR(pd.createdAt)) AS tahun,
                  COALESCE(pd.periodeMonth, MONTH(pd.createdAt)) AS bulan,
                  AVG(pd.skor) AS avgPelatihan
              FROM pelatihandetail pd
              ${bulan ? `WHERE (pd.periodeYear = ? AND pd.periodeMonth = ?) OR (pd.periodeYear IS NULL AND YEAR(pd.createdAt) = ? AND MONTH(pd.createdAt) = ?)` : ''}
              GROUP BY pd.karyawanId, COALESCE(pd.periodeYear, YEAR(pd.createdAt)), COALESCE(pd.periodeMonth, MONTH(pd.createdAt))
          ) t
            ON t.karyawanId = p.karyawanId
           AND t.tahun = p.tahun
           AND t.bulan = p.bulan

          JOIN karyawan k ON k.id = p.karyawanId
          LEFT JOIN _departemenonkaryawan dok ON dok.B = k.id
          LEFT JOIN departemen d ON d.id = dok.A

          LEFT JOIN (
              SELECT
                  kp.karyawanId,
                  COALESCE(kd.periodeYear, YEAR(kd.createdAt)) AS tahun,
                  COALESCE(kd.periodeMonth, MONTH(kd.createdAt)) AS bulan,
                  
                  SUM(ki.bobot) AS totalBobotIndikatorLain,
                  SUM(kd.score) AS totalScoreIndikatorLain,
                  AVG(kd.score) AS kpiIndikatorLain

              FROM kpidetail kd
              JOIN kpi kp ON kp.id = kd.kpiId
              JOIN kpiindicator ki ON ki.id = kd.indikatorId
              WHERE ki.nama NOT IN ('presensi','pelatihan')
                  ${bulan ? `AND ((kd.periodeYear = ? AND kd.periodeMonth = ?) OR (kd.periodeYear IS NULL AND YEAR(kd.createdAt) = ? AND MONTH(kd.createdAt) = ?))` : ''}
              GROUP BY kp.karyawanId, COALESCE(kd.periodeYear, YEAR(kd.createdAt)), COALESCE(kd.periodeMonth, MONTH(kd.createdAt))
          ) kpLain
            ON kpLain.karyawanId = p.karyawanId
           AND kpLain.tahun = p.tahun
           AND kpLain.bulan = p.bulan
      ) kpiData
      
      JOIN departemen d ON d.id = kpiData.departemenId
      
      ${whereClause}
      
      GROUP BY
          d.id,
          d.nama,
          kpiData.tahun,
          kpiData.bulan
      
      ORDER BY
          kpiData.tahun DESC,
          kpiData.bulan DESC,
          d.nama
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

    // Query raw SQL
    const results = await prisma.$queryRawUnsafe(query, ...allParams);

    // FIX BigInt
    const clean = convertBigInt(results);

    res.json({
      status: 200,
      message: "KPI bulanan per departemen retrieved",
      data: clean,
    });
  } catch (error) {
    console.error("KPI bulanan error:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

export default router;
