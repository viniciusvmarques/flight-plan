/**
 * Wordmark Marquisa: MARQUISA + jato azul com rastros (nova identidade).
 * Layout alinhado ao logo: avião acima da direita do nome.
 */
export function MarquisaWordmark({ scale = 40, compact = false, markOnly = false }) {
    const height = Math.max(28, Math.round(scale * (compact ? 0.95 : 1.05)));
    const width = Math.round(height * (markOnly ? 1 : 3.6));

    if (markOnly) {
        return (
            <div className={`mq-logo mq-logo--mark-only${compact ? " mq-logo--compact" : ""}`} aria-label="Marquisa">
                <img
                    className="mq-mark-icon"
                    src="/marquisa-icon.svg"
                    width={height}
                    height={height}
                    alt=""
                    draggable={false}
                    style={{ width: height, height, objectFit: "contain" }}
                />
            </div>
        );
    }

    return (
        <div className={`mq-logo mq-logo--lockup${compact ? " mq-logo--compact" : ""}`} aria-label="Marquisa">
            <img
                className="mq-wordmark-img"
                src="/marquisa-wordmark.svg"
                width={width}
                height={height}
                alt="Marquisa"
                draggable={false}
                style={{ width, height, objectFit: "contain", display: "block" }}
            />
        </div>
    );
}
