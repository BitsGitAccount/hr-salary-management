import express from 'express';

const { Router } = express;
import { getInsightsByCountry } from '../controllers/insightsController.js';

const router = Router();

// GET /api/insights/country - Get salary insights grouped by country
router.get('/country', getInsightsByCountry);

export default router;
