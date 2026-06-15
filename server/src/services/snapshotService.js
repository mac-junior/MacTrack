import Snapshot from '../models/Snapshot.js';
import BalanceService from './balanceService.js';
import dayjs from 'dayjs';

class SnapshotService {
  static async createDailySnapshot(userId, date) {
    const balances = await BalanceService.calculateTodayBalance(userId, date);
    
    const snapshot = await Snapshot.create({
      userId,
      snapshotDate: date,
      openingBalance: balances.opening_balance,
      totalIncome: balances.total_income,
      totalExpenses: balances.total_expenses,
      totalSavings: balances.total_savings,
      closingBalance: balances.actual_balance,
      unaccountedMoney: balances.unaccounted_money
    });
    
    return snapshot;
  }

  static async archiveYesterdayIfNeeded(userId) {
    const today = dayjs().format('YYYY-MM-DD');
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    
    // Check if yesterday's snapshot exists
    const existingSnapshot = await Snapshot.findByUserAndDate(userId, yesterday);
    
    if (!existingSnapshot) {
      // Create snapshot for yesterday
      const yesterdayTransactions = await BalanceService.calculateTodayBalance(userId, yesterday);
      
      const snapshot = await Snapshot.create({
        userId,
        snapshotDate: yesterday,
        openingBalance: yesterdayTransactions.opening_balance,
        totalIncome: yesterdayTransactions.total_income,
        totalExpenses: yesterdayTransactions.total_expenses,
        totalSavings: yesterdayTransactions.total_savings,
        closingBalance: yesterdayTransactions.actual_balance,
        unaccountedMoney: yesterdayTransactions.unaccounted_money
      });
      
      return snapshot;
    }
    
    return existingSnapshot;
  }

  static async getSnapshotSummary(userId, startDate, endDate) {
    const snapshots = await Snapshot.getHistoricalSnapshots(userId);
    
    const summary = {
      total_days: snapshots.length,
      average_daily_income: 0,
      average_daily_expenses: 0,
      average_daily_savings: 0,
      total_unaccounted_days: 0,
      best_day: null,
      worst_day: null
    };
    
    if (snapshots.length === 0) return summary;
    
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalSavings = 0;
    let maxIncome = 0;
    let maxExpense = 0;
    
    for (const snapshot of snapshots) {
      totalIncome += parseFloat(snapshot.total_income);
      totalExpenses += parseFloat(snapshot.total_expenses);
      totalSavings += parseFloat(snapshot.total_savings);
      
      if (parseFloat(snapshot.unaccounted_money) > 0) {
        summary.total_unaccounted_days++;
      }
      
      if (parseFloat(snapshot.total_income) > maxIncome) {
        maxIncome = parseFloat(snapshot.total_income);
        summary.best_day = snapshot.snapshot_date;
      }
      
      if (parseFloat(snapshot.total_expenses) > maxExpense) {
        maxExpense = parseFloat(snapshot.total_expenses);
        summary.worst_day = snapshot.snapshot_date;
      }
    }
    
    summary.average_daily_income = totalIncome / snapshots.length;
    summary.average_daily_expenses = totalExpenses / snapshots.length;
    summary.average_daily_savings = totalSavings / snapshots.length;
    
    return summary;
  }
}

export default SnapshotService;