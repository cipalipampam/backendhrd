import prisma from "../../prismaClient.js";
import { Router } from "express";
import { allowRoles } from "../../middleware/role-authorization.js";
import { ROLES } from "../../constants/roles.js";
import { randomUUID } from "crypto"; 

const router = Router()

router.get('/', allowRoles(ROLES.HR), async (req, res) => {
    try {
        const { departemenId } = req.query;
        
        const whereClause = {};
        if (departemenId) {
            whereClause.departemenId = departemenId;
        }

        const jabatan = await prisma.jabatan.findMany({
            where: whereClause,
            select: {
                id: true,
                nama: true,
                level: true,
                departemenId: true,
                deskripsi: true,
                departemen: {
                    select: {
                        id: true,
                        nama: true
                    }
                }
            },
            orderBy: [
                { departemenId: 'asc' },
                { level: 'asc' },
                { nama: 'asc' }
            ]
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
    const { nama, departemenId, level, deskripsi } = req.body;
    
    if (!nama || !departemenId) {
        return res.status(400).json({ message: 'nama dan departemenId wajib diisi' });
    }
    
    try {
        // Validate departemen exists
        const deptExists = await prisma.departemen.findUnique({
            where: { id: departemenId }
        });
        if (!deptExists) {
            return res.status(404).json({ message: 'Departemen tidak ditemukan' });
        }

        const jabatan = await prisma.jabatan.create({
            data: {
                id: randomUUID(), 
                nama,
                departemenId,
                level: level || null,
                deskripsi: deskripsi || null
            },
            include: {
                departemen: {
                    select: { id: true, nama: true }
                }
            }
        });
        res.status(201).json({ status: 201, message: 'Jabatan created', data: jabatan });
    } catch (error) {
        console.log(error);
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'Jabatan dengan nama ini sudah ada di departemen tersebut' });
        }
        res.status(500).json({ message: "Internal server error" });
    }
})

router.put('/:id', allowRoles(ROLES.HR), async (req, res) => {
    const { id } = req.params;
    const { nama, departemenId, level, deskripsi } = req.body;

    try {
        const existing = await prisma.jabatan.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ message: `Jabatan ${id} not found` });
        }

        // Validate departemen if provided
        if (departemenId && departemenId !== existing.departemenId) {
            const deptExists = await prisma.departemen.findUnique({
                where: { id: departemenId }
            });
            if (!deptExists) {
                return res.status(404).json({ message: 'Departemen tidak ditemukan' });
            }
        }

        const updateData = {};
        if (nama !== undefined) updateData.nama = nama;
        if (departemenId !== undefined) updateData.departemenId = departemenId;
        if (level !== undefined) updateData.level = level;
        if (deskripsi !== undefined) updateData.deskripsi = deskripsi;

        const jabatan = await prisma.jabatan.update({
            where: { id },
            data: updateData,
            include: {
                departemen: {
                    select: { id: true, nama: true }
                }
            }
        });
        res.json({ status: 200, message: 'Jabatan updated', data: jabatan })
    } catch (error) {
        console.log(error);
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'Jabatan dengan nama ini sudah ada di departemen tersebut' });
        }
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
