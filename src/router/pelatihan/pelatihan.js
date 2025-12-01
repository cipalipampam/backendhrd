import prisma from "../../prismaClient.js";
import { Router } from "express";
import { allowRoles } from "../../middleware/role-authorization.js";
import { randomUUID } from 'crypto';
import { ROLES } from "../../constants/roles.js";

const router = Router()

// Get all pelatihan (HR only)
router.get('/', allowRoles(ROLES.HR), async (req, res) => {
    try {
        const pelatihan = await prisma.pelatihan.findMany({
            include: {
                pelatihandetail: {
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
                    }
                }
            },
            orderBy: { tanggal: 'desc' }
        });
        res.json({
            status: 200,
            message: 'Pelatihan found',
            data: pelatihan
        })
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
            error: error.message
        });
    }
})

// Get current user's pelatihan
router.get('/my', async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const karyawan = await prisma.karyawan.findUnique({
            where: { userId: user.username },
            include: {
                pelatihandetail: {
                    include: {
                        pelatihan: true
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

        const pelatihan = karyawan.pelatihandetail.map(detail => ({
            id: detail.id,
            skor: detail.skor,
            catatan: detail.catatan,
            pelatihan: {
                id: detail.pelatihan.id,
                nama: detail.pelatihan.nama,
                tanggal: detail.pelatihan.tanggal,
                lokasi: detail.pelatihan.lokasi
            }
        }));

        res.json({
            status: 200,
            message: 'My pelatihan found',
            data: pelatihan
        })
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
            error: error.message
        });
    }
})

// Public for authenticated users: list available trainings
// MUST be before /:id routes to avoid route conflicts
router.get('/available', async (req, res) => {
    try {
        const pelatihan = await prisma.pelatihan.findMany({
            select: {
                id: true,
                nama: true,
                tanggal: true,
                lokasi: true
            },
            orderBy: { tanggal: 'desc' }
        });
        res.json({ status: 200, message: 'Available pelatihan', data: pelatihan });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/', allowRoles(ROLES.HR), async (req, res) => {
    const { nama, tanggal, lokasi } = req.body;
    if (!nama || !tanggal || !lokasi) {
        return res.status(400).json({ message: 'nama, tanggal, dan lokasi wajib diisi' });
    }
    try {
        const pelatihan = await prisma.pelatihan.create({
            data: {
                id: randomUUID(),
                nama,
                tanggal: new Date(tanggal),
                lokasi
            },
        });
        res.status(201).json({ status: 201, message: 'Pelatihan created', data: pelatihan });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
})

// Get pelatihan details with participants (HR only)
// MUST be before PUT /:id to avoid route conflicts
router.get('/:id', allowRoles(ROLES.HR), async (req, res) => {
    const { id } = req.params;
    try {
        const pelatihan = await prisma.pelatihan.findUnique({
            where: { id },
            include: {
                pelatihandetail: {
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
                                },
                                user: {
                                    select: {
                                        username: true,
                                        email: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!pelatihan) {
            return res.status(404).json({
                status: 404,
                message: `Pelatihan ${id} not found`
            });
        }

        res.json({
            status: 200,
            message: 'Pelatihan found',
            data: pelatihan
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

// Update score for a participant (HR only)
// MUST be before PUT /:id to avoid route conflicts
router.put('/:id/participant/:karyawanId/score', allowRoles(ROLES.HR), async (req, res) => {
    const pelatihanId = req.params.id;
    const karyawanId = req.params.karyawanId;
    const { skor, catatan } = req.body;

    if (typeof skor !== 'number') {
        return res.status(400).json({ 
            status: 400,
            message: 'skor (number) is required' 
        });
    }

    if (skor < 0 || skor > 100) {
        return res.status(400).json({
            status: 400,
            message: 'skor must be between 0 and 100'
        });
    }

    try {
        // Check if pelatihan exists
        const pelatihan = await prisma.pelatihan.findUnique({ 
            where: { id: pelatihanId } 
        });
        if (!pelatihan) {
            return res.status(404).json({ 
                status: 404,
                message: 'Pelatihan not found' 
            });
        }

        // Check if karyawan exists
        const karyawan = await prisma.karyawan.findUnique({ 
            where: { id: karyawanId } 
        });
        if (!karyawan) {
            return res.status(404).json({ 
                status: 404,
                message: 'Karyawan not found' 
            });
        }

        const { periodeYear, periodeMonth } = req.body;
        
        const updated = await prisma.pelatihandetail.update({
            where: { 
                pelatihanId_karyawanId: { 
                    pelatihanId, 
                    karyawanId 
                } 
            },
            data: {
                skor,
                catatan: catatan || null,
                periodeYear: periodeYear !== undefined ? periodeYear : undefined,
                periodeMonth: periodeMonth !== undefined ? periodeMonth : undefined,
                updatedAt: new Date()
            },
            include: {
                karyawan: {
                    select: {
                        id: true,
                        nama: true
                    }
                },
                pelatihan: {
                    select: {
                        id: true,
                        nama: true
                    }
                }
            }
        });

        res.json({ 
            status: 200, 
            message: 'Score updated successfully', 
            data: updated 
        });
    } catch (error) {
        console.log(error);
        if (error.code === 'P2025') {
            return res.status(404).json({ 
                status: 404,
                message: 'Participant record not found. Make sure the employee is registered for this training.' 
            });
        }
        res.status(500).json({ 
            status: 500,
            message: 'Internal server error',
            error: error.message 
        });
    }
});

router.put('/:id', allowRoles(ROLES.HR), async (req, res) => {
    const { id } = req.params;
    const { nama, tanggal, lokasi } = req.body;

    try {
        const existing = await prisma.pelatihan.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ message: `Pelatihan ${id} not found` });
        }
        const pelatihan = await prisma.pelatihan.update({
            where: { id },
            data: {
                nama,
                tanggal: new Date(tanggal),
                lokasi
            }
        });
        res.json({ status: 200, message: 'Pelatihan updated', data: pelatihan })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.delete('/:id', allowRoles(ROLES.HR), async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma.pelatihan.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ message: `Pelatihan ${id} not found` });
        }
        await prisma.pelatihan.delete({ where: { id } });
        res.json({ status: 200, message: `Pelatihan ${id} deleted` })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Join a pelatihan as current karyawan
router.post('/:id/join', async (req, res) => {
    try {
        const pelatihanId = req.params.id;
        const { periodeYear, periodeMonth } = req.body;
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const karyawan = await prisma.karyawan.findUnique({ where: { userId: user.username } });
        if (!karyawan) return res.status(404).json({ message: 'Karyawan not found' });

        // Check pelatihan exists
        const existingPel = await prisma.pelatihan.findUnique({ where: { id: pelatihanId } });
        if (!existingPel) return res.status(404).json({ message: 'Pelatihan not found' });

        // Check already joined
        const existing = await prisma.pelatihandetail.findUnique({
            where: { pelatihanId_karyawanId: { pelatihanId, karyawanId: karyawan.id } }
        });
        if (existing) return res.status(409).json({ message: 'Already joined' });

        const created = await prisma.pelatihandetail.create({
            data: {
                id: randomUUID(),
                pelatihanId,
                karyawanId: karyawan.id,
                periodeYear: periodeYear || null,
                periodeMonth: periodeMonth || null,
                updatedAt: new Date()
            }
        });

        res.status(201).json({ status: 201, message: 'Joined pelatihan', data: created });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Confirm attendance for a joined pelatihan
router.post('/:id/confirm', async (req, res) => {
    try {
        const pelatihanId = req.params.id;
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const karyawan = await prisma.karyawan.findUnique({ where: { userId: user.username } });
        if (!karyawan) return res.status(404).json({ message: 'Karyawan not found' });

        const updated = await prisma.pelatihandetail.update({
            where: { pelatihanId_karyawanId: { pelatihanId, karyawanId: karyawan.id } },
            data: { catatan: 'CONFIRMED', updatedAt: new Date() }
        });

        res.json({ status: 200, message: 'Confirmed', data: updated });
    } catch (error) {
        console.log(error);
        if (error.code === 'P2025') return res.status(404).json({ message: 'Join record not found' });
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Decline invitation / decline joining
router.post('/:id/decline', async (req, res) => {
    try {
        const pelatihanId = req.params.id;
        const { alasan } = req.body;
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const karyawan = await prisma.karyawan.findUnique({ where: { userId: user.username } });
        if (!karyawan) return res.status(404).json({ message: 'Karyawan not found' });

        const updated = await prisma.pelatihandetail.update({
            where: { pelatihanId_karyawanId: { pelatihanId, karyawanId: karyawan.id } },
            data: { catatan: alasan || 'DECLINED', updatedAt: new Date() }
        });

        res.json({ status: 200, message: 'Declined', data: updated });
    } catch (error) {
        console.log(error);
        if (error.code === 'P2025') return res.status(404).json({ message: 'Join record not found' });
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
