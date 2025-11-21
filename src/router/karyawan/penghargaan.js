import prisma from "../../prismaClient.js";
import { Router } from "express";
import { allowRoles } from "../../middleware/role-authorization.js";
import { ROLES } from "../../constants/roles.js";
import { randomUUID } from "crypto";

const router = Router();

// GET all penghargaan
router.get('/', allowRoles(ROLES.HR), async (req, res) => {
    try {
        const penghargaan = await prisma.penghargaan.findMany({
            select: {
                id: true,
                nama: true,
                tahun: true,
                createdAt: true,
                updatedAt: true,
                karyawan: {
                    select: {
                        id: true,
                        nama: true
                    }
                }
            },
            orderBy: {
                tahun: 'desc'
            }
        });
        res.json({
            status: 200,
            message: 'Penghargaan found',
            data: penghargaan
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// GET penghargaan by ID
router.get('/:id', allowRoles(ROLES.HR), async (req, res) => {
    const { id } = req.params;
    try {
        const penghargaan = await prisma.penghargaan.findUnique({
            where: { id },
            include: {
                karyawan: {
                    select: {
                        id: true,
                        nama: true,
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
                }
            }
        });

        if (!penghargaan) {
            return res.status(404).json({
                status: 404,
                message: `Penghargaan ${id} not found`
            });
        }

        res.json({
            status: 200,
            message: 'Penghargaan found',
            data: penghargaan
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// POST create penghargaan
router.post('/', allowRoles(ROLES.HR), async (req, res) => {
    const { nama, tahun, karyawanIds } = req.body;

    // Validasi input
    if (!nama || !tahun) {
        return res.status(400).json({
            status: 400,
            message: 'nama dan tahun wajib diisi'
        });
    }

    try {
        // Validasi format tahun
        const tahunDate = new Date(tahun);
        if (isNaN(tahunDate.getTime())) {
            return res.status(400).json({
                status: 400,
                message: 'Format tahun tidak valid'
            });
        }

        // Validasi karyawan jika ada
        if (karyawanIds && Array.isArray(karyawanIds) && karyawanIds.length > 0) {
            const karyawanExists = await prisma.karyawan.findMany({
                where: {
                    id: {
                        in: karyawanIds
                    }
                }
            });

            if (karyawanExists.length !== karyawanIds.length) {
                return res.status(400).json({
                    status: 400,
                    message: 'Beberapa karyawan tidak ditemukan'
                });
            }
        }

        const penghargaan = await prisma.penghargaan.create({
            data: {
                id: randomUUID(),
                nama,
                tahun: tahunDate,
                ...(karyawanIds && karyawanIds.length > 0 && {
                    karyawan: {
                        connect: karyawanIds.map(id => ({ id }))
                    }
                })
            },
            include: {
                karyawan: {
                    select: {
                        id: true,
                        nama: true
                    }
                }
            }
        });

        res.status(201).json({
            status: 201,
            message: 'Penghargaan created',
            data: penghargaan
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// PUT update penghargaan
router.put('/:id', allowRoles(ROLES.HR), async (req, res) => {
    const { id } = req.params;
    const { nama, tahun, karyawanIds } = req.body;

    try {
        const existing = await prisma.penghargaan.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({
                status: 404,
                message: `Penghargaan ${id} not found`
            });
        }

        // Prepare update data
        const updateData = {};
        
        if (nama) updateData.nama = nama;
        
        if (tahun) {
            const tahunDate = new Date(tahun);
            if (isNaN(tahunDate.getTime())) {
                return res.status(400).json({
                    status: 400,
                    message: 'Format tahun tidak valid'
                });
            }
            updateData.tahun = tahunDate;
        }

        // Handle karyawan relation update
        if (karyawanIds !== undefined) {
            if (Array.isArray(karyawanIds) && karyawanIds.length > 0) {
                // Validasi karyawan exists
                const karyawanExists = await prisma.karyawan.findMany({
                    where: {
                        id: {
                            in: karyawanIds
                        }
                    }
                });

                if (karyawanExists.length !== karyawanIds.length) {
                    return res.status(400).json({
                        status: 400,
                        message: 'Beberapa karyawan tidak ditemukan'
                    });
                }

                updateData.karyawan = {
                    set: [], // Clear existing relations
                    connect: karyawanIds.map(id => ({ id }))
                };
            } else {
                // Clear all karyawan relations
                updateData.karyawan = {
                    set: []
                };
            }
        }

        const penghargaan = await prisma.penghargaan.update({
            where: { id },
            data: updateData,
            include: {
                karyawan: {
                    select: {
                        id: true,
                        nama: true
                    }
                }
            }
        });

        res.json({
            status: 200,
            message: 'Penghargaan updated',
            data: penghargaan
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// DELETE penghargaan
router.delete('/:id', allowRoles(ROLES.HR), async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma.penghargaan.findUnique({ where: { id } });
        
        if (!existing) {
            return res.status(404).json({
                status: 404,
                message: `Penghargaan ${id} not found`
            });
        }

        await prisma.penghargaan.delete({ where: { id } });
        
        res.json({
            status: 200,
            message: `Penghargaan ${id} deleted`
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// GET penghargaan by karyawan ID
router.get('/karyawan/:karyawanId', allowRoles(ROLES.HR, ROLES.KARYAWAN), async (req, res) => {
    const { karyawanId } = req.params;

    try {
        const penghargaan = await prisma.penghargaan.findMany({
            where: {
                karyawan: {
                    some: {
                        id: karyawanId
                    }
                }
            },
            select: {
                id: true,
                nama: true,
                tahun: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: {
                tahun: 'desc'
            }
        });

        res.json({
            status: 200,
            message: 'Penghargaan found',
            data: penghargaan
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
            error: error.message
        });
    }
});

export default router;