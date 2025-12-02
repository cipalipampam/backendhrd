import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // -------------------- Departemen --------------------
  const departemenNames = [
    "Technology",
    "Sales & Marketing",
    "HR",
    "Operations",
    "Analytics",
    "R&D",
    "Procurement",
    "Finance",
  ];

  const createdDepartemen = [];
  for (const nama of departemenNames) {
    const dept = await prisma.departemen.upsert({
      where: { nama },
      update: {},
      create: {
        id: randomUUID(),
        nama,
        updatedAt: new Date(),
      },
    });
    createdDepartemen.push(dept);
  }
  console.log("✅ Departemen created");

  // -------------------- Jabatan (per Departemen) --------------------
  const jabatanData = [
    // Technology Department
    { nama: "Junior Developer", level: "Junior", departemen: "Technology" },
    { nama: "Software Engineer", level: "Staff", departemen: "Technology" },
    { nama: "Senior Software Engineer", level: "Senior", departemen: "Technology" },
    { nama: "Tech Lead", level: "Lead", departemen: "Technology" },
    { nama: "Engineering Manager", level: "Manager", departemen: "Technology" },
    { nama: "DevOps Engineer", level: "Staff", departemen: "Technology" },
    { nama: "QA Engineer", level: "Staff", departemen: "Technology" },
    { nama: "System Administrator", level: "Staff", departemen: "Technology" },
    { nama: "Full Stack Developer", level: "Senior", departemen: "Technology" },

    // Sales & Marketing Department
    { nama: "Sales Representative", level: "Junior", departemen: "Sales & Marketing" },
    { nama: "Account Executive", level: "Staff", departemen: "Sales & Marketing" },
    { nama: "Senior Account Manager", level: "Senior", departemen: "Sales & Marketing" },
    { nama: "Sales Manager", level: "Manager", departemen: "Sales & Marketing" },
    { nama: "Marketing Specialist", level: "Staff", departemen: "Sales & Marketing" },
    { nama: "Digital Marketing Manager", level: "Manager", departemen: "Sales & Marketing" },
    { nama: "Brand Manager", level: "Senior", departemen: "Sales & Marketing" },

    // HR Department
    { nama: "HR Assistant", level: "Junior", departemen: "HR" },
    { nama: "Recruitment Specialist", level: "Staff", departemen: "HR" },
    { nama: "Training Coordinator", level: "Staff", departemen: "HR" },
    { nama: "HR Business Partner", level: "Senior", departemen: "HR" },
    { nama: "HR Manager", level: "Manager", departemen: "HR" },
    { nama: "Employee Relations Specialist", level: "Staff", departemen: "HR" },

    // Operations Department
    { nama: "Operations Assistant", level: "Junior", departemen: "Operations" },
    { nama: "Process Coordinator", level: "Staff", departemen: "Operations" },
    { nama: "Quality Analyst", level: "Staff", departemen: "Operations" },
    { nama: "Operations Manager", level: "Manager", departemen: "Operations" },
    { nama: "Supply Chain Coordinator", level: "Staff", departemen: "Operations" },

    // Analytics Department
    { nama: "Data Analyst", level: "Staff", departemen: "Analytics" },
    { nama: "Business Intelligence Specialist", level: "Staff", departemen: "Analytics" },
    { nama: "Data Scientist", level: "Senior", departemen: "Analytics" },
    { nama: "Analytics Manager", level: "Manager", departemen: "Analytics" },
    { nama: "Statistician", level: "Staff", departemen: "Analytics" },

    // R&D Department
    { nama: "Research Assistant", level: "Junior", departemen: "R&D" },
    { nama: "Product Developer", level: "Staff", departemen: "R&D" },
    { nama: "Research Scientist", level: "Senior", departemen: "R&D" },
    { nama: "Research Manager", level: "Manager", departemen: "R&D" },
    { nama: "Innovation Specialist", level: "Staff", departemen: "R&D" },
    { nama: "Lab Technician", level: "Staff", departemen: "R&D" },

    // Procurement Department
    { nama: "Procurement Assistant", level: "Junior", departemen: "Procurement" },
    { nama: "Sourcing Specialist", level: "Staff", departemen: "Procurement" },
    { nama: "Vendor Relations Manager", level: "Senior", departemen: "Procurement" },
    { nama: "Procurement Manager", level: "Manager", departemen: "Procurement" },
    { nama: "Contract Specialist", level: "Staff", departemen: "Procurement" },

    // Finance Department
    { nama: "Finance Clerk", level: "Junior", departemen: "Finance" },
    { nama: "Accountant", level: "Staff", departemen: "Finance" },
    { nama: "Financial Analyst", level: "Staff", departemen: "Finance" },
    { nama: "Budget Specialist", level: "Staff", departemen: "Finance" },
    { nama: "Finance Manager", level: "Manager", departemen: "Finance" },
    { nama: "Investment Analyst", level: "Senior", departemen: "Finance" },
  ];

  for (const jab of jabatanData) {
    const dept = createdDepartemen.find((d) => d.nama === jab.departemen);
    if (!dept) continue;

    await prisma.jabatan.upsert({
      where: {
        nama_departemenId: {
          nama: jab.nama,
          departemenId: dept.id,
        },
      },
      update: { level: jab.level },
      create: {
        id: randomUUID(),
        nama: jab.nama,
        level: jab.level,
        departemenId: dept.id,
        updatedAt: new Date(),
      },
    });
  }
  console.log("✅ Jabatan created (per departemen)");

  // -------------------- KPI Indicators (untuk semua departemen) --------------------
  const kpiIndicators = [
    // Technology Department Indicators
    {
      nama: "Project Delivery Rate",
      deskripsi: "Persentase proyek yang diselesaikan tepat waktu",
      bobot: 0.6,
      departemenId: createdDepartemen.find((d) => d.nama === "Technology")?.id,
    },
    {
      nama: "Code Quality Score",
      deskripsi: "Skor kualitas kode berdasarkan review dan testing",
      bobot: 0.4,
      departemenId: createdDepartemen.find((d) => d.nama === "Technology")?.id,
    },

    // Sales & Marketing Department Indicators
    {
      nama: "Sales Revenue Achievement",
      deskripsi: "Persentase pencapaian target revenue",
      bobot: 0.7,
      departemenId: createdDepartemen.find(
        (d) => d.nama === "Sales & Marketing"
      )?.id,
    },
    {
      nama: "Customer Retention",
      deskripsi: "Persentase customer yang tetap aktif",
      bobot: 0.3,
      departemenId: createdDepartemen.find(
        (d) => d.nama === "Sales & Marketing"
      )?.id,
    },

    // HR Department Indicators
    {
      nama: "Employee Retention Rate",
      deskripsi: "Persentase karyawan yang bertahan dalam periode tertentu",
      bobot: 0.5,
      departemenId: createdDepartemen.find((d) => d.nama === "HR")?.id,
    },
    {
      nama: "Training Completion Rate",
      deskripsi: "Persentase penyelesaian program pelatihan",
      bobot: 0.5,
      departemenId: createdDepartemen.find((d) => d.nama === "HR")?.id,
    },

    // Operations Department Indicators
    {
      nama: "Process Efficiency",
      deskripsi: "Tingkat efisiensi proses operasional",
      bobot: 0.6,
      departemenId: createdDepartemen.find((d) => d.nama === "Operations")?.id,
    },
    {
      nama: "Quality Control Score",
      deskripsi: "Skor kontrol kualitas operasional",
      bobot: 0.4,
      departemenId: createdDepartemen.find((d) => d.nama === "Operations")?.id,
    },

    // Analytics Department Indicators
    {
      nama: "Data Analysis Accuracy",
      deskripsi: "Tingkat akurasi analisis data",
      bobot: 0.6,
      departemenId: createdDepartemen.find((d) => d.nama === "Analytics")?.id,
    },
    {
      nama: "Report Timeliness",
      deskripsi: "Ketepatan waktu pelaporan",
      bobot: 0.4,
      departemenId: createdDepartemen.find((d) => d.nama === "Analytics")?.id,
    },

    // Finance Department Indicators
    {
      nama: "Financial Accuracy",
      deskripsi: "Tingkat akurasi laporan keuangan",
      bobot: 0.6,
      departemenId: createdDepartemen.find((d) => d.nama === "Finance")?.id,
    },
    {
      nama: "Budget Compliance",
      deskripsi: "Kepatuhan terhadap budget",
      bobot: 0.4,
      departemenId: createdDepartemen.find((d) => d.nama === "Finance")?.id,
    },
  ];

  const createdIndicators = [];
  for (const indicator of kpiIndicators) {
    const created = await prisma.kpiIndicator.create({
      data: indicator,
    });
    createdIndicators.push(created);
  }
  console.log("✅ KPI Indicators created");

  // Helper function to get indicators by department
  const getIndicatorsByDepartment = (deptName) => {
    const dept = createdDepartemen.find((d) => d.nama === deptName);
    return createdIndicators.filter((ind) => ind.departemenId === dept?.id);
  };

  // -------------------- User & Karyawan (10 users) --------------------
  const users = [
    // 1. HR Manager
    {
      username: "sarah.johnson",
      email: "sarah.johnson@company.com",
      password: "password123",
      role: "HR",
      karyawan: {
        nama: "Sarah Johnson",
        gender: "Wanita",
        alamat: "Jl. Sudirman No. 123, Jakarta Pusat",
        no_telp: "081234567890",
        tanggal_lahir: new Date("1985-05-15"),
        pendidikan: "Magister",
        tanggal_masuk: new Date("2020-01-15"),
        jalur_rekrut: "Wawancara",
        departemen: "HR",
        jabatan: "HR Manager",
      },
    },
    // 2. HR Specialist
    {
      username: "michael.chen",
      email: "michael.chen@company.com",
      password: "password123",
      role: "HR",
      karyawan: {
        nama: "Michael Chen",
        gender: "Pria",
        alamat: "Jl. Thamrin No. 45, Jakarta Pusat",
        no_telp: "081234567891",
        tanggal_lahir: new Date("1990-08-20"),
        pendidikan: "Sarjana",
        tanggal_masuk: new Date("2021-03-10"),
        jalur_rekrut: "Wawancara",
        departemen: "HR",
        jabatan: "Recruitment Specialist",
      },
    },
    // 3. Senior Software Engineer
    {
      username: "john.developer",
      email: "john.developer@company.com",
      password: "password123",
      role: "KARYAWAN",
      karyawan: {
        nama: "John Anderson",
        gender: "Pria",
        alamat: "Jl. Gatot Subroto No. 789, Jakarta Selatan",
        no_telp: "081234567892",
        tanggal_lahir: new Date("1988-12-10"),
        pendidikan: "Sarjana",
        tanggal_masuk: new Date("2019-06-01"),
        jalur_rekrut: "Undangan",
        departemen: "Technology",
        jabatan: "Senior Software Engineer",
      },
    },
    // 4. Senior Account Manager
    {
      username: "jane.smith",
      email: "jane.smith@company.com",
      password: "password123",
      role: "KARYAWAN",
      karyawan: {
        nama: "Jane Smith",
        gender: "Wanita",
        alamat: "Jl. Kuningan No. 321, Jakarta Selatan",
        no_telp: "081234567893",
        tanggal_lahir: new Date("1987-03-25"),
        pendidikan: "Sarjana",
        tanggal_masuk: new Date("2018-09-15"),
        jalur_rekrut: "Wawancara",
        departemen: "Sales & Marketing",
        jabatan: "Senior Account Manager",
      },
    },
    // 5. Software Engineer
    {
      username: "david.wilson",
      email: "david.wilson@company.com",
      password: "password123",
      role: "KARYAWAN",
      karyawan: {
        nama: "David Wilson",
        gender: "Pria",
        alamat: "Jl. Senopati No. 56, Jakarta Selatan",
        no_telp: "081234567894",
        tanggal_lahir: new Date("1992-07-18"),
        pendidikan: "Sarjana",
        tanggal_masuk: new Date("2021-01-20"),
        jalur_rekrut: "Undangan",
        departemen: "Technology",
        jabatan: "Software Engineer",
      },
    },
    // 6. Operations Manager
    {
      username: "lisa.anderson",
      email: "lisa.anderson@company.com",
      password: "password123",
      role: "KARYAWAN",
      karyawan: {
        nama: "Lisa Anderson",
        gender: "Wanita",
        alamat: "Jl. Kemang No. 88, Jakarta Selatan",
        no_telp: "081234567895",
        tanggal_lahir: new Date("1986-04-12"),
        pendidikan: "Magister",
        tanggal_masuk: new Date("2019-08-05"),
        jalur_rekrut: "Wawancara",
        departemen: "Operations",
        jabatan: "Operations Manager",
      },
    },
    // 7. Data Scientist
    {
      username: "robert.martinez",
      email: "robert.martinez@company.com",
      password: "password123",
      role: "KARYAWAN",
      karyawan: {
        nama: "Robert Martinez",
        gender: "Pria",
        alamat: "Jl. Panglima Polim No. 12, Jakarta Selatan",
        no_telp: "081234567896",
        tanggal_lahir: new Date("1989-11-30"),
        pendidikan: "Magister",
        tanggal_masuk: new Date("2020-05-15"),
        jalur_rekrut: "Undangan",
        departemen: "Analytics",
        jabatan: "Data Scientist",
      },
    },
    // 8. Account Executive
    {
      username: "emma.rodriguez",
      email: "emma.rodriguez@company.com",
      password: "password123",
      role: "KARYAWAN",
      karyawan: {
        nama: "Emma Rodriguez",
        gender: "Wanita",
        alamat: "Jl. Tebet No. 234, Jakarta Selatan",
        no_telp: "081234567897",
        tanggal_lahir: new Date("1991-02-28"),
        pendidikan: "Sarjana",
        tanggal_masuk: new Date("2020-11-10"),
        jalur_rekrut: "Wawancara",
        departemen: "Sales & Marketing",
        jabatan: "Account Executive",
      },
    },
    // 9. Financial Analyst
    {
      username: "alex.thompson",
      email: "alex.thompson@company.com",
      password: "password123",
      role: "KARYAWAN",
      karyawan: {
        nama: "Alex Thompson",
        gender: "Pria",
        alamat: "Jl. Menteng No. 67, Jakarta Pusat",
        no_telp: "081234567898",
        tanggal_lahir: new Date("1987-09-05"),
        pendidikan: "Sarjana",
        tanggal_masuk: new Date("2019-04-01"),
        jalur_rekrut: "Undangan",
        departemen: "Finance",
        jabatan: "Financial Analyst",
      },
    },
    // 10. Junior Developer
    {
      username: "sophia.lee",
      email: "sophia.lee@company.com",
      password: "password123",
      role: "KARYAWAN",
      karyawan: {
        nama: "Sophia Lee",
        gender: "Wanita",
        alamat: "Jl. Cipete No. 91, Jakarta Selatan",
        no_telp: "081234567899",
        tanggal_lahir: new Date("1995-06-14"),
        pendidikan: "Sarjana",
        tanggal_masuk: new Date("2023-02-20"),
        jalur_rekrut: "Wawancara",
        departemen: "Technology",
        jabatan: "Junior Developer",
      },
    },
  ];

  const createdUsers = [];
  const createdKaryawan = [];

  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        username: userData.username,
        email: userData.email,
        password: await bcrypt.hash(userData.password, 10),
        role: userData.role,
        updatedAt: new Date(),
      },
    });
    createdUsers.push(user);

    // Get departemen and jabatan IDs
    const dept = createdDepartemen.find(
      (d) => d.nama === userData.karyawan.departemen
    );
    const jabatanRecord = await prisma.jabatan.findFirst({
      where: {
        nama: userData.karyawan.jabatan,
        departemenId: dept?.id,
      },
    });

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
          connect: [{ id: dept?.id }],
        },
        jabatan: jabatanRecord
          ? {
              connect: [{ id: jabatanRecord.id }],
            }
          : undefined,
      },
    });
    createdKaryawan.push(karyawan);
  }

  console.log("✅ Users and Karyawan created");

  // -------------------- Helper untuk create KPI --------------------
  const createKPIWithDetails = async (
    karyawanId,
    year,
    score,
    indicators,
    details
  ) => {
    let kpi = await prisma.kpi.findFirst({
      where: {
        karyawanId,
        year,
      },
    });

    if (kpi) {
      kpi = await prisma.kpi.update({
        where: { id: kpi.id },
        data: { score, updatedAt: new Date() },
      });
      await prisma.kpiDetail.deleteMany({ where: { kpiId: kpi.id } });
    } else {
      kpi = await prisma.kpi.create({
        data: {
          id: randomUUID(),
          karyawanId,
          year,
          score,
          updatedAt: new Date(),
        },
      });
    }

    await prisma.kpiDetail.createMany({
      data: details.map((detail) => ({
        id: randomUUID(),
        kpiId: kpi.id,
        indikatorId: indicators[detail.indikatorIndex].id,
        target: detail.target,
        realisasi: detail.realisasi,
        score:
          (detail.realisasi / detail.target) *
          indicators[detail.indikatorIndex].bobot *
          100,
        periodeYear: detail.periodeYear,
        periodeMonth: detail.periodeMonth,
      })),
    });
  };

  // -------------------- KPI Data (2024 - 2025) --------------------
  
  // 1. Sarah Johnson (HR Manager) - Excellent performer
  const hrIndicators = getIndicatorsByDepartment("HR");
  await createKPIWithDetails(createdKaryawan[0].id, 2024, 92.5, hrIndicators, [
    { indikatorIndex: 0, target: 93, realisasi: 95, periodeYear: 2024, periodeMonth: 1 },
    { indikatorIndex: 1, target: 96, realisasi: 97, periodeYear: 2024, periodeMonth: 1 },
  ]);
  await createKPIWithDetails(createdKaryawan[0].id, 2025, 94.0, hrIndicators, [
    { indikatorIndex: 0, target: 94, realisasi: 96, periodeYear: 2025, periodeMonth: 11 },
    { indikatorIndex: 1, target: 97, realisasi: 98, periodeYear: 2025, periodeMonth: 11 },
  ]);

  // 2. Michael Chen (HR Specialist)
  await createKPIWithDetails(createdKaryawan[1].id, 2024, 85.0, hrIndicators, [
    { indikatorIndex: 0, target: 90, realisasi: 87, periodeYear: 2024, periodeMonth: 6 },
    { indikatorIndex: 1, target: 92, realisasi: 90, periodeYear: 2024, periodeMonth: 6 },
  ]);
  await createKPIWithDetails(createdKaryawan[1].id, 2025, 88.5, hrIndicators, [
    { indikatorIndex: 0, target: 91, realisasi: 90, periodeYear: 2025, periodeMonth: 11 },
    { indikatorIndex: 1, target: 93, realisasi: 93, periodeYear: 2025, periodeMonth: 11 },
  ]);

  // 3. John Anderson (Senior Software Engineer) - Top performer
  const techIndicators = getIndicatorsByDepartment("Technology");
  await createKPIWithDetails(createdKaryawan[2].id, 2024, 91.5, techIndicators, [
    { indikatorIndex: 0, target: 95, realisasi: 96, periodeYear: 2024, periodeMonth: 3 },
    { indikatorIndex: 1, target: 90, realisasi: 93, periodeYear: 2024, periodeMonth: 3 },
  ]);
  await createKPIWithDetails(createdKaryawan[2].id, 2025, 93.0, techIndicators, [
    { indikatorIndex: 0, target: 96, realisasi: 98, periodeYear: 2025, periodeMonth: 11 },
    { indikatorIndex: 1, target: 92, realisasi: 94, periodeYear: 2025, periodeMonth: 11 },
  ]);

  // 4. Jane Smith (Senior Account Manager) - Top sales
  const salesIndicators = getIndicatorsByDepartment("Sales & Marketing");
  await createKPIWithDetails(createdKaryawan[3].id, 2024, 95.0, salesIndicators, [
    { indikatorIndex: 0, target: 110, realisasi: 125, periodeYear: 2024, periodeMonth: 4 },
    { indikatorIndex: 1, target: 87, realisasi: 88, periodeYear: 2024, periodeMonth: 4 },
  ]);
  await createKPIWithDetails(createdKaryawan[3].id, 2025, 97.0, salesIndicators, [
    { indikatorIndex: 0, target: 115, realisasi: 135, periodeYear: 2025, periodeMonth: 11 },
    { indikatorIndex: 1, target: 90, realisasi: 92, periodeYear: 2025, periodeMonth: 11 },
  ]);

  // 5. David Wilson (Software Engineer)
  await createKPIWithDetails(createdKaryawan[4].id, 2024, 86.0, techIndicators, [
    { indikatorIndex: 0, target: 92, realisasi: 90, periodeYear: 2024, periodeMonth: 5 },
    { indikatorIndex: 1, target: 88, realisasi: 86, periodeYear: 2024, periodeMonth: 5 },
  ]);
  await createKPIWithDetails(createdKaryawan[4].id, 2025, 89.5, techIndicators, [
    { indikatorIndex: 0, target: 93, realisasi: 93, periodeYear: 2025, periodeMonth: 11 },
    { indikatorIndex: 1, target: 90, realisasi: 90, periodeYear: 2025, periodeMonth: 11 },
  ]);

  // 6. Lisa Anderson (Operations Manager)
  const opsIndicators = getIndicatorsByDepartment("Operations");
  await createKPIWithDetails(createdKaryawan[5].id, 2024, 88.0, opsIndicators, [
    { indikatorIndex: 0, target: 92, realisasi: 91, periodeYear: 2024, periodeMonth: 2 },
    { indikatorIndex: 1, target: 90, realisasi: 88, periodeYear: 2024, periodeMonth: 2 },
  ]);
  await createKPIWithDetails(createdKaryawan[5].id, 2025, 91.0, opsIndicators, [
    { indikatorIndex: 0, target: 94, realisasi: 95, periodeYear: 2025, periodeMonth: 11 },
    { indikatorIndex: 1, target: 92, realisasi: 91, periodeYear: 2025, periodeMonth: 11 },
  ]);

  // 7. Robert Martinez (Data Scientist)
  const analyticsIndicators = getIndicatorsByDepartment("Analytics");
  await createKPIWithDetails(createdKaryawan[6].id, 2024, 90.0, analyticsIndicators, [
    { indikatorIndex: 0, target: 92, realisasi: 94, periodeYear: 2024, periodeMonth: 7 },
    { indikatorIndex: 1, target: 90, realisasi: 89, periodeYear: 2024, periodeMonth: 7 },
  ]);
  await createKPIWithDetails(createdKaryawan[6].id, 2025, 92.5, analyticsIndicators, [
    { indikatorIndex: 0, target: 94, realisasi: 96, periodeYear: 2025, periodeMonth: 11 },
    { indikatorIndex: 1, target: 92, realisasi: 93, periodeYear: 2025, periodeMonth: 11 },
  ]);

  // 8. Emma Rodriguez (Account Executive)
  await createKPIWithDetails(createdKaryawan[7].id, 2024, 87.0, salesIndicators, [
    { indikatorIndex: 0, target: 100, realisasi: 105, periodeYear: 2024, periodeMonth: 8 },
    { indikatorIndex: 1, target: 85, realisasi: 82, periodeYear: 2024, periodeMonth: 8 },
  ]);
  await createKPIWithDetails(createdKaryawan[7].id, 2025, 90.0, salesIndicators, [
    { indikatorIndex: 0, target: 105, realisasi: 112, periodeYear: 2025, periodeMonth: 11 },
    { indikatorIndex: 1, target: 87, realisasi: 87, periodeYear: 2025, periodeMonth: 11 },
  ]);

  // 9. Alex Thompson (Financial Analyst)
  const financeIndicators = getIndicatorsByDepartment("Finance");
  await createKPIWithDetails(createdKaryawan[8].id, 2024, 89.0, financeIndicators, [
    { indikatorIndex: 0, target: 96, realisasi: 93, periodeYear: 2024, periodeMonth: 9 },
    { indikatorIndex: 1, target: 94, realisasi: 92, periodeYear: 2024, periodeMonth: 9 },
  ]);
  await createKPIWithDetails(createdKaryawan[8].id, 2025, 91.5, financeIndicators, [
    { indikatorIndex: 0, target: 97, realisasi: 96, periodeYear: 2025, periodeMonth: 11 },
    { indikatorIndex: 1, target: 95, realisasi: 94, periodeYear: 2025, periodeMonth: 11 },
  ]);

  // 10. Sophia Lee (Junior Developer)
  await createKPIWithDetails(createdKaryawan[9].id, 2024, 78.0, techIndicators, [
    { indikatorIndex: 0, target: 85, realisasi: 80, periodeYear: 2024, periodeMonth: 10 },
    { indikatorIndex: 1, target: 80, realisasi: 75, periodeYear: 2024, periodeMonth: 10 },
  ]);
  await createKPIWithDetails(createdKaryawan[9].id, 2025, 82.5, techIndicators, [
    { indikatorIndex: 0, target: 88, realisasi: 85, periodeYear: 2025, periodeMonth: 11 },
    { indikatorIndex: 1, target: 83, realisasi: 80, periodeYear: 2025, periodeMonth: 11 },
  ]);

  console.log("✅ KPI data created (2024-2025)");

  // -------------------- Rating Data (2024-2025) --------------------
  const ratingData = [
    // 2024
    { karyawanId: createdKaryawan[0].id, year: 2024, score: 4.6, notes: "Outstanding leadership and HR management" },
    { karyawanId: createdKaryawan[1].id, year: 2024, score: 4.1, notes: "Good recruitment and training skills" },
    { karyawanId: createdKaryawan[2].id, year: 2024, score: 4.5, notes: "Excellent technical expertise" },
    { karyawanId: createdKaryawan[3].id, year: 2024, score: 4.7, notes: "Top sales performer, exceeded targets" },
    { karyawanId: createdKaryawan[4].id, year: 2024, score: 4.2, notes: "Solid developer with good collaboration" },
    { karyawanId: createdKaryawan[5].id, year: 2024, score: 4.3, notes: "Effective operations management" },
    { karyawanId: createdKaryawan[6].id, year: 2024, score: 4.4, notes: "Strong analytical and data science skills" },
    { karyawanId: createdKaryawan[7].id, year: 2024, score: 4.2, notes: "Good sales performance and client relations" },
    { karyawanId: createdKaryawan[8].id, year: 2024, score: 4.3, notes: "Accurate financial analysis and reporting" },
    { karyawanId: createdKaryawan[9].id, year: 2024, score: 3.8, notes: "Good progress for junior developer" },
    
    // 2025
    { karyawanId: createdKaryawan[0].id, year: 2025, score: 4.7, notes: "Exceptional leadership, strategic HR initiatives" },
    { karyawanId: createdKaryawan[1].id, year: 2025, score: 4.3, notes: "Improved recruitment processes significantly" },
    { karyawanId: createdKaryawan[2].id, year: 2025, score: 4.6, notes: "Consistently delivers high-quality code" },
    { karyawanId: createdKaryawan[3].id, year: 2025, score: 4.8, notes: "Outstanding sales achievements, best performer" },
    { karyawanId: createdKaryawan[4].id, year: 2025, score: 4.4, notes: "Notable improvement in technical skills" },
    { karyawanId: createdKaryawan[5].id, year: 2025, score: 4.5, notes: "Excellent operational efficiency improvements" },
    { karyawanId: createdKaryawan[6].id, year: 2025, score: 4.6, notes: "Advanced analytics and predictive modeling" },
    { karyawanId: createdKaryawan[7].id, year: 2025, score: 4.4, notes: "Strong sales growth and customer satisfaction" },
    { karyawanId: createdKaryawan[8].id, year: 2025, score: 4.5, notes: "Excellent financial forecasting accuracy" },
    { karyawanId: createdKaryawan[9].id, year: 2025, score: 4.0, notes: "Good improvement, shows strong potential" },
  ];

  for (const rating of ratingData) {
    await prisma.rating.upsert({
      where: {
        karyawanId_year: {
          karyawanId: rating.karyawanId,
          year: rating.year,
        },
      },
      update: {},
      create: {
        id: randomUUID(),
        ...rating,
        updatedAt: new Date(),
      },
    });
  }
  console.log("✅ Rating data created");

  // -------------------- Pelatihan Data (2024-2025) --------------------
  const pelatihanData = [
    // 2024
    {
      nama: "Leadership Excellence Program 2024",
      tanggal: new Date("2024-01-20"),
      lokasi: "Jakarta Convention Center",
      peserta: [
        { karyawanId: createdKaryawan[0].id, skor: 96, catatan: "Outstanding leadership demonstration" },
        { karyawanId: createdKaryawan[3].id, skor: 94, catatan: "Strong leadership potential" },
        { karyawanId: createdKaryawan[5].id, skor: 92, catatan: "Good management skills" },
      ],
    },
    {
      nama: "Advanced Technical Workshop 2024",
      tanggal: new Date("2024-03-15"),
      lokasi: "Jakarta Tech Hub",
      peserta: [
        { karyawanId: createdKaryawan[2].id, skor: 95, catatan: "Excellent technical knowledge" },
        { karyawanId: createdKaryawan[4].id, skor: 90, catatan: "Good technical progress" },
        { karyawanId: createdKaryawan[9].id, skor: 85, catatan: "Strong learning curve" },
      ],
    },
    {
      nama: "Sales Mastery Training 2024",
      tanggal: new Date("2024-05-10"),
      lokasi: "Jakarta Business Center",
      peserta: [
        { karyawanId: createdKaryawan[3].id, skor: 98, catatan: "Exceptional sales techniques" },
        { karyawanId: createdKaryawan[7].id, skor: 91, catatan: "Great improvement in sales" },
      ],
    },
    {
      nama: "Data Science & Analytics Summit 2024",
      tanggal: new Date("2024-07-22"),
      lokasi: "Jakarta Data Center",
      peserta: [
        { karyawanId: createdKaryawan[6].id, skor: 96, catatan: "Advanced analytics expertise" },
      ],
    },
    {
      nama: "Financial Management Workshop 2024",
      tanggal: new Date("2024-09-18"),
      lokasi: "Jakarta Finance Tower",
      peserta: [
        { karyawanId: createdKaryawan[8].id, skor: 93, catatan: "Strong financial analysis skills" },
      ],
    },
    // 2025
    {
      nama: "Strategic Leadership Summit 2025",
      tanggal: new Date("2025-02-14"),
      lokasi: "Bali International Convention Center",
      peserta: [
        { karyawanId: createdKaryawan[0].id, skor: 98, catatan: "Exemplary leadership vision" },
        { karyawanId: createdKaryawan[2].id, skor: 94, catatan: "Strong technical leadership" },
        { karyawanId: createdKaryawan[5].id, skor: 95, catatan: "Excellent operational leadership" },
      ],
    },
    {
      nama: "Modern Web Development 2025",
      tanggal: new Date("2025-04-20"),
      lokasi: "Surabaya Tech Park",
      peserta: [
        { karyawanId: createdKaryawan[2].id, skor: 97, catatan: "Mastery of modern frameworks" },
        { karyawanId: createdKaryawan[4].id, skor: 92, catatan: "Good understanding of new tech" },
        { karyawanId: createdKaryawan[9].id, skor: 88, catatan: "Significant improvement" },
      ],
    },
    {
      nama: "Advanced Sales Strategies 2025",
      tanggal: new Date("2025-06-15"),
      lokasi: "Bandung Business Hub",
      peserta: [
        { karyawanId: createdKaryawan[3].id, skor: 99, catatan: "Outstanding sales excellence" },
        { karyawanId: createdKaryawan[7].id, skor: 93, catatan: "Strong sales improvement" },
      ],
    },
    {
      nama: "AI & Machine Learning Workshop 2025",
      tanggal: new Date("2025-08-25"),
      lokasi: "Jakarta AI Center",
      peserta: [
        { karyawanId: createdKaryawan[6].id, skor: 97, catatan: "Expert in ML applications" },
        { karyawanId: createdKaryawan[2].id, skor: 90, catatan: "Good AI/ML foundation" },
      ],
    },
    {
      nama: "HR Innovation Conference 2025",
      tanggal: new Date("2025-10-12"),
      lokasi: "Jakarta HR Center",
      peserta: [
        { karyawanId: createdKaryawan[0].id, skor: 97, catatan: "Innovative HR strategies" },
        { karyawanId: createdKaryawan[1].id, skor: 91, catatan: "Good HR practices implementation" },
      ],
    },
  ];

  for (const pelatihan of pelatihanData) {
    const createdPelatihan = await prisma.pelatihan.create({
      data: {
        id: randomUUID(),
        nama: pelatihan.nama,
        tanggal: pelatihan.tanggal,
        lokasi: pelatihan.lokasi,
        updatedAt: new Date(),
      },
    });

    for (const peserta of pelatihan.peserta) {
      const pelatihanDate = new Date(pelatihan.tanggal);
      const periodeYear = pelatihanDate.getFullYear();
      const periodeMonth = pelatihanDate.getMonth() + 1;

      await prisma.pelatihandetail.create({
        data: {
          id: randomUUID(),
          pelatihanId: createdPelatihan.id,
          karyawanId: peserta.karyawanId,
          skor: peserta.skor,
          catatan: peserta.catatan,
          periodeYear: periodeYear,
          periodeMonth: periodeMonth,
          updatedAt: new Date(),
        },
      });
    }
  }
  console.log("✅ Pelatihan data created");

  // -------------------- Penghargaan Data (2024-2025) --------------------
  const penghargaanData = [
    // 2024
    {
      nama: "Employee of the Year 2024",
      tahun: new Date("2024-12-31"),
      karyawan: [createdKaryawan[3].id], // Jane Smith
    },
    {
      nama: "Best Technical Contributor 2024",
      tahun: new Date("2024-12-31"),
      karyawan: [createdKaryawan[2].id], // John Anderson
    },
    {
      nama: "Outstanding Leadership 2024",
      tahun: new Date("2024-12-31"),
      karyawan: [createdKaryawan[0].id], // Sarah Johnson
    },
    {
      nama: "Innovation Award 2024",
      tahun: new Date("2024-12-31"),
      karyawan: [createdKaryawan[6].id], // Robert Martinez
    },
    {
      nama: "Best Team Player 2024",
      tahun: new Date("2024-12-31"),
      karyawan: [createdKaryawan[4].id, createdKaryawan[5].id], // David & Lisa
    },
    // 2025
    {
      nama: "Sales Champion 2025",
      tahun: new Date("2025-11-30"),
      karyawan: [createdKaryawan[3].id], // Jane Smith
    },
    {
      nama: "Technical Excellence Award 2025",
      tahun: new Date("2025-11-30"),
      karyawan: [createdKaryawan[2].id], // John Anderson
    },
    {
      nama: "HR Leadership Excellence 2025",
      tahun: new Date("2025-11-30"),
      karyawan: [createdKaryawan[0].id], // Sarah Johnson
    },
    {
      nama: "Data Science Excellence 2025",
      tahun: new Date("2025-11-30"),
      karyawan: [createdKaryawan[6].id], // Robert Martinez
    },
    {
      nama: "Most Improved Employee 2025",
      tahun: new Date("2025-11-30"),
      karyawan: [createdKaryawan[9].id], // Sophia Lee
    },
  ];

  for (const penghargaan of penghargaanData) {
    await prisma.penghargaan.create({
      data: {
        id: randomUUID(),
        nama: penghargaan.nama,
        tahun: penghargaan.tahun,
        updatedAt: new Date(),
        karyawan: {
          connect: penghargaan.karyawan.map((id) => ({ id })),
        },
      },
    });
  }
  console.log("✅ Penghargaan data created");

  // -------------------- Kehadiran Data (2024 - sekarang) --------------------
  console.log("⏳ Creating attendance data (2024 - present)...");
  
  const startDate = new Date("2024-01-01");
  const endDate = new Date(); // Hari ini
  const kehadiranData = [];
  
  // Mapping karyawan dengan tanggal masuk
  const karyawanJoinDates = {};
  for (let i = 0; i < users.length; i++) {
    karyawanJoinDates[createdKaryawan[i].id] = users[i].karyawan.tanggal_masuk;
  }
  
  // Generate untuk setiap hari dari Jan 2024 sampai sekarang
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const tanggal = new Date(d);
    tanggal.setHours(0, 0, 0, 0);
    
    const dayOfWeek = tanggal.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Skip weekend
    if (isWeekend) continue;
    
    for (const karyawan of createdKaryawan) {
      // Check jika karyawan sudah join
      const tanggalMasuk = new Date(karyawanJoinDates[karyawan.id]);
      
      if (tanggal < tanggalMasuk) continue;
      
      // Random status dengan distribusi realistis
      const rand = Math.random();
      let status, waktuMasuk, waktuKeluar, keterangan;
      
      if (rand < 0.85) {
        // 85% hadir tepat waktu
        status = "HADIR";
        waktuMasuk = new Date(tanggal);
        waktuMasuk.setHours(7, 30 + Math.floor(Math.random() * 30), 0);
        waktuKeluar = new Date(tanggal);
        waktuKeluar.setHours(17, Math.floor(Math.random() * 60), 0);
      } else if (rand < 0.94) {
        // 9% terlambat
        status = "TERLAMBAT";
        waktuMasuk = new Date(tanggal);
        waktuMasuk.setHours(8, 10 + Math.floor(Math.random() * 50), 0);
        waktuKeluar = new Date(tanggal);
        waktuKeluar.setHours(17, Math.floor(Math.random() * 60), 0);
        keterangan = "Terlambat karena kemacetan";
      } else if (rand < 0.98) {
        // 4% izin
        status = "IZIN";
        keterangan = "Keperluan keluarga";
      } else {
        // 2% sakit
        status = "SAKIT";
        keterangan = "Sakit";
      }
      
      kehadiranData.push({
        id: randomUUID(),
        karyawanId: karyawan.id,
        tanggal,
        waktuMasuk,
        waktuKeluar,
        status,
        lokasi: waktuMasuk ? "Kantor Pusat Jakarta" : null,
        latitude: waktuMasuk ? -6.2088 + (Math.random() - 0.5) * 0.01 : null,
        longitude: waktuMasuk ? 106.8456 + (Math.random() - 0.5) * 0.01 : null,
        keterangan,
      });
    }
  }
  
  // Bulk create in chunks to avoid timeout
  const chunkSize = 500;
  for (let i = 0; i < kehadiranData.length; i += chunkSize) {
    const chunk = kehadiranData.slice(i, i + chunkSize);
    await prisma.kehadiran.createMany({
      data: chunk,
      skipDuplicates: true,
    });
    console.log(`  ➜ Created ${Math.min(i + chunkSize, kehadiranData.length)}/${kehadiranData.length} attendance records`);
  }
  
  console.log(`✅ Kehadiran data created (${kehadiranData.length} records from 2024 to present)`);

  // -------------------- Izin Request Data (2024-2025) --------------------
  const izinRequestData = [
    // 2024
    { karyawanId: createdKaryawan[1].id, tanggal: new Date("2024-02-14"), jenis: "IZIN", keterangan: "Acara keluarga", status: "APPROVED", approvedBy: "sarah.johnson", approvedAt: new Date("2024-02-13") },
    { karyawanId: createdKaryawan[4].id, tanggal: new Date("2024-03-20"), jenis: "SAKIT", keterangan: "Flu", status: "APPROVED", approvedBy: "sarah.johnson", approvedAt: new Date("2024-03-20") },
    { karyawanId: createdKaryawan[7].id, tanggal: new Date("2024-05-15"), jenis: "IZIN", keterangan: "Keperluan pribadi", status: "APPROVED", approvedBy: "sarah.johnson", approvedAt: new Date("2024-05-14") },
    { karyawanId: createdKaryawan[9].id, tanggal: new Date("2024-06-10"), jenis: "SAKIT", keterangan: "Demam", status: "APPROVED", approvedBy: "sarah.johnson", approvedAt: new Date("2024-06-10") },
    { karyawanId: createdKaryawan[2].id, tanggal: new Date("2024-08-05"), jenis: "IZIN", keterangan: "Urusan penting", status: "APPROVED", approvedBy: "sarah.johnson", approvedAt: new Date("2024-08-04") },
    { karyawanId: createdKaryawan[5].id, tanggal: new Date("2024-09-12"), jenis: "SAKIT", keterangan: "Sakit kepala", status: "APPROVED", approvedBy: "sarah.johnson", approvedAt: new Date("2024-09-12") },
    { karyawanId: createdKaryawan[8].id, tanggal: new Date("2024-10-22"), jenis: "IZIN", keterangan: "Perjalanan keluarga", status: "APPROVED", approvedBy: "sarah.johnson", approvedAt: new Date("2024-10-21") },
    
    // 2025
    { karyawanId: createdKaryawan[3].id, tanggal: new Date("2025-01-18"), jenis: "IZIN", keterangan: "Acara penting", status: "APPROVED", approvedBy: "sarah.johnson", approvedAt: new Date("2025-01-17") },
    { karyawanId: createdKaryawan[6].id, tanggal: new Date("2025-03-10"), jenis: "SAKIT", keterangan: "Batuk pilek", status: "APPROVED", approvedBy: "sarah.johnson", approvedAt: new Date("2025-03-10") },
    { karyawanId: createdKaryawan[4].id, tanggal: new Date("2025-04-25"), jenis: "IZIN", keterangan: "Keperluan keluarga", status: "APPROVED", approvedBy: "sarah.johnson", approvedAt: new Date("2025-04-24") },
    { karyawanId: createdKaryawan[9].id, tanggal: new Date("2025-06-15"), jenis: "SAKIT", keterangan: "Flu", status: "APPROVED", approvedBy: "sarah.johnson", approvedAt: new Date("2025-06-15") },
    { karyawanId: createdKaryawan[7].id, tanggal: new Date("2025-08-20"), jenis: "IZIN", keterangan: "Acara keluarga", status: "APPROVED", approvedBy: "sarah.johnson", approvedAt: new Date("2025-08-19") },
    { karyawanId: createdKaryawan[1].id, tanggal: new Date("2025-09-30"), jenis: "IZIN", keterangan: "Urusan pribadi", status: "APPROVED", approvedBy: "sarah.johnson", approvedAt: new Date("2025-09-29") },
    { karyawanId: createdKaryawan[8].id, tanggal: new Date("2025-10-15"), jenis: "SAKIT", keterangan: "Sakit perut", status: "APPROVED", approvedBy: "sarah.johnson", approvedAt: new Date("2025-10-15") },
    { karyawanId: createdKaryawan[5].id, tanggal: new Date("2025-11-05"), jenis: "IZIN", keterangan: "Keperluan mendesak", status: "APPROVED", approvedBy: "sarah.johnson", approvedAt: new Date("2025-11-04") },
    
    // Pending requests
    { karyawanId: createdKaryawan[2].id, tanggal: new Date("2025-12-10"), jenis: "IZIN", keterangan: "Acara keluarga mendatang", status: "PENDING", approvedBy: null, approvedAt: null },
    { karyawanId: createdKaryawan[6].id, tanggal: new Date("2025-12-15"), jenis: "IZIN", keterangan: "Rencana liburan", status: "PENDING", approvedBy: null, approvedAt: null },
  ];

  for (const izin of izinRequestData) {
    await prisma.izinRequest.create({
      data: {
        id: randomUUID(),
        ...izin,
        updatedAt: new Date(),
      },
    });
  }
  console.log("✅ Izin Request data created");

  console.log("\n🎉 Seeding completed successfully!");
  console.log("\n📋 Test Accounts (10 Users):");
  console.log("=" .repeat(80));
  console.log("\n👔 HR Accounts:");
  console.log("1. sarah.johnson@company.com / password123 (Sarah Johnson - HR Manager)");
  console.log("2. michael.chen@company.com / password123 (Michael Chen - Recruitment Specialist)");
  console.log("\n👨‍💼 Karyawan Accounts:");
  console.log("3. john.developer@company.com / password123 (John Anderson - Senior Software Engineer)");
  console.log("4. jane.smith@company.com / password123 (Jane Smith - Senior Account Manager)");
  console.log("5. david.wilson@company.com / password123 (David Wilson - Software Engineer)");
  console.log("6. lisa.anderson@company.com / password123 (Lisa Anderson - Operations Manager)");
  console.log("7. robert.martinez@company.com / password123 (Robert Martinez - Data Scientist)");
  console.log("8. emma.rodriguez@company.com / password123 (Emma Rodriguez - Account Executive)");
  console.log("9. alex.thompson@company.com / password123 (Alex Thompson - Financial Analyst)");
  console.log("10. sophia.lee@company.com / password123 (Sophia Lee - Junior Developer)");
  console.log("\n" + "=" .repeat(80));
  console.log("\n📊 Data Summary:");
  console.log(`  • 8 Departemen`);
  console.log(`  • ${jabatanData.length} Jabatan`);
  console.log(`  • 10 Users (2 HR + 8 Karyawan)`);
  console.log(`  • 20 KPI Records (2024-2025)`);
  console.log(`  • 20 Rating Records (2024-2025)`);
  console.log(`  • 10 Pelatihan with multiple participants`);
  console.log(`  • 10 Penghargaan (2024-2025)`);
  console.log(`  • ~${Math.floor(kehadiranData.length / 10) * 10}+ Kehadiran records (Jan 2024 - Present)`);
  console.log(`  • 17 Izin Requests (15 approved, 2 pending)`);
  console.log("=" .repeat(80));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
