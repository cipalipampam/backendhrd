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

    vk.tahun,
    vk.bulan,

    /* KPI DEPARTEMEN = rata-rata KPI Final karyawan */
    AVG(vk.kpiFinal) AS kpiFinalDepartemen,

    /* Komponen pendukung untuk analisa */
    AVG(vk.scorePresensi) AS avgScorePresensi,
    AVG(vk.scorePelatihan) AS avgScorePelatihan,
    AVG(vk.totalScoreIndikatorLain) AS avgIndicatorScore,
    AVG(vk.totalBobotIndikatorLain) AS avgIndicatorBobot

FROM v_kpi_karyawan_bulanan vk
JOIN departemen d
    ON d.id = vk.departemenId

GROUP BY
    d.id,
    d.nama,
    vk.tahun,
    vk.bulan

ORDER BY
    vk.tahun DESC,
    vk.bulan DESC,
    d.nama;

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
