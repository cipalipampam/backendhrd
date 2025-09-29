import prisma from "../../../prismaClient.js";
import XGBoostModel from "../model/xgboost.model.js";
import { buildFeatureVectorForKaryawanId } from "../features/karyawan-features.service.js";
import { mapFeaturesToArray } from "../features/feature-mapper.js";
import { ACTIVE_MODEL_NAME } from "../config/xgboost-config.js";

export async function loadActiveModel() {
	const active = await prisma.modelVersion.findFirst({
		where: { name: ACTIVE_MODEL_NAME },
		orderBy: { version: 'desc' }
	});
	if (!active) return null;
	const model = new XGBoostModel();
	model.loadFromPath(active.storagePath);
	return { model, meta: active };
}

export async function recommendForKaryawan(karyawanId) {
	try {
		const { model, meta } = await loadActiveModel() ?? {};
		if (!model || !meta) return null;

		const featuresObj = await buildFeatureVectorForKaryawanId(karyawanId);
		if (!featuresObj) return null;
		const featuresArr = mapFeaturesToArray(featuresObj);
		const result = model.predict(featuresArr); // { score, label, confidence, probability }

		// Get feature importance for explanation
		const featureImportance = model.getFeatureImportance();

		// Save feature snapshot
		await prisma.featureSnapshot.create({
			data: {
				karyawanId,
				features: featuresObj,
				modelVersionId: meta.id
			}
		});

		// Generate explanation
		const explanation = generateExplanation(result, featuresObj, featureImportance);

		// Save recommendation with enhanced data
		const rec = await prisma.promotionRecommendation.create({
			data: {
				karyawanId,
				modelVersionId: meta.id,
				score: result.score,
				recommend: result.label === 'PROMOTE',
				confidence: result.confidence,
				probability: result.probability,
				reasons: {
					top: explanation.keyFactors.map(f => f.feature),
					explanation: explanation.summary,
					recommendation: explanation.recommendation
				}
			}
		});

		return {
			...rec,
			explanation,
			featureImportance
		};
	} catch (error) {
		console.error('XGBoost recommendation error:', error);
		throw error;
	}
}

function generateExplanation(prediction, features, featureImportance) {
	const explanations = [];
	
	// Sort features by importance
	const sortedFeatures = featureImportance
		.map((imp, index) => ({ 
			...imp, 
			value: Object.values(features)[index] || 0 
		}))
		.sort((a, b) => b.importance - a.importance);

	// Generate explanation based on top contributing features
	const topFeatures = sortedFeatures.slice(0, 3);
	
	for (const feature of topFeatures) {
		if (feature.importance > 0.1) {
			explanations.push({
				feature: feature.feature,
				value: feature.value,
				importance: feature.importance,
				impact: feature.value * feature.importance > 0 ? 'positive' : 'negative'
			});
		}
	}

	return {
		summary: prediction.label === 'PROMOTE' 
			? 'Karyawan memiliki potensi tinggi untuk promosi'
			: 'Karyawan perlu peningkatan kinerja untuk promosi',
		confidence: prediction.confidence,
		keyFactors: explanations,
		recommendation: getRecommendationText(prediction, explanations)
	};
}

function getRecommendationText(prediction, explanations) {
	if (prediction.label === 'PROMOTE') {
		return 'Rekomendasi: Pertimbangkan untuk promosi. Karyawan menunjukkan performa yang baik.';
	} else {
		const areas = explanations
			.filter(exp => exp.impact === 'negative')
			.map(exp => exp.feature)
			.join(', ');
		return `Rekomendasi: Fokus pada peningkatan ${areas} sebelum pertimbangan promosi.`;
	}
}

// Batch recommendation for multiple employees
export async function recommendForMultipleKaryawan(karyawanIds) {
	const results = [];
	
	for (const karyawanId of karyawanIds) {
		try {
			const recommendation = await recommendForKaryawan(karyawanId);
			results.push(recommendation);
		} catch (error) {
			console.error(`Error recommending for karyawan ${karyawanId}:`, error);
			results.push({
				karyawanId,
				error: error.message,
				recommendedAt: new Date().toISOString()
			});
		}
	}
	
	return results;
}

// Get model performance metrics
export async function getModelPerformance() {
	const active = await prisma.modelVersion.findFirst({
		where: { name: ACTIVE_MODEL_NAME },
		orderBy: { version: 'desc' }
	});
	
	if (!active) return null;
	
	return {
		version: active.version,
		type: active.type,
		metrics: active.metrics,
		createdAt: active.createdAt,
		storagePath: active.storagePath
	};
}


