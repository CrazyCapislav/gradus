import { useState, useEffect } from 'react';
import { listUsers, deleteUser } from '../api/users';
import { getAllProjects, deleteProject } from '../api/projects';
import { useLang } from '../store/langStore';
import type { User, Project } from '../types/index';

function AdminPage() {
    const { t } = useLang();
    const [users, setUsers] = useState<User[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([listUsers(), getAllProjects()])
            .then(([usersData, projectsData]) => {
                setUsers(usersData);
                setProjects(projectsData);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    function handleDeleteUser(userId: string) {
        if (!window.confirm(t.confirmDeleteUser)) return;
        deleteUser(userId)
            .then(() => setUsers(users.filter(u => u.id !== userId)))
            .catch((err) => setError(err.message));
    }

    function handleDeleteProject(projectId: string) {
        if (!window.confirm(t.confirmDeleteProject)) return;
        deleteProject(projectId)
            .then(() => setProjects(projects.filter(p => p.id !== projectId)))
            .catch((err) => setError(err.message));
    }

    if (loading) return <div>{t.loading}</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="page">
            <div className="page-header">
                <h1>{t.adminPanel}</h1>
            </div>

            <div className="card" style={{ marginBottom: '24px' }}>
                <h2>{t.allUsers}</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                            <th style={{ padding: '8px', color: 'var(--text-secondary)', fontWeight: 500 }}>Email</th>
                            <th style={{ padding: '8px', color: 'var(--text-secondary)', fontWeight: 500 }}>{t.firstName}</th>
                            <th style={{ padding: '8px', color: 'var(--text-secondary)', fontWeight: 500 }}>{t.lastName}</th>
                            <th style={{ padding: '8px', color: 'var(--text-secondary)', fontWeight: 500 }}>{t.role}</th>
                            <th style={{ padding: '8px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '8px', fontSize: '14px' }}>{u.email}</td>
                                <td style={{ padding: '8px', fontSize: '14px' }}>{u.firstName}</td>
                                <td style={{ padding: '8px', fontSize: '14px' }}>{u.lastName}</td>
                                <td style={{ padding: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>{u.role}</td>
                                <td style={{ padding: '8px' }}>
                                    {u.role !== 'Admin' && (
                                        <button className="btn btn-sm" style={{ background: 'var(--error)', color: '#fff', border: 'none' }} onClick={() => handleDeleteUser(u.id)}>
                                            {t.delete}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card">
                <h2>{t.allProjects}</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                            <th style={{ padding: '8px', color: 'var(--text-secondary)', fontWeight: 500 }}>{t.title}</th>
                            <th style={{ padding: '8px', color: 'var(--text-secondary)', fontWeight: 500 }}>{t.description}</th>
                            <th style={{ padding: '8px', color: 'var(--text-secondary)', fontWeight: 500 }}>Status</th>
                            <th style={{ padding: '8px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map(p => (
                            <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '8px', fontSize: '14px' }}>{p.title}</td>
                                <td style={{ padding: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>{p.description ?? '—'}</td>
                                <td style={{ padding: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>{p.status}</td>
                                <td style={{ padding: '8px' }}>
                                    <button className="btn btn-sm" style={{ background: 'var(--error)', color: '#fff', border: 'none' }} onClick={() => handleDeleteProject(p.id)}>
                                        {t.delete}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminPage;
