/**
 * Marca oficial Marquisa — PNG do Canva.
 * ?v= evita cache do Netlify/navegador após troca de arte.
 */
const MARK_SRC = "/marquisa-mark.png?v=20260722c";
const ICON_SRC = "/marquisa-icon.png?v=20260722c";
const WORDMARK_SRC = "/marquisa-wordmark.png?v=20260722c";

export { MARK_SRC, ICON_SRC, WORDMARK_SRC };

export default function MarquisaMark({
    size = 28,
    className = "",
    title = "Marquisa",
    decorative = true,
}) {
    const s = Number(size) || 28;
    return (
        <img
            className={`mq-mark-icon ${className}`.trim()}
            src={MARK_SRC}
            width={s}
            height={s}
            alt={decorative ? "" : title}
            role={decorative ? "presentation" : "img"}
            aria-hidden={decorative ? true : undefined}
            draggable={false}
            style={{ width: s, height: s, objectFit: "contain", borderRadius: Math.round(s * 0.18) }}
        />
    );
}
