import { Router } from 'express';
import { allowRoles } from '../../middleware/role-authorization.js';
import { ROLES } from '../../constants/roles.js';
import prisma from '../../prismaClient.js';
import { recommendForKaryawan } from '../../modules/promotion-ai/services/promotion-recommender.service.js';

const router = Router();

router.post('/recommend/:karyawanId', allowRoles(ROLES.HR), async (req, res) => {
	const { karyawanId } = req.params;
	const existing = await prisma.karyawan.findUnique({ where: { id: karyawanId } });
	if (!existing) return res.status(404).json({ message: `Karyawan ${karyawanId} not found` });
	const rec = await recommendForKaryawan(karyawanId);
	if (!rec) return res.status(404).json({ message: 'No active model or features unavailable' });
	return res.json({ status: 200, message: 'Recommendation generated', data: rec });
});

router.post('/recommend-batch', allowRoles(ROLES.HR), async (req, res) => {
	const karyawan = await prisma.karyawan.findMany({ select: { id: true } });
	const results = [];
	for (const k of karyawan) {
		const rec = await recommendForKaryawan(k.id);
		if (rec) results.push(rec);
	}
	return res.json({ status: 200, message: 'Batch recommendation generated', data: results });
});

export default router;


