import { Router } from 'express';
import { allowRoles } from '../../middleware/role-authorization.js';
import { ROLES } from '../../constants/roles.js';
import { trainXGBoostModel } from '../../modules/promotion-ai/model/xgboost-trainer.service.js';
import { loadActiveModel } from '../../modules/promotion-ai/services/promotion-recommender.service.js';

const router = Router();

router.get('/model', allowRoles(ROLES.HR), async (req, res) => {
	const active = await loadActiveModel();
	if (!active) return res.status(404).json({ message: 'No active model' });
	return res.json({ status: 200, message: 'Active model', data: active.meta });
});

router.post('/train', allowRoles(ROLES.HR), async (req, res) => {
	const storagePath = process.env.XGBOOST_MODEL_PATH || 'model-xgboost.json';
	const meta = await trainXGBoostModel(storagePath);
	return res.status(201).json({ status: 201, message: 'Model trained', data: meta });
});

export default router;


