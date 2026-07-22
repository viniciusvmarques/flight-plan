/**
 * Marca oficial Marquisa — jato azul (nova identidade).
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
            className={`mq-mark-icon mq-mark-svg ${className}`.trim()}
            src="/marquisa-icon.svg"
            width={s}
            height={s}
            alt={decorative ? "" : title}
            role={decorative ? "presentation" : "img"}
            aria-hidden={decorative ? true : undefined}
            draggable={false}
            style={{ width: s, height: s, objectFit: "contain" }}
        />
    );
}
