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
    return res.status(404).json({ message: "User not found" });
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

    const expiresIn = 60 * 60 * 1;

    const token = jwt.sign(payload, secret, { expiresIn: expiresIn });
    return res.json({
      username: user.username,
      email: user.email,
      role: user.role,
      token,
    });
  } else {
    return res.status(401).json({
      message: "Invalid email or password",
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

    res.json({
      status: 200,
      message: "User info found",
      data: {
        username: user.username,
        email: user.email,
        role: user.role
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

export default router;
