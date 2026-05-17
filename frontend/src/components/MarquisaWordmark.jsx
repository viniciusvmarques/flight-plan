import { useId } from "react";

function PlaneIcon({ planeId, trailId, compact }) {
    const width = compact ? 56 : 72;
    const height = compact ? 28 : 34;

    return (
        <svg
            className="mq-plane-icon"
            width={width}
            height={height}
            viewBox="0 0 108 52"
            role="presentation"
            aria-hidden="true"
        >
            <defs>
                <linearGradient id={planeId} x1="42" y1="6" x2="72" y2="34" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ffffff" />
                    <stop offset="0.58" stopColor="#e2e8f0" />
                    <stop offset="1" stopColor="#94a3b8" />
                </linearGradient>
                <linearGradient id={trailId} x1="8" y1="35" x2="58" y2="20" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#93c5fd" stopOpacity="0.94" />
                    <stop offset="1" stopColor="#e2e8f0" stopOpacity="0.48" />
                </linearGradient>
                <filter id={`${planeId}-shadow`} x="0" y="0" width="108" height="52" filterUnits="userSpaceOnUse">
                    <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#020617" floodOpacity="0.34" />
                </filter>
            </defs>

            <path
                d="M8 35 C18 24, 28 24, 40 31"
                fill="none"
                stroke={`url(#${trailId})`}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeDasharray="3.4 5.2"
            />
            <path
                d="M40 31 C53 36, 66 33, 78 22"
                fill="none"
                stroke={`url(#${trailId})`}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeDasharray="3.4 5.2"
            />

            <g filter={`url(#${planeId}-shadow)`} transform="translate(48 2) rotate(-8 22 22)">
                <path
                    d="M22 2 28 17 46 19 50 23 46 27 28 29 22 50 16 50 17 29 5 37 1 37 7 24 1 11 5 11 17 19 16 2Z"
                    fill={`url(#${planeId})`}
                />
                <path
                    d="M22 2 26 17 42 19 46 23 42 27 26 29 22 50 19 50 20 29 10 35 8 32 14 24 8 16 10 13 20 19 19 2Z"
                    fill="#f8fafc"
                    opacity="0.64"
                />
                <path d="M22 8 25 23 22 43" stroke="#1e293b" strokeOpacity="0.16" strokeWidth="1.2" strokeLinecap="round" />
            </g>
        </svg>
    );
}

/**
 * Wordmark no estilo do Canva enviado:
 * nome + avião sempre na horizontal para manter a barra mais baixa.
 */
export function MarquisaWordmark({ scale = 40, compact = false, markOnly = false }) {
    const uid = useId().replace(/:/g, "");
    const planeId = `mq-plane-${uid}`;
    const trailId = `mq-trail-${uid}`;
    const fontSize = Math.max(22, Math.round(scale * (compact ? 0.92 : 1.02)));

    return (
        <div className={`mq-logo ${compact ? "mq-logo--compact" : ""} ${markOnly ? "mq-logo--mark-only" : ""}`} aria-label="Marquisa">
            {!markOnly ? (
                <div
                    className={`mq-logotype ${compact ? "mq-logotype--compact" : ""}`}
                    style={{ "--mq-font-size": `${fontSize}px` }}
                >
                    MARQUISA
                </div>
            ) : null}
            <PlaneIcon planeId={planeId} trailId={trailId} compact={compact} />
        </div>
    );
}
