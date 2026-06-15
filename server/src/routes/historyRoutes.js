import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getWeeksWithSummaries,
  getWeekDetails,
  getMonthSummary,
  getYearSummary,
  searchTransactions,
  getTransactionInsights,
  exportTransactions
} from '../controllers/historyController.js';

const router = express.Router();

router.use(protect); // All routes require authentication

// Summary routes
router.get('/weeks', getWeeksWithSummaries);
router.get('/week/:weekStart/:weekEnd', getWeekDetails);
router.get('/month/:year/:month', getMonthSummary);
router.get('/year/:year', getYearSummary);

// Analysis routes
router.get('/insights', getTransactionInsights);
router.get('/search', searchTransactions);
router.get('/export', exportTransactions);

export default router;