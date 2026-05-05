import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getNotifications } from "../api/notifications";
import { useAuth } from "./useAuth";

const NotificationContext = createContext<{
    unreadCount: number;
    refresh: () => void;
}>({ unreadCount: 0, refresh: () => {} });

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    const refresh = useCallback(() => {
        if (!user) return;
        getNotifications()
            .then(notifications => setUnreadCount(notifications.filter(n => !n.isRead).length))
            .catch(() => {});
    }, [user]);

    useEffect(() => {
        refresh();
        const interval = setInterval(refresh, 30000);
        return () => clearInterval(interval);
    }, [refresh]);

    return (
        <NotificationContext.Provider value={{ unreadCount, refresh }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    return useContext(NotificationContext);
}
