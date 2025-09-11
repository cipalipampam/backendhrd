import { PrismaClient} from "@prisma/client";
import { Router } from "express";

const router = Router()
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    try {
        const jabatan = await prisma.jabatan.findMany({
            select: {
                name: true
            }
        });
        res.json({
            status: 200,
            message: 'Jabatan found',
            data: jabatan
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
    const { name } = req.body;
    try {
        const jabatan = await prisma.jabatan.create({
            data: {
                name
            },
        });
        res.status(201).json(jabatan);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const jabatan = await prisma.jabatan.update({
            where: {
                id: id
            },
            data: {
                name
            }
        });
        res.json(jabatan)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.jabatan.delete({
            where: {
                id: id
            }
        });
        res.json({
            status: 200,
            message: `Jabatan ${id} deleted`,
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
