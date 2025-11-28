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

    // Build filter query
    const params = [];
    let whereClause = "";

    if (bulan) {
      whereClause += " WHERE p.bulan = ?";
      params.push(bulan);
    }

    if (departemenId) {
      whereClause += bulan ? " AND d.id = ?" : " WHERE d.id = ?";
      params.push(departemenId);
    }

    const query = `
      SELECT
          d.id AS departemenId,
          d.nama AS departemen,
          p.bulan,

          AVG(p.scorePresensi) AS scorePresensi,
          AVG(COALESCE(t.avgPelatihan, 0)) AS scorePelatihan,

          60 AS bobotPresensi,
          40 AS bobotPelatihan,

          COALESCE(kpLain.totalBobotLain, 0) AS totalBobotIndikatorLain,
          COALESCE(kpLain.totalScoreLain, 0) AS totalScoreIndikatorLain,

          (
              (
                  (AVG(p.scorePresensi) * 60) +
                  (AVG(COALESCE(t.avgPelatihan, 0)) * 40)
              ) / 100
              +
              COALESCE(kpLain.totalScoreLain, 0)
          )
          /
          (1 + COALESCE(kpLain.totalBobotLain, 0)) AS kpiFinal

      FROM (

          SELECT 
              k.id AS karyawanId,
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
          FROM karyawan k
          JOIN kehadiran kh ON kh.karyawanId = k.id
          GROUP BY k.id, bulan
      ) p

      LEFT JOIN (
          SELECT 
              karyawanId,
              DATE_FORMAT(createdAt, '%Y-%m') AS bulan,
              AVG(skor) AS avgPelatihan
          FROM pelatihandetail
          GROUP BY karyawanId, bulan
      ) t 
          ON t.karyawanId = p.karyawanId
         AND t.bulan = p.bulan

      JOIN _departemenonkaryawan dok 
          ON dok.B = p.karyawanId

      JOIN departemen d 
          ON d.id = dok.A

      LEFT JOIN (
          SELECT
              ki.departemenId,
              SUM(ki.bobot) AS totalBobotLain,
              SUM(ki.bobot * COALESCE(kd.score, 0)) AS totalScoreLain
          FROM kpiindicator ki
          LEFT JOIN kpidetail kd 
              ON kd.indikatorId = ki.id
          WHERE ki.nama NOT IN ('presensi', 'pelatihan')
          GROUP BY ki.departemenId
      ) kpLain
          ON kpLain.departemenId = d.id

      ${whereClause}

      GROUP BY 
          d.id,
          d.nama,
          p.bulan,
          kpLain.totalBobotLain,
          kpLain.totalScoreLain

      ORDER BY p.bulan DESC, d.nama;
    `;

    // Query raw SQL
    const results = await prisma.$queryRawUnsafe(query, ...params);

    // FIX BigInt
    const clean = convertBigInt(results);

    res.json({
      status: 200,
      message: "KPI bulanan retrieved",
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
