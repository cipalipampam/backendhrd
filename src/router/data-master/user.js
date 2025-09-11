import { PrismaClient} from "@prisma/client";
import { Router } from "express";

const router = Router()
const prisma = new PrismaClient();

//get all users
router.get('/', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                nama: true,
                email: true,
                password: true,
                role: true
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