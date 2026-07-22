import { MARK_SRC, WORDMARK_SRC } from "./MarquisaMark.jsx";

/**
 * Wordmark Marquisa — PNG oficial do Canva.
 */
export function MarquisaWordmark({ scale = 40, compact = false, markOnly = false }) {
    const height = Math.max(28, Math.round(scale * (compact ? 0.95 : 1.1)));
    const width = Math.round(height * (markOnly ? 1 : 3.8));

    if (markOnly) {
        return (
            <div className={`mq-logo mq-logo--mark-only${compact ? " mq-logo--compact" : ""}`} aria-label="Marquisa">
                <img
                    className="mq-mark-icon"
                    src={MARK_SRC}
                    width={height}
                    height={height}
                    alt=""
                    draggable={false}
                    style={{
                        width: height,
                        height,
                        objectFit: "contain",
                        borderRadius: Math.round(height * 0.18),
                    }}
                />
            </div>
        );
    }

    return (
        <div className={`mq-logo mq-logo--lockup${compact ? " mq-logo--compact" : ""}`} aria-label="Marquisa">
            <img
                className="mq-wordmark-img"
                src={WORDMARK_SRC}
                width={width}
                height={height}
                alt="Marquisa"
                draggable={false}
                style={{ width, height, objectFit: "contain", display: "block" }}
            />
        </div>
    );
}
