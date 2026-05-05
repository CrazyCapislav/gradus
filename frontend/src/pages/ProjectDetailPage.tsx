import {useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import { getStages, createStage } from '../api/stages';
import { addMember } from '../api/projects';
import { searchUserByEmail } from '../api/users';
import type { Stage, User } from '../types/index';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/useAuth';
import { useLang } from '../store/langStore';

function ProjectDetailPage() {
    const { projectId } = useParams();
    const { user } = useAuth();
    const { t } = useLang();
    const [stages, setStages] = useState<Stage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newOrder, setNewOrder] = useState(1);

    const [inviteEmail, setInviteEmail] = useState('');
    const [foundUser, setFoundUser] = useState<User | null>(null);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (projectId) {
            getStages(projectId)
                .then((data) => {
                    setStages(data);
                    setLoading(false);
                })
                .catch((err) => {
                    setError(err.message);
                    setLoading(false);
                });
        }
    }, [projectId]);

    function handleCreate() {
        createStage(projectId!, newTitle, newDescription, newOrder)
            .then((data) => {
                setStages([...stages, data]);
                setShowModal(false);
                setNewTitle('');
                setNewDescription('');
                setNewOrder(stages.length + 2);
            })
            .catch((err) => setError(err.message));
    }

    function handleSearch() {
        setFoundUser(null);
        setSearchError(null);
        setInviteSuccess(null);
        searchUserByEmail(inviteEmail)
            .then((data) => setFoundUser(data))
            .catch(() => setSearchError(t.userNotFound));
    }

    function handleAddMember() {
        if (!foundUser) return;
        addMember(projectId!, foundUser.id)
            .then(() => {
                setInviteSuccess(t.memberAdded);
                setFoundUser(null);
                setInviteEmail('');
            })
            .catch((err) => setSearchError(err.message));
    }

    if (loading) {
        return <div>{t.loading}</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="page">
            <div className="page-header">
                <h1>{t.stages}</h1>
                {user?.role === 'Teacher' && (
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>{t.createStage}</button>
                )}
            </div>

            {user?.role === 'Teacher' && (
                <div className="card" style={{marginBottom: '24px'}}>
                    <h2>{t.inviteStudent}</h2>
                    <div style={{display: 'flex', gap: '8px', marginTop: '12px'}}>
                        <input
                            className="input"
                            value={inviteEmail}
                            onChange={e => setInviteEmail(e.target.value)}
                            placeholder={t.searchByEmail}
                            style={{flex: 1}}
                        />
                        <button className="btn btn-secondary" onClick={handleSearch}>{t.search}</button>
                    </div>
                    {searchError && <p className="error-msg" style={{marginTop: '8px'}}>{searchError}</p>}
                    {inviteSuccess && <p style={{color: 'var(--success)', fontSize: '13px', marginTop: '8px'}}>{inviteSuccess}</p>}
                    {foundUser && (
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', padding: '12px', background: 'var(--card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)'}}>
                            <div>
                                <p style={{fontWeight: 600}}>{foundUser.firstName} {foundUser.lastName}</p>
                                <p style={{fontSize: '13px', color: 'var(--text-secondary)'}}>{foundUser.email}</p>
                            </div>
                            <button className="btn btn-primary btn-sm" onClick={handleAddMember}>{t.addToProject}</button>
                        </div>
                    )}
                </div>
            )}

            {stages.map((stage) => (
                <Link className="card-link" to={`/projects/${projectId}/stages/${stage.id}`} key={stage.id}>
                    <div className="card">
                        <h2 className="card-title">{stage.title}</h2>
                        <p className="card-desc">{stage.description}</p>
                    </div>
                </Link>
            ))}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>{t.newStage}</h3>
                        <div className="form-group">
                            <label>{t.title}</label>
                            <input className="input" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder={t.title} />
                        </div>
                        <div className="form-group">
                            <label>{t.description}</label>
                            <input className="input" value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder={t.description} />
                        </div>
                        <div className="form-group">
                            <label>{t.order}</label>
                            <input className="input" type="number" value={newOrder} onChange={e => setNewOrder(Number(e.target.value))} min={1} />
                        </div>
                        <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px'}}>
                            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>{t.cancel}</button>
                            <button className="btn btn-primary" onClick={handleCreate}>{t.create}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProjectDetailPage;
