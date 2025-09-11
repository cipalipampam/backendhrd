import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const app = express();
const port = 5000;

const prisma = new PrismaClient();

app.use(express.json());

// ➜ Tambahkan ini:
app.get("/", (req, res) => {
  res.send("Server Express + Prisma sudah jalan!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
