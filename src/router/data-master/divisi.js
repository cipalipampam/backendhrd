import { PrismaClient} from "@prisma/client";
import { Router } from "express";

const router = Router()
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    try {
        const divisi = await prisma.divisi.findMany({
            select: {
                name: true
            }
        });
        res.json({
            status: 200,
            message: 'Divisi found',
            data: divisi
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
        const divisi = await prisma.divisi.create({
            data: {
                name
            },
        });
        res.status(201).json(divisi);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const divisi = await prisma.divisi.update({
            where: {
                id: id
            },
            data: {
                name
            }
        });
        res.json(divisi)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.divisi.delete({
            where: {
                id: id
            }
        });
        res.json({
            status: 200,
            message: `Divisi ${id} deleted`,
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
