export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
  SAVINGS: 'savings'
};

export const TRANSACTION_TYPE_OPTIONS = [
  { value: 'expense', label: 'Expense', color: 'red' },
  { value: 'income', label: 'Income', color: 'green' },
  { value: 'savings', label: 'Savings', color: 'emerald' }
];

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  LIMIT_OPTIONS: [10, 20, 50, 100]
};

export const DATE_FORMATS = {
  DISPLAY: 'MMM D, YYYY',
  DISPLAY_WITH_TIME: 'MMM D, YYYY h:mm A',
  API: 'YYYY-MM-DD',
  API_WITH_TIME: 'YYYY-MM-DDTHH:mm:ss'
};