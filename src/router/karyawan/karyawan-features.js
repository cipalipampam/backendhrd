import prisma from "../../prismaClient.js";
import { Router } from "express";
import { allowRoles } from "../../middleware/role-authorization.js";
import { ROLES } from "../../constants/roles.js";

const router = Router();

// Encoding mappings
const ENCODING = {
  departemen: {
    "Sales & Marketing": 1,
    Operations: 2,
    Technology: 3,
    Analytics: 4,
    "R&D": 5,
    Procurement: 6,
    Finance: 7,
    HR: 8,
    Legal: 9,
  },
  pendidikan: {
    Magister: 3,
    Sarjana: 2,
    "Dibawah Keduanya": 1,
  },
  jalur_rekrut: {
    Wawancara: 1,
    Undangan: 2,
    lainnya: 3,
  },
  gender: {
    Pria: 1,
    Wanita: 2,
  },
};

// Helper function to calculate age
// function calculateAge(birthDate) {
//   const today = new Date();
//   const birth = new Date(birthDate);
//   let age = today.getFullYear() - birth.getFullYear();
//   const monthDiff = today.getMonth() - birth.getMonth();
//   if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
//     age--;
//   }
//   return age;
// }

function calculateAge(birthDate, targetYear = null) {
  const birth = new Date(birthDate);

  // Jika ada targetYear → gunakan tanggal 1 Januari targetYear
  const today = targetYear
    ? new Date(targetYear, 12) // bulan 0 = Januari
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
    ? new Date(targetYear, 12) // bulan 0 = Januari
    : new Date();

  let years = today.getFullYear() - join.getFullYear();
  const monthDiff = today.getMonth() - join.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < join.getDate())) {
    years--;
  }
  if (years < 0) years = 0;
  return years;
}

// GET /api/karyawan-features?year=2024
// Mendapatkan semua data karyawan dengan encoding untuk tahun tertentu
router.get("/", allowRoles(ROLES.HR), async (req, res) => {
  try {
    const { year } = req.query;

    if (!year) {
      return res.status(400).json({
        status: 400,
        message: "Parameter year wajib diisi (contoh: ?year=2024)",
      });
    }

    const targetYear = parseInt(year);

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
      const departemenEncoded = ENCODING.departemen[departemenNama] || 0;

      // Pendidikan
      const pendidikanEncoded = ENCODING.pendidikan[karyawan.pendidikan] || 0;

      // Gender
      const genderEncoded = ENCODING.gender[karyawan.gender] || 0;

      // Jalur Rekrut
      const jalurRekrutEncoded =
        ENCODING.jalur_rekrut[karyawan.jalur_rekrut] || 0;

      // Jumlah Pelatihan
      const jumlahPelatihan = karyawan.pelatihandetail.length;

      // Umur
      const umur = karyawan.tanggal_lahir
        ? calculateAge(karyawan.tanggal_lahir, targetYear)
        : 0;

      // Lama Bekerja
      const lamaBekerja = calculateWorkingYears(karyawan.tanggal_masuk, targetYear);

      // KPI > 80% (untuk tahun yang ditentukan)
      const kpiData = karyawan.kpi[0]; // sudah difilter by year
      const kpiDiatas80 = kpiData && kpiData.score > 80 ? 1 : 0;

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
        // departemen: departemenEncoded,
        // pendidikan: pendidikanEncoded,
        // gender: genderEncoded,
        // jalur_rekrut: jalurRekrutEncoded,
        departemen: departemenNama,
        pendidikan: karyawan.pendidikan,
        gender: karyawan.gender,
        jalur_rekrut: karyawan.jalur_rekrut,
        jumlah_pelatihan: jumlahPelatihan,
        umur: umur,
        lama_bekerja: lamaBekerja,
        kpi_diatas_80: kpiDiatas80,
        penghargaan: adaPenghargaan,
        rata_rata_score_pelatihan: parseFloat(
          rataRataScorePelatihan.toFixed(2)
        ),
        // Data tambahan untuk referensi (tidak encoded)
        // _raw: {
        //     departemen_nama: departemenNama,
        //     pendidikan_nama: karyawan.pendidikan,
        //     gender_nama: karyawan.gender,
        //     jalur_rekrut_nama: karyawan.jalur_rekrut,
        //     kpi_score: kpiData?.score || null
        // }
      };
    });

    res.json({
      status: 200,
      // message: `Data features karyawan untuk tahun ${targetYear}`,
      year: targetYear,
      // total: features.length,
      // encoding_reference: ENCODING,
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

// GET /api/karyawan-features/:id?year=2024
// Mendapatkan data satu karyawan dengan encoding untuk tahun tertentu
router.get("/:id", allowRoles(ROLES.HR), async (req, res) => {
  try {
    const { id } = req.params;
    const { year } = req.query;

    if (!year) {
      return res.status(400).json({
        status: 400,
        message: "Parameter year wajib diisi (contoh: ?year=2024)",
      });
    }

    const targetYear = parseInt(year);

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
    const departemenNama = karyawan.departemen[0]?.nama || "";
    const departemenEncoded = ENCODING.departemen[departemenNama] || 0;
    const pendidikanEncoded = ENCODING.pendidikan[karyawan.pendidikan] || 0;
    const genderEncoded = ENCODING.gender[karyawan.gender] || 0;
    const jalurRekrutEncoded =
      ENCODING.jalur_rekrut[karyawan.jalur_rekrut] || 0;
    const jumlahPelatihan = karyawan.pelatihandetail.length;
    const umur = karyawan.tanggal_lahir
      ? calculateAge(karyawan.tanggal_lahir, targetYear)
      : 0;
    const lamaBekerja = calculateWorkingYears(karyawan.tanggal_masuk, targetYear);
    const kpiData = karyawan.kpi[0];
    const kpiDiatas80 = kpiData && kpiData.score > 80 ? 1 : 0;
    const adaPenghargaan = karyawan.penghargaan.length > 0 ? 1 : 0;

    const scoresPelatihan = karyawan.pelatihandetail
      .map((pd) => pd.skor)
      .filter((skor) => skor !== null && skor !== undefined);

    const rataRataScorePelatihan =
      scoresPelatihan.length > 0
        ? scoresPelatihan.reduce((sum, score) => sum + score, 0) /
          scoresPelatihan.length
        : 0;

    const features = {
      karyawan_id: karyawan.id,
      nama: karyawan.nama,
      // departemen: departemenEncoded,
      // pendidikan: pendidikanEncoded,
      // gender: genderEncoded,
      // jalur_rekrut: jalurRekrutEncoded,
      departemen: departemenNama,
      pendidikan: karyawan.pendidikan,
      gender: karyawan.gender,
      jalur_rekrut: karyawan.jalur_rekrut,
      jumlah_pelatihan: jumlahPelatihan,
      umur: umur,
      lama_bekerja: lamaBekerja,
      kpi_diatas_80: kpiDiatas80,
      penghargaan: adaPenghargaan,
      rata_rata_score_pelatihan: parseFloat(rataRataScorePelatihan.toFixed(2)),
      // _raw: {
      //     departemen_nama: departemenNama,
      //     pendidikan_nama: karyawan.pendidikan,
      //     gender_nama: karyawan.gender,
      //     jalur_rekrut_nama: karyawan.jalur_rekrut,
      //     kpi_score: kpiData?.score || null
      // }
    };

    res.json({
      status: 200,
      // message: `Data features karyawan ${karyawan.nama} untuk tahun ${targetYear}`,
      year: targetYear,
      // encoding_reference: ENCODING,
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
