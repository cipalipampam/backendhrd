import { PrismaClient} from "@prisma/client";
import { Router } from "express";

const router = Router()
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    try {
        const pelatihan = await prisma.pelatihan.findMany({
            select: {
                nama: true,
                tanggal: true,
                lokasi: true
            }
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

router.post('/', async (req, res) => {
    const { nama, tanggal, lokasi } = req.body;
    try {
        const pelatihan = await prisma.pelatihan.create({
            data: {
                nama,
                tanggal,
                lokasi
            },
        });
        res.status(201).json(pelatihan);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nama, tanggal, lokasi } = req.body;

    try {
        const pelatihan = await prisma.pelatihan.update({
            where: {
                id: id
            },
            data: {
                nama,
                tanggal,
                lokasi
            }
        });
        res.json(pelatihan)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.pelatihan.delete({
            where: {
                id: id
            }
        });
        res.json({
            status: 200,
            message: `pelatihan ${id} deleted`,
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
