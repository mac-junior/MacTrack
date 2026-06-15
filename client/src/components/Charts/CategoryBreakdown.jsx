import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#F97316'];

const CategoryBreakdown = ({ categories }) => {
  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No category data available</p>
      </div>
    );
  }

  const data = categories.map(category => ({
    name: category.name,
    value: category.amount,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatCurrency(value)} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryBreakdown;