/**
 * Marca oficial Marquisa — rosa dos ventos (mark-b).
 * Usa currentColor para herdar a cor do badge/pai sem desalinhhar o layout.
 */
export default function MarquisaMark({
    size = 28,
    className = "",
    title = "Marquisa",
    decorative = true,
}) {
    const s = Number(size) || 28;
    return (
        <svg
            className={`mq-mark-svg ${className}`.trim()}
            width={s}
            height={s}
            viewBox="0 0 64 64"
            role={decorative ? "presentation" : "img"}
            aria-hidden={decorative ? true : undefined}
            aria-label={decorative ? undefined : title}
        >
            {!decorative ? <title>{title}</title> : null}
            <circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" strokeWidth="1.35" opacity="0.55" />
            <path
                d="M32 8.5V55.5M8.5 32H55.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.9"
            />
            <path
                d="M16.2 16.2l4.2 4.2M43.6 16.2l-4.2 4.2M16.2 47.8l4.2-4.2M43.6 47.8l-4.2-4.2"
                stroke="currentColor"
                strokeWidth="1.15"
                strokeLinecap="round"
                opacity="0.72"
            />
            <path fill="currentColor" d="M32 11.2 35.1 28.2 32 26.4 28.9 28.2Z" />
            <path fill="currentColor" d="M52.8 32 35.8 35.1 37.6 32 35.8 28.9Z" />
            <path fill="currentColor" d="M32 52.8 28.9 35.8 32 37.6 35.1 35.8Z" />
            <path fill="currentColor" d="M11.2 32 28.2 28.9 26.4 32 28.2 35.1Z" />
            <path fill="currentColor" d="M44.8 19.2 36.6 30.2 35.2 28.8 33.8 30.2Z" opacity="0.55" />
            <path fill="currentColor" d="M44.8 44.8 33.8 33.8 35.2 35.2 36.6 33.8Z" opacity="0.55" />
            <path fill="currentColor" d="M19.2 44.8 30.2 33.8 28.8 35.2 30.2 36.6Z" opacity="0.55" />
            <path fill="currentColor" d="M19.2 19.2 30.2 30.2 28.8 28.8 30.2 27.4Z" opacity="0.55" />
            <circle cx="32" cy="32" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.35" />
            <circle cx="32" cy="32" r="1.7" fill="currentColor" />
        </svg>
    );
}
