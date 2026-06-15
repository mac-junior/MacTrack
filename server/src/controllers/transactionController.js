import Transaction from '../models/Transaction.js';
import Category from '../models/Category.js';
import SMSParserService from '../services/smsParserService.js';
import BalanceService from '../services/balanceService.js';
import SnapshotService from '../services/snapshotService.js';
import dayjs from 'dayjs';

// @desc    Create manual transaction
// @route   POST /api/transactions/manual
// @access  Private
export const createManualTransaction = async (req, res) => {
  try {
    const { amount, type, categoryId, description, transactionDate } = req.body;
    
    if (!amount || !type || !categoryId) {
      return res.status(400).json({ message: 'Amount, type, and category are required' });
    }
    
    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }
    
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ message: 'Invalid category' });
    }
    
    const transaction = await Transaction.create({
      userId: req.user.id,
      amount,
      type,
      categoryId,
      description: description || `Manual ${type} transaction`,
      source: 'manual',
      transactionDate: transactionDate || new Date(),
      isParsed: false
    });
    
    // Check and archive snapshot if needed
    await SnapshotService.archiveYesterdayIfNeeded(req.user.id);
    
    res.status(201).json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Create manual transaction error:', error);
    res.status(500).json({ message: 'Server error creating transaction' });
  }
};

// @desc    Parse and create transaction from SMS
// @route   POST /api/transactions/parse-sms
// @access  Private
export const parseSmsTransaction = async (req, res) => {
  try {
    const { smsMessage, userConfirmedData } = req.body;
    
    if (!smsMessage) {
      return res.status(400).json({ message: 'SMS message is required' });
    }
    
    let parsedData;
    
    if (userConfirmedData) {
      // User confirmed/edited the data
      parsedData = userConfirmedData;
    } else {
      // Parse the SMS
      parsedData = SMSParserService.parse(smsMessage);
      const validation = SMSParserService.validateExtractedData(parsedData);
      
      if (!validation.isValid) {
        return res.status(400).json({
          needsConfirmation: true,
          parsedData,
          errors: validation.errors,
          message: 'Please confirm or edit the extracted information'
        });
      }
    }
    
    // Find or suggest category
    let categoryId = null;
    if (parsedData.suggestedCategory) {
      const category = await Category.findByName(parsedData.suggestedCategory);
      if (category) {
        categoryId = category.id;
      }
    }
    
    // If no category found, get default based on type
    if (!categoryId) {
      const defaultCategory = await Category.findByName(
        parsedData.type === 'income' ? 'Other Income' : 'Other'
      );
      if (defaultCategory) {
        categoryId = defaultCategory.id;
      }
    }
    
    const transaction = await Transaction.create({
      userId: req.user.id,
      amount: parsedData.amount,
      type: parsedData.type,
      categoryId,
      description: parsedData.description,
      source: parsedData.source || 'mobile_money',
      transactionDate: new Date(),
      isParsed: true
    });
    
    // Check and archive snapshot if needed
    await SnapshotService.archiveYesterdayIfNeeded(req.user.id);
    
    res.status(201).json({
      success: true,
      transaction,
      parsedData
    });
  } catch (error) {
    console.error('Parse SMS transaction error:', error);
    res.status(500).json({ message: 'Server error processing SMS' });
  }
};

// @desc    Get today's transactions and balances
// @route   GET /api/transactions/today
// @access  Private
export const getTodayFinancialStory = async (req, res) => {
  try {
    const today = dayjs().format('YYYY-MM-DD');
    
    // Archive yesterday if needed
    await SnapshotService.archiveYesterdayIfNeeded(req.user.id);
    
    const transactions = await Transaction.getTodayTransactions(req.user.id, today);
    const balances = await BalanceService.calculateTodayBalance(req.user.id, today);
    
    // Get greeting based on time
    const hour = dayjs().hour();
    let greeting = '';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';
    else greeting = 'Good evening';
    
    res.json({
      success: true,
      date: today,
      greeting: `${greeting}, ${req.user.username}`,
      summary: balances,
      transactions,
      hasUnaccountedMoney: balances.unaccounted_money > 0,
      unaccountedMessage: balances.unaccounted_money > 0 
        ? `You have ${balances.unaccounted_money.toLocaleString()} unaccounted. Did you spend cash recently?`
        : null
    });
  } catch (error) {
    console.error('Get today financial story error:', error);
    res.status(500).json({ message: 'Server error fetching today\'s data' });
  }
};

// @desc    Get all transactions with pagination
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;
    
    const transactions = await Transaction.findByUser(
      req.user.id, 
      limit, 
      offset, 
      startDate, 
      endDate
    );
    
    res.json({
      success: true,
      page,
      limit,
      transactions,
      hasMore: transactions.length === limit
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error fetching transactions' });
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
export const updateTransaction = async (req, res) => {
  try {
    const { categoryId, description, amount, transactionDate } = req.body;
    
    const transaction = await Transaction.update(
      req.params.id,
      req.user.id,
      { categoryId, description, amount, transactionDate }
    );
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Server error updating transaction' });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.delete(req.params.id, req.user.id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Server error deleting transaction' });
  }
};

// @desc    Get categories
// @route   GET /api/transactions/categories
// @access  Private
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    
    const groupedCategories = {
      income: categories.filter(c => c.type === 'income'),
      expense: categories.filter(c => c.type === 'expense'),
      savings: categories.filter(c => c.type === 'savings')
    };
    
    res.json({
      success: true,
      categories: groupedCategories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error fetching categories' });
  }
};