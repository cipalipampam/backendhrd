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

    // Build filter query
    const params = [];
    let whereClause = "";

    if (bulan) {
      whereClause += " WHERE p.bulan = ?";
      params.push(bulan);
    }

    if (karyawanId) {
      whereClause += whereClause ? " AND k.id = ?" : " WHERE k.id = ?";
      params.push(karyawanId);
    }

    if (departemenId) {
      whereClause += whereClause ? " AND d.id = ?" : " WHERE d.id = ?";
      params.push(departemenId);
    }

    // ================================
    // QUERY KPI PER KARYAWAN / BULAN
    // ================================
    const query = `
      SELECT
          k.id AS karyawanId,
          k.nama AS namaKaryawan,

          d.id AS departemenId,
          d.nama AS departemen,

          p.bulan,

          /* PRESENSI & PELATIHAN */
          p.scorePresensi,
          COALESCE(t.avgPelatihan, 0) AS scorePelatihan,

          60 AS bobotPresensi,
          40 AS bobotPelatihan,

          /* INDIKATOR LAIN */
          COALESCE(kpLain.totalBobotLain, 0) AS totalBobotIndikatorLain,
          COALESCE(kpLain.totalScoreLain, 0) AS totalScoreIndikatorLain,

          /* KPI FINAL */
          (
              (
                  (p.scorePresensi * 60) +
                  (COALESCE(t.avgPelatihan, 0) * 40)
              ) / 100
              +
              COALESCE(kpLain.totalScoreLain, 0)
          ) / (1 + COALESCE(kpLain.totalBobotLain, 0)) AS kpiFinal

      FROM (
          /* PRESENSI PER KARYAWAN PER BULAN */
          SELECT 
              kh.karyawanId,
              DATE_FORMAT(kh.tanggal, '%Y-%m') AS bulan,
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
          GROUP BY kh.karyawanId, DATE_FORMAT(kh.tanggal, '%Y-%m')
      ) p

      /* PELATIHAN PER KARYAWAN PER BULAN */
      LEFT JOIN (
          SELECT
              pd.karyawanId,
              DATE_FORMAT(pd.createdAt, '%Y-%m') AS bulan,
              AVG(pd.skor) AS avgPelatihan
          FROM pelatihandetail pd
          GROUP BY pd.karyawanId, DATE_FORMAT(pd.createdAt, '%Y-%m')
      ) t
        ON t.karyawanId = p.karyawanId
       AND t.bulan = p.bulan

      /* JOIN KARYAWAN */
      JOIN karyawan k ON k.id = p.karyawanId

      /* DEPARTEMEN KARYAWAN */
      LEFT JOIN _departemenonkaryawan dok ON dok.B = k.id
      LEFT JOIN departemen d ON d.id = dok.A

      /* KPI INDIKATOR LAIN PER KARYAWAN PER BULAN */
      LEFT JOIN (
          SELECT
              kp.karyawanId,
              DATE_FORMAT(kd.createdAt, '%Y-%m') AS bulan,
              SUM(ki.bobot) AS totalBobotLain,
              SUM(ki.bobot * COALESCE(kd.score,0)) AS totalScoreLain
          FROM kpidetail kd
          JOIN kpi kp ON kp.id = kd.kpiId              -- menghubungkan ke karyawan
          JOIN kpiindicator ki ON ki.id = kd.indikatorId
          WHERE ki.nama NOT IN ('presensi','pelatihan')
          GROUP BY kp.karyawanId, DATE_FORMAT(kd.createdAt, '%Y-%m')
      ) kpLain
        ON kpLain.karyawanId = p.karyawanId
       AND kpLain.bulan = p.bulan

      ${whereClause}

      ORDER BY p.bulan DESC, k.nama;
    `;

    // Jalankan query
    const results = await prisma.$queryRawUnsafe(query, ...params);

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
