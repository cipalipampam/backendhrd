import prisma from "../../prismaClient.js";
import { Router } from "express";
import { body, validationResult } from "express-validator";
import { allowRoles } from "../../middleware/role-authorization.js";
import { ROLES } from "../../constants/roles.js";

const router = Router();

// Check-in (untuk karyawan yang sedang login)
router.post(
  "/check-in",
  [
    body("lokasi").optional().isString(),
    body("latitude").optional().isFloat(),
    body("longitude").optional().isFloat(),
    body("keterangan").optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Cari karyawan berdasarkan user
      const karyawan = await prisma.karyawan.findUnique({
        where: { userId: user.username },
      });

      if (!karyawan) {
        return res.status(404).json({ message: "Karyawan not found" });
      }

      // Cek apakah sudah check-in hari ini
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const existingKehadiran = await prisma.kehadiran.findFirst({
        where: {
          karyawanId: karyawan.id,
          tanggal: {
            gte: today,
            lt: tomorrow,
          },
        },
      });

      if (existingKehadiran && existingKehadiran.waktuMasuk) {
        return res.status(400).json({
          message: "Anda sudah check-in hari ini",
          data: existingKehadiran,
        });
      }

      const waktuMasuk = new Date();
      const jamMasuk = waktuMasuk.getHours();
      const menitMasuk = waktuMasuk.getMinutes();

      // Tentukan status (jam masuk kantor: 08:00)
      let status = "HADIR";
      if (jamMasuk > 8 || (jamMasuk === 8 && menitMasuk > 0)) {
        status = "TERLAMBAT";
      }

      // Create atau update kehadiran
      const kehadiran = await prisma.kehadiran.upsert({
        where: {
          karyawanId_tanggal: {
            karyawanId: karyawan.id,
            tanggal: today,
          },
        },
        update: {
          waktuMasuk,
          status,
          lokasi: req.body.lokasi,
          latitude: req.body.latitude,
          longitude: req.body.longitude,
          keterangan: req.body.keterangan,
        },
        create: {
          karyawanId: karyawan.id,
          tanggal: today,
          waktuMasuk,
          status,
          lokasi: req.body.lokasi,
          latitude: req.body.latitude,
          longitude: req.body.longitude,
          keterangan: req.body.keterangan,
        },
        include: {
          karyawan: {
            select: {
              id: true,
              nama: true,
            },
          },
        },
      });

      res.status(201).json({
        status: 201,
        message: "Check-in berhasil",
        data: kehadiran,
      });
    } catch (error) {
      console.error("Check-in error:", error);
      res.status(500).json({
        status: 500,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
);

// Check-out (untuk karyawan yang sedang login)
router.post(
  "/check-out",
  [
    body("keterangan").optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Cari karyawan berdasarkan user
      const karyawan = await prisma.karyawan.findUnique({
        where: { userId: user.username },
      });

      if (!karyawan) {
        return res.status(404).json({ message: "Karyawan not found" });
      }

      // Cari kehadiran hari ini
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const kehadiran = await prisma.kehadiran.findFirst({
        where: {
          karyawanId: karyawan.id,
          tanggal: {
            gte: today,
            lt: tomorrow,
          },
        },
      });

      if (!kehadiran) {
        return res.status(404).json({
          message: "Anda belum check-in hari ini",
        });
      }

      if (!kehadiran.waktuMasuk) {
        return res.status(400).json({
          message: "Anda belum check-in hari ini",
        });
      }

      if (kehadiran.waktuKeluar) {
        return res.status(400).json({
          message: "Anda sudah check-out hari ini",
          data: kehadiran,
        });
      }

      const waktuKeluar = new Date();

      // Update kehadiran
      const updatedKehadiran = await prisma.kehadiran.update({
        where: { id: kehadiran.id },
        data: {
          waktuKeluar,
          keterangan: req.body.keterangan || kehadiran.keterangan,
        },
        include: {
          karyawan: {
            select: {
              id: true,
              nama: true,
            },
          },
        },
      });

      res.json({
        status: 200,
        message: "Check-out berhasil",
        data: updatedKehadiran,
      });
    } catch (error) {
      console.error("Check-out error:", error);
      res.status(500).json({
        status: 500,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
);

// Get kehadiran hari ini untuk user yang login
router.get("/today", async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const karyawan = await prisma.karyawan.findUnique({
      where: { userId: user.username },
    });

    if (!karyawan) {
      return res.status(404).json({ message: "Karyawan not found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const kehadiran = await prisma.kehadiran.findFirst({
      where: {
        karyawanId: karyawan.id,
        tanggal: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        karyawan: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    });

    res.json({
      status: 200,
      message: kehadiran ? "Kehadiran found" : "Belum ada kehadiran hari ini",
      data: kehadiran,
    });
  } catch (error) {
    console.error("Get today kehadiran error:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get riwayat kehadiran user yang login (dengan filter bulan/tahun)
router.get("/history", async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const karyawan = await prisma.karyawan.findUnique({
      where: { userId: user.username },
    });

    if (!karyawan) {
      return res.status(404).json({ message: "Karyawan not found" });
    }

    const { month, year } = req.query;

    let whereCondition = {
      karyawanId: karyawan.id,
    };

    // Filter berdasarkan bulan dan tahun jika ada
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 1);

      whereCondition.tanggal = {
        gte: startDate,
        lt: endDate,
      };
    } else if (year) {
      const startDate = new Date(parseInt(year), 0, 1);
      const endDate = new Date(parseInt(year) + 1, 0, 1);

      whereCondition.tanggal = {
        gte: startDate,
        lt: endDate,
      };
    }

    const kehadiran = await prisma.kehadiran.findMany({
      where: whereCondition,
      orderBy: {
        tanggal: "desc",
      },
      include: {
        karyawan: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    });

    // Hitung statistik
    const stats = {
      total: kehadiran.length,
      hadir: kehadiran.filter((k) => k.status === "HADIR").length,
      terlambat: kehadiran.filter((k) => k.status === "TERLAMBAT").length,
      izin: kehadiran.filter((k) => k.status === "IZIN").length,
      sakit: kehadiran.filter((k) => k.status === "SAKIT").length,
      alpa: kehadiran.filter((k) => k.status === "ALPA").length,
      belumAbsen: kehadiran.filter((k) => k.status === "BELUM_ABSEN").length,
    };

    res.json({
      status: 200,
      message: "Riwayat kehadiran found",
      data: kehadiran,
      stats,
    });
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get all kehadiran (HR only) dengan filter
router.get("/", allowRoles(ROLES.HR), async (req, res) => {
  try {
    const { karyawanId, month, year, status } = req.query;

    let whereCondition = {};

    if (karyawanId) {
      whereCondition.karyawanId = karyawanId;
    }

    if (status) {
      whereCondition.status = status;
    }

    // Filter berdasarkan bulan dan tahun jika ada
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 1);

      whereCondition.tanggal = {
        gte: startDate,
        lt: endDate,
      };
    } else if (year) {
      const startDate = new Date(parseInt(year), 0, 1);
      const endDate = new Date(parseInt(year) + 1, 0, 1);

      whereCondition.tanggal = {
        gte: startDate,
        lt: endDate,
      };
    }

    const kehadiran = await prisma.kehadiran.findMany({
      where: whereCondition,
      orderBy: {
        tanggal: "desc",
      },
      include: {
        karyawan: {
          select: {
            id: true,
            nama: true,
            departemen: true,
            jabatan: true,
          },
        },
      },
    });

    res.json({
      status: 200,
      message: "Kehadiran found",
      data: kehadiran,
    });
  } catch (error) {
    console.error("Get all kehadiran error:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Update kehadiran manual (HR only) - untuk input izin, sakit, dll
router.put(
  "/:id",
  allowRoles(ROLES.HR),
  [
    body("status")
      .optional()
      .isIn(["HADIR", "TERLAMBAT", "IZIN", "SAKIT", "ALPA", "BELUM_ABSEN"]),
    body("waktuMasuk").optional().isISO8601(),
    body("waktuKeluar").optional().isISO8601(),
    body("keterangan").optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;

      const kehadiran = await prisma.kehadiran.findUnique({
        where: { id },
      });

      if (!kehadiran) {
        return res.status(404).json({ message: "Kehadiran not found" });
      }

      const updateData = {};
      if (req.body.status) updateData.status = req.body.status;
      if (req.body.waktuMasuk)
        updateData.waktuMasuk = new Date(req.body.waktuMasuk);
      if (req.body.waktuKeluar)
        updateData.waktuKeluar = new Date(req.body.waktuKeluar);
      if (req.body.keterangan !== undefined)
        updateData.keterangan = req.body.keterangan;

      const updatedKehadiran = await prisma.kehadiran.update({
        where: { id },
        data: updateData,
        include: {
          karyawan: {
            select: {
              id: true,
              nama: true,
            },
          },
        },
      });

      res.json({
        status: 200,
        message: "Kehadiran updated",
        data: updatedKehadiran,
      });
    } catch (error) {
      console.error("Update kehadiran error:", error);
      res.status(500).json({
        status: 500,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
);

// Create kehadiran manual (HR only)
router.post(
  "/",
  allowRoles(ROLES.HR),
  [
    body("karyawanId").notEmpty().isString(),
    body("tanggal").notEmpty().isISO8601(),
    body("status").isIn([
      "HADIR",
      "TERLAMBAT",
      "IZIN",
      "SAKIT",
      "ALPA",
      "BELUM_ABSEN",
    ]),
    body("waktuMasuk").optional().isISO8601(),
    body("waktuKeluar").optional().isISO8601(),
    body("lokasi").optional().isString(),
    body("keterangan").optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { karyawanId, tanggal, status, waktuMasuk, waktuKeluar, lokasi, keterangan } =
        req.body;

      // Cek karyawan exists
      const karyawan = await prisma.karyawan.findUnique({
        where: { id: karyawanId },
      });

      if (!karyawan) {
        return res.status(404).json({ message: "Karyawan not found" });
      }

      // Buat date object dan set ke awal hari
      const tanggalDate = new Date(tanggal);
      tanggalDate.setHours(0, 0, 0, 0);

      const kehadiran = await prisma.kehadiran.create({
        data: {
          karyawanId,
          tanggal: tanggalDate,
          status,
          waktuMasuk: waktuMasuk ? new Date(waktuMasuk) : null,
          waktuKeluar: waktuKeluar ? new Date(waktuKeluar) : null,
          lokasi,
          keterangan,
        },
        include: {
          karyawan: {
            select: {
              id: true,
              nama: true,
            },
          },
        },
      });

      res.status(201).json({
        status: 201,
        message: "Kehadiran created",
        data: kehadiran,
      });
    } catch (error) {
      console.error("Create kehadiran error:", error);
      
      // Handle unique constraint violation
      if (error.code === 'P2002') {
        return res.status(400).json({
          status: 400,
          message: "Kehadiran untuk karyawan pada tanggal ini sudah ada",
        });
      }

      res.status(500).json({
        status: 500,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
);

// Delete kehadiran (HR only)
router.delete("/:id", allowRoles(ROLES.HR), async (req, res) => {
  try {
    const { id } = req.params;

    const kehadiran = await prisma.kehadiran.findUnique({
      where: { id },
    });

    if (!kehadiran) {
      return res.status(404).json({ message: "Kehadiran not found" });
    }

    await prisma.kehadiran.delete({
      where: { id },
    });

    res.json({
      status: 200,
      message: "Kehadiran deleted",
    });
  } catch (error) {
    console.error("Delete kehadiran error:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get laporan kehadiran summary per karyawan (HR only)
router.get("/report/summary", allowRoles(ROLES.HR), async (req, res) => {
  try {
    const { month, year } = req.query;

    let whereCondition = {};

    // Filter berdasarkan bulan dan tahun jika ada
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 1);

      whereCondition.tanggal = {
        gte: startDate,
        lt: endDate,
      };
    } else if (year) {
      const startDate = new Date(parseInt(year), 0, 1);
      const endDate = new Date(parseInt(year) + 1, 0, 1);

      whereCondition.tanggal = {
        gte: startDate,
        lt: endDate,
      };
    }

    const kehadiran = await prisma.kehadiran.findMany({
      where: whereCondition,
      include: {
        karyawan: {
          select: {
            id: true,
            nama: true,
            departemen: true,
            jabatan: true,
          },
        },
      },
    });

    // Group by karyawan dan hitung statistik
    const summaryMap = {};

    kehadiran.forEach((k) => {
      if (!summaryMap[k.karyawanId]) {
        summaryMap[k.karyawanId] = {
          karyawan: k.karyawan,
          total: 0,
          hadir: 0,
          terlambat: 0,
          izin: 0,
          sakit: 0,
          alpa: 0,
          belumAbsen: 0,
        };
      }

      summaryMap[k.karyawanId].total++;
      if (k.status === "HADIR") summaryMap[k.karyawanId].hadir++;
      if (k.status === "TERLAMBAT") summaryMap[k.karyawanId].terlambat++;
      if (k.status === "IZIN") summaryMap[k.karyawanId].izin++;
      if (k.status === "SAKIT") summaryMap[k.karyawanId].sakit++;
      if (k.status === "ALPA") summaryMap[k.karyawanId].alpa++;
      if (k.status === "BELUM_ABSEN") summaryMap[k.karyawanId].belumAbsen++;
    });

    const summary = Object.values(summaryMap).map((item) => ({
      ...item,
      persentaseKehadiran: item.total > 0 
        ? Math.round(((item.hadir + item.terlambat) / item.total) * 100) 
        : 0,
    }));

    res.json({
      status: 200,
      message: "Laporan kehadiran summary",
      data: summary,
    });
  } catch (error) {
    console.error("Get report summary error:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

export default router;
