import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyEmail } from '../api/auth';
import { useLang } from '../store/langStore';

function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const { t } = useLang();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setStatus('error');
            return;
        }
        verifyEmail(token)
            .then(() => setStatus('success'))
            .catch(() => setStatus('error'));
    }, [searchParams]);

    return (
        <div className="auth-page">
            <div className="auth-card" style={{ textAlign: 'center' }}>
                {status === 'loading' && (
                    <p style={{ color: 'var(--text-secondary)' }}>{t.verifyingEmail}</p>
                )}
                {status === 'success' && (
                    <>
                        <h2 style={{ color: 'var(--success)' }}>{t.emailVerified}</h2>
                        <Link to="/login" style={{ display: 'inline-block', marginTop: '24px' }}>
                            <button className="btn btn-primary">{t.login}</button>
                        </Link>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <h2 style={{ color: 'var(--error)' }}>{t.verifyError}</h2>
                        <Link to="/register" style={{ display: 'inline-block', marginTop: '24px' }}>
                            <button className="btn btn-secondary">{t.register}</button>
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}

export default VerifyEmailPage;
