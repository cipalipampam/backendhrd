import prisma from "../../prismaClient.js";
import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { accessValidation } from "../../middleware/access-validation.js";

const router = Router();

router.post("/login", async (req, res) => {
  const { email, username, password } = req.body;
  const identifier = email || username;

  if (!identifier || !password) {
    return res.status(400).json({ message: "Email/username dan password wajib diisi" });
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { username: identifier }],
    },
  });

  if (!user) {
    return res.status(401).json({ message: "Email atau password salah" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (isPasswordValid) {
    const payload = {
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "Server misconfigured: JWT_SECRET missing" });
    }

    // Token berlaku 30 hari
    const expiresIn = 60 * 60 * 24 * 30;

    const token = jwt.sign(payload, secret, { expiresIn: expiresIn });
    return res.json({
      username: user.username,
      email: user.email,
      role: user.role,
      token,
    });
  } else {
    return res.status(401).json({
      message: "Email atau password salah",
    });
  }
});

// Get current user info from token
router.get("/me", accessValidation, async (req, res) => {
  try {
    const user = req.user; // From JWT token
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Fetch full user data from database to include foto_profil and nama_lengkap
    const fullUser = await prisma.user.findUnique({
      where: { username: user.username },
      select: {
        username: true,
        email: true,
        role: true,
        foto_profil: true,
        nama_lengkap: true,
      }
    });

    if (!fullUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      status: 200,
      message: "User info found",
      data: {
        username: fullUser.username,
        email: fullUser.email,
        role: fullUser.role,
        foto_profil: fullUser.foto_profil,
        nama_lengkap: fullUser.nama_lengkap,
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Change password
router.post("/change-password", accessValidation, async (req, res) => {
  try {
    const user = req.user; // From JWT token
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { currentPassword, newPassword } = req.body;

    // Validasi input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        status: 400,
        message: "Current password dan new password wajib diisi" 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        status: 400,
        message: "Password baru minimal 6 karakter" 
      });
    }

    // Ambil user dari database
    const dbUser = await prisma.user.findUnique({
      where: { username: user.username }
    });

    if (!dbUser) {
      return res.status(404).json({ 
        status: 404,
        message: "User tidak ditemukan" 
      });
    }

    // Verifikasi password lama
    const isPasswordValid = await bcrypt.compare(currentPassword, dbUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        status: 401,
        message: "Password saat ini salah" 
      });
    }

    // Hash password baru
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { username: user.username },
      data: { password: hashedNewPassword }
    });

    res.json({
      status: 200,
      message: "Password berhasil diubah",
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

export default router;
