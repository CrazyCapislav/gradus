import {useParams} from 'react-router-dom';
import { getStageById } from '../api/stages';
import { getProjectById } from '../api/projects';
import { useEffect, useState, useRef } from 'react';
import type { Stage, StageResult, StageMaterial } from '../types';
import {useAuth} from '../store/useAuth';
import { useLang } from '../store/langStore';
import { submitStageResult, getStageResults, getMyResult, updateMyResult } from '../api/stageResults';
import { gradeStageResult } from '../api/grades';
import { uploadFile, downloadAttachment, deleteAttachment } from '../api/fileAttachments';
import { getMaterials, uploadMaterial, deleteMaterial, downloadMaterial } from '../api/stageMaterials';
import RichTextEditor from '../components/RichTextEditor';
import RichTextDisplay from '../components/RichTextDisplay';
import { useToast } from '../components/Toast';

function StageDetailPage() {
    const { projectId, stageId } = useParams();
    const [stage, setStage] = useState<Stage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<StageResult[]>([]);
    const [contentText, setContentText] = useState('');
    const [isTeacher, setIsTeacher] = useState(false);
    const { user } = useAuth();
    const { t } = useLang();
    const { showToast } = useToast();
    const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
    const [isAccepted, setIsAccepted] = useState<boolean | null>(null);
    const [feedback, setFeedback] = useState<string>('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [materials, setMaterials] = useState<StageMaterial[]>([]);
    const materialInputRef = useRef<HTMLInputElement>(null);
    const [myResult, setMyResult] = useState<StageResult | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState('');

    useEffect(() => {
        if (!projectId || !stageId) return;
        Promise.all([
            getStageById(projectId, stageId),
            getProjectById(projectId),
            getMaterials(projectId, stageId),
        ]).then(([stageData, project, materialsData]) => {
            setStage(stageData);
            setMaterials(materialsData);
            const teacher = project.teacherId === user?.id;
            setIsTeacher(teacher);
            setLoading(false);
            if (teacher) {
                getStageResults(projectId, stageId)
                    .then(setResults)
                    .catch(console.error);
            } else {
                getMyResult(projectId, stageId)
                    .then(setMyResult)
                    .catch(console.error);
            }
        }).catch((err: Error) => {
            setError(err.message);
            setLoading(false);
        });
    }, [projectId, stageId, user]);

    function handleMaterialUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file || !projectId || !stageId) return;
        uploadMaterial(projectId, stageId, file)
            .then(m => {
                setMaterials(prev => [...prev, m]);
                if (materialInputRef.current) materialInputRef.current.value = '';
            })
            .catch(err => setError(err.message));
    }

    function handleDeleteMaterial(materialId: string) {
        if (!projectId || !stageId) return;
        deleteMaterial(projectId, stageId, materialId)
            .then(() => setMaterials(prev => prev.filter(m => m.id !== materialId)))
            .catch(err => setError(err.message));
    }

    function handleSubmit() {
        if (projectId && stageId) {
            submitStageResult(projectId, stageId, contentText)
                .then((result) => {
                    setMyResult(result);
                    if (selectedFiles.length > 0) {
                        return Promise.all(selectedFiles.map(file => uploadFile(result.id, file)));
                    }
                })
                .then(() => {
                    setContentText('');
                    setSelectedFiles([]);
                    showToast(t.toastResultSubmitted, 'success');
                })
                .catch((err) => { setError(err.message); showToast(err.message, 'error'); });
        }
    }

    function handleStartEdit() {
        setEditText(myResult?.contentText ?? '');
        setIsEditing(true);
    }

    function handleSaveEdit() {
        if (!projectId || !stageId) return;
        updateMyResult(projectId, stageId, editText)
            .then((updated) => {
                setMyResult(prev => ({ ...updated, fileAttachments: prev?.fileAttachments }));
                setIsEditing(false);
                showToast(t.toastResultSaved, 'success');
            })
            .catch((err) => { showToast(err.message, 'error'); });
    }

    function handleDeleteAttachment(fileId: string) {
        if (!myResult) return;
        deleteAttachment(myResult.id, fileId)
            .then(() => {
                setMyResult(prev => prev ? { ...prev, fileAttachments: prev.fileAttachments?.filter(f => f.id !== fileId) } : prev);
            })
            .catch((err) => { showToast(err.message, 'error'); });
    }

    function handleAddAttachment(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file || !myResult) return;
        uploadFile(myResult.id, file)
            .then(() => getMyResult(projectId!, stageId!))
            .then(updated => { if (updated) setMyResult(updated); })
            .catch((err) => { showToast(err.message, 'error'); });
        e.target.value = '';
    }

    function handleGrade(resultId: string) {
        if (isAccepted === null) return;
        gradeStageResult(resultId, isAccepted, feedback || undefined)
            .then((grade) => {
                setResults(prev => prev.map(r => r.id === resultId ? { ...r, grade } : r));
                showToast(t.toastGradeSubmitted, 'success');
                setSelectedResultId(null);
                setIsAccepted(null);
                setFeedback('');
            })
            .catch((err) => { setError(err.message); showToast(err.message, 'error'); });
    }

    if (loading) return <div>{t.loading}</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="page">
            <h1 style={{marginBottom: '16px'}}>{stage?.title}</h1>

            <div className="card" style={{marginBottom: '16px'}}>
                {(stage?.description && stage.description !== '<p></p>') && (
                    <>
                        <RichTextDisplay html={stage.description} style={{fontSize: '14px', color: 'var(--text-secondary)', marginBottom: (stage.softDeadline || stage.hardDeadline) ? '16px' : '0'}} />
                        {(stage.softDeadline || stage.hardDeadline) && <hr style={{border: 'none', borderTop: '1px solid var(--border)', margin: '0 0 12px'}} />}
                    </>
                )}
                {(stage?.softDeadline || stage?.hardDeadline) ? (
                    <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                        {stage.softDeadline && (() => {
                            const passed = new Date(stage.softDeadline) < new Date();
                            return (
                                <div style={{display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: 'var(--radius-sm)', border: `1px solid ${passed ? '#E3B341' : 'var(--border)'}`, background: passed ? 'rgba(227,179,65,0.08)' : 'transparent', fontSize: '13px', color: passed ? '#E3B341' : 'var(--text-secondary)'}}>
                                    {passed ? '⚠' : '○'} {t.softDeadline}: {new Date(stage.softDeadline).toLocaleString('ru')}
                                </div>
                            );
                        })()}
                        {stage.hardDeadline && (() => {
                            const passed = new Date(stage.hardDeadline) < new Date();
                            return (
                                <div style={{display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: 'var(--radius-sm)', border: `1px solid ${passed ? 'var(--error)' : 'var(--border)'}`, background: passed ? 'rgba(248,81,73,0.08)' : 'transparent', fontSize: '13px', color: passed ? 'var(--error)' : 'var(--text-secondary)'}}>
                                    {passed ? '⛔' : '○'} {t.hardDeadline}: {new Date(stage.hardDeadline).toLocaleString('ru')}
                                </div>
                            );
                        })()}
                    </div>
                ) : (!stage?.description || stage.description === '<p></p>') && (
                    <p style={{margin: 0, color: 'var(--text-secondary)', fontSize: '14px'}}>{t.noDeadline}</p>
                )}
            </div>

            <div className="card" style={{marginBottom: '16px'}}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px'}}>
                    <h2 style={{margin: 0}}>{t.materials}</h2>
                    {isTeacher && (
                        <label className="btn btn-secondary btn-sm" style={{cursor: 'pointer', margin: 0}}>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{marginRight: '5px', verticalAlign: 'middle'}} xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 2V14M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            {t.uploadMaterial}
                            <input ref={materialInputRef} type="file" style={{display: 'none'}} onChange={handleMaterialUpload} />
                        </label>
                    )}
                </div>
                {materials.length === 0 ? (
                    <p style={{color: 'var(--text-secondary)', fontSize: '14px', margin: 0}}>{t.noMaterials}</p>
                ) : (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                        {materials.map(m => (
                            <div key={m.id} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)'}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0}}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{flexShrink: 0, color: 'var(--text-secondary)'}} xmlns="http://www.w3.org/2000/svg">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                                        <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                                    </svg>
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        style={{fontSize: '14px', color: 'var(--accent)', padding: 0, background: 'none', border: 'none', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left'}}
                                        onClick={() => downloadMaterial(projectId!, stageId!, m.id, m.originalName)}
                                    >
                                        {m.originalName}
                                    </button>
                                </div>
                                {isTeacher && (
                                    <button className="btn btn-ghost btn-sm" style={{color: 'var(--error)', flexShrink: 0}} onClick={() => handleDeleteMaterial(m.id)}>
                                        {t.deleteMaterial}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {!isTeacher && (
                <div className="card" style={{marginBottom: '16px'}}>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px'}}>
                        <h2 style={{margin: 0}}>{t.yourAnswer}</h2>
                        {myResult && !isEditing && (
                            <button className="btn btn-secondary btn-sm" onClick={handleStartEdit}>{t.editAnswer}</button>
                        )}
                    </div>

                    {myResult?.grade && !isEditing && (
                        <div style={{marginBottom: '16px', padding: '12px 16px', borderRadius: 'var(--radius-sm)', background: myResult.grade.isAccepted ? 'rgba(63,185,80,0.08)' : 'rgba(248,81,73,0.08)', border: `1px solid ${myResult.grade.isAccepted ? '#3FB950' : 'var(--error)'}`}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: myResult.grade.feedback ? '8px' : '0'}}>
                                <span style={{fontSize: '15px', fontWeight: 700, color: myResult.grade.isAccepted ? '#3FB950' : 'var(--error)'}}>
                                    {myResult.grade.isAccepted ? '✓ ' + t.accepted : '✗ ' + t.notAccepted}
                                </span>
                            </div>
                            {myResult.grade.feedback && (
                                <p style={{margin: 0, fontSize: '13px', color: 'var(--text-secondary)'}}><strong style={{color: 'var(--text)'}}>{t.feedback}:</strong> {myResult.grade.feedback}</p>
                            )}
                        </div>
                    )}

                    {myResult && !isEditing && (
                        <>
                            <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px'}}>
                                {myResult.isLate && (
                                    <span style={{display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', background: 'rgba(248,81,73,0.10)', border: '1px solid var(--error)', borderRadius: '999px', fontSize: '12px', color: 'var(--error)'}}>
                                        ⚠ {t.submittedLate}
                                    </span>
                                )}
                                {myResult.isEdited && (
                                    <span style={{display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', background: 'rgba(88,166,255,0.08)', border: '1px solid rgba(88,166,255,0.25)', borderRadius: '999px', fontSize: '12px', color: 'var(--accent)'}}>
                                        ✎ {t.edited}{myResult.editedAt ? ': ' + new Date(myResult.editedAt).toLocaleString('ru') : ''}
                                    </span>
                                )}
                                {myResult.editedAfterDeadline && (
                                    <span style={{display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', background: 'rgba(248,81,73,0.10)', border: '1px solid var(--error)', borderRadius: '999px', fontSize: '12px', color: 'var(--error)'}}>
                                        ⛔ {t.editedAfterDeadline}
                                    </span>
                                )}
                            </div>
                            <RichTextDisplay html={myResult.contentText ?? ''} style={{fontSize: '14px'}} />
                            {myResult.fileAttachments && myResult.fileAttachments.length > 0 && (
                                <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px'}}>
                                    {myResult.fileAttachments.map(f => (
                                        <button key={f.id} className="btn btn-ghost btn-sm" style={{display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', background: 'rgba(88,166,255,0.06)', border: '1px solid rgba(88,166,255,0.2)', borderRadius: '999px', fontSize: '12px', color: 'var(--accent)'}}
                                            onClick={() => downloadAttachment(myResult.id, f.id, f.originalName)}>
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                                            {f.originalName}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {myResult && isEditing && (
                        <>
                            <RichTextEditor value={editText} onChange={setEditText} placeholder="Введите текст ответа..." minHeight="150px" />
                            {myResult.fileAttachments && myResult.fileAttachments.length > 0 && (
                                <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px'}}>
                                    {myResult.fileAttachments.map(f => (
                                        <span key={f.id} style={{display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px 3px 10px', background: 'rgba(88,166,255,0.06)', border: '1px solid rgba(88,166,255,0.2)', borderRadius: '999px', fontSize: '12px', color: 'var(--accent)'}}>
                                            {f.originalName}
                                            <button onClick={() => handleDeleteAttachment(f.id)} style={{background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', color: 'var(--text-secondary)', lineHeight: 1, fontSize: '14px'}} title={t.delete}>×</button>
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div style={{display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center'}}>
                                <button className="btn btn-primary btn-sm" onClick={handleSaveEdit}>{t.saveChanges}</button>
                                <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>{t.cancelEdit}</button>
                                <label style={{display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)'}}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                                    </svg>
                                    {t.attachments}
                                    <input type="file" style={{display: 'none'}} onChange={handleAddAttachment} />
                                </label>
                            </div>
                        </>
                    )}

                    {!myResult && (
                        <>
                            <div className="form-group">
                                <label>{t.text}</label>
                                <RichTextEditor value={contentText} onChange={setContentText} placeholder="Введите текст ответа..." minHeight="150px" />
                            </div>
                            <div className="form-group">
                                <label>{t.attachments}</label>
                                <label style={{display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '6px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'var(--text-secondary)', background: 'var(--bg)', transition: 'border-color 0.15s, color 0.15s'}}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                                    </svg>
                                    Прикрепить файлы
                                    <input type="file" multiple accept=".pdf,.doc,.docx,.zip" style={{display: 'none'}}
                                        onChange={(e) => {
                                            const added = Array.from(e.target.files ?? []);
                                            setSelectedFiles(prev => {
                                                const existing = new Set(prev.map(f => f.name + f.size));
                                                return [...prev, ...added.filter(f => !existing.has(f.name + f.size))];
                                            });
                                            e.target.value = '';
                                        }} />
                                </label>
                                {selectedFiles.length > 0 && (
                                    <div style={{marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px'}}>
                                        {selectedFiles.map((f, i) => (
                                            <span key={i} style={{display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px 3px 10px', background: 'rgba(88,166,255,0.08)', border: '1px solid rgba(88,166,255,0.2)', borderRadius: '999px', fontSize: '12px', color: 'var(--accent)'}}>
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
                                                {f.name}
                                                <button onClick={() => setSelectedFiles(prev => prev.filter((_, j) => j !== i))} style={{background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', color: 'var(--text-secondary)', lineHeight: 1, fontSize: '14px'}} title="Убрать">×</button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button className="btn btn-primary" onClick={handleSubmit}>{t.submitResult}</button>
                        </>
                    )}
                </div>
            )}

            {isTeacher && (
                <div className="card">
                    {stage?.hardDeadline && new Date(stage.hardDeadline) < new Date() && (
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(248,81,73,0.10)', border: '1px solid var(--error)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: '16px', color: 'var(--error)', fontSize: '14px', fontWeight: 500}}>
                            ⛔ {t.hardDeadlinePassed}
                        </div>
                    )}
                    <h2>{t.submittedResults}</h2>
                    {results.map(result => (
                        <div key={result.id} style={{borderBottom: '1px solid var(--border)', padding: '16px 0'}}>
                            {result.student && (
                                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px'}}>
                                    <div style={{width: '30px', height: '30px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, color: '#fff', flexShrink: 0}}>
                                        {result.student.firstName[0]}{result.student.lastName[0]}
                                    </div>
                                    <div>
                                        <div style={{fontSize: '14px', fontWeight: 500}}>{result.student.firstName} {result.student.lastName}</div>
                                        <div style={{fontSize: '12px', color: 'var(--text-secondary)'}}>{result.student.email}</div>
                                    </div>
                                </div>
                            )}
                            <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: (result.isLate || result.isEdited || result.editedAfterDeadline) ? '10px' : '0'}}>
                                {result.isLate && (
                                    <span style={{display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(248,81,73,0.10)', border: '1px solid var(--error)', borderRadius: '999px', padding: '3px 10px', fontSize: '12px', color: 'var(--error)'}}>
                                        ⚠ {t.submittedLate}
                                    </span>
                                )}
                                {result.isEdited && (
                                    <span style={{display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(88,166,255,0.08)', border: '1px solid rgba(88,166,255,0.25)', borderRadius: '999px', padding: '3px 10px', fontSize: '12px', color: 'var(--accent)'}}>
                                        ✎ {t.edited}{result.editedAt ? ': ' + new Date(result.editedAt).toLocaleString('ru') : ''}
                                    </span>
                                )}
                                {result.editedAfterDeadline && (
                                    <span style={{display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(248,81,73,0.10)', border: '1px solid var(--error)', borderRadius: '999px', padding: '3px 10px', fontSize: '12px', color: 'var(--error)'}}>
                                        ⛔ {t.editedAfterDeadline}
                                    </span>
                                )}
                            </div>
                            <RichTextDisplay html={result.contentText ?? ''} style={{fontSize: '14px'}} />
                            {result.fileAttachments && result.fileAttachments.length > 0 && (
                                <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '8px 0'}}>
                                    {result.fileAttachments.map(f => (
                                        <button key={f.id} className="btn btn-ghost btn-sm" style={{display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', background: 'rgba(88,166,255,0.06)', border: '1px solid rgba(88,166,255,0.2)', borderRadius: '999px', fontSize: '12px', color: 'var(--accent)'}}
                                            onClick={() => downloadAttachment(result.id, f.id, f.originalName)}>
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                                            {f.originalName}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {result.grade ? (
                                <div style={{marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px'}}>
                                    <span style={{display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: 600, background: result.grade.isAccepted ? 'rgba(63,185,80,0.12)' : 'rgba(248,81,73,0.12)', border: `1px solid ${result.grade.isAccepted ? '#3FB950' : 'var(--error)'}`, color: result.grade.isAccepted ? '#3FB950' : 'var(--error)', alignSelf: 'flex-start'}}>
                                        {result.grade.isAccepted ? '✓ ' + t.accepted : '✗ ' + t.notAccepted}
                                    </span>
                                    {result.grade.feedback && <p style={{margin: 0, fontSize: '13px', color: 'var(--text-secondary)'}}>{result.grade.feedback}</p>}
                                </div>
                            ) : (
                                <>
                                    <button className="btn btn-secondary btn-sm" style={{marginTop: '8px'}} onClick={() => { setSelectedResultId(result.id); setIsAccepted(null); setFeedback(''); }}>{t.grade}</button>
                                    {selectedResultId === result.id && (
                                        <div style={{marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                                            <div style={{display: 'flex', gap: '8px'}}>
                                                <button
                                                    className="btn btn-sm"
                                                    onClick={() => setIsAccepted(true)}
                                                    style={{flex: 1, background: isAccepted === true ? '#3FB950' : 'transparent', color: isAccepted === true ? '#0D1117' : '#3FB950', border: '1px solid #3FB950', fontWeight: isAccepted === true ? 700 : 400}}>
                                                    ✓ {t.accepted}
                                                </button>
                                                <button
                                                    className="btn btn-sm"
                                                    onClick={() => setIsAccepted(false)}
                                                    style={{flex: 1, background: isAccepted === false ? 'var(--error)' : 'transparent', color: isAccepted === false ? '#fff' : 'var(--error)', border: '1px solid var(--error)', fontWeight: isAccepted === false ? 700 : 400}}>
                                                    ✗ {t.notAccepted}
                                                </button>
                                            </div>
                                            <textarea className="input" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder={t.feedback} />
                                            <button className="btn btn-primary btn-sm" disabled={isAccepted === null} onClick={() => handleGrade(result.id)}>{t.submitGrade}</button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default StageDetailPage;
