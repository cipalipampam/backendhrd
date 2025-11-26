/**
 * Script untuk migrate data jabatan existing ke struktur baru (dengan departemenId)
 * 
 * ⚠️ PENTING: Jalankan script ini SETELAH schema migration tapi SEBELUM menjalankan seed
 * 
 * Use case: Jika Anda punya data jabatan existing tanpa departemenId
 * 
 * Run: node scripts/migrate-jabatan-data.js
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Mapping manual: jabatan nama -> departemen nama
// SESUAIKAN mapping ini dengan data Anda
const JABATAN_TO_DEPT_MAPPING = {
  'Manager': 'HR',
  'Staff': 'Technology',
  'Supervisor': 'Operations',
  'Developer': 'Technology',
  'Accountant': 'Finance',
  'Sales Representative': 'Sales & Marketing',
  'HR Assistant': 'HR',
  'Operations Manager': 'Operations',
  'Data Analyst': 'Analytics',
  'Researcher': 'R&D',
  'Procurement Specialist': 'Procurement',
  // Tambahkan mapping lainnya sesuai data Anda
};

const DEFAULT_DEPARTMENT = 'HR'; // Fallback jika tidak ada mapping

async function migrateJabatanData() {
  console.log('🔄 Starting jabatan data migration...\n');

  try {
    // 1. Ambil semua jabatan existing
    const jabatanList = await prisma.jabatan.findMany();
    console.log(`Found ${jabatanList.length} jabatan records\n`);

    if (jabatanList.length === 0) {
      console.log('✅ No existing jabatan data. You can run seed script now.');
      return;
    }

    // 2. Ambil semua departemen
    const departemenList = await prisma.departemen.findMany();
    console.log(`Found ${departemenList.length} departemen records\n`);

    if (departemenList.length === 0) {
      console.error('❌ No departemen found! Please seed departemen first.');
      return;
    }

    // 3. Check if jabatan already has departemenId (migration already done)
    const firstJabatan = jabatanList[0];
    if (firstJabatan.departemenId) {
      console.log('✅ Jabatan already has departemenId. Migration already completed.');
      return;
    }

    // 4. Process each jabatan
    let successCount = 0;
    let failCount = 0;

    for (const jab of jabatanList) {
      // Get target departemen from mapping (or use default)
      const targetDeptName = JABATAN_TO_DEPT_MAPPING[jab.nama] || DEFAULT_DEPARTMENT;
      const targetDept = departemenList.find(d => d.nama === targetDeptName);

      if (!targetDept) {
        console.log(`⚠️  No department found for: ${jab.nama} -> ${targetDeptName} (SKIPPED)`);
        failCount++;
        continue;
      }

      try {
        // Update jabatan with departemenId
        await prisma.jabatan.update({
          where: { id: jab.id },
          data: { 
            departemenId: targetDept.id,
            level: inferLevel(jab.nama), // Infer level from name
          }
        });

        console.log(`✅ ${jab.nama} -> ${targetDept.nama}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to update ${jab.nama}:`, error.message);
        failCount++;
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   📝 Total: ${jabatanList.length}`);

    if (failCount > 0) {
      console.log('\n⚠️  Some migrations failed. Please check the mapping or fix manually.');
    } else {
      console.log('\n✅ All jabatan migrated successfully!');
      console.log('   You can now run: npm run seed');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Infer level from jabatan name (basic heuristic)
 */
function inferLevel(namaJabatan) {
  const lower = namaJabatan.toLowerCase();
  
  if (lower.includes('director') || lower.includes('head')) return 'Director';
  if (lower.includes('manager')) return 'Manager';
  if (lower.includes('lead') || lower.includes('senior')) return 'Senior';
  if (lower.includes('supervisor') || lower.includes('coordinator')) return 'Lead';
  if (lower.includes('junior') || lower.includes('assistant')) return 'Junior';
  
  return 'Staff'; // Default
}

// Run migration
migrateJabatanData();
