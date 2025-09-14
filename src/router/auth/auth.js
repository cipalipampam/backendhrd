import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient();

router.use("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    res.status(404).json({
      message: "User not found",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (isPasswordValid) {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
    }

    const secret = process.env.JWT_SECRET

    const expiresIn = 60 * 60 * 1

    const token = jwt.sign(payload, secret, { expiresIn: expiresIn })
    return res.json({
        id: user.id,
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

export default router;
