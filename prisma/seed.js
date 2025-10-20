import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // -------------------- Departemen --------------------
  const departemenNames = [
    'Sales & Marketing',
    'Operations',
    'Technology',
    'Finance',
    'HR'
  ]
  
  await Promise.all(
    departemenNames.map(nama =>
      prisma.departemen.upsert({
        where: { nama },
        update: {},
        create: { 
          id: randomUUID(),
          nama,
          updatedAt: new Date()
        }
      })
    )
  )
  console.log('✅ Departemen created')

  // -------------------- Jabatan --------------------
  const jabatanNames = [
    'Manager',
    'Staff',
    'Supervisor',
    'Analyst',
    'Developer',
    'Specialist'
  ]
  
  await Promise.all(
    jabatanNames.map(nama =>
      prisma.jabatan.upsert({
        where: { nama },
        update: {},
        create: { 
          id: randomUUID(),
          nama,
          updatedAt: new Date()
        }
      })
    )
  )
  console.log('✅ Jabatan created')

  // -------------------- User & Karyawan --------------------
  const users = [
    // HR Users
    {
      username: 'hr_manager',
      email: 'hr.manager@company.com',
      password: 'hr123',
      role: 'HR',
      karyawan: {
        nama: 'Sarah Johnson',
        gender: 'Wanita',
        alamat: 'Jl. Sudirman No. 123, Jakarta',
        no_telp: '081234567890',
        tanggal_lahir: new Date('1985-05-15'),
        pendidikan: 'Magister Manajemen',
        tanggal_masuk: new Date('2020-01-15'),
        jalur_rekrut: 'Headhunter',
        departemen: 'HR',
        jabatan: 'Manager'
      }
    },
    // Karyawan Users
    {
      username: 'john_doe',
      email: 'john.doe@company.com',
      password: 'karyawan123',
      role: 'KARYAWAN',
      karyawan: {
        nama: 'John Doe',
        gender: 'Pria',
        alamat: 'Jl. Gatot Subroto No. 789, Jakarta',
        no_telp: '081234567892',
        tanggal_lahir: new Date('1992-12-10'),
        pendidikan: 'Sarjana Teknik Informatika',
        tanggal_masuk: new Date('2022-06-01'),
        jalur_rekrut: 'LinkedIn',
        departemen: 'Technology',
        jabatan: 'Developer'
      }
    },
    {
      username: 'jane_smith',
      email: 'jane.smith@company.com',
      password: 'karyawan123',
      role: 'KARYAWAN',
      karyawan: {
        nama: 'Jane Smith',
        gender: 'Wanita',
        alamat: 'Jl. Kuningan No. 321, Jakarta',
        no_telp: '081234567893',
        tanggal_lahir: new Date('1988-03-25'),
        pendidikan: 'Magister Manajemen',
        tanggal_masuk: new Date('2021-09-15'),
        jalur_rekrut: 'Referral',
        departemen: 'Sales & Marketing',
        jabatan: 'Manager'
      }
    },
    {
      username: 'budi_santoso',
      email: 'budi.santoso@company.com',
      password: 'karyawan123',
      role: 'KARYAWAN',
      karyawan: {
        nama: 'Budi Santoso',
        gender: 'Pria',
        alamat: 'Jl. Senayan No. 654, Jakarta',
        no_telp: '081234567894',
        tanggal_lahir: new Date('1995-07-18'),
        pendidikan: 'Sarjana Akuntansi',
        tanggal_masuk: new Date('2023-01-10'),
        jalur_rekrut: 'Campus Recruitment',
        departemen: 'Finance',
        jabatan: 'Analyst'
      }
    },
    {
      username: 'ahmad_rizki',
      email: 'ahmad.rizki@company.com',
      password: 'karyawan123',
      role: 'KARYAWAN',
      karyawan: {
        nama: 'Ahmad Rizki',
        gender: 'Pria',
        alamat: 'Jl. Cikini No. 147, Jakarta',
        no_telp: '081234567896',
        tanggal_lahir: new Date('1991-04-12'),
        pendidikan: 'Sarjana Teknik Industri',
        tanggal_masuk: new Date('2020-11-05'),
        jalur_rekrut: 'Job Portal',
        departemen: 'Operations',
        jabatan: 'Supervisor'
      }
    }
  ]

  const createdUsers = []
  const createdKaryawan = []

  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        username: userData.username,
        email: userData.email,
        password: await bcrypt.hash(userData.password, 10),
        role: userData.role,
        updatedAt: new Date()
      }
    })
    createdUsers.push(user)

    const karyawan = await prisma.karyawan.upsert({
      where: { userId: user.username },
      update: {},
      create: {
        id: randomUUID(),
        nama: userData.karyawan.nama,
        gender: userData.karyawan.gender,
        alamat: userData.karyawan.alamat,
        no_telp: userData.karyawan.no_telp,
        tanggal_lahir: userData.karyawan.tanggal_lahir,
        pendidikan: userData.karyawan.pendidikan,
        tanggal_masuk: userData.karyawan.tanggal_masuk,
        jalur_rekrut: userData.karyawan.jalur_rekrut,
        userId: user.username,
        updatedAt: new Date(),
        departemen: {
          connect: [{ nama: userData.karyawan.departemen }]
        },
        jabatan: {
          connect: [{ nama: userData.karyawan.jabatan }]
        }
      }
    })
    createdKaryawan.push(karyawan)
  }

  console.log('✅ Users and Karyawan created')

  // -------------------- KPI Data --------------------
  const kpiData = [
    // Sarah Johnson (HR Manager)
    { karyawanId: createdKaryawan[0].id, year: 2022, score: 85.5, notes: 'Target tercapai dengan baik' },
    { karyawanId: createdKaryawan[0].id, year: 2023, score: 88.0, notes: 'Peningkatan performa yang signifikan' },
    { karyawanId: createdKaryawan[0].id, year: 2024, score: 92.5, notes: 'Exceeded expectations' },
    
    // John Doe (Developer)
    { karyawanId: createdKaryawan[1].id, year: 2022, score: 78.0, notes: 'Learning phase, good progress' },
    { karyawanId: createdKaryawan[1].id, year: 2023, score: 85.0, notes: 'Significant improvement' },
    { karyawanId: createdKaryawan[1].id, year: 2024, score: 88.5, notes: 'Strong technical skills' },
    
    // Jane Smith (Sales Manager)
    { karyawanId: createdKaryawan[2].id, year: 2021, score: 90.0, notes: 'Excellent sales performance' },
    { karyawanId: createdKaryawan[2].id, year: 2022, score: 93.5, notes: 'Exceeded sales targets' },
    { karyawanId: createdKaryawan[2].id, year: 2023, score: 95.0, notes: 'Outstanding leadership' },
    { karyawanId: createdKaryawan[2].id, year: 2024, score: 96.5, notes: 'Top performer' },
    
    // Budi Santoso (Finance Analyst)
    { karyawanId: createdKaryawan[3].id, year: 2023, score: 87.0, notes: 'Strong analytical skills' },
    { karyawanId: createdKaryawan[3].id, year: 2024, score: 89.5, notes: 'Excellent attention to detail' },
    
    // Ahmad Rizki (Operations Supervisor)
    { karyawanId: createdKaryawan[4].id, year: 2020, score: 83.0, notes: 'Good operational management' },
    { karyawanId: createdKaryawan[4].id, year: 2021, score: 86.0, notes: 'Improved efficiency' },
    { karyawanId: createdKaryawan[4].id, year: 2022, score: 88.5, notes: 'Strong leadership' },
    { karyawanId: createdKaryawan[4].id, year: 2023, score: 91.0, notes: 'Excellent team management' },
    { karyawanId: createdKaryawan[4].id, year: 2024, score: 93.5, notes: 'Outstanding performance' }
  ]

  for (const kpi of kpiData) {
    await prisma.kpi.upsert({
      where: {
        karyawanId_year: {
          karyawanId: kpi.karyawanId,
          year: kpi.year
        }
      },
      update: {},
      create: {
        id: randomUUID(),
        ...kpi,
        updatedAt: new Date()
      }
    })
  }
  console.log('✅ KPI data created')

  // -------------------- Rating Data --------------------
  const ratingData = [
    // Sarah Johnson
    { karyawanId: createdKaryawan[0].id, year: 2022, score: 4.2, notes: 'Good leadership skills' },
    { karyawanId: createdKaryawan[0].id, year: 2023, score: 4.4, notes: 'Improved team management' },
    { karyawanId: createdKaryawan[0].id, year: 2024, score: 4.6, notes: 'Excellent HR management' },
    
    // John Doe
    { karyawanId: createdKaryawan[1].id, year: 2022, score: 3.8, notes: 'Good technical skills' },
    { karyawanId: createdKaryawan[1].id, year: 2023, score: 4.1, notes: 'Improved problem solving' },
    { karyawanId: createdKaryawan[1].id, year: 2024, score: 4.3, notes: 'Strong developer' },
    
    // Jane Smith
    { karyawanId: createdKaryawan[2].id, year: 2021, score: 4.5, notes: 'Excellent sales results' },
    { karyawanId: createdKaryawan[2].id, year: 2022, score: 4.6, notes: 'Outstanding sales performance' },
    { karyawanId: createdKaryawan[2].id, year: 2023, score: 4.7, notes: 'Top sales manager' },
    { karyawanId: createdKaryawan[2].id, year: 2024, score: 4.8, notes: 'Exceptional leadership' },
    
    // Budi Santoso
    { karyawanId: createdKaryawan[3].id, year: 2023, score: 4.2, notes: 'Good analytical work' },
    { karyawanId: createdKaryawan[3].id, year: 2024, score: 4.4, notes: 'Excellent financial analysis' },
    
    // Ahmad Rizki
    { karyawanId: createdKaryawan[4].id, year: 2020, score: 4.0, notes: 'Good operational skills' },
    { karyawanId: createdKaryawan[4].id, year: 2021, score: 4.2, notes: 'Improved efficiency' },
    { karyawanId: createdKaryawan[4].id, year: 2022, score: 4.3, notes: 'Strong supervision' },
    { karyawanId: createdKaryawan[4].id, year: 2023, score: 4.5, notes: 'Excellent team leadership' },
    { karyawanId: createdKaryawan[4].id, year: 2024, score: 4.6, notes: 'Outstanding supervisor' }
  ]

  for (const rating of ratingData) {
    await prisma.rating.upsert({
      where: {
        karyawanId_year: {
          karyawanId: rating.karyawanId,
          year: rating.year
        }
      },
      update: {},
      create: {
        id: randomUUID(),
        ...rating,
        updatedAt: new Date()
      }
    })
  }
  console.log('✅ Rating data created')

  // -------------------- Pelatihan Data --------------------
  const pelatihanData = [
    {
      nama: 'Leadership Development Program',
      tanggal: new Date('2024-01-15'),
      lokasi: 'Jakarta Convention Center',
      peserta: [
        { karyawanId: createdKaryawan[0].id, skor: 95, catatan: 'Excellent leadership potential' },
        { karyawanId: createdKaryawan[2].id, skor: 92, catatan: 'Strong leadership skills' },
        { karyawanId: createdKaryawan[4].id, skor: 88, catatan: 'Good management potential' }
      ]
    },
    {
      nama: 'Software Development Best Practices',
      tanggal: new Date('2024-04-05'),
      lokasi: 'Jakarta Tech Hub',
      peserta: [
        { karyawanId: createdKaryawan[1].id, skor: 93, catatan: 'Excellent technical skills' }
      ]
    },
    {
      nama: 'Financial Analysis & Reporting',
      tanggal: new Date('2024-05-12'),
      lokasi: 'Jakarta Financial Center',
      peserta: [
        { karyawanId: createdKaryawan[3].id, skor: 91, catatan: 'Strong financial acumen' },
        { karyawanId: createdKaryawan[0].id, skor: 86, catatan: 'Good understanding of finance' }
      ]
    }
  ]

  for (const pelatihan of pelatihanData) {
    const createdPelatihan = await prisma.pelatihan.create({
      data: {
        id: randomUUID(),
        nama: pelatihan.nama,
        tanggal: pelatihan.tanggal,
        lokasi: pelatihan.lokasi,
        updatedAt: new Date()
      }
    })

    for (const peserta of pelatihan.peserta) {
      await prisma.pelatihandetail.create({
        data: {
          id: randomUUID(),
          pelatihanId: createdPelatihan.id,
          karyawanId: peserta.karyawanId,
          skor: peserta.skor,
          catatan: peserta.catatan,
          updatedAt: new Date()
        }
      })
    }
  }
  console.log('✅ Pelatihan data created')

  // -------------------- Penghargaan Data --------------------
  const penghargaanData = [
    {
      nama: 'Employee of the Year 2024',
      tahun: new Date('2024-12-31'),
      karyawan: [createdKaryawan[2].id] // Jane Smith
    },
    {
      nama: 'Best Team Player 2024',
      tahun: new Date('2024-12-31'),
      karyawan: [createdKaryawan[1].id] // John Doe
    },
    {
      nama: 'Leadership Excellence 2024',
      tahun: new Date('2024-12-31'),
      karyawan: [createdKaryawan[0].id, createdKaryawan[2].id] // Sarah Johnson & Jane Smith
    }
  ]

  for (const penghargaan of penghargaanData) {
    await prisma.penghargaan.create({
      data: {
        id: randomUUID(),
        nama: penghargaan.nama,
        tahun: penghargaan.tahun,
        updatedAt: new Date(),
        karyawan: {
          connect: penghargaan.karyawan.map(id => ({ id }))
        }
      }
    })
  }
  console.log('✅ Penghargaan data created')

  console.log('🎉 Seeding completed successfully!')
  console.log('\n📋 Test Accounts:')
  console.log('HR Manager: hr.manager@company.com / hr123')
  console.log('John Doe: john.doe@company.com / karyawan123')
  console.log('Jane Smith: jane.smith@company.com / karyawan123')
  console.log('Budi Santoso: budi.santoso@company.com / karyawan123')
  console.log('Ahmad Rizki: ahmad.rizki@company.com / karyawan123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())