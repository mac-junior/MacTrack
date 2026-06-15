import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getTodaySnapshot,
  getSnapshotByDate,
  getHistoricalSnapshots,
  getSnapshotSummary,
  forceCreateSnapshot
} from '../controllers/snapshotController.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/today', getTodaySnapshot);
router.get('/history', getHistoricalSnapshots);
router.get('/summary', getSnapshotSummary);
router.post('/create', forceCreateSnapshot);
router.get('/:date', getSnapshotByDate);

export default router;