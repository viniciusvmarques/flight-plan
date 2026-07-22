import MarquisaMark from "./MarquisaMark";

/**
 * Wordmark Marquisa: rosa dos ventos + nome.
 * Mantém layout horizontal compacto para não desalinhhar headers.
 */
export function MarquisaWordmark({ scale = 40, compact = false, markOnly = false }) {
    const fontSize = Math.max(22, Math.round(scale * (compact ? 0.92 : 1.02)));
    const markSize = Math.max(22, Math.round(scale * (compact ? 0.72 : 0.78)));

    return (
        <div
            className={`mq-logo ${compact ? "mq-logo--compact" : ""} ${markOnly ? "mq-logo--mark-only" : ""}`}
            aria-label="Marquisa"
        >
            <MarquisaMark size={markSize} className="mq-mark-icon" />
            {!markOnly ? (
                <div
                    className={`mq-logotype ${compact ? "mq-logotype--compact" : ""}`}
                    style={{ "--mq-font-size": `${fontSize}px` }}
                >
                    MARQUISA
                </div>
            ) : null}
        </div>
    );
}
