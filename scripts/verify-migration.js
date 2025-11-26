import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function verify() {
  console.log('\n📊 Verification Results:\n');
  
  // 1. Count jabatan per departemen
  const departemen = await prisma.departemen.findMany({
    include: {
      _count: {
        select: { jabatan: true }
      }
    }
  });
  
  console.log('1. Jabatan count per Departemen:');
  departemen.forEach(d => {
    console.log(`   ${d.nama}: ${d._count.jabatan} roles`);
  });
  
  // 2. Sample jabatan with departemen
  console.log('\n2. Sample Jabatan (first 10):');
  const jabatan = await prisma.jabatan.findMany({
    include: {
      departemen: {
        select: { nama: true }
      }
    },
    take: 10,
    orderBy: [
      { departemenId: 'asc' },
      { nama: 'asc' }
    ]
  });
  
  jabatan.forEach(j => {
    console.log(`   ${j.nama} (${j.level || 'No level'}) - ${j.departemen.nama}`);
  });
  
  // 3. Check karyawan with jabatan
  console.log('\n3. Karyawan with Jabatan:');
  const karyawan = await prisma.karyawan.findMany({
    include: {
      jabatan: {
        select: { nama: true, level: true }
      },
      departemen: {
        select: { nama: true }
      }
    },
    take: 5
  });
  
  karyawan.forEach(k => {
    const jabatanInfo = k.jabatan[0] ? `${k.jabatan[0].nama} (${k.jabatan[0].level})` : 'No jabatan';
    const deptInfo = k.departemen[0] ? k.departemen[0].nama : 'No dept';
    console.log(`   ${k.nama}: ${jabatanInfo} @ ${deptInfo}`);
  });
  
  console.log('\n✅ Verification complete!\n');
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
