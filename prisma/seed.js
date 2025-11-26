import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // -------------------- Departemen (hanya 3) --------------------
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

  // -------------------- Jabatan --------------------
  const jabatanNames = ["Manager", "Staff", "Supervisor", "Developer"];

  await Promise.all(
    jabatanNames.map((nama) =>
      prisma.jabatan.upsert({
        where: { nama },
        update: {},
        create: {
          id: randomUUID(),
          nama,
          updatedAt: new Date(),
        },
      })
    )
  );
  console.log("✅ Jabatan created");

  // -------------------- KPI Indicators (2 per departemen) --------------------
  const kpiIndicators = [
    // Technology Department Indicators (2)
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

    // Sales & Marketing Department Indicators (2)
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

    // HR Department Indicators (2)
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

  // -------------------- User & Karyawan --------------------
  const users = [
    // HR Users
    {
      username: "hr_manager",
      email: "hr.manager@company.com",
      password: "hr123",
      role: "HR",
      karyawan: {
        nama: "Sarah Johnson",
        gender: "Wanita",
        alamat: "Jl. Sudirman No. 123, Jakarta",
        no_telp: "081234567890",
        tanggal_lahir: new Date("1985-05-15"),
        pendidikan: "Magister",
        tanggal_masuk: new Date("2020-01-15"),
        jalur_rekrut: "Wawancara",
        departemen: "HR",
        jabatan: "Manager",
      },
    },
    // Karyawan Users
    {
      username: "john_doe",
      email: "john.doe@company.com",
      password: "karyawan123",
      role: "KARYAWAN",
      karyawan: {
        nama: "John Doe",
        gender: "Pria",
        alamat: "Jl. Gatot Subroto No. 789, Jakarta",
        no_telp: "081234567892",
        tanggal_lahir: new Date("1992-12-10"),
        pendidikan: "Sarjana",
        tanggal_masuk: new Date("2022-06-01"),
        jalur_rekrut: "Undangan",
        departemen: "Technology",
        jabatan: "Developer",
      },
    },
    {
      username: "jane_smith",
      email: "jane.smith@company.com",
      password: "karyawan123",
      role: "KARYAWAN",
      karyawan: {
        nama: "Jane Smith",
        gender: "Wanita",
        alamat: "Jl. Kuningan No. 321, Jakarta",
        no_telp: "081234567893",
        tanggal_lahir: new Date("1988-03-25"),
        pendidikan: "Dibawah Keduanya",
        tanggal_masuk: new Date("2021-09-15"),
        jalur_rekrut: "lainnya",
        departemen: "Sales & Marketing",
        jabatan: "Manager",
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
          connect: [{ nama: userData.karyawan.departemen }],
        },
        jabatan: {
          connect: [{ nama: userData.karyawan.jabatan }],
        },
      },
    });
    createdKaryawan.push(karyawan);
  }

  console.log("✅ Users and Karyawan created");

  // -------------------- KPI Data with Details --------------------

  // Sarah Johnson (HR Manager) - 2022
  const sarahHRIndicators = getIndicatorsByDepartment("HR");
  const sarahKPI2022 = await prisma.kpi.upsert({
    where: {
      karyawanId_year: {
        karyawanId: createdKaryawan[0].id,
        year: 2022,
      },
    },
    update: {},
    create: {
      id: randomUUID(),
      karyawanId: createdKaryawan[0].id,
      year: 2022,
      score: 85.5,
      updatedAt: new Date(),
    },
  });

  await prisma.kpiDetail.createMany({
    data: [
      {
        id: randomUUID(),
        kpiId: sarahKPI2022.id,
        indikatorId: sarahHRIndicators[0].id, // Employee Retention Rate
        target: 90,
        realisasi: 88,
        score: (88 / 90) * 0.5 * 100,
      },
      {
        id: randomUUID(),
        kpiId: sarahKPI2022.id,
        indikatorId: sarahHRIndicators[1].id, // Training Completion Rate
        target: 95,
        realisasi: 92,
        score: (92 / 95) * 0.5 * 100,
      },
    ],
  });

  // Sarah Johnson - 2023
  const sarahKPI2023 = await prisma.kpi.upsert({
    where: {
      karyawanId_year: {
        karyawanId: createdKaryawan[0].id,
        year: 2023,
      },
    },
    update: {},
    create: {
      id: randomUUID(),
      karyawanId: createdKaryawan[0].id,
      year: 2023,
      score: 88.0,
      updatedAt: new Date(),
    },
  });

  await prisma.kpiDetail.createMany({
    data: [
      {
        id: randomUUID(),
        kpiId: sarahKPI2023.id,
        indikatorId: sarahHRIndicators[0].id,
        target: 92,
        realisasi: 91,
        score: (91 / 92) * 0.5 * 100,
      },
      {
        id: randomUUID(),
        kpiId: sarahKPI2023.id,
        indikatorId: sarahHRIndicators[1].id,
        target: 95,
        realisasi: 94,
        score: (94 / 95) * 0.5 * 100,
      },
    ],
  });

  // Sarah Johnson - 2024
  const sarahKPI2024 = await prisma.kpi.upsert({
    where: {
      karyawanId_year: {
        karyawanId: createdKaryawan[0].id,
        year: 2024,
      },
    },
    update: {},
    create: {
      id: randomUUID(),
      karyawanId: createdKaryawan[0].id,
      year: 2024,
      score: 92.5,
      updatedAt: new Date(),
    },
  });

  await prisma.kpiDetail.createMany({
    data: [
      {
        id: randomUUID(),
        kpiId: sarahKPI2024.id,
        indikatorId: sarahHRIndicators[0].id,
        target: 93,
        realisasi: 95,
        score: (95 / 93) * 0.5 * 100,
      },
      {
        id: randomUUID(),
        kpiId: sarahKPI2024.id,
        indikatorId: sarahHRIndicators[1].id,
        target: 96,
        realisasi: 97,
        score: (97 / 96) * 0.5 * 100,
      },
    ],
  });

  // John Doe (Technology Developer) - 2022, 2023, 2024
  const johnTechIndicators = getIndicatorsByDepartment("Technology");

  const johnKPI2022 = await prisma.kpi.upsert({
    where: {
      karyawanId_year: {
        karyawanId: createdKaryawan[1].id,
        year: 2022,
      },
    },
    update: {},
    create: {
      id: randomUUID(),
      karyawanId: createdKaryawan[1].id,
      year: 2022,
      score: 78.0,
      updatedAt: new Date(),
    },
  });

  await prisma.kpiDetail.createMany({
    data: [
      {
        id: randomUUID(),
        kpiId: johnKPI2022.id,
        indikatorId: johnTechIndicators[0].id, // Project Delivery Rate
        target: 90,
        realisasi: 82,
        score: (82 / 90) * 0.6 * 100,
      },
      {
        id: randomUUID(),
        kpiId: johnKPI2022.id,
        indikatorId: johnTechIndicators[1].id, // Code Quality Score
        target: 85,
        realisasi: 78,
        score: (78 / 85) * 0.4 * 100,
      },
    ],
  });

  const johnKPI2023 = await prisma.kpi.upsert({
    where: {
      karyawanId_year: {
        karyawanId: createdKaryawan[1].id,
        year: 2023,
      },
    },
    update: {},
    create: {
      id: randomUUID(),
      karyawanId: createdKaryawan[1].id,
      year: 2023,
      score: 85.0,
      updatedAt: new Date(),
    },
  });

  await prisma.kpiDetail.createMany({
    data: [
      {
        id: randomUUID(),
        kpiId: johnKPI2023.id,
        indikatorId: johnTechIndicators[0].id,
        target: 92,
        realisasi: 90,
        score: (90 / 92) * 0.6 * 100,
      },
      {
        id: randomUUID(),
        kpiId: johnKPI2023.id,
        indikatorId: johnTechIndicators[1].id,
        target: 88,
        realisasi: 86,
        score: (86 / 88) * 0.4 * 100,
      },
    ],
  });

  const johnKPI2024 = await prisma.kpi.upsert({
    where: {
      karyawanId_year: {
        karyawanId: createdKaryawan[1].id,
        year: 2024,
      },
    },
    update: {},
    create: {
      id: randomUUID(),
      karyawanId: createdKaryawan[1].id,
      year: 2024,
      score: 88.5,
      updatedAt: new Date(),
    },
  });

  await prisma.kpiDetail.createMany({
    data: [
      {
        id: randomUUID(),
        kpiId: johnKPI2024.id,
        indikatorId: johnTechIndicators[0].id,
        target: 93,
        realisasi: 92,
        score: (92 / 93) * 0.6 * 100,
      },
      {
        id: randomUUID(),
        kpiId: johnKPI2024.id,
        indikatorId: johnTechIndicators[1].id,
        target: 90,
        realisasi: 91,
        score: (91 / 90) * 0.4 * 100,
      },
    ],
  });

  // Jane Smith (Sales & Marketing Manager) - 2021-2024
  const janeSalesIndicators = getIndicatorsByDepartment("Sales & Marketing");

  const janeKPI2021 = await prisma.kpi.upsert({
    where: {
      karyawanId_year: {
        karyawanId: createdKaryawan[2].id,
        year: 2021,
      },
    },
    update: {},
    create: {
      id: randomUUID(),
      karyawanId: createdKaryawan[2].id,
      year: 2021,
      score: 90.0,
      updatedAt: new Date(),
    },
  });

  await prisma.kpiDetail.createMany({
    data: [
      {
        id: randomUUID(),
        kpiId: janeKPI2021.id,
        indikatorId: janeSalesIndicators[0].id, // Sales Revenue Achievement
        target: 100,
        realisasi: 105,
        score: (105 / 100) * 0.7 * 100,
      },
      {
        id: randomUUID(),
        kpiId: janeKPI2021.id,
        indikatorId: janeSalesIndicators[1].id, // Customer Retention
        target: 85,
        realisasi: 82,
        score: (82 / 85) * 0.3 * 100,
      },
    ],
  });

  const janeKPI2022 = await prisma.kpi.upsert({
    where: {
      karyawanId_year: {
        karyawanId: createdKaryawan[2].id,
        year: 2022,
      },
    },
    update: {},
    create: {
      id: randomUUID(),
      karyawanId: createdKaryawan[2].id,
      year: 2022,
      score: 93.5,
      updatedAt: new Date(),
    },
  });

  await prisma.kpiDetail.createMany({
    data: [
      {
        id: randomUUID(),
        kpiId: janeKPI2022.id,
        indikatorId: janeSalesIndicators[0].id,
        target: 110,
        realisasi: 118,
        score: (118 / 110) * 0.7 * 100,
      },
      {
        id: randomUUID(),
        kpiId: janeKPI2022.id,
        indikatorId: janeSalesIndicators[1].id,
        target: 87,
        realisasi: 88,
        score: (88 / 87) * 0.3 * 100,
      },
    ],
  });

  const janeKPI2023 = await prisma.kpi.upsert({
    where: {
      karyawanId_year: {
        karyawanId: createdKaryawan[2].id,
        year: 2023,
      },
    },
    update: {},
    create: {
      id: randomUUID(),
      karyawanId: createdKaryawan[2].id,
      year: 2023,
      score: 95.0,
      updatedAt: new Date(),
    },
  });

  await prisma.kpiDetail.createMany({
    data: [
      {
        id: randomUUID(),
        kpiId: janeKPI2023.id,
        indikatorId: janeSalesIndicators[0].id,
        target: 120,
        realisasi: 128,
        score: (128 / 120) * 0.7 * 100,
      },
      {
        id: randomUUID(),
        kpiId: janeKPI2023.id,
        indikatorId: janeSalesIndicators[1].id,
        target: 90,
        realisasi: 91,
        score: (91 / 90) * 0.3 * 100,
      },
    ],
  });

  const janeKPI2024 = await prisma.kpi.upsert({
    where: {
      karyawanId_year: {
        karyawanId: createdKaryawan[2].id,
        year: 2024,
      },
    },
    update: {},
    create: {
      id: randomUUID(),
      karyawanId: createdKaryawan[2].id,
      year: 2024,
      score: 96.5,
      updatedAt: new Date(),
    },
  });

  await prisma.kpiDetail.createMany({
    data: [
      {
        id: randomUUID(),
        kpiId: janeKPI2024.id,
        indikatorId: janeSalesIndicators[0].id,
        target: 125,
        realisasi: 135,
        score: (135 / 125) * 0.7 * 100,
      },
      {
        id: randomUUID(),
        kpiId: janeKPI2024.id,
        indikatorId: janeSalesIndicators[1].id,
        target: 92,
        realisasi: 94,
        score: (94 / 92) * 0.3 * 100,
      },
    ],
  });

  console.log("✅ KPI data with details created");

  // -------------------- Rating Data --------------------
  const ratingData = [
    // Sarah Johnson
    {
      karyawanId: createdKaryawan[0].id,
      year: 2022,
      score: 4.2,
      notes: "Good leadership skills",
    },
    {
      karyawanId: createdKaryawan[0].id,
      year: 2023,
      score: 4.4,
      notes: "Improved team management",
    },
    {
      karyawanId: createdKaryawan[0].id,
      year: 2024,
      score: 4.6,
      notes: "Excellent HR management",
    },

    // John Doe
    {
      karyawanId: createdKaryawan[1].id,
      year: 2022,
      score: 3.8,
      notes: "Good technical skills",
    },
    {
      karyawanId: createdKaryawan[1].id,
      year: 2023,
      score: 4.1,
      notes: "Improved problem solving",
    },
    {
      karyawanId: createdKaryawan[1].id,
      year: 2024,
      score: 4.3,
      notes: "Strong developer",
    },

    // Jane Smith
    {
      karyawanId: createdKaryawan[2].id,
      year: 2021,
      score: 4.5,
      notes: "Excellent sales results",
    },
    {
      karyawanId: createdKaryawan[2].id,
      year: 2022,
      score: 4.6,
      notes: "Outstanding sales performance",
    },
    {
      karyawanId: createdKaryawan[2].id,
      year: 2023,
      score: 4.7,
      notes: "Top sales manager",
    },
    {
      karyawanId: createdKaryawan[2].id,
      year: 2024,
      score: 4.8,
      notes: "Exceptional leadership",
    },
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

  // -------------------- Pelatihan Data --------------------
  const pelatihanData = [
    {
      nama: "Leadership Development Program",
      tanggal: new Date("2024-01-15"),
      lokasi: "Jakarta Convention Center",
      peserta: [
        {
          karyawanId: createdKaryawan[0].id,
          skor: 95,
          catatan: "Excellent leadership potential",
        },
        {
          karyawanId: createdKaryawan[2].id,
          skor: 92,
          catatan: "Strong leadership skills",
        },
      ],
    },
    {
      nama: "Software Development Best Practices",
      tanggal: new Date("2024-04-05"),
      lokasi: "Jakarta Tech Hub",
      peserta: [
        {
          karyawanId: createdKaryawan[1].id,
          skor: 93,
          catatan: "Excellent technical skills",
        },
      ],
    },
    {
      nama: "Sales Strategy Workshop",
      tanggal: new Date("2024-05-12"),
      lokasi: "Jakarta Business Center",
      peserta: [
        {
          karyawanId: createdKaryawan[2].id,
          skor: 96,
          catatan: "Outstanding sales knowledge",
        },
        {
          karyawanId: createdKaryawan[0].id,
          skor: 86,
          catatan: "Good understanding of sales",
        },
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
      await prisma.pelatihandetail.create({
        data: {
          id: randomUUID(),
          pelatihanId: createdPelatihan.id,
          karyawanId: peserta.karyawanId,
          skor: peserta.skor,
          catatan: peserta.catatan,
          updatedAt: new Date(),
        },
      });
    }
  }
  console.log("✅ Pelatihan data created");

  // -------------------- Penghargaan Data --------------------
  const penghargaanData = [
    {
      nama: "Employee of the Year 2024",
      tahun: new Date("2024-12-31"),
      karyawan: [createdKaryawan[2].id], // Jane Smith
    },
    {
      nama: "Best Team Player 2024",
      tahun: new Date("2024-12-31"),
      karyawan: [createdKaryawan[1].id], // John Doe
    },
    {
      nama: "Leadership Excellence 2024",
      tahun: new Date("2024-12-31"),
      karyawan: [createdKaryawan[0].id, createdKaryawan[2].id], // Sarah Johnson & Jane Smith
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

  // -------------------- Kehadiran Data (30 hari terakhir) --------------------
  const today = new Date();
  const kehadiranData = [];

  // Generate kehadiran untuk 30 hari terakhir untuk setiap karyawan
  for (let day = 29; day >= 0; day--) {
    const tanggal = new Date(today);
    tanggal.setDate(tanggal.getDate() - day);
    tanggal.setHours(0, 0, 0, 0);

    const dayOfWeek = tanggal.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Skip weekend
    if (isWeekend) continue;

    for (const karyawan of createdKaryawan) {
      // Random status dengan distribusi realistis
      const rand = Math.random();
      let status, waktuMasuk, waktuKeluar, keterangan;

      if (rand < 0.75) {
        // 75% hadir tepat waktu
        status = "HADIR";
        waktuMasuk = new Date(tanggal);
        waktuMasuk.setHours(7, 30 + Math.floor(Math.random() * 30), 0); // 7:30 - 8:00
        waktuKeluar = new Date(tanggal);
        waktuKeluar.setHours(17, Math.floor(Math.random() * 60), 0); // 17:00 - 18:00
      } else if (rand < 0.90) {
        // 15% terlambat
        status = "TERLAMBAT";
        waktuMasuk = new Date(tanggal);
        waktuMasuk.setHours(8, 10 + Math.floor(Math.random() * 50), 0); // 8:10 - 9:00
        waktuKeluar = new Date(tanggal);
        waktuKeluar.setHours(17, Math.floor(Math.random() * 60), 0);
        keterangan = "Terlambat karena kemacetan";
      } else if (rand < 0.95) {
        // 5% izin
        status = "IZIN";
        keterangan = "Keperluan keluarga";
      } else if (rand < 0.98) {
        // 3% sakit
        status = "SAKIT";
        keterangan = "Sakit flu";
      } else {
        // 2% alpa
        status = "ALPA";
      }

      kehadiranData.push({
        karyawanId: karyawan.id,
        tanggal,
        waktuMasuk,
        waktuKeluar,
        status,
        lokasi: waktuMasuk ? "Kantor Pusat Jakarta" : null,
        keterangan,
      });
    }
  }

  // Bulk create kehadiran data
  await prisma.kehadiran.createMany({
    data: kehadiranData,
    skipDuplicates: true,
  });
  console.log(`✅ Kehadiran data created (${kehadiranData.length} records)`);

  console.log("🎉 Seeding completed successfully!");
  console.log("\n📋 Test Accounts:");
  console.log("HR Manager: hr.manager@company.com / hr123");
  console.log("John Doe (Tech): john.doe@company.com / karyawan123");
  console.log("Jane Smith (Sales): jane.smith@company.com / karyawan123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
