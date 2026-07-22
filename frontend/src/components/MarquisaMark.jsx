/**
 * Marca oficial Marquisa — PNG do Canva (sempre o mesmo arquivo).
 */
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
            src="/marquisa-mark.png"
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
