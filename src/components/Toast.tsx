import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, X, Info } from 'lucide-react';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, duration = 5000, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for fade out animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle size={20} />;
            case 'error': return <AlertTriangle size={20} />;
            case 'warning': return <AlertTriangle size={20} />;
            case 'info': return <Info size={20} />;
        }
    };

    const getColors = () => {
        switch (type) {
            case 'success': return { bg: 'rgba(0, 255, 150, 0.1)', border: 'rgba(0, 255, 150, 0.3)', text: '#00ff96' };
            case 'error': return { bg: 'rgba(255, 100, 100, 0.1)', border: 'rgba(255, 100, 100, 0.3)', text: '#ff6464' };
            case 'warning': return { bg: 'rgba(255, 200, 0, 0.1)', border: 'rgba(255, 200, 0, 0.3)', text: '#ffc800' };
            case 'info': return { bg: 'rgba(0, 217, 255, 0.1)', border: 'rgba(0, 217, 255, 0.3)', text: '#00d9ff' };
        }
    };

    const colors = getColors();

    return (
        <div
            style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: colors.text,
                fontSize: '0.9rem',
                fontWeight: '500',
                zIndex: 10000,
                minWidth: '300px',
                maxWidth: '500px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
                opacity: isVisible ? 1 : 0,
                transition: 'all 0.3s ease-in-out'
            }}
        >
            <div style={{ color: colors.text, flexShrink: 0 }}>
                {getIcon()}
            </div>
            <div style={{ flex: 1, color: 'var(--text-primary)' }}>
                {message}
            </div>
            <button
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                }}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
                <X size={16} />
            </button>
        </div>
    );
};

export default Toast;