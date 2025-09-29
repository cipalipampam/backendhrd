import prisma from "../../prismaClient.js";
import { Router } from "express";
import { allowRoles } from "../../middleware/role-authorization.js";
import { ROLES } from "../../constants/roles.js";

const router = Router()

// Get all pelatihan (HR only)
router.get('/', allowRoles(ROLES.HR), async (req, res) => {
    try {
        const pelatihan = await prisma.pelatihan.findMany({
            include: {
                peserta: {
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
                pelatihanDetail: {
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

        const pelatihan = karyawan.pelatihanDetail.map(detail => ({
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

router.post('/', allowRoles(ROLES.HR), async (req, res) => {
    const { nama, tanggal, lokasi } = req.body;
    if (!nama || !tanggal || !lokasi) {
        return res.status(400).json({ message: 'nama, tanggal, dan lokasi wajib diisi' });
    }
    try {
        const pelatihan = await prisma.pelatihan.create({
            data: {
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

export default router;
