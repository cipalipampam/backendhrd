export const ACTIVE_MODEL_NAME = 'XGBoostPromotionModel';
export const ACTIVE_MODEL_TYPE = 'XGBoost';

export const XGBOOST_CONFIG = {
	// XGBoost hyperparameters
	objective: 'binary:logistic',
	maxDepth: 6,
	learningRate: 0.1,
	nEstimators: 100,
	subsample: 0.8,
	colsampleBytree: 0.8,
	randomState: 42,
	earlyStoppingRounds: 10
};

export const FEATURE_CONFIG = {
	// mapping nama fitur -> sumber data / transformasi di service
	// contoh: masaKerjaTahun, skorKpiRata2, ratingTerakhir, jumlahPelatihan12Bulan, dsb.
	features: [
		'masaKerjaTahun',
		'skorKpiRata2', 
		'ratingTerakhir',
		'jumlahPelatihan12Bulan',
		'umur',
		'pendidikanLevel',
		'genderNumeric'
	]
};


