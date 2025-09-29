import prisma from "../../../prismaClient.js";
import XGBoostModel from "./xgboost.model.js";
import { ACTIVE_MODEL_NAME, ACTIVE_MODEL_TYPE, XGBOOST_CONFIG, FEATURE_CONFIG } from "../config/xgboost-config.js";
import { buildFeatureVectorForKaryawanId } from "../features/karyawan-features.service.js";
import { mapFeaturesToArray } from "../features/feature-mapper.js";

export async function trainXGBoostFromHistory(storagePath) {
	try {
		// Ambil dataset historis untuk training
		const trainingData = await getHistoricalTrainingData();
		
		if (trainingData.length === 0) {
			throw new Error('No historical data available for training');
		}

		// Prepare features and labels
		const features = [];
		const labels = [];
		
		for (const record of trainingData) {
			const featureVector = mapFeaturesToArray(record.features);
			features.push(featureVector);
			labels.push(record.label === 'PROMOTE' ? 1 : 0);
		}

		// Train XGBoost model (simplified implementation)
		const modelData = await trainXGBoostInternal(features, labels);
		
		// Create XGBoost model instance
		const model = new XGBoostModel();
		model.setModel(modelData, FEATURE_CONFIG.features);
		model.saveToPath(storagePath);

		// Calculate metrics
		const metrics = await calculateModelMetrics(features, labels, model);

		// Save to database
		const lastVersion = await prisma.modelVersion.findFirst({
			where: { name: ACTIVE_MODEL_NAME },
			orderBy: { version: 'desc' }
		});
		const version = (lastVersion?.version ?? 0) + 1;

		const created = await prisma.modelVersion.create({
			data: {
				name: ACTIVE_MODEL_NAME,
				version,
				type: ACTIVE_MODEL_TYPE,
				storagePath,
				metrics: metrics
			}
		});

		return created;
	} catch (error) {
		console.error('XGBoost training error:', error);
		throw error;
	}
}

async function getHistoricalTrainingData() {
	// Ambil data historis dari database
	// Untuk demo, kita buat data sintetis berdasarkan pola yang masuk akal
	const syntheticData = [
		// High performers - should be promoted
		{
			features: {
				masaKerjaTahun: 3,
				skorKpiRata2: 85,
				ratingTerakhir: 90,
				jumlahPelatihan12Bulan: 4,
				umur: 28,
				pendidikanLevel: 3,
				genderNumeric: 1
			},
			label: 'PROMOTE'
		},
		{
			features: {
				masaKerjaTahun: 5,
				skorKpiRata2: 88,
				ratingTerakhir: 85,
				jumlahPelatihan12Bulan: 6,
				umur: 32,
				pendidikanLevel: 4,
				genderNumeric: 0
			},
			label: 'PROMOTE'
		},
		// Average performers - should not be promoted
		{
			features: {
				masaKerjaTahun: 2,
				skorKpiRata2: 70,
				ratingTerakhir: 75,
				jumlahPelatihan12Bulan: 2,
				umur: 25,
				pendidikanLevel: 2,
				genderNumeric: 1
			},
			label: 'NO_PROMOTE'
		},
		{
			features: {
				masaKerjaTahun: 4,
				skorKpiRata2: 72,
				ratingTerakhir: 78,
				jumlahPelatihan12Bulan: 3,
				umur: 30,
				pendidikanLevel: 3,
				genderNumeric: 0
			},
			label: 'NO_PROMOTE'
		}
	];

	return syntheticData;
}

async function trainXGBoostInternal(features, labels) {
	// Simplified XGBoost training (dalam implementasi real, gunakan library XGBoost)
	// Untuk demo, kita buat model dengan weights yang dihitung dari data
	
	const numFeatures = features[0].length;
	const weights = new Array(numFeatures).fill(0);
	const bias = 0;
	
	// Calculate feature weights based on correlation with labels
	for (let i = 0; i < numFeatures; i++) {
		let sum = 0;
		let count = 0;
		for (let j = 0; j < features.length; j++) {
			sum += features[j][i] * labels[j];
			count++;
		}
		weights[i] = count > 0 ? sum / count : 0;
	}

	// Calculate feature importance
	const featureImportance = weights.map((weight, index) => ({
		feature: FEATURE_CONFIG.features[index] || `feature_${index}`,
		importance: Math.abs(weight)
	}));

	return {
		weights,
		bias,
		featureImportance,
		config: XGBOOST_CONFIG,
		trainedAt: new Date().toISOString()
	};
}

async function calculateModelMetrics(features, labels, model) {
	let correct = 0;
	let total = features.length;
	
	for (let i = 0; i < features.length; i++) {
		const prediction = model.predict(features[i]);
		const predictedLabel = prediction.label === 'PROMOTE' ? 1 : 0;
		if (predictedLabel === labels[i]) {
			correct++;
		}
	}

	const accuracy = total > 0 ? correct / total : 0;
	
	return {
		accuracy: accuracy,
		totalSamples: total,
		correctPredictions: correct,
		modelType: 'XGBoost'
	};
}

// Alias for consistency (main function is already defined above)
export async function trainXGBoostModel(storagePath) {
	return await trainXGBoostFromHistory(storagePath);
}


