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
                <NavLink to="/notifications" style={{position: 'relative'}}>
                    {t.notifications}
                    {unreadCount > 0 && (
                        <span style={{position:'absolute', top:'-6px', right:'-10px', background:'var(--error)', color:'#fff', borderRadius:'50%', fontSize:'11px', fontWeight:700, minWidth:'18px', height:'18px', display:'flex', alignItems:'center', justifyContent:'center', padding:'0 4px', lineHeight:1}}>
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
