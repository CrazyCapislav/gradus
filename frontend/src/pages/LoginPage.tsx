import { useState } from "react";
import { login } from "../api/auth";
import { useAuth } from "../store/useAuth";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useLang } from "../store/langStore";

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:3000';
const GOOGLE_AUTH_URL = `${API_BASE}/api/auth/google`;
const ITMO_AUTH_URL = `${API_BASE}/api/auth/itmo`;

function LoginPage() {
    const { setUser, setAccessToken } = useAuth();
    const { t } = useLang();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const urlError = searchParams.get('error');
    const [error, setError] = useState(
        urlError === 'google_failed' ? t.googleFailed :
        urlError === 'itmo_failed' ? t.itmoFailed : ""
    );

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        login(email, password)
            .then(({ user, accessToken }) => {
                setUser(user);
                setAccessToken(accessToken);
                navigate("/projects");
            })
            .catch((err) => {
                const message = err.response?.data?.message;
                if (message === "Email not confirmed") {
                    setError(t.emailNotConfirmed);
                } else {
                    setError(t.invalidCredentials);
                }
            });
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>{t.login}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">{t.email}</label>
                        <input className="input" type="email" id="email" name="email" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">{t.password}</label>
                        <input className="input" type="password" id="password" name="password" required />
                    </div>
                    {error && <p className="error-msg">{error}</p>}
                    <button className="btn btn-primary" type="submit" style={{width: '100%', marginTop: '8px'}}>{t.login}</button>
                </form>

                <div style={{display: 'flex', alignItems: 'center', gap: '8px', margin: '16px 0'}}>
                    <div style={{flex: 1, height: '1px', background: 'var(--border)'}} />
                    <span style={{fontSize: '13px', color: 'var(--text-hint)'}}>{t.or}</span>
                    <div style={{flex: 1, height: '1px', background: 'var(--border)'}} />
                </div>

                <a href={GOOGLE_AUTH_URL} style={{display: 'block', textDecoration: 'none'}}>
                    <button className="btn btn-secondary" type="button" style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
                        <svg width="18" height="18" viewBox="0 0 48 48">
                            <path d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.5-.4-3.5z" fill="#FFC107"/>
                            <path d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4c-7.7 0-14.4 4.4-17.7 10.7z" fill="#FF3D00"/>
                            <path d="M24 44c5.3 0 10.1-2 13.7-5.3l-6.3-5.3C29.4 35.1 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-7.8L6 33.3C9.3 39.6 16.1 44 24 44z" fill="#4CAF50"/>
                            <path d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6.3 5.3C41.8 36.1 44 30.4 44 24c0-1.2-.1-2.5-.4-3.5z" fill="#1976D2"/>
                        </svg>
                        {t.loginWithGoogle}
                    </button>
                </a>

                <a href={ITMO_AUTH_URL} style={{display: 'block', textDecoration: 'none', marginTop: '8px'}}>
                    <button className="btn btn-secondary" type="button" style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
                        <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                            <rect width="32" height="32" rx="6" fill="#0033A0"/>
                            <text x="16" y="22" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="Arial">IT</text>
                        </svg>
                        {t.loginWithItmo}
                    </button>
                </a>

                <p style={{textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--text-secondary)'}}>
                    {t.noAccount} <Link to="/register">{t.registerHere}</Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
