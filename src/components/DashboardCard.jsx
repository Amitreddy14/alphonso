import React from 'react';

const DashboardCard = ({ icon: Icon, title, value, trend, subtitle, bgColor }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`${bgColor} p-3 rounded-lg`}>
          <Icon className="h-6 w-6" />
        </div>
        {trend && (
          <span className="text-green-500 flex items-center text-sm font-medium">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
};

export default DashboardCard;