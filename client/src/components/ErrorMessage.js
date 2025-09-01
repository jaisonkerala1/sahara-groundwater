import React from 'react';
import { AlertCircle, RefreshCw, RotateCcw } from 'lucide-react';

function ErrorMessage({ message, onRetry, onReset }) {
  return (
    <div className="card-primary border-l-4 border-l-status-error bg-red-50">
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-6 h-6 text-status-error mt-1 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-h3 text-neutral-gray900 mb-2">
            Analysis Failed
          </h3>
          <p className="text-body2 text-neutral-gray700 mb-4">
            {message}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="btn-primary flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
            )}
            {onReset && (
              <button
                onClick={onReset}
                className="btn-secondary flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Start Over</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ErrorMessage;
