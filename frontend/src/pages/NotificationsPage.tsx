import {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/useAuth';
import { useLang } from '../store/langStore';
import type { Notification } from '../types';
import { getNotifications, markAsRead, deleteNotification } from '../api/notifications';
import { acceptInvitation, declineInvitation } from '../api/projects';
import { useNotifications } from '../store/notificationStore';
import { useToast } from '../components/Toast';

function NotificationsPage() {
    const { user } = useAuth();
    const { t } = useLang();
    const navigate = useNavigate();
    const { refresh: refreshBadge } = useNotifications();
    const { showToast } = useToast();
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

    function handleMarkAsRead(notification: Notification) {
        markAsRead(notification.id)
            .then(() => {
                setNotifications(prev => prev.map(n =>
                    n.id === notification.id ? { ...n, isRead: true } : n
                ));
                refreshBadge();
            })
            .catch(console.error);
    }

    function handleDelete(id: string) {
        deleteNotification(id)
            .then(() => {
                setNotifications(prev => prev.filter(n => n.id !== id));
                refreshBadge();
            })
            .catch(console.error);
    }

    function handleAccept(notification: Notification) {
        if (!notification.referenceId) return;
        acceptInvitation(notification.referenceId)
            .then(() => {
                setNotifications(prev => prev.filter(n => n.id !== notification.id));
                refreshBadge();
                showToast(t.invitationAccepted, 'success');
                navigate(`/projects/${notification.referenceId}`);
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

    if (loading) return <div>{t.loading}</div>;
    if (error) return <div>Error: {error}</div>;

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
                notifications.map((notification) => (
                    <div className="card" key={notification.id} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '8px', opacity: notification.isRead ? 0.65 : 1}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0}}>
                            {!notification.isRead && (
                                <div style={{width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0}} />
                            )}
                            <span style={{fontSize: '14px', wordBreak: 'break-word'}}>{notification.message}</span>
                        </div>
                        <div style={{display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center'}}>
                            {notification.type === 'project_invitation' && !notification.isRead ? (
                                <>
                                    <button className="btn btn-primary btn-sm" onClick={() => handleAccept(notification)}>{t.acceptInvitation}</button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => handleDecline(notification)}>{t.declineInvitation}</button>
                                </>
                            ) : !notification.isRead && (
                                <button className="btn btn-ghost btn-sm" onClick={() => handleMarkAsRead(notification)}>{t.markAsRead}</button>
                            )}
                            <button
                                className="btn btn-ghost btn-sm"
                                style={{color: 'var(--text-secondary)', padding: '4px 6px'}}
                                title={t.deleteNotification}
                                onClick={() => handleDelete(notification.id)}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default NotificationsPage;
