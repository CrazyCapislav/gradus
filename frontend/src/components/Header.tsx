import {Link, useNavigate} from 'react-router-dom';
import { useAuth } from '../store/useAuth';
import { useLang } from '../store/langStore';

function Header() {
    const { user, logout } = useAuth();
    const { t, lang, toggleLang } = useLang();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate('/login');
    }

    if (!user) { return null; }

    return (
        <header className="header">
            <nav className="header-nav">
                <Link to="/projects">{t.projects}</Link>
                <Link to="/notifications">{t.notifications}</Link>
                {user.role === 'Admin' && (
                    <Link to="/admin">{t.adminPanel}</Link>
                )}
            </nav>
            <span style={{fontSize: '14px', color: 'var(--text-secondary)'}}>{t.welcome}, {user.firstName}!</span>
            <button className="btn btn-ghost btn-sm" onClick={toggleLang}>{lang === 'ru' ? 'EN' : 'RU'}</button>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>{t.logout}</button>
        </header>
    );
}

export default Header;

