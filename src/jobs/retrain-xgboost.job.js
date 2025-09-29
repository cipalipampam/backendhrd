import { trainXGBoostModel } from "../modules/promotion-ai/model/xgboost-trainer.service.js";

async function main() {
	const storagePath = process.env.XGBOOST_MODEL_PATH || 'model-xgboost.json';
	await trainXGBoostModel(storagePath);
}

main().catch(err => { console.error(err); process.exit(1); });


