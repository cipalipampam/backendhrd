import { PrismaClient } from "@prisma/client";

let prismaClientInstance;

export function getPrismaClient() {
	if (!prismaClientInstance) {
		prismaClientInstance = new PrismaClient();
	}
	return prismaClientInstance;
}

const prisma = getPrismaClient();
export default prisma;


