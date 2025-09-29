import prisma from "../../prismaClient.js";
import { Router } from "express";
import { allowRoles } from "../../middleware/role-authorization.js";
import { ROLES } from "../../constants/roles.js";

const router = Router()

// get all users (sesuai skema: username sebagai PK, tidak expose password)
router.get('/', allowRoles(ROLES.HR), async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                username: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });
        res.json({
            status: 200,
            message: 'Users found',
            data: users
        })
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
            error: error.message
        });
    }
})

export default router;