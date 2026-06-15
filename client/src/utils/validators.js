export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateAmount = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

export const validateTransaction = (data) => {
  const errors = {};
  
  if (!data.amount || !validateAmount(data.amount)) {
    errors.amount = 'Please enter a valid amount greater than 0';
  }
  
  if (!data.type) {
    errors.type = 'Please select a transaction type';
  }
  
  if (!data.categoryId) {
    errors.categoryId = 'Please select a category';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};