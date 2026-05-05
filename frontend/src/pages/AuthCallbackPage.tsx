import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getMe } from '../api/auth';
import { setToken } from '../api/client';
import { useAuth } from '../store/useAuth';
import { useLang } from '../store/langStore';

function AuthCallbackPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setUser, setAccessToken } = useAuth();
    const { t } = useLang();

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error || !token) {
            navigate(`/login?error=${error ?? 'google_failed'}`);
            return;
        }

        setToken(token);
        getMe()
            .then((user) => {
                setAccessToken(token);
                setUser(user);
                navigate('/projects');
            })
            .catch(() => {
                setToken(null);
                navigate('/login?error=oauth_failed');
            });
    }, []);

    return (
        <div className="auth-page">
            <div className="auth-card" style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>{t.loading}</p>
            </div>
        </div>
    );
}

export default AuthCallbackPage;
