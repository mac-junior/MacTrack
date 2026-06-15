import pool from '../config/database.js';
import Transaction from '../models/Transaction.js';
import Snapshot from '../models/Snapshot.js';
import BalanceService from '../services/balanceService.js';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear.js';

dayjs.extend(weekOfYear);

// @desc    Get weeks with summaries
// @route   GET /api/history/weeks
// @access  Private
export const getWeeksWithSummaries = async (req, res) => {
  try {
    const year = req.query.year || dayjs().year();
    const weeks = await Snapshot.getWeekSummaries(req.user.id, year);
    
    const formattedWeeks = weeks.map(week => ({
      week_start: dayjs(week.week_start).format('YYYY-MM-DD'),
      week_end: dayjs(week.week_end).format('YYYY-MM-DD'),
      week_number: dayjs(week.week_start).week(),
      summary: {
        total_income: parseFloat(week.week_income) || 0,
        total_expenses: parseFloat(week.week_expenses) || 0,
        total_savings: parseFloat(week.week_savings) || 0,
        net_change: (parseFloat(week.week_income) || 0) - ((parseFloat(week.week_expenses) || 0) + (parseFloat(week.week_savings) || 0)),
        avg_unaccounted: parseFloat(week.avg_unaccounted) || 0
      }
    }));
    
    res.json({
      success: true,
      year,
      weeks: formattedWeeks
    });
  } catch (error) {
    console.error('Get weeks with summaries error:', error);
    res.status(500).json({ message: 'Server error fetching weekly summaries' });
  }
};

// @desc    Get week details with transactions
// @route   GET /api/history/week/:weekStart/:weekEnd
// @access  Private
export const getWeekDetails = async (req, res) => {
  try {
    const { weekStart, weekEnd } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    
    // Validate dates
    if (!dayjs(weekStart).isValid() || !dayjs(weekEnd).isValid()) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }
    
    const transactions = await Transaction.getTransactionsByWeek(
      req.user.id,
      weekStart,
      weekEnd
    );
    
    // Get snapshot summary for the week
    const snapshots = await Snapshot.getHistoricalSnapshots(req.user.id);
    const weekSnapshots = snapshots.filter(s => 
      s.snapshot_date >= weekStart && s.snapshot_date <= weekEnd
    );
    
    const weekSummary = {
      total_income: 0,
      total_expenses: 0,
      total_savings: 0,
      total_unaccounted: 0,
      average_daily_balance: 0,
      day_count: weekSnapshots.length
    };
    
    let totalBalances = 0;
    for (const snapshot of weekSnapshots) {
      weekSummary.total_income += parseFloat(snapshot.total_income) || 0;
      weekSummary.total_expenses += parseFloat(snapshot.total_expenses) || 0;
      weekSummary.total_savings += parseFloat(snapshot.total_savings) || 0;
      weekSummary.total_unaccounted += parseFloat(snapshot.unaccounted_money) || 0;
      totalBalances += parseFloat(snapshot.closing_balance) || 0;
    }
    
    if (weekSnapshots.length > 0) {
      weekSummary.average_daily_balance = totalBalances / weekSnapshots.length;
    }
    
    // Paginate transactions
    const paginatedTransactions = transactions.slice(offset, offset + limit);
    const totalPages = Math.ceil(transactions.length / limit);
    
    res.json({
      success: true,
      week: {
        start: weekStart,
        end: weekEnd,
        display: `${dayjs(weekStart).format('MMM D')} - ${dayjs(weekEnd).format('MMM D, YYYY')}`
      },
      summary: weekSummary,
      transactions: paginatedTransactions,
      pagination: {
        page,
        limit,
        total: transactions.length,
        totalPages,
        hasMore: page < totalPages,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null
      }
    });
  } catch (error) {
    console.error('Get week details error:', error);
    res.status(500).json({ message: 'Server error fetching week details' });
  }
};

// @desc    Get month summary
// @route   GET /api/history/month/:year/:month
// @access  Private
export const getMonthSummary = async (req, res) => {
  try {
    const { year, month } = req.params;
    
    // Validate inputs
    const monthNum = parseInt(month);
    if (monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ message: 'Month must be between 1 and 12' });
    }
    
    const startDate = dayjs(`${year}-${month}-01`).format('YYYY-MM-DD');
    const endDate = dayjs(startDate).endOf('month').format('YYYY-MM-DD');
    
    const transactions = await Transaction.getTransactionsByWeek(
      req.user.id,
      startDate,
      endDate
    );
    
    const snapshots = await Snapshot.getHistoricalSnapshots(req.user.id);
    const monthSnapshots = snapshots.filter(s => 
      s.snapshot_date >= startDate && s.snapshot_date <= endDate
    );
    
    // Group transactions by category
    const categoryBreakdown = {};
    for (const transaction of transactions) {
      const categoryName = transaction.category_name || 'Uncategorized';
      if (!categoryBreakdown[categoryName]) {
        categoryBreakdown[categoryName] = {
          name: categoryName,
          amount: 0,
          count: 0,
          type: transaction.type
        };
      }
      categoryBreakdown[categoryName].amount += parseFloat(transaction.amount);
      categoryBreakdown[categoryName].count++;
    }
    
    const monthSummary = {
      month: `${year}-${month.padStart(2, '0')}`,
      display: dayjs(startDate).format('MMMM YYYY'),
      total_days: monthSnapshots.length,
      total_income: 0,
      total_expenses: 0,
      total_savings: 0,
      total_unaccounted: 0,
      days_with_unaccounted: 0,
      average_daily_spending: 0,
      category_breakdown: Object.values(categoryBreakdown),
      top_expense_category: null,
      top_income_category: null
    };
    
    let totalExpensesForAvg = 0;
    for (const snapshot of monthSnapshots) {
      monthSummary.total_income += parseFloat(snapshot.total_income) || 0;
      monthSummary.total_expenses += parseFloat(snapshot.total_expenses) || 0;
      monthSummary.total_savings += parseFloat(snapshot.total_savings) || 0;
      monthSummary.total_unaccounted += parseFloat(snapshot.unaccounted_money) || 0;
      totalExpensesForAvg += parseFloat(snapshot.total_expenses) || 0;
      
      if (parseFloat(snapshot.unaccounted_money) > 0) {
        monthSummary.days_with_unaccounted++;
      }
    }
    
    if (monthSnapshots.length > 0) {
      monthSummary.average_daily_spending = totalExpensesForAvg / monthSnapshots.length;
    }
    
    // Find top categories
    const expenses = monthSummary.category_breakdown.filter(c => c.type === 'expense');
    const incomes = monthSummary.category_breakdown.filter(c => c.type === 'income');
    
    if (expenses.length > 0) {
      monthSummary.top_expense_category = expenses.reduce((max, cat) => 
        cat.amount > max.amount ? cat : max, expenses[0]
      );
    }
    
    if (incomes.length > 0) {
      monthSummary.top_income_category = incomes.reduce((max, cat) => 
        cat.amount > max.amount ? cat : max, incomes[0]
      );
    }
    
    res.json({
      success: true,
      summary: monthSummary
    });
  } catch (error) {
    console.error('Get month summary error:', error);
    res.status(500).json({ message: 'Server error fetching month summary' });
  }
};

// @desc    Get year summary
// @route   GET /api/history/year/:year
// @access  Private
export const getYearSummary = async (req, res) => {
  try {
    const { year } = req.params;
    const yearNum = parseInt(year);
    
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      return res.status(400).json({ message: 'Invalid year' });
    }
    
    const startDate = dayjs(`${year}-01-01`).format('YYYY-MM-DD');
    const endDate = dayjs(`${year}-12-31`).format('YYYY-MM-DD');
    
    const transactions = await Transaction.getTransactionsByWeek(
      req.user.id,
      startDate,
      endDate
    );
    
    const snapshots = await Snapshot.getHistoricalSnapshots(req.user.id);
    const yearSnapshots = snapshots.filter(s => 
      s.snapshot_date >= startDate && s.snapshot_date <= endDate
    );
    
    // Monthly breakdown
    const monthlyBreakdown = {};
    for (let i = 1; i <= 12; i++) {
      const monthStart = dayjs(`${year}-${i.toString().padStart(2, '0')}-01`).format('YYYY-MM-DD');
      const monthEnd = dayjs(monthStart).endOf('month').format('YYYY-MM-DD');
      
      const monthTransactions = transactions.filter(t => 
        t.transaction_date >= monthStart && t.transaction_date <= monthEnd
      );
      
      const monthIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const monthExpenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const monthSavings = monthTransactions
        .filter(t => t.type === 'savings')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      monthlyBreakdown[i] = {
        month: i,
        name: dayjs().month(i - 1).format('MMMM'),
        income: monthIncome,
        expenses: monthExpenses,
        savings: monthSavings,
        net: monthIncome - (monthExpenses + monthSavings)
      };
    }
    
    const yearSummary = {
      year,
      total_days: yearSnapshots.length,
      total_income: 0,
      total_expenses: 0,
      total_savings: 0,
      total_unaccounted: 0,
      months_with_data: new Set(),
      best_month: null,
      worst_month: null,
      monthly_breakdown: Object.values(monthlyBreakdown)
    };
    
    let bestNet = -Infinity;
    let worstNet = Infinity;
    
    for (const snapshot of yearSnapshots) {
      yearSummary.total_income += parseFloat(snapshot.total_income) || 0;
      yearSummary.total_expenses += parseFloat(snapshot.total_expenses) || 0;
      yearSummary.total_savings += parseFloat(snapshot.total_savings) || 0;
      yearSummary.total_unaccounted += parseFloat(snapshot.unaccounted_money) || 0;
      yearSummary.months_with_data.add(dayjs(snapshot.snapshot_date).month() + 1);
    }
    
    // Find best and worst months
    for (const month of Object.values(monthlyBreakdown)) {
      if (month.net > bestNet) {
        bestNet = month.net;
        yearSummary.best_month = month;
      }
      if (month.net < worstNet && month.net !== 0) {
        worstNet = month.net;
        yearSummary.worst_month = month;
      }
    }
    
    yearSummary.months_with_data = yearSummary.months_with_data.size;
    yearSummary.average_monthly_income = yearSummary.total_income / 12;
    yearSummary.average_monthly_expenses = yearSummary.total_expenses / 12;
    
    res.json({
      success: true,
      summary: yearSummary
    });
  } catch (error) {
    console.error('Get year summary error:', error);
    res.status(500).json({ message: 'Server error fetching year summary' });
  }
};

// @desc    Search transactions
// @route   GET /api/history/search
// @access  Private
export const searchTransactions = async (req, res) => {
  try {
    const { 
      query, 
      startDate, 
      endDate, 
      type, 
      categoryId,
      minAmount,
      maxAmount,
      sortBy = 'transaction_date',
      sortOrder = 'DESC'
    } = req.query;
    
    let sqlQuery = `
      SELECT t.*, c.name as category_name, c.type as category_type
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1
    `;
    const params = [req.user.id];
    let paramIndex = 2;
    
    if (query) {
      sqlQuery += ` AND (t.description ILIKE $${paramIndex} OR t.source ILIKE $${paramIndex})`;
      params.push(`%${query}%`);
      paramIndex++;
    }
    
    if (startDate) {
      sqlQuery += ` AND DATE(t.transaction_date) >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      sqlQuery += ` AND DATE(t.transaction_date) <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }
    
    if (type && ['income', 'expense', 'savings'].includes(type)) {
      sqlQuery += ` AND t.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }
    
    if (categoryId) {
      sqlQuery += ` AND t.category_id = $${paramIndex}`;
      params.push(categoryId);
      paramIndex++;
    }
    
    if (minAmount) {
      sqlQuery += ` AND t.amount >= $${paramIndex}`;
      params.push(parseFloat(minAmount));
      paramIndex++;
    }
    
    if (maxAmount) {
      sqlQuery += ` AND t.amount <= $${paramIndex}`;
      params.push(parseFloat(maxAmount));
      paramIndex++;
    }
    
    // Validate sort column to prevent SQL injection
    const allowedSortColumns = ['transaction_date', 'amount', 'created_at', 'type'];
    const validSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'transaction_date';
    const validSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    sqlQuery += ` ORDER BY ${validSortBy} ${validSortOrder} LIMIT 200`;
    
    const result = await pool.query(sqlQuery, params);
    
    // Calculate summary of search results
    const searchSummary = {
      total_amount: 0,
      total_income: 0,
      total_expenses: 0,
      total_savings: 0,
      average_amount: 0
    };
    
    for (const transaction of result.rows) {
      searchSummary.total_amount += parseFloat(transaction.amount);
      if (transaction.type === 'income') searchSummary.total_income += parseFloat(transaction.amount);
      if (transaction.type === 'expense') searchSummary.total_expenses += parseFloat(transaction.amount);
      if (transaction.type === 'savings') searchSummary.total_savings += parseFloat(transaction.amount);
    }
    
    if (result.rows.length > 0) {
      searchSummary.average_amount = searchSummary.total_amount / result.rows.length;
    }
    
    res.json({
      success: true,
      search_params: { query, startDate, endDate, type, categoryId, minAmount, maxAmount },
      results: {
        count: result.rows.length,
        transactions: result.rows,
        summary: searchSummary
      }
    });
  } catch (error) {
    console.error('Search transactions error:', error);
    res.status(500).json({ message: 'Server error searching transactions' });
  }
};

// @desc    Get transaction insights and patterns
// @route   GET /api/history/insights
// @access  Private
export const getTransactionInsights = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    let startDate;
    const endDate = dayjs().format('YYYY-MM-DD');
    
    switch(period) {
      case 'week':
        startDate = dayjs().subtract(7, 'days').format('YYYY-MM-DD');
        break;
      case 'month':
        startDate = dayjs().subtract(30, 'days').format('YYYY-MM-DD');
        break;
      case 'quarter':
        startDate = dayjs().subtract(90, 'days').format('YYYY-MM-DD');
        break;
      case 'year':
        startDate = dayjs().subtract(365, 'days').format('YYYY-MM-DD');
        break;
      default:
        startDate = dayjs().subtract(30, 'days').format('YYYY-MM-DD');
    }
    
    const transactions = await Transaction.getTransactionsByWeek(
      req.user.id,
      startDate,
      endDate
    );
    
    // Calculate insights
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const totalSavings = transactions
      .filter(t => t.type === 'savings')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    // Top spending categories
    const categorySpending = {};
    for (const transaction of transactions.filter(t => t.type === 'expense')) {
      const category = transaction.category_name || 'Uncategorized';
      if (!categorySpending[category]) {
        categorySpending[category] = 0;
      }
      categorySpending[category] += parseFloat(transaction.amount);
    }
    
    const topSpendingCategories = Object.entries(categorySpending)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    // Daily average spending
    const uniqueDays = new Set(transactions.map(t => 
      dayjs(t.transaction_date).format('YYYY-MM-DD')
    ));
    const dailyAverageSpending = totalExpenses / Math.max(uniqueDays.size, 1);
    
    // Biggest transaction
    const biggestExpense = transactions
      .filter(t => t.type === 'expense')
      .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))[0];
    
    const biggestIncome = transactions
      .filter(t => t.type === 'income')
      .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))[0];
    
    // Frequent transaction patterns
    const frequentDescriptions = {};
    for (const transaction of transactions) {
      const desc = transaction.description || 'No description';
      if (!frequentDescriptions[desc]) {
        frequentDescriptions[desc] = 0;
      }
      frequentDescriptions[desc]++;
    }
    
    const frequentTransactions = Object.entries(frequentDescriptions)
      .map(([description, count]) => ({ description, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    res.json({
      success: true,
      period,
      date_range: { startDate, endDate },
      insights: {
        totals: {
          income: totalIncome,
          expenses: totalExpenses,
          savings: totalSavings,
          net: totalIncome - (totalExpenses + totalSavings)
        },
        spending: {
          daily_average: dailyAverageSpending,
          top_categories: topSpendingCategories,
          biggest_expense: biggestExpense ? {
            amount: biggestExpense.amount,
            description: biggestExpense.description,
            date: biggestExpense.transaction_date
          } : null
        },
        income: {
          biggest_income: biggestIncome ? {
            amount: biggestIncome.amount,
            description: biggestIncome.description,
            date: biggestIncome.transaction_date
          } : null
        },
        patterns: {
          frequent_transactions: frequentTransactions,
          total_transactions: transactions.length
        }
      }
    });
  } catch (error) {
    console.error('Get transaction insights error:', error);
    res.status(500).json({ message: 'Server error fetching insights' });
  }
};

// @desc    Export transactions to CSV
// @route   GET /api/history/export
// @access  Private
export const exportTransactions = async (req, res) => {
  try {
    const { startDate, endDate, format = 'csv' } = req.query;
    
    let transactions;
    if (startDate && endDate) {
      transactions = await Transaction.getTransactionsByWeek(
        req.user.id,
        startDate,
        endDate
      );
    } else {
      transactions = await Transaction.findByUser(req.user.id, 10000, 0);
    }
    
    if (format === 'csv') {
      // Create CSV
      const headers = ['Date', 'Type', 'Category', 'Amount', 'Description', 'Source'];
      const csvRows = [headers];
      
      for (const transaction of transactions) {
        csvRows.push([
          dayjs(transaction.transaction_date).format('YYYY-MM-DD HH:mm:ss'),
          transaction.type,
          transaction.category_name || 'Uncategorized',
          transaction.amount,
          transaction.description || '',
          transaction.source || ''
        ]);
      }
      
      const csvContent = csvRows.map(row => row.join(',')).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=mactrack_export_${dayjs().format('YYYY-MM-DD')}.csv`);
      res.send(csvContent);
    } else {
      res.json({
        success: true,
        count: transactions.length,
        transactions
      });
    }
  } catch (error) {
    console.error('Export transactions error:', error);
    res.status(500).json({ message: 'Server error exporting transactions' });
  }
};