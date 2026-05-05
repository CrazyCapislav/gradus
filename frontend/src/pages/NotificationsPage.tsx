import {useState, useEffect} from 'react';
import { useAuth } from '../store/useAuth';
import { useLang } from '../store/langStore';
import type { Notification } from '../types';
import { getNotifications, markAsRead } from '../api/notifications';
import { acceptInvitation, declineInvitation } from '../api/projects';
import { useNotifications } from '../store/notificationStore';

function NotificationsPage() {
    const {user} = useAuth();
    const { t } = useLang();
    const { refresh: refreshBadge } = useNotifications();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            getNotifications()
                .then((data) => {
                    setNotifications(data);
                    setLoading(false);
                    refreshBadge();
                })
                .catch((err) => {
                    setError(err.message);
                    setLoading(false);
                });
        }
    }, [user]);

    function handleAccept(notification: Notification) {
        if (!notification.referenceId) return;
        acceptInvitation(notification.referenceId)
            .then(() => {
                setNotifications(prev => prev.filter(n => n.id !== notification.id));
                refreshBadge();
            })
            .catch(console.error);
    }

    function handleDecline(notification: Notification) {
        if (!notification.referenceId) return;
        declineInvitation(notification.referenceId)
            .then(() => {
                setNotifications(prev => prev.filter(n => n.id !== notification.id));
                refreshBadge();
            })
            .catch(console.error);
    }

    if (loading) {
        return <div>{t.loading}</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="page">
            <div className="page-header">
                <h1>{t.notifications}</h1>
            </div>
            {notifications.length === 0 ? (
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', gap: '12px'}}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--border-light)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    <p style={{color: 'var(--text-secondary)', fontSize: '15px', margin: 0}}>{t.noNotifications}</p>
                </div>
            ) : (
                <>
                    {notifications.map((notification) => (
                        <div className="card" key={notification.id} style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap: '12px'}}>
                            <span style={notification.isRead ? {color: 'var(--text-secondary)'} : {}}>{notification.message}</span>
                            {notification.type === 'project_invitation' && !notification.isRead ? (
                                <div style={{display:'flex', gap:'8px', flexShrink: 0}}>
                                    <button className="btn btn-primary btn-sm" onClick={() => handleAccept(notification)}>{t.acceptInvitation}</button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => handleDecline(notification)}>{t.declineInvitation}</button>
                                </div>
                            ) : !notification.isRead && (
                                <button className="btn btn-ghost btn-sm" style={{flexShrink: 0}} onClick={() => markAsRead(notification.id)}>{t.markAsRead}</button>
                            )}
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}

export default NotificationsPage;