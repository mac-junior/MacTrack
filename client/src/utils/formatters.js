export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date, format = 'MMM D, YYYY') => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getGreeting = (username) => {
  const hour = new Date().getHours();
  let greeting = '';
  
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 18) greeting = 'Good afternoon';
  else greeting = 'Good evening';
  
  return `${greeting}, ${username}`;
};

export const getCategoryColor = (type, categoryName) => {
  const colors = {
    income: 'text-emerald-600 bg-emerald-50',
    expense: 'text-red-600 bg-red-50',
    savings: 'text-emerald-600 bg-emerald-50',
  };
  
  return colors[type] || 'text-gray-600 bg-gray-50';
};

export const truncateText = (text, length = 50) => {
  if (!text) return '';
  return text.length > length ? `${text.substring(0, length)}...` : text;
};