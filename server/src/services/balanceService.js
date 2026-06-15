import Transaction from '../models/Transaction.js';
import Snapshot from '../models/Snapshot.js';
import dayjs from 'dayjs';

class BalanceService {
  static async calculateTodayBalance(userId, date) {
    const balances = await Transaction.getBalance(userId, date);
    const actualBalance = balances.total_income - (balances.total_expenses + balances.total_savings);
    
    // Get opening balance from previous day's snapshot
    const previousDate = dayjs(date).subtract(1, 'day').format('YYYY-MM-DD');
    const previousSnapshot = await Snapshot.findByUserAndDate(userId, previousDate);
    const openingBalance = previousSnapshot ? previousSnapshot.closing_balance : 0;
    
    const expectedBalance = openingBalance + balances.total_income;
    const unaccountedMoney = expectedBalance - actualBalance;
    
    return {
      opening_balance: openingBalance,
      total_income: parseFloat(balances.total_income),
      total_expenses: parseFloat(balances.total_expenses),
      total_savings: parseFloat(balances.total_savings),
      actual_balance: actualBalance,
      expected_balance: expectedBalance,
      unaccounted_money: Math.max(0, unaccountedMoney) // Only positive unaccounted money
    };
  }

  static async calculateHistoricalBalance(userId, endDate) {
    const allTimeBalances = await Transaction.getAllTimeBalance(userId);
    const actualBalance = allTimeBalances.total_income - 
                         (allTimeBalances.total_expenses + allTimeBalances.total_savings);
    
    return {
      total_income: parseFloat(allTimeBalances.total_income),
      total_expenses: parseFloat(allTimeBalances.total_expenses),
      total_savings: parseFloat(allTimeBalances.total_savings),
      net_balance: actualBalance
    };
  }

  static async getExpectedBalance(userId, date) {
    const previousDate = dayjs(date).subtract(1, 'day').format('YYYY-MM-DD');
    const previousSnapshot = await Snapshot.findByUserAndDate(userId, previousDate);
    const openingBalance = previousSnapshot ? previousSnapshot.closing_balance : 0;
    
    const todayIncome = await Transaction.getBalance(userId, date);
    return openingBalance + parseFloat(todayIncome.total_income);
  }

  static async getActualBalance(userId, date) {
    const balances = await Transaction.getBalance(userId, date);
    return balances.total_income - (balances.total_expenses + balances.total_savings);
  }

  static async getUnaccountedMoney(userId, date) {
    const expectedBalance = await this.getExpectedBalance(userId, date);
    const actualBalance = await this.getActualBalance(userId, date);
    return Math.max(0, expectedBalance - actualBalance);
  }
}

export default BalanceService;