import prisma from "../../prismaClient.js";
import { Router } from "express";
import bcrypt from "bcrypt";
import { body, validationResult } from "express-validator";
import { allowRoles } from "../../middleware/role-authorization.js";
import { ROLES } from "../../constants/roles.js"; 

const router = Router();

// Get all karyawan (HR only)
router.get("/", allowRoles(ROLES.HR), async (req, res) => {
  try {
    const karyawan = await prisma.karyawan.findMany({
      include: {
        departemen: true,
        jabatan: true,
        kpi: true,
        rating: true,
        pelatihandetail: {
          include: {
            pelatihan: true
          }
        },
        user: {
          select: {
            username: true,
            email: true,
            role: true
          }
        }
      },
    });

    const now = new Date();

    const data = karyawan.map((k) => {
      // Hitung umur
      let umur = null;
      if (k.tanggal_lahir) {
        const diff = now - new Date(k.tanggal_lahir);
        umur = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
      }

      // Hitung lama masa kerja (dalam tahun, bisa diubah ke bulan)
      const diffKerja = now - new Date(k.tanggal_masuk);
      const masaKerjaTahun = Math.floor(
        diffKerja / (365.25 * 24 * 60 * 60 * 1000)
      );

      return {
        ...k,
        umur,
        masaKerja: masaKerjaTahun,
      };
    });

    res.json({
      status: 200,
      message: "Karyawan found",
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get current user's karyawan data
router.get("/me", async (req, res) => {
  try {
    const user = req.user; // From JWT token
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const karyawan = await prisma.karyawan.findUnique({
      where: { userId: user.username },
      include: {
        Departemen: true,
        Jabatan: true,
        KPI: true,
        Rating: true,
        pelatihanDetail: {
          include: {
            pelatihan: true
          }
        },
        user: {
          select: {
            username: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!karyawan) {
      return res.status(404).json({
        status: 404,
        message: "Karyawan data not found for this user",
      });
    }

    const now = new Date();

    // Hitung umur
    let umur = null;
    if (karyawan.tanggal_lahir) {
      const diff = now - new Date(karyawan.tanggal_lahir);
      umur = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
    }

    // Hitung lama masa kerja
    const diffKerja = now - new Date(karyawan.tanggal_masuk);
    const masaKerjaTahun = Math.floor(
      diffKerja / (365.25 * 24 * 60 * 60 * 1000)
    );

    const data = {
      ...karyawan,
      umur,
      masaKerja: masaKerjaTahun,
    };


    res.json({
      status: 200,
      message: "Karyawan data found",
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Update current user's profile
router.put("/me", async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { alamat, no_telp } = req.body;

    const karyawan = await prisma.karyawan.update({
      where: { userId: user.username },
      data: {
        alamat,
        no_telp,
      },
      include: {
        Departemen: true,
        Jabatan: true,
        user: {
          select: {
            username: true,
            email: true,
            role: true
          }
        }
      }
    });

    res.json({
      status: 200,
      message: "Profile updated successfully",
      data: karyawan,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.get("/:id", allowRoles(ROLES.HR), async (req, res) => {
  const { id } = req.params;
  try {
    // Cari Karyawan berdasarkan PK Karyawan.id
    const karyawan = await prisma.karyawan.findUnique({
      where: { id },
      include: { 
        Departemen: true, 
        Jabatan: true, 
        KPI: true,
        Rating: true,
        pelatihanDetail: {
          include: {
            pelatihan: true
          }
        },
        user: {
          select: {
            username: true,
            email: true,
            role: true
          }
        }
      },
    });
    if (!karyawan) {
      return res.status(404).json({
        status: 404,
        message: `Karyawan ${id} tidak ditemukan`,
      });
    }

    const now = new Date();

    // Hitung umur
    let umur = null;
    if (karyawan.tanggal_lahir) {
      const diff = now - new Date(karyawan.tanggal_lahir);
      umur = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
    }

    // Hitung lama masa kerja
    const diffKerja = now - new Date(karyawan.tanggal_masuk);
    const masaKerjaTahun = Math.floor(
      diffKerja / (365.25 * 24 * 60 * 60 * 1000)
    );

    const data = {
      ...karyawan,
      umur,
      masaKerja: masaKerjaTahun,
    };

    res.json({
      status: 200,
      message: `Karyawan ${id} found`,
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.post(
  "/",
  allowRoles(ROLES.HR),
  [
    body("username").trim().notEmpty().withMessage("Username wajib diisi"),
    body("email").isEmail().withMessage("Format email tidak valid"),
    body("nama").trim().notEmpty().withMessage("Nama wajib diisi"),
    body("tanggal_lahir").notEmpty().withMessage("Tanggal lahir wajib diisi"),
    body("tanggal_masuk").notEmpty().withMessage("Tanggal masuk wajib diisi"),
  ],
  async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validasi gagal",
        errors: errors.array(),
      });
    }

    const {
      username,
      email,
      password,
      nama,
      gender,
      alamat,
      no_telp,
      tanggal_lahir,
      pendidikan,
      tanggal_masuk,
      jalur_rekrut,
      departemenId,  // Tambahkan ini
      jabatanId,     // Tambahkan ini
    } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const [userExists, emailExists] = await Promise.all([
        prisma.user.findUnique({ where: { username } }),
        prisma.user.findUnique({ where: { email } }),
      ]);
      if (userExists) {
        return res
          .status(400)
          .json({ message: "Username sudah dipakai" });
      }
      if (emailExists) {
        return res
          .status(400)
          .json({ message: "Email sudah terdaftar" });
      }

      // Validasi departemen dan jabatan jika diisi
      if (departemenId) {
        const deptExists = await prisma.departemen.findUnique({
          where: { id: departemenId }
        });
        if (!deptExists) {
          return res.status(400).json({ message: "Departemen tidak ditemukan" });
        }
      }

      if (jabatanId) {
        const jabExists = await prisma.jabatan.findUnique({
          where: { id: jabatanId }
        });
        if (!jabExists) {
          return res.status(400).json({ message: "Jabatan tidak ditemukan" });
        }
      }

      // Buat data karyawan dengan relasi
      const karyawanData = {
        id: crypto.randomUUID(),
        nama,
        gender,
        alamat,
        no_telp,
        tanggal_lahir: new Date(tanggal_lahir),
        pendidikan,
        tanggal_masuk: new Date(tanggal_masuk),
        jalur_rekrut,
      };

      // Tambahkan relasi departemen dan jabatan jika ada
      if (departemenId) {
        karyawanData.departemen = {
          connect: { id: departemenId }
        };
      }

      if (jabatanId) {
        karyawanData.jabatan = {
          connect: { id: jabatanId }
        };
      }

      const result = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role: "KARYAWAN",
          karyawan: {
            create: karyawanData,
          },
        },
        include: {
          karyawan: {
            include: {
              departemen: true,
              jabatan: true,
            }
          }
        }
      });

      res.status(201).json(result);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
);

router.put(
  "/:id",
  allowRoles(ROLES.HR),
  [
    body("nama").optional().trim().notEmpty().withMessage("Nama tidak boleh kosong"),
    body("gender").optional().isIn(["Pria", "Wanita"]).withMessage("Gender harus Pria atau Wanita"),
    body("email").optional().isEmail().withMessage("Format email tidak valid"),
  ],
  async (req, res) => {
    const { id } = req.params;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validasi gagal",
        errors: errors.array(),
      });
    }

    try {
      // Cek apakah karyawan exists
      const karyawanExists = await prisma.karyawan.findUnique({
        where: { id },
      });

      if (!karyawanExists) {
        return res.status(404).json({
          status: 404,
          message: `Karyawan ${id} tidak ditemukan`,
        });
      }

      const {
        nama,
        gender,
        alamat,
        no_telp,
        tanggal_lahir,
        pendidikan,
        tanggal_masuk,
        jalur_rekrut,
        departemenId,
        jabatanId,
      } = req.body;

      // Validasi departemen jika diisi
      if (departemenId) {
        const deptExists = await prisma.departemen.findUnique({
          where: { id: departemenId }
        });
        if (!deptExists) {
          return res.status(400).json({ message: "Departemen tidak ditemukan" });
        }
      }

      // Validasi jabatan jika diisi
      if (jabatanId) {
        const jabExists = await prisma.jabatan.findUnique({
          where: { id: jabatanId }
        });
        if (!jabExists) {
          return res.status(400).json({ message: "Jabatan tidak ditemukan" });
        }
      }

      // Siapkan data update
      const updateData = {};
      
      if (nama !== undefined) updateData.nama = nama;
      if (gender !== undefined) updateData.gender = gender;
      if (alamat !== undefined) updateData.alamat = alamat;
      if (no_telp !== undefined) updateData.no_telp = no_telp;
      if (tanggal_lahir !== undefined) updateData.tanggal_lahir = new Date(tanggal_lahir);
      if (pendidikan !== undefined) updateData.pendidikan = pendidikan;
      if (tanggal_masuk !== undefined) updateData.tanggal_masuk = new Date(tanggal_masuk);
      if (jalur_rekrut !== undefined) updateData.jalur_rekrut = jalur_rekrut;

      // Handle many-to-many relationship untuk departemen
      if (departemenId !== undefined) {
        // Hapus semua relasi departemen yang ada
        updateData.departemen = {
          set: [], // Kosongkan dulu
          connect: departemenId ? [{ id: departemenId }] : []
        };
      }

      // Handle many-to-many relationship untuk jabatan
      if (jabatanId !== undefined) {
        updateData.jabatan = {
          set: [], // Kosongkan dulu
          connect: jabatanId ? [{ id: jabatanId }] : []
        };
      }

      const karyawan = await prisma.karyawan.update({
        where: { id },
        data: updateData,
        include: {
          departemen: true,
          jabatan: true,
          kpi: true,
          rating: true,
          pelatihandetail: {
            include: {
              pelatihan: true
            }
          },
          user: {
            select: {
              username: true,
              email: true,
              role: true
            }
          }
        },
      });

      res.json({
        status: 200,
        message: "Karyawan updated successfully",
        data: karyawan,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 500,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
);

router.delete("/:id", allowRoles(ROLES.HR), async (req, res) => {
  const { id } = req.params;

  try {
    // Cek apakah karyawan exists dan ambil userId untuk delete user juga
    const karyawan = await prisma.karyawan.findUnique({
      where: { id },
      include: {
        user: true,
      }
    });

    if (!karyawan) {
      return res.status(404).json({
        status: 404,
        message: `Karyawan ${id} tidak ditemukan`,
      });
    }

    const userId = karyawan.userId;

    // Gunakan transaction untuk memastikan semua delete berhasil atau rollback semua
    await prisma.$transaction(async (tx) => {
      // 1. Hapus relasi many-to-many dengan departemen
      await tx.karyawan.update({
        where: { id },
        data: {
          departemen: {
            set: [], // Disconnect semua departemen
          },
        },
      });

      // 2. Hapus relasi many-to-many dengan jabatan
      await tx.karyawan.update({
        where: { id },
        data: {
          jabatan: {
            set: [], // Disconnect semua jabatan
          },
        },
      });

      // 3. Hapus relasi many-to-many dengan penghargaan
      await tx.karyawan.update({
        where: { id },
        data: {
          penghargaan: {
            set: [], // Disconnect semua penghargaan
          },
        },
      });

      // 4. Hapus data KPI terkait
      await tx.kpi.deleteMany({
        where: { karyawanId: id },
      });

      // 5. Hapus data Rating terkait
      await tx.rating.deleteMany({
        where: { karyawanId: id },
      });

      // 6. Hapus data PelatihanDetail terkait
      await tx.pelatihandetail.deleteMany({
        where: { karyawanId: id },
      });

      // 7. Hapus FeatureSnapshot terkait (jika ada)
      await tx.featuresnapshot.deleteMany({
        where: { karyawanId: id },
      });

      // 8. Hapus PromotionRecommendation terkait (jika ada)
      await tx.promotionrecommendation.deleteMany({
        where: { karyawanId: id },
      });

      // 9. Hapus record karyawan
      await tx.karyawan.delete({
        where: { id },
      });

      // 10. Hapus user account terkait
      await tx.user.delete({
        where: { username: userId },
      });
    });

    res.json({
      status: 200,
      message: "Karyawan berhasil dihapus",
      data: {
        deletedKaryawanId: id,
        deletedUserId: userId,
      },
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

export default router;
