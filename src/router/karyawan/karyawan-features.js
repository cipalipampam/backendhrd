import prisma from "../../prismaClient.js";
import { Router } from "express";
import { allowRoles } from "../../middleware/role-authorization.js";
import { ROLES } from "../../constants/roles.js";

const router = Router();

// Convert BigInt in query result → Number
function convertBigInt(obj) {
  return JSON.parse(
    JSON.stringify(obj, (_, v) => (typeof v === "bigint" ? Number(v) : v))
  );
}

function calculateAge(birthDate, targetYear = null) {
  const birth = new Date(birthDate);

  // Jika ada targetYear → gunakan tanggal 1 Januari targetYear
  const today = targetYear
    ? new Date(targetYear, 0, 1) // bulan 0 = Januari
    : new Date();

  let age = today.getFullYear() - birth.getFullYear();

  const monthDiff = today.getMonth() - birth.getMonth();

  // Cek apakah ulang tahunnya belum lewat pada tahun target
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  if (age < 0) age = 0;
  return age;
}

// Helper function to calculate working years
function calculateWorkingYears(joinDate, targetYear = null) {
  const join = new Date(joinDate);

  // Jika ada targetYear → gunakan tanggal 1 Januari targetYear
  const today = targetYear
    ? new Date(targetYear, 0, 1) // bulan 0 = Januari
    : new Date();

  let years = today.getFullYear() - join.getFullYear();
  const monthDiff = today.getMonth() - join.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < join.getDate())) {
    years--;
  }
  if (years < 0) years = 0;
  return years;
}

// GET /api/karyawan-features?year=2024&bulan=2024-06
// Mendapatkan semua data karyawan dengan encoding untuk tahun tertentu
router.get("/", allowRoles(ROLES.HR), async (req, res) => {
  try {
    const { year, bulan } = req.query;

    if (!year) {
      return res.status(400).json({
        status: 400,
        message: "Parameter year wajib diisi (contoh: ? year=2024)",
      });
    }

    const targetYear = parseInt(year);

    // Validasi bulan jika ada
    let filterYear = null;
    let filterMonth = null;
    if (bulan) {
      const isValidMonth = (s) =>
        typeof s === "string" && /^\d{4}-\d{2}$/.test(s);

      if (!isValidMonth(bulan)) {
        return res.status(400).json({
          status: 400,
          message: "Query param 'bulan' must be in YYYY-MM format",
        });
      }

      const [y, m] = bulan.split("-").map(Number);
      filterYear = y;
      filterMonth = m;
    }

    // ================================
    // QUERY KPI FINAL PER KARYAWAN
    // ================================
    const kpiFinalQuery = `
      SELECT
        k.id AS karyawanId,
        
        kplain.periodeYear AS tahun,
        kplain.periodeMonth AS bulan,

        COALESCE(p.scorePresensi, 0) AS scorePresensi,
        COALESCE(t.avgPelatihan, 0) AS scorePelatihan,

        60 AS bobotPresensi,
        40 AS bobotPelatihan,

        kplain.totalBobotIndikatorLain,
        kplain.totalScoreIndikatorLain,
        kplain.kpiIndikatorLain,

        -- RUMUS KPI FINAL
        LEAST(100, GREATEST(0,
          CASE 
            WHEN kplain.kpiIndikatorLain IS NULL THEN
              (
                (COALESCE(p.scorePresensi, 0) * 60) +
                (COALESCE(t.avgPelatihan, 0) * 40)
              ) / 100
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

      FROM 
      (
        SELECT
          kp.karyawanId,
          kd.periodeYear,
          kd. periodeMonth,
          SUM(ki.bobot) AS totalBobotIndikatorLain,
          SUM(kd.score) AS totalScoreIndikatorLain,
          AVG(kd.score) AS kpiIndikatorLain
        FROM kpidetail kd
        JOIN kpi kp ON kp.id = kd.kpiId
        JOIN kpiindicator ki ON ki.id = kd.indikatorId
        WHERE ki.nama NOT IN ('presensi', 'pelatihan')
          ${
            filterYear && filterMonth
              ? `AND kd.periodeYear = ${filterYear} AND kd.periodeMonth = ${filterMonth}`
              : ""
          }
        GROUP BY kp.karyawanId, kd. periodeYear, kd.periodeMonth
      ) kplain

      JOIN karyawan k ON k.id = kplain.karyawanId

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
        ${
          filterYear && filterMonth
            ? `WHERE YEAR(kh.tanggal) = ${filterYear} AND MONTH(kh.tanggal) = ${filterMonth}`
            : ""
        }
        GROUP BY kh.karyawanId, YEAR(kh.tanggal), MONTH(kh. tanggal)
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
        ${
          filterYear && filterMonth
            ? `WHERE pd.periodeYear = ${filterYear} AND pd.periodeMonth = ${filterMonth}`
            : ""
        }
        GROUP BY pd.karyawanId, pd.periodeYear, pd.periodeMonth
      ) t
        ON t.karyawanId = kplain.karyawanId
       AND t.periodeYear = kplain.periodeYear
       AND t.periodeMonth = kplain.periodeMonth
      
      WHERE kplain.periodeYear = ${targetYear}
        ${filterMonth ? `AND kplain.periodeMonth = ${filterMonth}` : ""}
    `;

    // Jalankan query KPI Final
    const kpiFinalResults = await prisma.$queryRawUnsafe(kpiFinalQuery);
    const kpiFinalData = convertBigInt(kpiFinalResults);

    // Buat mapping KPI Final per karyawan (grouping by karyawanId)
    const kpiFinalMap = {};
    kpiFinalData.forEach((row) => {
      const karyawanId = row.karyawanId;
      if (!kpiFinalMap[karyawanId]) {
        kpiFinalMap[karyawanId] = [];
      }
      kpiFinalMap[karyawanId].push({
        tahun: row.tahun,
        bulan: row.bulan,
        kpiFinal: parseFloat(row.kpiFinal || 0),
        scorePresensi: parseFloat(row.scorePresensi || 0),
        scorePelatihan: parseFloat(row.scorePelatihan || 0),
        kpiIndikatorLain: parseFloat(row.kpiIndikatorLain || 0),
      });
    });

    // Ambil semua karyawan dengan relasi yang dibutuhkan
    const karyawanList = await prisma.karyawan.findMany({
      include: {
        departemen: true,
        kpi: {
          where: {
            year: targetYear,
          },
        },
        penghargaan: {
          where: {
            tahun: {
              gte: new Date(`${targetYear}-01-01`),
              lte: new Date(`${targetYear}-12-31`),
            },
          },
        },
        pelatihandetail: {
          include: {
            pelatihan: true,
          },
        },
      },
    });

    // Transform data untuk setiap karyawan
    const features = karyawanList.map((karyawan) => {
      // Departemen (ambil yang pertama jika ada)
      const departemenNama = karyawan.departemen[0]?.nama || "";

      // Jumlah Pelatihan
      const jumlahPelatihan = karyawan.pelatihandetail.length;

      // Umur
      const umur = karyawan.tanggal_lahir
        ? calculateAge(karyawan.tanggal_lahir, targetYear)
        : 0;

      // Lama Bekerja
      const lamaBekerja = calculateWorkingYears(
        karyawan.tanggal_masuk,
        targetYear
      );

      // KPI Final dari query
      const kpiFinalArray = kpiFinalMap[karyawan.id] || [];

      // Hitung rata-rata KPI Final untuk tahun tersebut
      const avgKpiFinal =
        kpiFinalArray.length > 0
          ? kpiFinalArray.reduce((sum, item) => sum + item.kpiFinal, 0) /
            kpiFinalArray.length
          : 0;

      // KPI > 80% (berdasarkan KPI Final)
      const kpiDiatas80 = avgKpiFinal > 80 ? 1 : 0;

      // Penghargaan (untuk tahun yang ditentukan)
      const adaPenghargaan = karyawan.penghargaan.length > 0 ? 1 : 0;

      // Rata-rata Score Pelatihan
      const scoresPelatihan = karyawan.pelatihandetail
        .map((pd) => pd.skor)
        .filter((skor) => skor !== null && skor !== undefined);

      const rataRataScorePelatihan =
        scoresPelatihan.length > 0
          ? scoresPelatihan.reduce((sum, score) => sum + score, 0) /
            scoresPelatihan.length
          : 0;

      return {
        karyawan_id: karyawan.id,
        nama: karyawan.nama,
        departemen: departemenNama,
        pendidikan: karyawan.pendidikan,
        gender: karyawan.gender,
        jalur_rekrut: karyawan.jalur_rekrut,
        jumlah_pelatihan: jumlahPelatihan,
        umur: umur,
        lama_bekerja: lamaBekerja,
        kpi_final_avg: parseFloat(avgKpiFinal.toFixed(2)),
        kpi_diatas_80: kpiDiatas80,
        penghargaan: adaPenghargaan,
        rata_rata_score_pelatihan: parseFloat(
          rataRataScorePelatihan.toFixed(2)
        ),
        // Detail KPI Final per bulan (opsional)
        kpi_final_detail: kpiFinalArray.map((item) => ({
          bulan: item.bulan,
          kpi_final: parseFloat(item.kpiFinal.toFixed(2)),
        })),
      };
    });

    res.json({
      status: 200,
      year: targetYear,
      bulan: bulan || "all",
      data: features,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// ================================
// GET /api/karyawan-features/my-kpi-bulanan
// Endpoint untuk karyawan melihat KPI bulanan mereka sendiri
// ================================
router.get("/my-kpi-bulanan", async (req, res) => {
  try {
    console.log("🔵 [my-kpi-bulanan] Request received");
    console.log("🔵 [my-kpi-bulanan] User:", req.user);

    const username = req.user?.username;

    if (!username) {
      console.log("❌ [my-kpi-bulanan] No username in req.user");
      return res.status(401).json({
        status: 401,
        message: "Unauthorized: User tidak ditemukan",
      });
    }

    console.log("✅ [my-kpi-bulanan] Username:", username);

    // Dapatkan karyawan berdasarkan username
    const karyawan = await prisma.karyawan.findFirst({
      where: { userId: username },
      select: { id: true },
    });

    if (!karyawan) {
      return res.status(404).json({
        status: 404,
        message: "Data karyawan tidak ditemukan",
      });
    }

    const karyawanId = karyawan.id;

    // Query KPI bulanan (sama seperti di kpi-karyawan.js tapi filtered by karyawanId)
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

        LEAST(100, GREATEST(0,
          CASE 
            WHEN kplain.kpiIndikatorLain IS NULL THEN
              (
                (COALESCE(p.scorePresensi, 0) * 60) +
                (COALESCE(t.avgPelatihan, 0) * 40)
              ) / 100
            ELSE
              (
                0.5 * (
                  (COALESCE(p.scorePresensi, 0) * 60) +
                  (COALESCE(t.avgPelatihan, 0) * 40)
                ) / 100
              ) + (
                0.5 * kplain.kpiIndikatorLain
              )
          END
        )) AS kpiFinal

      FROM 
      (
        SELECT
          kp.karyawanId,
          kd.periodeYear,
          kd.periodeMonth,
          SUM(ki.bobot) AS totalBobotIndikatorLain,
          SUM(kd.score) AS totalScoreIndikatorLain,
          AVG(kd.score) AS kpiIndikatorLain
        FROM kpidetail kd
        JOIN kpi kp ON kp.id = kd.kpiId
        JOIN kpiindicator ki ON ki.id = kd.indikatorId
        WHERE ki.nama NOT IN ('presensi', 'pelatihan')
        GROUP BY kp.karyawanId, kd.periodeYear, kd.periodeMonth
      ) kplain

      JOIN karyawan k ON k.id = kplain.karyawanId
      LEFT JOIN _departemenonkaryawan dok ON dok.B = k.id
      LEFT JOIN departemen d ON d.id = dok.A

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
       AND t.periodeMonth = kplain.periodeMonth

      WHERE k.id = ?
      ORDER BY kplain.periodeYear DESC, kplain.periodeMonth DESC
    `;

    const results = await prisma.$queryRawUnsafe(query, karyawanId);
    const clean = convertBigInt(results);

    return res.json({
      status: 200,
      message: "KPI bulanan karyawan retrieved",
      data: clean,
    });
  } catch (error) {
    console.error("Error getting my KPI bulanan:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// GET /api/karyawan-features/:id?year=2024
// Mendapatkan data satu karyawan dengan encoding untuk tahun tertentu
router.get("/:id", allowRoles(ROLES.HR), async (req, res) => {
  try {
    const { id } = req.params;
    const { year, bulan } = req.query;

    if (!year) {
      return res.status(400). json({
        status: 400,
        message: "Parameter year wajib diisi (contoh: ?year=2024)",
      });
    }

    const targetYear = parseInt(year);

    // Validasi bulan jika ada
    let filterYear = null;
    let filterMonth = null;
    if (bulan) {
      const isValidMonth = (s) =>
        typeof s === "string" && /^\d{4}-\d{2}$/. test(s);
      
      if (!isValidMonth(bulan)) {
        return res. status(400).json({
          status: 400,
          message: "Query param 'bulan' must be in YYYY-MM format",
        });
      }
      
      const [y, m] = bulan.split('-'). map(Number);
      filterYear = y;
      filterMonth = m;
    }

    // ================================
    // QUERY KPI FINAL UNTUK KARYAWAN SPESIFIK
    // ================================
    const kpiFinalQuery = `
      SELECT
        k.id AS karyawanId,
        
        kplain.periodeYear AS tahun,
        kplain.periodeMonth AS bulan,

        COALESCE(p.scorePresensi, 0) AS scorePresensi,
        COALESCE(t.avgPelatihan, 0) AS scorePelatihan,

        60 AS bobotPresensi,
        40 AS bobotPelatihan,

        kplain.totalBobotIndikatorLain,
        kplain.totalScoreIndikatorLain,
        kplain.kpiIndikatorLain,

        -- RUMUS KPI FINAL
        LEAST(100, GREATEST(0,
          CASE 
            WHEN kplain.kpiIndikatorLain IS NULL THEN
              (
                (COALESCE(p.scorePresensi, 0) * 60) +
                (COALESCE(t.avgPelatihan, 0) * 40)
              ) / 100
            ELSE
              (
                0.5 * (
                  (COALESCE(p. scorePresensi, 0) * 60) +
                  (COALESCE(t.avgPelatihan, 0) * 40)
                ) / 100
              )
              +
              (
                0.5 * kplain.kpiIndikatorLain
              )
          END
        )) AS kpiFinal

      FROM 
      (
        SELECT
          kp.karyawanId,
          kd.periodeYear,
          kd. periodeMonth,
          SUM(ki.bobot) AS totalBobotIndikatorLain,
          SUM(kd.score) AS totalScoreIndikatorLain,
          AVG(kd.score) AS kpiIndikatorLain
        FROM kpidetail kd
        JOIN kpi kp ON kp.id = kd.kpiId
        JOIN kpiindicator ki ON ki.id = kd.indikatorId
        WHERE ki.nama NOT IN ('presensi', 'pelatihan')
          AND kp.karyawanId = ?
          ${filterYear && filterMonth ? `AND kd.periodeYear = ${filterYear} AND kd.periodeMonth = ${filterMonth}` : ''}
        GROUP BY kp.karyawanId, kd. periodeYear, kd.periodeMonth
      ) kplain

      JOIN karyawan k ON k.id = kplain.karyawanId

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
        WHERE kh.karyawanId = ?
        ${filterYear && filterMonth ? `AND YEAR(kh.tanggal) = ${filterYear} AND MONTH(kh.tanggal) = ${filterMonth}` : ''}
        GROUP BY kh.karyawanId, YEAR(kh.tanggal), MONTH(kh.tanggal)
      ) p
        ON p.karyawanId = kplain.karyawanId
       AND p. periodeYear = kplain. periodeYear
       AND p. periodeMonth = kplain. periodeMonth

      LEFT JOIN
      (
        SELECT
          pd.karyawanId,
          pd.periodeYear,
          pd.periodeMonth,
          AVG(pd.skor) AS avgPelatihan
        FROM pelatihandetail pd
        WHERE pd. karyawanId = ? 
        ${filterYear && filterMonth ? `AND pd.periodeYear = ${filterYear} AND pd.periodeMonth = ${filterMonth}` : ''}
        GROUP BY pd. karyawanId, pd. periodeYear, pd.periodeMonth
      ) t
        ON t.karyawanId = kplain.karyawanId
       AND t.periodeYear = kplain.periodeYear
       AND t.periodeMonth = kplain.periodeMonth
      
      WHERE kplain.periodeYear = ${targetYear}
        ${filterMonth ? `AND kplain.periodeMonth = ${filterMonth}` : ''}
    `;

    // Jalankan query KPI Final dengan parameter karyawanId
    const kpiFinalResults = await prisma.$queryRawUnsafe(kpiFinalQuery, id, id, id);
    const kpiFinalData = convertBigInt(kpiFinalResults);

    // Ambil data karyawan
    const karyawan = await prisma.karyawan.findUnique({
      where: { id },
      include: {
        departemen: true,
        kpi: {
          where: {
            year: targetYear,
          },
        },
        penghargaan: {
          where: {
            tahun: {
              gte: new Date(`${targetYear}-01-01`),
              lte: new Date(`${targetYear}-12-31`),
            },
          },
        },
        pelatihandetail: {
          include: {
            pelatihan: true,
          },
        },
      },
    });

    if (!karyawan) {
      return res.status(404).json({
        status: 404,
        message: `Karyawan ${id} tidak ditemukan`,
      });
    }

    // Transform data
    const departemenNama = karyawan. departemen[0]?.nama || "";
    const jumlahPelatihan = karyawan.pelatihandetail.length;
    const umur = karyawan.tanggal_lahir
      ? calculateAge(karyawan.tanggal_lahir, targetYear)
      : 0;
    const lamaBekerja = calculateWorkingYears(
      karyawan.tanggal_masuk,
      targetYear
    );

    // KPI Final dari query
    const kpiFinalArray = kpiFinalData.map(row => ({
      tahun: row.tahun,
      bulan: row.bulan,
      kpiFinal: parseFloat(row. kpiFinal || 0),
      scorePresensi: parseFloat(row.scorePresensi || 0),
      scorePelatihan: parseFloat(row.scorePelatihan || 0),
      kpiIndikatorLain: parseFloat(row.kpiIndikatorLain || 0),
    }));

    // Hitung rata-rata KPI Final untuk tahun tersebut
    const avgKpiFinal = kpiFinalArray.length > 0
      ?  kpiFinalArray.reduce((sum, item) => sum + item. kpiFinal, 0) / kpiFinalArray.length
      : 0;

    // KPI > 80% (berdasarkan KPI Final)
    const kpiDiatas80 = avgKpiFinal > 80 ? 1 : 0;

    // Penghargaan
    const adaPenghargaan = karyawan.penghargaan.length > 0 ?  1 : 0;

    // Rata-rata Score Pelatihan
    const scoresPelatihan = karyawan.pelatihandetail
      .map((pd) => pd. skor)
      .filter((skor) => skor !== null && skor !== undefined);

    const rataRataScorePelatihan =
      scoresPelatihan.length > 0
        ? scoresPelatihan. reduce((sum, score) => sum + score, 0) /
          scoresPelatihan.length
        : 0;

    const features = {
      karyawan_id: karyawan.id,
      nama: karyawan.nama,
      departemen: departemenNama,
      pendidikan: karyawan.pendidikan,
      gender: karyawan.gender,
      jalur_rekrut: karyawan.jalur_rekrut,
      jumlah_pelatihan: jumlahPelatihan,
      umur: umur,
      lama_bekerja: lamaBekerja,
      kpi_final_avg: parseFloat(avgKpiFinal. toFixed(2)),
      kpi_diatas_80: kpiDiatas80,
      penghargaan: adaPenghargaan,
      rata_rata_score_pelatihan: parseFloat(rataRataScorePelatihan.toFixed(2)),
      // Detail KPI Final per bulan
      kpi_final_detail: kpiFinalArray. map(item => ({
        tahun: item.tahun,
        bulan: item.bulan,
        kpi_final: parseFloat(item.kpiFinal. toFixed(2)),
        score_presensi: parseFloat(item.scorePresensi.toFixed(2)),
        score_pelatihan: parseFloat(item.scorePelatihan.toFixed(2)),
        kpi_indikator_lain: item.kpiIndikatorLain ?  parseFloat(item.kpiIndikatorLain.toFixed(2)) : null,
      }))
    };

    res.json({
      status: 200,
      year: targetYear,
      bulan: bulan || "all",
      data: features,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

export default router;
