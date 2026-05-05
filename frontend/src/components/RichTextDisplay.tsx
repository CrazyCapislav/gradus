interface Props {
    html: string;
    style?: React.CSSProperties;
}

export default function RichTextDisplay({ html, style }: Props) {
    if (!html || html === '<p></p>') return null;
    return (
        <div
            className="rich-text"
            dangerouslySetInnerHTML={{ __html: html }}
            style={style}
        />
    );
}
