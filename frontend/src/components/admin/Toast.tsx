import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl text-white transition-all animate-fadeIn ${type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
      {type === 'success' ? (
        <FaCheckCircle className="text-2xl" />
      ) : (
        <FaExclamationCircle className="text-2xl" />
      )}
      <span className="font-semibold text-base tracking-wide">{message}</span>
    </div>
  );
};

export default Toast; 