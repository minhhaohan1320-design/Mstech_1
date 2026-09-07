import React from 'react';

interface SensorCardProps {
  title: string;
  value: number | string | null;
  unit: string;
  icon?: React.ReactNode;
  colorClass: string;
}

export const SensorCard: React.FC<SensorCardProps> = ({ title, value, unit, icon, colorClass }) => {
  const isInvalid = value === null || value === undefined || (typeof value === 'number' && isNaN(value));
  const displayValue = isInvalid ? '--' : value;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-start justify-between">
      <div className="flex items-center space-x-2 mb-3 w-full">
        <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
          {icon}
        </div>
        <span className="text-sm font-semibold text-gray-600">{title}</span>
      </div>
      <div className="flex items-end space-x-1">
        <span className="text-3xl font-bold text-gray-900">{displayValue}</span>
        <span className="text-sm text-gray-500 mb-1">{unit}</span>
      </div>
    </div>
  );
};
