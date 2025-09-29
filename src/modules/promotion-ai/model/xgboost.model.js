import fs from 'fs';
import { Matrix } from 'ml-matrix';

export class XGBoostModel {
	constructor(modelData = null) {
		this.model = modelData;
		this.featureNames = [];
		this.isLoaded = false;
	}

	loadFromPath(path) {
		const raw = fs.readFileSync(path, 'utf-8');
		const modelData = JSON.parse(raw);
		this.model = modelData.model;
		this.featureNames = modelData.featureNames || [];
		this.isLoaded = true;
	}

	saveToPath(path) {
		const modelData = {
			model: this.model,
			featureNames: this.featureNames,
			metadata: {
				type: 'XGBoost',
				createdAt: new Date().toISOString(),
				version: '1.0.0'
			}
		};
		fs.writeFileSync(path, JSON.stringify(modelData, null, 2));
	}

	predict(featureArray) {
		if (!this.isLoaded || !this.model) {
			return { score: 0, label: 'NO_PROMOTE', confidence: 0 };
		}

		try {
			// Simulasi prediksi XGBoost (dalam implementasi real, gunakan library XGBoost)
			// Untuk demo, kita buat scoring berdasarkan feature weights
			const weights = this.model.weights || this.getDefaultWeights();
			const bias = this.model.bias || 0;
			
			// Hitung weighted sum
			let score = bias;
			for (let i = 0; i < featureArray.length && i < weights.length; i++) {
				score += featureArray[i] * weights[i];
			}

			// Sigmoid activation untuk binary classification
			const probability = 1 / (1 + Math.exp(-score));
			const threshold = 0.5;
			
			const label = probability >= threshold ? 'PROMOTE' : 'NO_PROMOTE';
			const confidence = Math.abs(probability - 0.5) * 2; // 0-1 confidence

			return {
				score: probability,
				label: label,
				confidence: confidence,
				probability: probability
			};
		} catch (error) {
			console.error('XGBoost prediction error:', error);
			return { score: 0, label: 'NO_PROMOTE', confidence: 0 };
		}
	}

	getDefaultWeights() {
		// Default weights untuk features: [masaKerja, kpi, rating, pelatihan, umur, pendidikan, gender]
		return [0.3, 0.4, 0.3, 0.2, -0.1, 0.1, 0.05];
	}

	setModel(modelData, featureNames = []) {
		this.model = modelData;
		this.featureNames = featureNames;
		this.isLoaded = true;
	}

	getFeatureImportance() {
		if (!this.model || !this.model.featureImportance) {
			return this.featureNames.map((name, index) => ({
				feature: name,
				importance: this.getDefaultWeights()[index] || 0
			}));
		}
		return this.model.featureImportance;
	}
}

export default XGBoostModel;


