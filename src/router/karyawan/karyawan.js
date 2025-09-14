import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import bcrypt from "bcrypt";

const router = Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  try {
    const karyawan = await prisma.karyawan.findMany({
      include: {
        Departemen: true,
        Jabatan: true,
      },
    });

    const now = new Date();

    const data = karyawan.map(k => {
      // Hitung umur
      let umur = null;
      if (k.tanggal_lahir) {
        const diff = now - new Date(k.tanggal_lahir);
        umur = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
      }

      // Hitung lama masa kerja (dalam tahun, bisa diubah ke bulan)
      const diffKerja = now - new Date(k.tanggal_masuk);
      const masaKerjaTahun = Math.floor(diffKerja / (365.25 * 24 * 60 * 60 * 1000));

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


router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { karyawan: true },
    });
    res.json({
      status: 200,
      message: `Karyawan ${id} found`,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.post("/", async (req, res) => {
  const {
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
  } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const karyawan = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "KARYAWAN",
        karyawan: {
          create: {
            nama,
            gender,
            alamat,
            no_telp,
            tanggal_lahir: new Date(tanggal_lahir),
            pendidikan,
            tanggal_masuk: new Date(tanggal_masuk),
            jalur_rekrut,
          },
        },
      },
    });

    res.status(201).json(karyawan);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;