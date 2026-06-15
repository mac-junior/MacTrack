import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createManualTransaction,
  parseSmsTransaction,
  getTodayFinancialStory,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getCategories
} from '../controllers/transactionController.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.post('/manual', createManualTransaction);
router.post('/parse-sms', parseSmsTransaction);
router.get('/today', getTodayFinancialStory);
router.get('/categories', getCategories);
router.get('/', getTransactions);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;