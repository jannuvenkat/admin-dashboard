import React from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';

export const ErrorMessage = ({ message, onRetry, onDismiss, className = '' }) => {
  if (!message) return null;

  return (
    <div
      className={`flex items-start justify-between p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-rose-900">An error occurred</p>
          <p className="mt-0.5 text-rose-700">{message}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-4 shrink-0">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 text-rose-500 hover:text-rose-800 hover:bg-rose-100 rounded-lg transition-colors"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
