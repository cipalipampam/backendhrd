import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
const prisma = new PrismaClient()

async function main() {
  // -------------------- Departemen --------------------
  const departemenNames = [
    'Sales & Marketing',
    'Operations',
    'Technology',
    'Analytics',
    'R&D',
    'Procurement',
    'Finance',
    'HR',
    'Legal'
  ]
  await Promise.all(
    departemenNames.map(nama =>
      prisma.departemen.upsert({
        where: { nama },
        update: {},
        create: { nama }
      })
    )
  )

  // -------------------- Jabatan contoh --------------------
  const jabatanNames = ['Manager', 'Staff', 'Supervisor']
  await Promise.all(
    jabatanNames.map(nama =>
      prisma.jabatan.upsert({
        where: { nama },
        update: {},
        create: { nama }
      })
    )
  )

  // -------------------- User & Karyawan --------------------
  const user1 = await prisma.user.upsert({
    where: { email: 'hr@hr.com' },        // samakan email
    update: {},
    create: {
      username: 'hr',                  
      email: 'hr@gmail.com',
      password: await bcrypt.hash('hr', 10),
      role: 'HR'
    }
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'karyawan@gmail.com' },
    update: {},
    create: {
      username: 'karyawan',
      email: 'karyawan@gmail.com',
      password: await bcrypt.hash('karyawan', 10),
      role: 'KARYAWAN'
    }
  })

  const karyawan1 = await prisma.karyawan.upsert({
    where: { userId: user1.username },
    update: {},
    create: {
      nama: 'HRD',
      gender: 'Pria',
      pendidikan: 'Magister',
      tanggal_masuk: new Date('2022-01-10'),
      jalur_rekrut: 'Wawancara',
      userId: user1.username,
      Departemen: {
        connect: [{ nama: 'HR' }]
      },
      Jabatan: {
        connect: [{ nama: 'Manager' }]
      }
    }
  })

  const karyawan2 = await prisma.karyawan.upsert({
    where: { userId: user2.username },
    update: {},
    create: {
      nama: 'Karyawan',
      gender: 'Pria',
      pendidikan: 'Sarjana',
      tanggal_masuk: new Date('2023-03-01'),
      jalur_rekrut: 'Undangan',
      userId: user2.username,
      Departemen: {
        connect: [{ nama: 'Technology' }]
      },
      Jabatan: {
        connect: [{ nama: 'Staff' }]
      }
    }
  })

  // -------------------- KPI & Rating contoh --------------------
  await prisma.kPI.create({
    data: {
      year: 2024,
      score: 87.5,
      notes: 'Target tercapai',
      karyawanId: karyawan1.id         // <-- gunakan FK langsung
    }
  })

  await prisma.rating.create({
    data: {
      year: 2024,
      score: 90,
      notes: 'Sangat baik',
      karyawanId: karyawan2.id         // <-- gunakan FK langsung
    }
  })

  // -------------------- Pelatihan & Detail contoh --------------------
  const pelatihan = await prisma.pelatihan.create({
    data: {
      nama: 'Pelatihan Leadership',
      tanggal: new Date('2024-08-15'),
      lokasi: 'Jakarta'
    }
  })

  await prisma.pelatihanDetail.create({
    data: {
      pelatihanId: pelatihan.id,
      karyawanId: karyawan2.id,
      skor: 95,
      catatan: 'Sangat aktif'
    }
  })

  // -------------------- Penghargaan contoh --------------------
  await prisma.penghargaan.create({
    data: {
      nama: 'Karyawan Terbaik',
      tahun: new Date('2024-12-31'),
      Karyawan: { connect: [{ id: karyawan2.id }] }
    }
  })

  console.log('✅ Seeding selesai!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
