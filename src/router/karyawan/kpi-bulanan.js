import prisma from "../../prismaClient.js";
import { Router } from "express";
import { allowRoles } from "../../middleware/role-authorization.js";
import { ROLES } from "../../constants/roles.js";

const router = Router();

// GET / -> KPI bulanan per departemen
// Query params:
// - bulan: YYYY-MM (optional)
// - departemenId: string (optional)
router.get("/", allowRoles(ROLES.HR), async (req, res) => {
  try {
    const { bulan, departemenId } = req.query;

    // Simple validation
    const isValidMonth = (s) => typeof s === "string" && /^\d{4}-\d{2}$/.test(s);
    if (bulan && !isValidMonth(bulan)) {
      return res.status(400).json({ status: 400, message: "Query param 'bulan' must be in YYYY-MM format" });
    }

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
        ( AVG(p.scorePresensi) * 0.6 + AVG(COALESCE(t.avgPelatihan, 0)) * 0.4 ) AS kpiFinal
      FROM (
        SELECT 
          k.id AS karyawanId,
          DATE_FORMAT(kh.tanggal, '%Y-%m') AS bulan,
          (SUM(CASE WHEN kh.status = 'HADIR' THEN 1 ELSE 0 END) / COUNT(*)) * 100 AS scorePresensi
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
      ${whereClause}
      GROUP BY d.id, d.nama, p.bulan
      ORDER BY p.bulan DESC, d.nama;
    `;

    const results = await prisma.$queryRawUnsafe(query, ...params);

    res.json({ status: 200, message: "KPI bulanan retrieved", data: results });
  } catch (error) {
    console.error('KPI bulanan error:', error);
    res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
  }
});

export default router;
