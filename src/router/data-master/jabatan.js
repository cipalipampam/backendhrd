import prisma from "../../prismaClient.js";
import { Router } from "express";
import { allowRoles } from "../../middleware/role-authorization.js";
import { ROLES } from "../../constants/roles.js";
import { randomUUID } from "crypto"; 

const router = Router()

router.get('/', allowRoles(ROLES.HR), async (req, res) => {
    try {
        const jabatan = await prisma.jabatan.findMany({
           select: {
                id: true,
                nama: true
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

router.post('/', allowRoles(ROLES.HR), async (req, res) => {
    const { nama } = req.body;
    if (!nama) {
        return res.status(400).json({ message: 'nama wajib diisi' });
    }
    try {
        const jabatan = await prisma.jabatan.create({
            data: {
                id: randomUUID(), 
                nama
            },
        });
        res.status(201).json({ status: 201, message: 'Jabatan created', data: jabatan });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.put('/:id', allowRoles(ROLES.HR), async (req, res) => {
    const { id } = req.params;
    const { nama } = req.body;

    try {
        const existing = await prisma.jabatan.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ message: `Jabatan ${id} not found` });
        }
        const jabatan = await prisma.jabatan.update({
            where: { id },
            data: { nama }
        });
        res.json({ status: 200, message: 'Jabatan updated', data: jabatan })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.delete('/:id', allowRoles(ROLES.HR), async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma.jabatan.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ message: `Jabatan ${id} not found` });
        }
        await prisma.jabatan.delete({ where: { id } });
        res.json({ status: 200, message: `Jabatan ${id} deleted` })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
