import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

const AuthMessage = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) {
          onClose();
        }
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message || !isVisible) {
    return null;
  }

  const isError = type === 'error';

  return (
    <div
      className={`mb-4 p-4 rounded-lg border transition-all duration-300 flex items-start gap-3 ${
        isError
          ? 'bg-red-500/10 border-red-500/30 text-red-400'
          : 'bg-green-500/10 border-green-500/30 text-green-400'
      }`}
    >
      {isError ? (
        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
      ) : (
        <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
      )}
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
};

export default AuthMessage;
