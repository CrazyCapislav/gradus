import {useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import { getStages, createStage } from '../api/stages';
import { inviteUser, getProjectById } from '../api/projects';
import { listUsers } from '../api/users';
import RichTextEditor from '../components/RichTextEditor';
import RichTextDisplay from '../components/RichTextDisplay';
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
    const [newSoftDeadline, setNewSoftDeadline] = useState('');
    const [newHardDeadline, setNewHardDeadline] = useState('');
    const [isTeacher, setIsTeacher] = useState(false);

    const [inviteEmail, setInviteEmail] = useState('');
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (!projectId) return;
        Promise.all([
            getStages(projectId),
            getProjectById(projectId),
        ]).then(([stagesData, project]) => {
            setStages(stagesData);
            const teacher = project.teacherId === user?.id;
            setIsTeacher(teacher);
            setLoading(false);
            if (teacher) {
                listUsers().then(setAllUsers).catch(console.error);
            }
        }).catch((err) => {
            setError(err.message);
            setLoading(false);
        });
    }, [projectId, user]);

    function handleCreate() {
        createStage(projectId!, newTitle, newDescription, newOrder, newSoftDeadline || undefined, newHardDeadline || undefined)
            .then((data) => {
                setStages([...stages, data]);
                setShowModal(false);
                setNewTitle('');
                setNewDescription('');
                setNewOrder(stages.length + 2);
                setNewSoftDeadline('');
                setNewHardDeadline('');
            })
            .catch((err) => setError(err.message));
    }

    function handleAddMember(memberId: string) {
        setSearchError(null);
        setInviteSuccess(null);
        inviteUser(projectId!, memberId)
            .then(() => setInviteSuccess(t.inviteSent))
            .catch((err) => {
                const msg = err.response?.data?.message;
                setSearchError(msg === "Invitation already sent" ? t.inviteAlreadySent : err.message);
            });
    }

    const filteredUsers = allUsers.filter(u =>
        u.id !== user?.id &&
        (inviteEmail === '' ||
            u.email.toLowerCase().includes(inviteEmail.toLowerCase()) ||
            `${u.firstName} ${u.lastName}`.toLowerCase().includes(inviteEmail.toLowerCase()))
    );

    if (loading) return <div>{t.loading}</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="page">
            <div className="page-header">
                <h1>{t.stages}</h1>
                {isTeacher && (
                    <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px'}}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 2V14M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        {t.createStage}
                    </button>
                )}
            </div>

            {isTeacher && (
                <div className="card" style={{marginBottom: '24px'}}>
                    <h2>{t.inviteStudent}</h2>
                    <input
                        className="input"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        placeholder={t.searchByEmail}
                        style={{marginTop: '12px'}}
                    />
                    {searchError && <p className="error-msg" style={{marginTop: '8px'}}>{searchError}</p>}
                    {inviteSuccess && <p style={{color: 'var(--success)', fontSize: '13px', marginTop: '8px'}}>{inviteSuccess}</p>}
                    <div style={{marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto'}}>
                        {filteredUsers.map(u => (
                            <div key={u.id} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)'}}>
                                <div>
                                    <p style={{fontWeight: 600, margin: 0}}>{u.firstName} {u.lastName}</p>
                                    <p style={{fontSize: '13px', color: 'var(--text-secondary)', margin: 0}}>{u.email}</p>
                                </div>
                                <button className="btn btn-primary" onClick={() => handleAddMember(u.id)} style={{width: '32px', height: '32px', padding: 0, borderRadius: '6px', flexShrink: 0, fontSize: '20px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>+</button>
                            </div>
                        ))}
                        {filteredUsers.length === 0 && (
                            <p style={{color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center', padding: '12px 0'}}>{t.userNotFound}</p>
                        )}
                    </div>
                </div>
            )}

            {stages.map((stage, index) => (
                <Link className="card-link" to={`/projects/${projectId}/stages/${stage.id}`} key={stage.id}>
                    <div className="card">
                        <h2 className="card-title">
                            <span style={{color: 'var(--text-secondary)', fontWeight: 400, marginRight: '8px'}}>{index + 1}.</span>
                            {stage.title}
                        </h2>
                        <RichTextDisplay html={stage.description ?? ''} style={{fontSize: '14px', color: 'var(--text-secondary)'}} />
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
                            <RichTextEditor value={newDescription} onChange={setNewDescription} placeholder={t.description} minHeight="100px" />
                        </div>
                        <div className="form-group">
                            <label>{t.order}</label>
                            <input className="input" type="number" value={newOrder} onChange={e => setNewOrder(Number(e.target.value))} min={1} />
                        </div>
                        <div className="form-group">
                            <label>{t.softDeadline}</label>
                            <input className="input" type="datetime-local" value={newSoftDeadline} onChange={e => setNewSoftDeadline(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>{t.hardDeadline}</label>
                            <input className="input" type="datetime-local" value={newHardDeadline} onChange={e => setNewHardDeadline(e.target.value)} />
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
