import {NavLink, useNavigate} from 'react-router-dom';
import { useAuth } from '../store/useAuth';
import { useLang } from '../store/langStore';
import { useNotifications } from '../store/notificationStore';

function Header() {
    const { user, logout } = useAuth();
    const { t, lang, toggleLang } = useLang();
    const { unreadCount } = useNotifications();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate('/login');
    }

    if (!user) { return null; }

    return (
        <header className="header">
            <nav className="header-nav">
                <NavLink to="/projects">{t.projects}</NavLink>
                <NavLink to="/notifications" style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    {unreadCount > 0 && (
                        <span style={{position:'absolute', top:'-6px', right:'-8px', background:'var(--error)', color:'#fff', borderRadius:'50%', fontSize:'11px', fontWeight:700, minWidth:'18px', height:'18px', display:'flex', alignItems:'center', justifyContent:'center', padding:'0 4px', lineHeight:1}}>
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </NavLink>
                {user.role === 'Admin' && (
                    <NavLink to="/admin">{t.adminPanel}</NavLink>
                )}
            </nav>
            <span style={{fontSize: '14px', color: 'var(--text-secondary)'}}>{t.welcome}, {user.firstName}!</span>
            <button className="btn btn-ghost btn-sm" onClick={toggleLang}>{lang === 'ru' ? 'EN' : 'RU'}</button>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>{t.logout}</button>
        </header>
    );
}

export default Header;
