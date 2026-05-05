import { useState } from "react";
import { register } from "../api/auth";
import { Link } from "react-router-dom";
import { useLang } from "../store/langStore";

function RegisterPage() {
    const { t } = useLang();
    const [error, setError] = useState("");
    const [registered, setRegistered] = useState(false);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const firstName = formData.get("firstName") as string;
        const lastName = formData.get("lastName") as string;
        const role = formData.get("role") as "Student" | "Teacher" | "Admin";

        register(firstName, lastName, email, password, role)
            .then(() => {
                setRegistered(true);
            })
            .catch((error) => {
                console.error("Registration failed:", error);
                const errors = error.response?.data?.errors;
                if (errors) {
                    const firstError = Object.values(errors)[0] as string[];
                    setError(firstError[0]);
                } else {
                    setError(error.response?.data?.message || t.failedRegister);
                }
            });
    };

    if (registered) {
        return (
            <div className="auth-page">
                <div className="auth-card" style={{ textAlign: 'center' }}>
                    <h2 style={{ color: 'var(--success)' }}>{t.checkEmailTitle}</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '12px', lineHeight: '1.6' }}>{t.checkEmailDesc}</p>
                    <Link to="/login" style={{ display: 'inline-block', marginTop: '24px' }}>
                        <button className="btn btn-primary">{t.backToLogin}</button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>{t.register}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="firstName">{t.firstName}</label>
                        <input className="input" type="text" id="firstName" name="firstName" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="lastName">{t.lastName}</label>
                        <input className="input" type="text" id="lastName" name="lastName" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">{t.email}</label>
                        <input className="input" type="email" id="email" name="email" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">{t.password}</label>
                        <input className="input" type="password" id="password" name="password" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="role">{t.role}</label>
                        <select className="input" id="role" name="role" required>
                            <option value="Student">{t.student}</option>
                            <option value="Teacher">{t.teacher}</option>
                        </select>
                    </div>
                    {error && <p className="error-msg">{error}</p>}
                    <button className="btn btn-primary" style={{width: '100%', marginTop: '8px'}} type="submit">{t.register}</button>
                </form>
            </div>
        </div>
    );
}

export default RegisterPage;
