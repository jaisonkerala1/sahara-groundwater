import React from 'react';

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="loading-spinner w-16 h-16 mb-6"></div>
      <div className="flex space-x-1">
        <div className="w-3 h-3 bg-primary-purple rounded-full animate-bounce"></div>
        <div className="w-3 h-3 bg-primary-purple rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-3 h-3 bg-primary-purple rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
}

export default LoadingSpinner;
