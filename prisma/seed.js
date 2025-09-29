import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

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
    'Legal',
    'Customer Service',
    'Quality Assurance',
    'Production',
    'Logistics'
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
  console.log('✅ Departemen created')

  // -------------------- Jabatan --------------------
  const jabatanNames = [
    'Manager',
    'Staff',
    'Supervisor',
    'Senior Manager',
    'Director',
    'Analyst',
    'Developer',
    'Designer',
    'Coordinator',
    'Specialist',
    'Lead',
    'Senior Staff',
    'Junior Staff',
    'Intern'
  ]
  await Promise.all(
    jabatanNames.map(nama =>
      prisma.jabatan.upsert({
        where: { nama },
        update: {},
        create: { nama }
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
    {
      username: 'hr_specialist',
      email: 'hr.specialist@company.com',
      password: 'hr123',
      role: 'HR',
      karyawan: {
        nama: 'Michael Chen',
        gender: 'Pria',
        alamat: 'Jl. Thamrin No. 456, Jakarta',
        no_telp: '081234567891',
        tanggal_lahir: new Date('1990-08-22'),
        pendidikan: 'Sarjana Psikologi',
        tanggal_masuk: new Date('2021-03-10'),
        jalur_rekrut: 'Job Fair',
        departemen: 'HR',
        jabatan: 'Specialist'
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
      username: 'sari_dewi',
      email: 'sari.dewi@company.com',
      password: 'karyawan123',
      role: 'KARYAWAN',
      karyawan: {
        nama: 'Sari Dewi',
        gender: 'Wanita',
        alamat: 'Jl. Kebayoran No. 987, Jakarta',
        no_telp: '081234567895',
        tanggal_lahir: new Date('1993-11-30'),
        pendidikan: 'Sarjana Desain Komunikasi Visual',
        tanggal_masuk: new Date('2022-08-20'),
        jalur_rekrut: 'Portfolio',
        departemen: 'Technology',
        jabatan: 'Designer'
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
    },
    {
      username: 'lisa_wong',
      email: 'lisa.wong@company.com',
      password: 'karyawan123',
      role: 'KARYAWAN',
      karyawan: {
        nama: 'Lisa Wong',
        gender: 'Wanita',
        alamat: 'Jl. Menteng No. 258, Jakarta',
        no_telp: '081234567897',
        tanggal_lahir: new Date('1989-09-08'),
        pendidikan: 'Magister Data Science',
        tanggal_masuk: new Date('2021-12-01'),
        jalur_rekrut: 'Conference',
        departemen: 'Analytics',
        jabatan: 'Lead'
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
        role: userData.role
      }
    })
    createdUsers.push(user)

    const karyawan = await prisma.karyawan.upsert({
      where: { userId: user.username },
    update: {},
    create: {
        nama: userData.karyawan.nama,
        gender: userData.karyawan.gender,
        alamat: userData.karyawan.alamat,
        no_telp: userData.karyawan.no_telp,
        tanggal_lahir: userData.karyawan.tanggal_lahir,
        pendidikan: userData.karyawan.pendidikan,
        tanggal_masuk: userData.karyawan.tanggal_masuk,
        jalur_rekrut: userData.karyawan.jalur_rekrut,
        userId: user.username,
      Departemen: {
          connect: [{ nama: userData.karyawan.departemen }]
      },
      Jabatan: {
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
    
    // Michael Chen (HR Specialist)
    { karyawanId: createdKaryawan[1].id, year: 2021, score: 82.0, notes: 'Good performance for first year' },
    { karyawanId: createdKaryawan[1].id, year: 2022, score: 86.5, notes: 'Consistent improvement' },
    { karyawanId: createdKaryawan[1].id, year: 2023, score: 89.0, notes: 'Excellent work' },
    { karyawanId: createdKaryawan[1].id, year: 2024, score: 91.5, notes: 'Outstanding performance' },
    
    // John Doe (Developer)
    { karyawanId: createdKaryawan[2].id, year: 2022, score: 78.0, notes: 'Learning phase, good progress' },
    { karyawanId: createdKaryawan[2].id, year: 2023, score: 85.0, notes: 'Significant improvement' },
    { karyawanId: createdKaryawan[2].id, year: 2024, score: 88.5, notes: 'Strong technical skills' },
    
    // Jane Smith (Sales Manager)
    { karyawanId: createdKaryawan[3].id, year: 2021, score: 90.0, notes: 'Excellent sales performance' },
    { karyawanId: createdKaryawan[3].id, year: 2022, score: 93.5, notes: 'Exceeded sales targets' },
    { karyawanId: createdKaryawan[3].id, year: 2023, score: 95.0, notes: 'Outstanding leadership' },
    { karyawanId: createdKaryawan[3].id, year: 2024, score: 96.5, notes: 'Top performer' },
    
    // Budi Santoso (Finance Analyst)
    { karyawanId: createdKaryawan[4].id, year: 2023, score: 87.0, notes: 'Strong analytical skills' },
    { karyawanId: createdKaryawan[4].id, year: 2024, score: 89.5, notes: 'Excellent attention to detail' },
    
    // Sari Dewi (Designer)
    { karyawanId: createdKaryawan[5].id, year: 2022, score: 84.0, notes: 'Creative and innovative' },
    { karyawanId: createdKaryawan[5].id, year: 2023, score: 87.5, notes: 'Great design work' },
    { karyawanId: createdKaryawan[5].id, year: 2024, score: 90.0, notes: 'Outstanding creativity' },
    
    // Ahmad Rizki (Operations Supervisor)
    { karyawanId: createdKaryawan[6].id, year: 2020, score: 83.0, notes: 'Good operational management' },
    { karyawanId: createdKaryawan[6].id, year: 2021, score: 86.0, notes: 'Improved efficiency' },
    { karyawanId: createdKaryawan[6].id, year: 2022, score: 88.5, notes: 'Strong leadership' },
    { karyawanId: createdKaryawan[6].id, year: 2023, score: 91.0, notes: 'Excellent team management' },
    { karyawanId: createdKaryawan[6].id, year: 2024, score: 93.5, notes: 'Outstanding performance' },
    
    // Lisa Wong (Analytics Lead)
    { karyawanId: createdKaryawan[7].id, year: 2021, score: 89.0, notes: 'Strong analytical capabilities' },
    { karyawanId: createdKaryawan[7].id, year: 2022, score: 92.0, notes: 'Excellent data insights' },
    { karyawanId: createdKaryawan[7].id, year: 2023, score: 94.5, notes: 'Outstanding data analysis' },
    { karyawanId: createdKaryawan[7].id, year: 2024, score: 96.0, notes: 'Top analytics performer' }
  ]

  for (const kpi of kpiData) {
    await prisma.kPI.upsert({
      where: {
        karyawanId_year: {
          karyawanId: kpi.karyawanId,
          year: kpi.year
        }
      },
      update: {},
      create: kpi
    })
  }
  console.log('✅ KPI data created')

  // -------------------- Rating Data --------------------
  const ratingData = [
    // Sarah Johnson
    { karyawanId: createdKaryawan[0].id, year: 2022, score: 4.2, notes: 'Good leadership skills' },
    { karyawanId: createdKaryawan[0].id, year: 2023, score: 4.4, notes: 'Improved team management' },
    { karyawanId: createdKaryawan[0].id, year: 2024, score: 4.6, notes: 'Excellent HR management' },
    
    // Michael Chen
    { karyawanId: createdKaryawan[1].id, year: 2021, score: 4.0, notes: 'Good potential' },
    { karyawanId: createdKaryawan[1].id, year: 2022, score: 4.2, notes: 'Strong work ethic' },
    { karyawanId: createdKaryawan[1].id, year: 2023, score: 4.4, notes: 'Excellent specialist skills' },
    { karyawanId: createdKaryawan[1].id, year: 2024, score: 4.5, notes: 'Outstanding performance' },
    
    // John Doe
    { karyawanId: createdKaryawan[2].id, year: 2022, score: 3.8, notes: 'Good technical skills' },
    { karyawanId: createdKaryawan[2].id, year: 2023, score: 4.1, notes: 'Improved problem solving' },
    { karyawanId: createdKaryawan[2].id, year: 2024, score: 4.3, notes: 'Strong developer' },
    
    // Jane Smith
    { karyawanId: createdKaryawan[3].id, year: 2021, score: 4.5, notes: 'Excellent sales results' },
    { karyawanId: createdKaryawan[3].id, year: 2022, score: 4.6, notes: 'Outstanding sales performance' },
    { karyawanId: createdKaryawan[3].id, year: 2023, score: 4.7, notes: 'Top sales manager' },
    { karyawanId: createdKaryawan[3].id, year: 2024, score: 4.8, notes: 'Exceptional leadership' },
    
    // Budi Santoso
    { karyawanId: createdKaryawan[4].id, year: 2023, score: 4.2, notes: 'Good analytical work' },
    { karyawanId: createdKaryawan[4].id, year: 2024, score: 4.4, notes: 'Excellent financial analysis' },
    
    // Sari Dewi
    { karyawanId: createdKaryawan[5].id, year: 2022, score: 4.1, notes: 'Creative designer' },
    { karyawanId: createdKaryawan[5].id, year: 2023, score: 4.3, notes: 'Great design work' },
    { karyawanId: createdKaryawan[5].id, year: 2024, score: 4.5, notes: 'Outstanding creativity' },
    
    // Ahmad Rizki
    { karyawanId: createdKaryawan[6].id, year: 2020, score: 4.0, notes: 'Good operational skills' },
    { karyawanId: createdKaryawan[6].id, year: 2021, score: 4.2, notes: 'Improved efficiency' },
    { karyawanId: createdKaryawan[6].id, year: 2022, score: 4.3, notes: 'Strong supervision' },
    { karyawanId: createdKaryawan[6].id, year: 2023, score: 4.5, notes: 'Excellent team leadership' },
    { karyawanId: createdKaryawan[6].id, year: 2024, score: 4.6, notes: 'Outstanding supervisor' },
    
    // Lisa Wong
    { karyawanId: createdKaryawan[7].id, year: 2021, score: 4.4, notes: 'Strong analytical skills' },
    { karyawanId: createdKaryawan[7].id, year: 2022, score: 4.5, notes: 'Excellent data insights' },
    { karyawanId: createdKaryawan[7].id, year: 2023, score: 4.6, notes: 'Outstanding analytics' },
    { karyawanId: createdKaryawan[7].id, year: 2024, score: 4.7, notes: 'Top analytics lead' }
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
      create: rating
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
        { karyawanId: createdKaryawan[3].id, skor: 92, catatan: 'Strong leadership skills' },
        { karyawanId: createdKaryawan[6].id, skor: 88, catatan: 'Good management potential' }
      ]
    },
    {
      nama: 'Advanced Data Analytics',
      tanggal: new Date('2024-02-20'),
      lokasi: 'Online Training Platform',
      peserta: [
        { karyawanId: createdKaryawan[7].id, skor: 98, catatan: 'Outstanding analytical skills' },
        { karyawanId: createdKaryawan[4].id, skor: 85, catatan: 'Good understanding of analytics' }
      ]
    },
    {
      nama: 'Digital Marketing Strategy',
      tanggal: new Date('2024-03-10'),
      lokasi: 'Bandung Training Center',
      peserta: [
        { karyawanId: createdKaryawan[3].id, skor: 90, catatan: 'Great marketing insights' },
        { karyawanId: createdKaryawan[5].id, skor: 87, catatan: 'Good creative approach' }
      ]
    },
    {
      nama: 'Software Development Best Practices',
      tanggal: new Date('2024-04-05'),
      lokasi: 'Jakarta Tech Hub',
      peserta: [
        { karyawanId: createdKaryawan[2].id, skor: 93, catatan: 'Excellent technical skills' },
        { karyawanId: createdKaryawan[5].id, skor: 82, catatan: 'Good design integration' }
      ]
    },
    {
      nama: 'Financial Analysis & Reporting',
      tanggal: new Date('2024-05-12'),
      lokasi: 'Jakarta Financial Center',
      peserta: [
        { karyawanId: createdKaryawan[4].id, skor: 91, catatan: 'Strong financial acumen' },
        { karyawanId: createdKaryawan[0].id, skor: 86, catatan: 'Good understanding of finance' }
      ]
    },
    {
      nama: 'Project Management Certification',
      tanggal: new Date('2024-06-18'),
      lokasi: 'Surabaya Business Center',
      peserta: [
        { karyawanId: createdKaryawan[6].id, skor: 89, catatan: 'Good project management skills' },
        { karyawanId: createdKaryawan[1].id, skor: 87, catatan: 'Solid project coordination' }
      ]
    },
    {
      nama: 'UI/UX Design Workshop',
      tanggal: new Date('2024-07-25'),
      lokasi: 'Jakarta Design Studio',
      peserta: [
        { karyawanId: createdKaryawan[5].id, skor: 96, catatan: 'Outstanding design skills' },
        { karyawanId: createdKaryawan[2].id, skor: 84, catatan: 'Good technical implementation' }
      ]
    },
    {
      nama: 'Operations Excellence',
      tanggal: new Date('2024-08-30'),
      lokasi: 'Jakarta Operations Center',
      peserta: [
        { karyawanId: createdKaryawan[6].id, skor: 94, catatan: 'Excellent operational knowledge' },
        { karyawanId: createdKaryawan[1].id, skor: 88, catatan: 'Good process understanding' }
      ]
    }
  ]

  for (const pelatihan of pelatihanData) {
    const createdPelatihan = await prisma.pelatihan.create({
    data: {
        nama: pelatihan.nama,
        tanggal: pelatihan.tanggal,
        lokasi: pelatihan.lokasi
      }
    })

    for (const peserta of pelatihan.peserta) {
  await prisma.pelatihanDetail.create({
    data: {
          pelatihanId: createdPelatihan.id,
          karyawanId: peserta.karyawanId,
          skor: peserta.skor,
          catatan: peserta.catatan
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
      karyawan: [createdKaryawan[3].id, createdKaryawan[7].id] // Jane Smith & Lisa Wong
    },
    {
      nama: 'Best Team Player 2024',
      tahun: new Date('2024-12-31'),
      karyawan: [createdKaryawan[2].id, createdKaryawan[5].id] // John Doe & Sari Dewi
    },
    {
      nama: 'Innovation Award 2024',
      tahun: new Date('2024-12-31'),
      karyawan: [createdKaryawan[7].id] // Lisa Wong
    },
    {
      nama: 'Leadership Excellence 2024',
      tahun: new Date('2024-12-31'),
      karyawan: [createdKaryawan[0].id, createdKaryawan[3].id] // Sarah Johnson & Jane Smith
    },
    {
      nama: 'Rising Star 2024',
      tahun: new Date('2024-12-31'),
      karyawan: [createdKaryawan[4].id] // Budi Santoso
    }
  ]

  for (const penghargaan of penghargaanData) {
    const createdPenghargaan = await prisma.penghargaan.create({
      data: {
        nama: penghargaan.nama,
        tahun: penghargaan.tahun,
        Karyawan: {
          connect: penghargaan.karyawan.map(id => ({ id }))
        }
      }
    })
  }
  console.log('✅ Penghargaan data created')

  console.log('🎉 Seeding completed successfully!')
  console.log('\n📋 Test Accounts:')
  console.log('HR Manager: hr.manager@company.com / hr123')
  console.log('HR Specialist: hr.specialist@company.com / hr123')
  console.log('John Doe: john.doe@company.com / karyawan123')
  console.log('Jane Smith: jane.smith@company.com / karyawan123')
  console.log('Budi Santoso: budi.santoso@company.com / karyawan123')
  console.log('Sari Dewi: sari.dewi@company.com / karyawan123')
  console.log('Ahmad Rizki: ahmad.rizki@company.com / karyawan123')
  console.log('Lisa Wong: lisa.wong@company.com / karyawan123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
