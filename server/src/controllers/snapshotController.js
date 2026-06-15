import SnapshotService from '../services/snapshotService.js';
import Snapshot from '../models/Snapshot.js';
import dayjs from 'dayjs';

// @desc    Get current day snapshot
// @route   GET /api/snapshots/today
// @access  Private
export const getTodaySnapshot = async (req, res) => {
  try {
    const today = dayjs().format('YYYY-MM-DD');
    let snapshot = await Snapshot.findByUserAndDate(req.user.id, today);
    
    if (!snapshot) {
      // Create snapshot for today if it doesn't exist
      snapshot = await SnapshotService.createDailySnapshot(req.user.id, today);
    }
    
    res.json({
      success: true,
      snapshot
    });
  } catch (error) {
    console.error('Get today snapshot error:', error);
    res.status(500).json({ message: 'Server error fetching snapshot' });
  }
};

// @desc    Get snapshot by date
// @route   GET /api/snapshots/:date
// @access  Private
export const getSnapshotByDate = async (req, res) => {
  try {
    const { date } = req.params;
    let snapshot = await Snapshot.findByUserAndDate(req.user.id, date);
    
    if (!snapshot) {
      snapshot = await SnapshotService.createDailySnapshot(req.user.id, date);
    }
    
    res.json({
      success: true,
      snapshot
    });
  } catch (error) {
    console.error('Get snapshot by date error:', error);
    res.status(500).json({ message: 'Server error fetching snapshot' });
  }
};

// @desc    Get historical snapshots
// @route   GET /api/snapshots/history
// @access  Private
export const getHistoricalSnapshots = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const snapshots = await Snapshot.getHistoricalSnapshots(req.user.id, limit);
    
    res.json({
      success: true,
      snapshots
    });
  } catch (error) {
    console.error('Get historical snapshots error:', error);
    res.status(500).json({ message: 'Server error fetching historical snapshots' });
  }
};

// @desc    Get snapshot summary
// @route   GET /api/snapshots/summary
// @access  Private
export const getSnapshotSummary = async (req, res) => {
  try {
    const startDate = req.query.startDate || dayjs().subtract(30, 'days').format('YYYY-MM-DD');
    const endDate = req.query.endDate || dayjs().format('YYYY-MM-DD');
    
    const summary = await SnapshotService.getSnapshotSummary(req.user.id, startDate, endDate);
    
    res.json({
      success: true,
      summary,
      period: { startDate, endDate }
    });
  } catch (error) {
    console.error('Get snapshot summary error:', error);
    res.status(500).json({ message: 'Server error fetching snapshot summary' });
  }
};

// @desc    Force create snapshot for date
// @route   POST /api/snapshots/create
// @access  Private
export const forceCreateSnapshot = async (req, res) => {
  try {
    const { date } = req.body;
    const snapshotDate = date || dayjs().format('YYYY-MM-DD');
    
    const snapshot = await SnapshotService.createDailySnapshot(req.user.id, snapshotDate);
    
    res.json({
      success: true,
      snapshot,
      message: `Snapshot created for ${snapshotDate}`
    });
  } catch (error) {
    console.error('Force create snapshot error:', error);
    res.status(500).json({ message: 'Server error creating snapshot' });
  }
};