export function mapFeaturesToArray(featureObject) {
	if (!featureObject) return null;
	// Urutan fitur harus konsisten dengan yang dipakai saat training
	return [
		featureObject.masaKerjaTahun ?? 0,
		featureObject.umur ?? 0,
		featureObject.skorKpiRata2 ?? 0,
		featureObject.ratingTerakhir ?? 0,
		featureObject.jumlahPelatihan ?? 0
	];
}


