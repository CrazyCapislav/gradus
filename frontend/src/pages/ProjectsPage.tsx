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
            
            {projects.map((project) => (
                <Link className="card-link" key={project.id} to={`/projects/${project.id}`}>
                    <div className="card">
                        <h2 className="card-title">{project.title}</h2>
                        <RichTextDisplay html={project.description ?? ''} style={{fontSize: '14px', color: 'var(--text-secondary)'}} />
                    </div>
                </Link>
            ))}
            
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
