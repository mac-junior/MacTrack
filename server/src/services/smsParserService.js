class SMSParserService {
  static parse(message) {
    const parsedData = {
      type: null,
      amount: null,
      source: null,
      description: null,
      confidence: 'low'
    };

    const upperMessage = message.toUpperCase();

    // Detect transaction type
    if (upperMessage.includes('RECEIVED') || 
        upperMessage.includes('CREDITED') || 
        upperMessage.includes('DEPOSIT') ||
        upperMessage.includes('RECEIVED FROM')) {
      parsedData.type = 'income';
      parsedData.confidence = 'high';
    } else if (upperMessage.includes('PAID') || 
               upperMessage.includes('SENT') || 
               upperMessage.includes('DEBITED') ||
               upperMessage.includes('WITHDRAWAL') ||
               upperMessage.includes('PURCHASE')) {
      parsedData.type = 'expense';
      parsedData.confidence = 'high';
    } else if (upperMessage.includes('SAVINGS') || 
               upperMessage.includes('SAVE')) {
      parsedData.type = 'savings';
      parsedData.confidence = 'medium';
    }

    // Extract amount using regex
    const amountPatterns = [
      /(?:UGX|USD|KES|TZS|RWF|GHS|NGN)?\s*([\d,]+(?:\.\d{2})?)/i,
      /(?:AMOUNT|VALUE):\s*([\d,]+(?:\.\d{2})?)/i,
      /([\d,]+(?:\.\d{2})?)\s*(?:UGX|USD|SHILLINGS?)/i
    ];

    for (const pattern of amountPatterns) {
      const match = message.match(pattern);
      if (match) {
        parsedData.amount = parseFloat(match[1].replace(/,/g, ''));
        break;
      }
    }

    // Extract source/recipient
    const sourcePatterns = [
      /FROM:\s*([A-Z\s]+)/i,
      /RECEIVED FROM\s+([A-Z\s]+)/i,
      /PAID TO\s+([A-Z\s]+)/i,
      /SENT TO\s+([A-Z\s]+)/i
    ];

    for (const pattern of sourcePatterns) {
      const match = message.match(pattern);
      if (match) {
        parsedData.source = match[1].trim();
        break;
      }
    }

    // Generate description
    if (!parsedData.description) {
      if (parsedData.type === 'income') {
        parsedData.description = parsedData.source ? `Received from ${parsedData.source}` : 'Income received';
      } else if (parsedData.type === 'expense') {
        parsedData.description = parsedData.source ? `Payment to ${parsedData.source}` : 'Payment made';
      } else {
        parsedData.description = 'Transaction recorded';
      }
    }

    // Suggest category based on keywords
    parsedData.suggestedCategory = this.suggestCategory(message, parsedData.type);

    return parsedData;
  }

  static suggestCategory(message, type) {
    const upperMessage = message.toUpperCase();
    
    const categoryKeywords = {
      'Transport': ['UBER', 'TAXI', 'BUS', 'FUEL', 'PETROL', 'BODA', 'MOTO'],
      'Food': ['RESTAURANT', 'CAFE', 'GROCERY', 'FOOD', 'LUNCH', 'DINNER', 'BREAKFAST'],
      'Data': ['AIRTEL', 'MTN', 'TIGO', 'VODAFONE', 'DATA', 'INTERNET', 'BUNDLE'],
      'Shopping': ['SHOP', 'STORE', 'SUPERMARKET', 'AMAZON', 'JUMIA'],
      'School': ['SCHOOL', 'TUITION', 'UNIVERSITY', 'COLLEGE', 'FEES'],
      'Savings': ['SAVE', 'SAVINGS', 'FIXED DEPOSIT'],
      'Tithe': ['CHURCH', 'TITHE', 'OFFERING', 'TITHING']
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      for (const keyword of keywords) {
        if (upperMessage.includes(keyword)) {
          return category;
        }
      }
    }

    // Default suggestions based on type
    if (type === 'income') return 'Other Income';
    if (type === 'savings') return 'Savings';
    return 'Other';
  }

  static validateExtractedData(data) {
    const errors = [];
    
    if (!data.type) {
      errors.push('Transaction type could not be detected');
    }
    
    if (!data.amount || data.amount <= 0) {
      errors.push('Valid amount could not be extracted');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default SMSParserService;