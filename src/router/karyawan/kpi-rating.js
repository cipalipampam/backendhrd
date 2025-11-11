import prisma from "../../prismaClient.js";
import { Router } from "express";
import { allowRoles } from "../../middleware/role-authorization.js";
import { ROLES } from "../../constants/roles.js";

const router = Router();

// Get all KPI (HR only)
router.get("/kpi", allowRoles(ROLES.HR), async (req, res) => {
  try {
    const kpi = await prisma.kpi.findMany({
      include: {
        karyawan: {
          select: {
            id: true,
            nama: true,
            user: {
              select: {
                username: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { year: 'desc' }
    });

    res.json({
      status: 200,
      message: "All KPI found",
      data: kpi
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get all Rating (HR only)
router.get("/rating", allowRoles(ROLES.HR), async (req, res) => {
  try {
    const rating = await prisma.rating.findMany({
      include: {
        karyawan: {
          select: {
            id: true,
            nama: true,
            user: {
              select: {
                username: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { year: 'desc' }
    });

    res.json({
      status: 200,
      message: "All Rating found",
      data: rating
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get current user's KPI
router.get("/my-kpi", async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const karyawan = await prisma.karyawan.findUnique({
      where: { userId: user.username },
      include: {
        KPI: {
          orderBy: { year: 'desc' }
        }
      }
    });

    if (!karyawan) {
      return res.status(404).json({
        status: 404,
        message: "Karyawan data not found for this user",
      });
    }

    res.json({
      status: 200,
      message: "My KPI found",
      data: karyawan.KPI
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get current user's Rating
router.get("/my-rating", async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const karyawan = await prisma.karyawan.findUnique({
      where: { userId: user.username },
      include: {
        Rating: {
          orderBy: { year: 'desc' }
        }
      }
    });

    if (!karyawan) {
      return res.status(404).json({
        status: 404,
        message: "Karyawan data not found for this user",
      });
    }

    res.json({
      status: 200,
      message: "My Rating found",
      data: karyawan.Rating
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
