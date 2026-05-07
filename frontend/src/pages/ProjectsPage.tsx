import {useState, useEffect} from 'react';
import { getProjects, createProject } from '../api/projects';
import { useAuth } from '../store/useAuth';
import { useLang } from '../store/langStore';
import type { Project } from '../types';
import { Link } from 'react-router-dom';
import RichTextEditor from '../components/RichTextEditor';
import RichTextDisplay from '../components/RichTextDisplay';

function ProjectsPage() {
    const {user} = useAuth();
    const { t } = useLang();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');


    useEffect(() => {
        getProjects()
            .then((data) => {
                setProjects(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [user]);

    if (loading) {
        return <div>{t.loading}</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    function handleCreate() {
    try {
        createProject(newTitle, newDescription)
            .then((data) => {
                setProjects([...projects, data]);
                setShowModal(false);
                setNewTitle('');
                setNewDescription('');
            }
            ).catch((err) => {
                setError(err.message);
            });
    } catch (err) {
        setError((err as Error).message);
    }
    


}

    return (
        <div className="page">
            <div className="page-header">
                <h1>{t.projects}</h1>
                <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px'}}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 2V14M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        {t.createProject}
                    </button>
            </div>
            
            {projects.map((project) => {
                const isOwner = project.teacherId === user?.id;
                return (
                    <Link className="card-link" key={project.id} to={`/projects/${project.id}`}>
                        <div className="card">
                            <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px'}}>
                                <h2 className="card-title" style={{margin: 0}}>{project.title}</h2>
                                <span style={{
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    padding: '2px 8px',
                                    borderRadius: '999px',
                                    background: isOwner ? 'rgba(88,166,255,0.15)' : 'var(--bg-secondary)',
                                    color: isOwner ? 'var(--primary)' : 'var(--text-secondary)',
                                    border: '1px solid ' + (isOwner ? 'var(--primary)' : 'var(--border)'),
                                    flexShrink: 0,
                                }}>
                                    {isOwner ? t.teacher : t.student}
                                </span>
                            </div>
                            <RichTextDisplay html={project.description ?? ''} style={{fontSize: '14px', color: 'var(--text-secondary)'}} />
                        </div>
                    </Link>
                );
            })}
            
            {showModal && (
                <div className="modal-overlay">
                <div className="modal">
                    <h3>{t.newProject}</h3>
                    <div className="form-group">
                        <label>{t.title}</label>
                        <input className="input" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder={t.title} />
                    </div>
                    <div className="form-group">
                        <label>{t.description}</label>
                        <RichTextEditor value={newDescription} onChange={setNewDescription} placeholder={t.description} minHeight="100px" />
                    </div>
                    <div style={{display:'flex', gap:'8px', justifyContent:'flex-end', marginTop:'20px'}}>
                        <button className="btn btn-ghost" onClick={() => setShowModal(false)}>{t.cancel}</button>
                        <button className="btn btn-primary" onClick={handleCreate}>{t.create}</button>
                    </div>
                </div>
            </div>
        )}
        </div>
    );

}





export default ProjectsPage;
