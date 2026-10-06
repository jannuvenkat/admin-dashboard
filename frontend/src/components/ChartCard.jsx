import React from 'react';
import { Skeleton } from './Loading';
import { ErrorMessage } from './ErrorMessage';

export const ChartCard = ({
  title,
  subtitle,
  actions,
  children,
  loading = false,
  error = null,
  onRetry = null,
  className = '',
  minHeight = 'min-h-[320px]'
}) => {
  return (
    <div
      className={`bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      <div className={`relative flex-1 ${minHeight}`}>
        {loading ? (
          <div className="absolute inset-0 flex flex-col gap-3 justify-center">
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-full h-32" />
            <Skeleton className="w-full h-12" />
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center p-4">
            <ErrorMessage message={error} onRetry={onRetry} />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default ChartCard;
