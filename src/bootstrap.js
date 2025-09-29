import { execSync } from 'child_process';

function ensureDatabaseExists() {
	// Untuk MySQL (XAMPP), Prisma akan membuat tabel saat migrate deploy.
	// Jika database belum ada, sediakan DATABASE_URL ke DB yang ada + schema, atau buat DB manual.
	// Di sini kita biarkan Prisma meng-handle via migrate deploy.
}

export function runPrismaMigrateAndSeed() {
	try {
		ensureDatabaseExists();
		// Generate Prisma Client terlebih dahulu
		execSync('npx prisma generate', { stdio: 'inherit' });
		// Apply pending migrations (create DB/tables if missing)
		execSync('npx prisma migrate deploy', { stdio: 'inherit' });
		// Seed database (idempotent seed script recommended)
		execSync('npm run seed', { stdio: 'inherit' });
	} catch (err) {
		console.error('Error during migrate/seed:', err?.message || err);
	}
}

export async function runPrismaSetup() {
	return runPrismaMigrateAndSeed();
}


