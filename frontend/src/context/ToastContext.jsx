import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import './Toast.css';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

const Toast = ({ id, message, type, onClose }) => {
    const icons = {
        success: <Check size={18} />,
        info: <Info size={18} />,
        warning: <AlertTriangle size={18} />,
        error: <AlertCircle size={18} />
    };

    const colors = {
        success: 'var(--success-text)',
        info: 'var(--primary-color)',
        warning: '#f59e0b',
        error: '#ef4444'
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className={`toast toast-${type}`}
            style={{ borderLeftColor: colors[type] }}
        >
            <div className="toast-icon" style={{ color: colors[type] }}>
                {icons[type]}
            </div>
            <div className="toast-message">{message}</div>
            <button className="toast-close" onClick={() => onClose(id)}>
                <X size={14} />
            </button>
        </motion.div>
    );
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now().toString() + Math.random().toString();
        setToasts(prev => [...prev, { id, message, type }]);

        if (duration) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="toast-container">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <Toast
                            key={toast.id}
                            {...toast}
                            onClose={removeToast}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
