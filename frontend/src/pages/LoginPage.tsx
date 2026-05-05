import { useState } from "react";
import { login } from "../api/auth";
import { useAuth } from "../store/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { useLang } from "../store/langStore";

function LoginPage() {
    const { setUser, setAccessToken } = useAuth();
    const { t } = useLang();
    const navigate = useNavigate();
    const [error, setError] = useState("");

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
                    <p style={{textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--text-secondary)'}}>
                        {t.noAccount} <Link to="/register">{t.registerHere}</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;
