import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  change,
  comparisonText = 'vs last period',
  isCurrency = false,
  colorScheme = 'indigo', // indigo, emerald, amber, blue, violet, rose
}) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600',
      badge: 'text-indigo-600',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      badge: 'text-emerald-600',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      badge: 'text-amber-600',
    },
    blue: {
      bg: 'bg-blue-50 text-blue-600',
      badge: 'text-blue-600',
    },
    violet: {
      bg: 'bg-violet-50 text-violet-600',
      badge: 'text-violet-600',
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600',
      badge: 'text-rose-600',
    },
  };

  const scheme = colorMap[colorScheme] || colorMap.indigo;
  const isPositive = typeof change === 'number' && change >= 0;

  const formattedValue =
    isCurrency && typeof value === 'number'
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
        }).format(value)
      : typeof value === 'number'
      ? new Intl.NumberFormat('en-US').format(value)
      : value;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h4 className="text-2xl font-bold text-slate-900 tracking-tight">
            {formattedValue}
          </h4>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${scheme.bg} shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(change !== undefined || comparisonText) && (
        <div className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-50 text-xs text-slate-500">
          {change !== undefined && (
            <span
              className={`inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded-full ${
                isPositive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(change)}%
            </span>
          )}
          <span className="truncate">{comparisonText}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
