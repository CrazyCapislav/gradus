import {useParams} from 'react-router-dom';
import { getStageById } from '../api/stages';
import { useEffect, useState } from 'react';
import type { Stage, StageResult } from '../types';
import {useAuth} from '../store/useAuth';
import { useLang } from '../store/langStore';
import { submitStageResult, getStageResults } from '../api/stageResults';
import { gradeStageResult } from '../api/grades';
import { uploadFile } from '../api/fileAttachments';

function StageDetailPage() {
    const { projectId, stageId } = useParams();
    const [stage, setStage] = useState<Stage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<StageResult[]>([]);
    const [contentText, setContentText] = useState('');
    const { user } = useAuth();
    const { t } = useLang();
    const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
    const [score, setScore] = useState<number>(0);
    const [feedback, setFeedback] = useState<string>('');
    const [files, setFiles] = useState<FileList | null>(null);
    

    function handleSubmit() {
        if (projectId && stageId) {
            submitStageResult(projectId, stageId, contentText)
                .then((result) => {
                    if (files) {
                        const uploads = Array.from(files).map(file => uploadFile(result.id, file));
                        return Promise.all(uploads);
                    }
                    
                })
                .then(() => {
                    setContentText('');
                    setFiles(null);
                    alert('Stage result submitted!');
                }
                ).catch((err) => {
                    setError(err.message);
                }
                );
        }
    }
    function handleGrade(resultId: string) {
        gradeStageResult(resultId, score, feedback)
            .then(() => {
                alert('Graded!');
                setSelectedResultId(null);
            
            }).catch((err) => {
                setError(err.message);
            });
    }
    useEffect(() => {
        if (user?.role == "Teacher") {
            getStageResults(projectId!, stageId!)
                .then((data) => {
                    setResults(data);
                    console.log('Stage results:', data);
                }).catch((err) => {
                    console.error('Error fetching stage results:', err);
                }); 

        }
        }, [user, projectId, stageId]);

    useEffect(() => {
        if (projectId && stageId) {
            getStageById(projectId, stageId)
                .then((data: Stage) => {
                    setStage(data);
                    setLoading(false);
                })
                .catch((err: Error) => {
                    setError(err.message);
                    setLoading(false);
                });
        }
    }, [projectId, stageId]);

    if (loading) {
        return <div>{t.loading}</div>;
    }
    if (error) {
        return <div>Error: {error}</div>;
    }
    return (
        <div className="page">
            <h1>{stage?.title}</h1>
            <p style={{color: 'var(--text-secondary)', marginBottom: '24px'}}>{stage?.description}</p>
            <div className="card">
                {user?.role === 'Student' && (
                    <>
                    <div className="form-group">
                        <label>{t.text}</label>
                        <textarea className="input" value={contentText} onChange={(e) => setContentText(e.target.value)}/>
                    </div>
                    <div className="form-group">
                        <label>{t.attachments}</label>
                        <input type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.zip"
                        onChange={(e) => setFiles(e.target.files)}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={handleSubmit}>{t.submitResult}</button>
                    </>
                )}
            </div>
            <div className="card">
                {user?.role === 'Teacher' && (
                    <>
                        <h2>{t.submittedResults}</h2>
                        {results.map(result => (
                            <div key={result.id} style={{borderBottom: '1px solid var(--border)', padding: '16px 0'}}>
                                <p>{result.contentText}</p>
                                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedResultId(result.id)}>{t.grade}</button>
                                {selectedResultId === result.id && (
                                    <div style={{marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                                        <input className="input" type="number" value={score} onChange={(e) => setScore(Number(e.target.value))} placeholder={t.score} />
                                        <textarea className="input" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder={t.feedback} />
                                        <button className="btn btn-primary btn-sm" onClick={() => handleGrade(result.id)}>{t.submitGrade}</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
    
}

export default StageDetailPage;