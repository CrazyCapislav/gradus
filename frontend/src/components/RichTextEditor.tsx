import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';

interface Props {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    minHeight?: string;
}

function ToolbarButton({ onClick, active, title, children }: {
    onClick: () => void;
    active?: boolean;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            title={title}
            onMouseDown={e => { e.preventDefault(); onClick(); }}
            style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '28px', height: '28px', borderRadius: '4px', border: 'none',
                background: active ? 'var(--accent)' : 'transparent',
                color: active ? '#0D1117' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: '13px', fontWeight: 600, flexShrink: 0,
                transition: 'background 0.15s, color 0.15s',
            }}
        >
            {children}
        </button>
    );
}

function Divider() {
    return <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 2px', flexShrink: 0 }} />;
}

export default function RichTextEditor({ value, onChange, placeholder, minHeight = '120px' }: Props) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({ codeBlock: false }),
            Link.configure({ openOnClick: false, HTMLAttributes: { style: 'color: var(--accent); text-decoration: underline;' } }),
            Placeholder.configure({ placeholder: placeholder ?? '' }),
        ],
        content: value || '',
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
        editorProps: {
            attributes: {
                style: `min-height: ${minHeight}; outline: none; padding: 12px; font-size: 14px; line-height: 1.6; color: var(--text);`,
            },
        },
    });

    useEffect(() => {
        if (editor && value === '' && editor.getHTML() !== '<p></p>') {
            editor.commands.clearContent();
        }
    }, [value]);

    if (!editor) return null;

    function setLink() {
        const url = window.prompt('URL ссылки');
        if (url) editor!.chain().focus().setLink({ href: url }).run();
        else editor!.chain().focus().unsetLink().run();
    }

    return (
        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--input-bg, var(--bg))', overflow: 'hidden' }}>
            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '6px 8px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
                <ToolbarButton title="Жирный" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
                    <b>B</b>
                </ToolbarButton>
                <ToolbarButton title="Курсив" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
                    <i>I</i>
                </ToolbarButton>
                <ToolbarButton title="Зачёркнутый" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
                    <s>S</s>
                </ToolbarButton>
                <ToolbarButton title="Код" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
                    {'<>'}
                </ToolbarButton>
                <Divider />
                <ToolbarButton title="Заголовок H2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                    H2
                </ToolbarButton>
                <ToolbarButton title="Заголовок H3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                    H3
                </ToolbarButton>
                <Divider />
                <ToolbarButton title="Нумерованный список" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
                </ToolbarButton>
                <ToolbarButton title="Маркированный список" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/></svg>
                </ToolbarButton>
                <ToolbarButton title="Цитата" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
                </ToolbarButton>
                <ToolbarButton title="Ссылка" active={editor.isActive('link')} onClick={setLink}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                </ToolbarButton>
                <ToolbarButton title="Разделитель" active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                    —
                </ToolbarButton>
            </div>
            {/* Editor area */}
            <EditorContent editor={editor} />
        </div>
    );
}
