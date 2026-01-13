import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    // Auto-dismiss after 3 seconds
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = type === 'success' 
    ? 'bg-white border-l-4 border-emerald-500 text-gray-800' 
    : 'bg-white border-l-4 border-red-500 text-gray-800';

  const icon = type === 'success' 
    ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
    : <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />;

  return (
    <div className={`
      fixed top-6 left-1/2 -translate-x-1/2 z-[100] 
      flex items-center gap-3 px-5 py-3.5 
      rounded-lg shadow-xl border border-gray-100 min-w-[320px] max-w-[90vw]
      transform transition-all duration-300 ease-out
      ${styles}
    `}>
      {icon}
      <p className="flex-1 text-sm font-medium leading-tight">{message}</p>
      <button 
        onClick={onClose} 
        className="p-1 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;