import prisma from "../../prismaClient.js";
import { Router } from "express";
import { allowRoles } from "../../middleware/role-authorization.js";
import { ROLES } from "../../constants/roles.js";
import { randomUUID } from "crypto"; 

const router = Router()

router.get('/', allowRoles(ROLES.HR), async (req, res) => {
    try {
        const departemen = await prisma.departemen.findMany({
            select: {
                id: true,
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

router.post('/', allowRoles(ROLES.HR), async (req, res) => {
    const { nama } = req.body;
    if (!nama) {
        return res.status(400).json({ message: 'nama wajib diisi' });
    }
    try {
        const departemen = await prisma.departemen.create({
            data: {
                id: randomUUID(), 
                nama
            },
        });
        res.status(201).json({ status: 201, message: 'Departemen created', data: departemen });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
})

router.put('/:id', allowRoles(ROLES.HR), async (req, res) => {
    const { id } = req.params;
    const { nama } = req.body;

    try {
        const existing = await prisma.departemen.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ message: `Departemen ${id} not found` });
        }
        const departemen = await prisma.departemen.update({
            where: { id },
            data: { nama }
        });
        res.json({ status: 200, message: 'Departemen updated', data: departemen })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
})

router.delete('/:id', allowRoles(ROLES.HR), async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma.departemen.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ message: `Departemen ${id} not found` });
        }
        await prisma.departemen.delete({ where: { id } });
        res.json({ status: 200, message: `Departemen ${id} deleted` })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

export default router;