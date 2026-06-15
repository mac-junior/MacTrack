import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const SpendingChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No spending data available</p>
      </div>
    );
  }

  const chartData = data.map(category => ({
    name: category.name,
    amount: category.amount,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => formatCurrency(value)} />
        <Tooltip formatter={(value) => formatCurrency(value)} />
        <Bar dataKey="amount" fill="#10B981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SpendingChart;