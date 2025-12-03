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

    vk.tahun,
    vk.bulan,

    AVG(vk.kpiFinal) AS kpiFinalDepartemen,
    AVG(vk.scorePresensi) AS avgScorePresensi,
    AVG(vk.scorePelatihan) AS avgScorePelatihan,
    AVG(vk.kpiIndikatorLain) AS avgKpiIndikatorLain,
    AVG(vk.totalBobotIndikatorLain) AS avgBobotIndikatorLain,
    AVG(vk.totalScoreIndikatorLain) AS avgScoreIndikatorLain

FROM v_kpi_karyawan_bulanan vk
JOIN departemen d
    ON d.id = vk.departemenId

GROUP BY
    d.id, d.nama,
    vk.tahun, vk.bulan

ORDER BY
    vk.tahun DESC,
    vk.bulan DESC,
    d.nama ASC;
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
