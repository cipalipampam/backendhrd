import prisma from "../../prismaClient.js";
import { Router } from "express";
import { allowRoles } from "../../middleware/role-authorization.js";
import { ROLES } from "../../constants/roles.js";
import { randomUUID } from "crypto";

const router = Router();

// Lightweight helper shared by create/update handlers
const parseOptionalInt = (value, label) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Field '${label}' must be a valid number`);
  }
  return parsed;
};

// ==================== KPI INDICATORS ENDPOINTS ====================

// Get all KPI Indicators
router.get("/indicators", allowRoles(ROLES.HR), async (req, res) => {
  try {
    const { departemenId } = req.query;
    
    const where = departemenId ? { departemenId } : {};
    
    const indicators = await prisma.kpiIndicator.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      status: 200,
      message: "KPI Indicators retrieved successfully",
      data: indicators
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get single KPI Indicator by ID
router.get("/indicators/:id", allowRoles(ROLES.HR), async (req, res) => {
  try {
    const { id } = req.params;

    const indicator = await prisma.kpiIndicator.findUnique({
      where: { id }
    });

    if (!indicator) {
      return res.status(404).json({
        status: 404,
        message: "KPI Indicator not found"
      });
    }

    res.json({
      status: 200,
      message: "KPI Indicator found",
      data: indicator
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Create new KPI Indicator
router.post("/indicators", allowRoles(ROLES.HR), async (req, res) => {
  try {
    const { nama, deskripsi, bobot, departemenId } = req.body;

    // Validation
    if (!nama || bobot === undefined) {
      return res.status(400).json({
        status: 400,
        message: "Field 'nama' and 'bobot' are required"
      });
    }

    if (bobot < 0 || bobot > 1) {
      return res.status(400).json({
        status: 400,
        message: "Field 'bobot' must be between 0 and 1"
      });
    }

    // Check if departemenId exists if provided
    if (departemenId) {
      const departemen = await prisma.departemen.findUnique({
        where: { id: departemenId }
      });

      if (!departemen) {
        return res.status(404).json({
          status: 404,
          message: "Departemen not found"
        });
      }
    }

    const indicator = await prisma.kpiIndicator.create({
      data: {
        nama,
        deskripsi: deskripsi || null,
        bobot,
        departemenId: departemenId || null
      }
    });

    res.status(201).json({
      status: 201,
      message: "KPI Indicator created successfully",
      data: indicator
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Update KPI Indicator
router.put("/indicators/:id", allowRoles(ROLES.HR), async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, deskripsi, bobot, departemenId } = req.body;

    // Check if indicator exists
    const existingIndicator = await prisma.kpiIndicator.findUnique({
      where: { id }
    });

    if (!existingIndicator) {
      return res.status(404).json({
        status: 404,
        message: "KPI Indicator not found"
      });
    }

    // Validation
    if (bobot !== undefined && (bobot < 0 || bobot > 1)) {
      return res.status(400).json({
        status: 400,
        message: "Field 'bobot' must be between 0 and 1"
      });
    }

    // Check if departemenId exists if provided
    if (departemenId) {
      const departemen = await prisma.departemen.findUnique({
        where: { id: departemenId }
      });

      if (!departemen) {
        return res.status(404).json({
          status: 404,
          message: "Departemen not found"
        });
      }
    }

    const updateData = {};
    if (nama !== undefined) updateData.nama = nama;
    if (deskripsi !== undefined) updateData.deskripsi = deskripsi;
    if (bobot !== undefined) updateData.bobot = bobot;
    if (departemenId !== undefined) updateData.departemenId = departemenId;

    const indicator = await prisma.kpiIndicator.update({
      where: { id },
      data: updateData
    });

    res.json({
      status: 200,
      message: "KPI Indicator updated successfully",
      data: indicator
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Delete KPI Indicator
router.delete("/indicators/:id", allowRoles(ROLES.HR), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if indicator exists
    const existingIndicator = await prisma.kpiIndicator.findUnique({
      where: { id },
      include: {
        kpiDetails: true
      }
    });

    if (!existingIndicator) {
      return res.status(404).json({
        status: 404,
        message: "KPI Indicator not found"
      });
    }

    // Check if indicator is being used
    if (existingIndicator.kpiDetails.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Cannot delete indicator that is being used in KPI Details"
      });
    }

    await prisma.kpiIndicator.delete({
      where: { id }
    });

    res.json({
      status: 200,
      message: "KPI Indicator deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// ==================== KPI ENDPOINTS ====================

// Get all KPI (HR only) with details
router.get("/kpi", allowRoles(ROLES.HR), async (req, res) => {
  try {
    const { year, karyawanId } = req.query;
    
    const where = {};
    if (year) where.year = parseInt(year);
    if (karyawanId) where.karyawanId = karyawanId;

    const kpi = await prisma.kpi.findMany({
      where,
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
            },
            departemen: {
              select: {
                id: true,
                nama: true
              }
            },
            jabatan: {
              select: {
                id: true,
                nama: true
              }
            }
          }
        },
        kpiDetails: {
          include: {
            indikator: true
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

// Get single KPI by ID
router.get("/kpi/:id", allowRoles(ROLES.HR), async (req, res) => {
  try {
    const { id } = req.params;

    const kpi = await prisma.kpi.findUnique({
      where: { id },
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
            },
            departemen: {
              select: {
                id: true,
                nama: true
              }
            },
            jabatan: {
              select: {
                id: true,
                nama: true
              }
            }
          }
        },
        kpiDetails: {
          include: {
            indikator: true
          }
        }
      }
    });

    if (!kpi) {
      return res.status(404).json({
        status: 404,
        message: "KPI not found"
      });
    }

    // Log for debugging
    console.log(`[KPI GET by ID] KPI ID: ${id}, kpiDetails count: ${kpi.kpiDetails?.length || 0}`);
    if (kpi.kpiDetails && kpi.kpiDetails.length > 0) {
      console.log('[KPI GET by ID] Details:', kpi.kpiDetails.map(d => ({
        id: d.id,
        indikatorId: d.indikatorId,
        indikatorNama: d.indikator?.nama,
        target: d.target,
        realisasi: d.realisasi,
        periodeYear: d.periodeYear,
        periodeMonth: d.periodeMonth
      })));
    }

    res.json({
      status: 200,
      message: "KPI found",
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

// Create new KPI with details
router.post("/kpi", allowRoles(ROLES.HR), async (req, res) => {
  try {
    const { karyawanId, kpiDetails, periodeYear, periodeMonth } = req.body;

    // Validation
    if (!karyawanId) {
      return res.status(400).json({
        status: 400,
        message: "Field 'karyawanId' is required"
      });
    }

    let parsedYear;
    try {
      parsedYear = parseOptionalInt(periodeYear, "periodeYear");
      if (parsedYear === null && Array.isArray(kpiDetails)) {
        for (let i = 0; i < kpiDetails.length; i += 1) {
          const candidate = parseOptionalInt(
            kpiDetails[i]?.periodeYear,
            `kpiDetails[${i}].periodeYear`
          );
          if (candidate !== null) {
            parsedYear = candidate;
            break;
          }
        }
      }
    } catch (parseError) {
      return res.status(400).json({
        status: 400,
        message: parseError.message
      });
    }

    if (parsedYear === null) {
      parsedYear = new Date().getFullYear();
    }

    // Check if karyawan exists
    const karyawan = await prisma.karyawan.findUnique({
      where: { id: karyawanId }
    });

    if (!karyawan) {
      return res.status(404).json({
        status: 404,
        message: "Karyawan not found"
      });
    }

    // Validate and calculate KPI score from details
    let totalScore = 0;
    const validatedDetails = [];
    const combinationSet = new Set();

    if (kpiDetails && Array.isArray(kpiDetails)) {
      for (let index = 0; index < kpiDetails.length; index += 1) {
        const detail = kpiDetails[index];
        const { indikatorId, target, realisasi } = detail;

        let detailPeriodeYear;
        let detailPeriodeMonth;
        try {
          detailPeriodeYear =
            parseOptionalInt(detail.periodeYear, `kpiDetails[${index}].periodeYear`) ?? parsedYear;
          detailPeriodeMonth = parseOptionalInt(
            detail.periodeMonth ?? periodeMonth,
            `kpiDetails[${index}].periodeMonth`
          );
        } catch (parseError) {
          return res.status(400).json({
            status: 400,
            message: parseError.message
          });
        }

        if (!indikatorId || target === undefined) {
          return res.status(400).json({
            status: 400,
            message: "Each KPI detail must have 'indikatorId' and 'target'"
          });
        }

        // Check if indicator exists
        const indicator = await prisma.kpiIndicator.findUnique({
          where: { id: indikatorId }
        });

        if (!indicator) {
          return res.status(404).json({
            status: 404,
            message: `KPI Indicator with id ${indikatorId} not found`
          });
        }

        // Prevent duplicate KPI detail combination (karyawan + indikator + periode)
        const combinationKey = `${karyawanId}-${indikatorId}-${detailPeriodeYear ?? "null"}-${detailPeriodeMonth ?? "null"}`;
        if (combinationSet.has(combinationKey)) {
          return res.status(400).json({
            status: 400,
            message: "Duplicate KPI detail combination within request body"
          });
        }

        const conflictDetail = await prisma.kpiDetail.findFirst({
          where: {
            indikatorId,
            periodeYear: detailPeriodeYear,
            periodeMonth: detailPeriodeMonth,
            kpi: {
              karyawanId
            }
          }
        });

        if (conflictDetail) {
          return res.status(400).json({
            status: 400,
            message: "KPI detail already exists for this karyawan with the same indikator, month, and year"
          });
        }

        combinationSet.add(combinationKey);

        // Calculate score if realisasi is provided
        let score = null;
        if (realisasi !== undefined && realisasi !== null) {
          score = (realisasi / target) * indicator.bobot * 100;
          totalScore += score;
        }

        validatedDetails.push({
          id: randomUUID(),
          indikatorId,
          target,
          realisasi: realisasi || null,
          score,
          periodeYear: detailPeriodeYear,
          periodeMonth: detailPeriodeMonth
        });
      }
    }

    // Create KPI with details in a transaction
    const kpi = await prisma.$transaction(async (tx) => {
      const newKPI = await tx.kpi.create({
        data: {
          id: randomUUID(),
          karyawanId,
          year: parsedYear,
          score: totalScore
        }
      });

      if (validatedDetails.length > 0) {
        await tx.kpiDetail.createMany({
          data: validatedDetails.map(detail => ({
            ...detail,
            kpiId: newKPI.id
          }))
        });
      }

      return tx.kpi.findUnique({
        where: { id: newKPI.id },
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
          },
          kpiDetails: {
            include: {
              indikator: true
            }
          }
        }
      });
    });

    res.status(201).json({
      status: 201,
      message: "KPI created successfully",
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

// Update KPI
router.put("/kpi/:id", allowRoles(ROLES.HR), async (req, res) => {
  try {
    const { id } = req.params;
    const { year, kpiDetails, periodeYear, periodeMonth } = req.body;

    // Check if KPI exists
    const existingKPI = await prisma.kpi.findUnique({
      where: { id },
      include: {
        kpiDetails: true
      }
    });

    if (!existingKPI) {
      return res.status(404).json({
        status: 404,
        message: "KPI not found"
      });
    }

    // Determine target year (fallback to existing year)
    let targetYear = existingKPI.year;
    if (year !== undefined) {
      try {
        const parsedYear = parseOptionalInt(year, "year");
        if (parsedYear !== null) {
          targetYear = parsedYear;
        }
      } catch (parseError) {
        return res.status(400).json({
          status: 400,
          message: parseError.message
        });
      }
    }

    let totalScore = existingKPI.score;
    const updatedDetails = [];
    const combinationSet = new Set();

    if (kpiDetails && Array.isArray(kpiDetails)) {
      totalScore = 0;

      for (let index = 0; index < kpiDetails.length; index += 1) {
        const detail = kpiDetails[index];
        const { id: detailId, indikatorId, target, realisasi } = detail;

        let detailPeriodeYear;
        let detailPeriodeMonth;
        try {
          detailPeriodeYear =
            parseOptionalInt(
              detail.periodeYear ?? periodeYear,
              `kpiDetails[${index}].periodeYear`
            ) ?? targetYear;
          detailPeriodeMonth = parseOptionalInt(
            detail.periodeMonth ?? periodeMonth,
            `kpiDetails[${index}].periodeMonth`
          );
        } catch (parseError) {
          return res.status(400).json({
            status: 400,
            message: parseError.message
          });
        }

        if (!indikatorId || target === undefined) {
          return res.status(400).json({
            status: 400,
            message: "Each KPI detail must have 'indikatorId' and 'target'"
          });
        }

        const indicator = await prisma.kpiIndicator.findUnique({
          where: { id: indikatorId }
        });

        if (!indicator) {
          return res.status(404).json({
            status: 404,
            message: `KPI Indicator with id ${indikatorId} not found`
          });
        }

        const combinationKey = `${existingKPI.karyawanId}-${indikatorId}-${detailPeriodeYear ?? "null"}-${detailPeriodeMonth ?? "null"}`;
        if (combinationSet.has(combinationKey)) {
          return res.status(400).json({
            status: 400,
            message: "Duplicate KPI detail combination within request body"
          });
        }

        const conflictDetail = await prisma.kpiDetail.findFirst({
          where: {
            indikatorId,
            periodeYear: detailPeriodeYear ?? null,
            periodeMonth: detailPeriodeMonth ?? null,
            kpi: {
              karyawanId: existingKPI.karyawanId
            },
            NOT: detailId ? { id: detailId } : undefined
          }
        });

        if (conflictDetail) {
          return res.status(400).json({
            status: 400,
            message: "KPI detail already exists for this karyawan, indikator, periode year, and periode month"
          });
        }

        combinationSet.add(combinationKey);

        let score = null;
        if (realisasi !== undefined && realisasi !== null) {
          score = (realisasi / target) * indicator.bobot * 100;
          totalScore += score;
        }

        updatedDetails.push({
          id: detailId || randomUUID(),
          indikatorId,
          target,
          realisasi: realisasi || null,
          score,
          periodeYear: detailPeriodeYear ?? null,
          periodeMonth: detailPeriodeMonth ?? null
        });
      }
    }

    console.log(`[KPI UPDATE] KPI ID: ${id}, Received ${kpiDetails?.length || 0} details`);
    console.log(`[KPI UPDATE] Updated details count: ${updatedDetails.length}`);
    if (updatedDetails.length > 0) {
      console.log('[KPI UPDATE] Details to save:', updatedDetails.map(d => ({
        id: d.id,
        indikatorId: d.indikatorId,
        target: d.target,
        realisasi: d.realisasi,
        periodeYear: d.periodeYear,
        periodeMonth: d.periodeMonth
      })));
    }

    const kpi = await prisma.$transaction(async (tx) => {
      const updatedKPI = await tx.kpi.update({
        where: { id },
        data: {
          year: targetYear,
          score: totalScore
        }
      });

      if (Array.isArray(kpiDetails)) {
        const deletedCount = await tx.kpiDetail.deleteMany({
          where: { kpiId: id }
        });
        console.log(`[KPI UPDATE] Deleted ${deletedCount.count} old details`);

        if (updatedDetails.length > 0) {
          await tx.kpiDetail.createMany({
            data: updatedDetails.map((detail) => ({
              ...detail,
              kpiId: id
            }))
          });
          console.log(`[KPI UPDATE] Created ${updatedDetails.length} new details`);
        }
      }

      const finalKpi = await tx.kpi.findUnique({
        where: { id: updatedKPI.id },
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
          },
          kpiDetails: {
            include: {
              indikator: true
            }
          }
        }
      });

      console.log(`[KPI UPDATE] Final KPI has ${finalKpi.kpiDetails?.length || 0} details`);
      return finalKpi;
    });

    res.json({
      status: 200,
      message: "KPI updated successfully",
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

// Delete KPI
router.delete("/kpi/:id", allowRoles(ROLES.HR), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if KPI exists
    const existingKPI = await prisma.kpi.findUnique({
      where: { id }
    });

    if (!existingKPI) {
      return res.status(404).json({
        status: 404,
        message: "KPI not found"
      });
    }

    // Delete KPI and its details in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete KPI details first
      await tx.kpiDetail.deleteMany({
        where: { kpiId: id }
      });

      // Delete KPI
      await tx.kpi.delete({
        where: { id }
      });
    });

    res.json({
      status: 200,
      message: "KPI deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// ==================== KPI DETAILS ENDPOINTS ====================

// Add KPI Detail to existing KPI
router.post("/kpi/:kpiId/details", allowRoles(ROLES.HR), async (req, res) => {
  try {
    const { kpiId } = req.params;
    const { indikatorId, target, realisasi, periodeYear, periodeMonth } = req.body;

    // Validation
    if (!indikatorId || target === undefined) {
      return res.status(400).json({
        status: 400,
        message: "Fields 'indikatorId' and 'target' are required"
      });
    }

    // Check if KPI exists
    const kpi = await prisma.kpi.findUnique({
      where: { id: kpiId }
    });

    if (!kpi) {
      return res.status(404).json({
        status: 404,
        message: "KPI not found"
      });
    }

    // Check if indicator exists
    const indicator = await prisma.kpiIndicator.findUnique({
      where: { id: indikatorId }
    });

    if (!indicator) {
      return res.status(404).json({
        status: 404,
        message: "KPI Indicator not found"
      });
    }

    // Calculate score
    let score = null;
    if (realisasi !== undefined && realisasi !== null) {
      score = (realisasi / target) * indicator.bobot * 100;
    }

    // Create detail and update KPI score in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const detail = await tx.kpiDetail.create({
        data: {
          id: randomUUID(),
          kpiId,
          indikatorId,
          target,
          realisasi: realisasi || null,
          score,
          periodeYear: periodeYear || null,
          periodeMonth: periodeMonth || null
        },
        include: {
          indikator: true
        }
      });

      // Recalculate KPI total score
      const allDetails = await tx.kpiDetail.findMany({
        where: { kpiId }
      });

      const totalScore = allDetails.reduce((sum, d) => sum + (d.score || 0), 0);

      await tx.kpi.update({
        where: { id: kpiId },
        data: { score: totalScore }
      });

      return detail;
    });

    res.status(201).json({
      status: 201,
      message: "KPI Detail added successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Update KPI Detail
router.put("/details/:detailId", allowRoles(ROLES.HR), async (req, res) => {
  try {
    const { detailId } = req.params;
    const { target, realisasi, periodeYear, periodeMonth } = req.body;

    // Check if detail exists
    const existingDetail = await prisma.kpiDetail.findUnique({
      where: { id: detailId },
      include: {
        indikator: true
      }
    });

    if (!existingDetail) {
      return res.status(404).json({
        status: 404,
        message: "KPI Detail not found"
      });
    }

    // Calculate new score
    const newTarget = target !== undefined ? target : existingDetail.target;
    const newRealisasi = realisasi !== undefined ? realisasi : existingDetail.realisasi;
    const newPeriodeYear = periodeYear !== undefined ? periodeYear : existingDetail.periodeYear;
    const newPeriodeMonth = periodeMonth !== undefined ? periodeMonth : existingDetail.periodeMonth;
    
    let score = null;
    if (newRealisasi !== null) {
      score = (newRealisasi / newTarget) * existingDetail.indikator.bobot * 100;
    }

    // Update detail and recalculate KPI score in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const detail = await tx.kpiDetail.update({
        where: { id: detailId },
        data: {
          target: newTarget,
          realisasi: newRealisasi,
          score,
          periodeYear: newPeriodeYear,
          periodeMonth: newPeriodeMonth
        },
        include: {
          indikator: true
        }
      });

      // Recalculate KPI total score
      const allDetails = await tx.kpiDetail.findMany({
        where: { kpiId: existingDetail.kpiId }
      });

      const totalScore = allDetails.reduce((sum, d) => sum + (d.score || 0), 0);

      await tx.kpi.update({
        where: { id: existingDetail.kpiId },
        data: { score: totalScore }
      });

      return detail;
    });

    res.json({
      status: 200,
      message: "KPI Detail updated successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Delete KPI Detail
router.delete("/details/:detailId", allowRoles(ROLES.HR), async (req, res) => {
  try {
    const { detailId } = req.params;

    // Check if detail exists
    const existingDetail = await prisma.kpiDetail.findUnique({
      where: { id: detailId }
    });

    if (!existingDetail) {
      return res.status(404).json({
        status: 404,
        message: "KPI Detail not found"
      });
    }

    // Delete detail and recalculate KPI score in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.kpiDetail.delete({
        where: { id: detailId }
      });

      // Recalculate KPI total score
      const allDetails = await tx.kpiDetail.findMany({
        where: { kpiId: existingDetail.kpiId }
      });

      const totalScore = allDetails.reduce((sum, d) => sum + (d.score || 0), 0);

      await tx.kpi.update({
        where: { id: existingDetail.kpiId },
        data: { score: totalScore }
      });
    });

    res.json({
      status: 200,
      message: "KPI Detail deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// ==================== USER-SPECIFIC ENDPOINTS ====================

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
        kpi: {
          include: {
            kpiDetails: {
              include: {
                indikator: true
              }
            }
          },
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
      data: karyawan.kpi
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// ==================== RATING ENDPOINTS (kept from original) ====================

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
        rating: {
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
      data: karyawan.rating
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