import { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
    id: number;
    message: string;
    type: ToastType;
}

const ToastContext = createContext<{
    showToast: (message: string, type?: ToastType) => void;
}>({ showToast: () => {} });

let counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = ++counter;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    }, []);

    const colors: Record<ToastType, { bg: string; border: string; icon: string }> = {
        success: { bg: 'rgba(35,134,54,0.15)', border: '#238636', icon: '✓' },
        error:   { bg: 'rgba(248,81,73,0.15)', border: 'var(--error)', icon: '✕' },
        info:    { bg: 'rgba(88,166,255,0.12)', border: 'var(--accent)', icon: 'i' },
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div style={{ position: 'fixed', bottom: '24px', right: '24px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 9999, pointerEvents: 'none' }}>
                {toasts.map(toast => {
                    const c = colors[toast.type];
                    return (
                        <div key={toast.id} style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '12px 16px', borderRadius: 'var(--radius-sm)',
                            background: c.bg, border: `1px solid ${c.border}`,
                            backdropFilter: 'blur(8px)',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                            fontSize: '14px', color: 'var(--text)',
                            minWidth: '240px', maxWidth: '360px',
                            animation: 'toast-in 0.2s ease',
                        }}>
                            <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: c.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                {c.icon}
                            </span>
                            {toast.message}
                        </div>
                    );
                })}
            </div>
            <style>{`@keyframes toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </ToastContext.Provider>
    );
}

export function useToast() {
    return useContext(ToastContext);
}
