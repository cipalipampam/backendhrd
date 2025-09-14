import { PrismaClient} from "@prisma/client";
import { Router } from "express";

const router = Router()
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    try {
        const departemen = await prisma.departemen.findMany({
            select: {
                nama: true
            }
        });
        res.json({
            status: 200,
            message: 'Departemen found',
            data: departemen
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
    const { nama } = req.body;
    try {
        const departemen = await prisma.departemen.create({
            data: {
                nama
            },
        });
        res.status(201).json(departemen);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const departemen = await prisma.departemen.update({
            where: {
                id: id
            },
            data: {
                name
            }
        });
        res.json(departemen)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.departemen.delete({
            where: {
                id: id
            }
        });
        res.json({
            status: 200,
            message: `Departemen ${id} deleted`,
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
