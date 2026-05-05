import {useState, useEffect} from 'react';
import { useAuth } from '../store/useAuth';
import { useLang } from '../store/langStore';
import type { Notification } from '../types';
import { getNotifications, markAsRead } from '../api/notifications';

function NotificationsPage() {
    const {user} = useAuth();
    const { t } = useLang();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            getNotifications()
                .then((data) => {
                    setNotifications(data);
                    setLoading(false);
                })
                .catch((err) => {
                    setError(err.message);
                    setLoading(false);
                });
            
        }
    }, [user]);

    if (loading) {
        return <div>{t.loading}</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="page">
            <h1>{t.notifications}</h1>
            {notifications.length === 0 ? (
                <p>{t.noNotifications}</p>
            ) : (
                <>
                    {notifications.map((notification) => (
                        <div className="card" key={notification.id} style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                            <span style={notification.isRead ? {color: 'var(--text-secondary)'} : {}}>{notification.message}</span>
                            {!notification.isRead && (
                                <button className="btn btn-ghost btn-sm" onClick={() => markAsRead(notification.id)}>{t.markAsRead}</button>
                            )}
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}

export default NotificationsPage;