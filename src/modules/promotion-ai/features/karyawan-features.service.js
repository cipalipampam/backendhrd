import prisma from "../../../prismaClient.js";

export async function buildFeatureVectorForKaryawanId(karyawanId) {
	// Contoh ekstraksi fitur ringkas; sesuaikan kebutuhan bisnis
	const karyawan = await prisma.karyawan.findUnique({
		where: { id: karyawanId },
		include: {
			KPI: true,
			Rating: true,
			pelatihanDetail: true
		}
	});
	if (!karyawan) return null;

	const now = new Date();
	const masaKerjaTahun = Math.floor((now - new Date(karyawan.tanggal_masuk)) / (365.25 * 24 * 60 * 60 * 1000));
	const umur = karyawan.tanggal_lahir ? Math.floor((now - new Date(karyawan.tanggal_lahir)) / (365.25 * 24 * 60 * 60 * 1000)) : null;

	const skorKpiRata2 = karyawan.KPI.length ? (karyawan.KPI.reduce((s, k) => s + k.score, 0) / karyawan.KPI.length) : 0;
	const ratingTerakhir = karyawan.Rating.length ? karyawan.Rating.sort((a,b) => b.year - a.year)[0].score : 0;
	const jumlahPelatihan = karyawan.pelatihanDetail.length;

	return {
		masaKerjaTahun,
		umur,
		skorKpiRata2,
		ratingTerakhir,
		jumlahPelatihan
	};
}


