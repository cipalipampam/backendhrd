import prisma from "../prismaClient.js";
import { recommendForKaryawan } from "../modules/promotion-ai/services/promotion-recommender.service.js";

async function main() {
	const karyawan = await prisma.karyawan.findMany({ select: { id: true } });
	for (const k of karyawan) {
		await recommendForKaryawan(k.id);
	}
}

main().catch(err => { console.error(err); process.exit(1); });


