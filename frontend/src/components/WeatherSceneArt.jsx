/** Cenas climáticas em SVG inline (não dependem de /public no Netlify). */

function SceneShell({ children, sky }) {
    return (
        <svg className="ck-wx-scene__img" viewBox="0 0 640 420" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <defs>{sky}</defs>
            {children}
        </svg>
    );
}

function ClearScene() {
    return (
        <SceneShell
            sky={
                <linearGradient id="ckSkyClear" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1d4ed8" />
                    <stop offset="55%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#082f49" />
                </linearGradient>
            }
        >
            <rect width="640" height="420" fill="url(#ckSkyClear)" />
            <circle cx="460" cy="118" r="90" fill="rgba(253,224,71,0.35)" />
            <circle cx="460" cy="118" r="42" fill="#fde68a" />
            <path d="M0 300 C120 270 220 330 320 300 C420 270 520 320 640 290 L640 420 L0 420 Z" fill="#0b1220" opacity="0.9" />
            <rect x="268" y="248" width="104" height="18" rx="2" fill="#334155" />
            <rect x="286" y="266" width="68" height="52" fill="#1e293b" />
            <path d="M286 266 L320 236 L354 266 Z" fill="#475569" />
        </SceneShell>
    );
}

function CloudyScene() {
    return (
        <SceneShell
            sky={
                <linearGradient id="ckSkyCloudy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1e3a5f" />
                    <stop offset="100%" stopColor="#0b1220" />
                </linearGradient>
            }
        >
            <rect width="640" height="420" fill="url(#ckSkyCloudy)" />
            <circle cx="470" cy="100" r="36" fill="#fcd34d" opacity="0.85" />
            <ellipse cx="210" cy="140" rx="90" ry="36" fill="#94a3b8" />
            <ellipse cx="260" cy="128" rx="70" ry="30" fill="#94a3b8" />
            <ellipse cx="420" cy="180" rx="110" ry="40" fill="#cbd5e1" opacity="0.8" />
            <ellipse cx="480" cy="168" rx="78" ry="32" fill="#cbd5e1" opacity="0.8" />
            <path d="M0 310 C150 280 260 340 390 305 C500 278 580 330 640 300 L640 420 L0 420 Z" fill="#0f172a" />
            <rect x="268" y="258" width="104" height="18" rx="2" fill="#334155" />
            <rect x="286" y="276" width="68" height="52" fill="#1e293b" />
            <path d="M286 276 L320 246 L354 276 Z" fill="#475569" />
        </SceneShell>
    );
}

function OvercastScene() {
    return (
        <SceneShell
            sky={
                <linearGradient id="ckSkyOvc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#334155" />
                    <stop offset="100%" stopColor="#0b1220" />
                </linearGradient>
            }
        >
            <rect width="640" height="420" fill="url(#ckSkyOvc)" />
            <ellipse cx="120" cy="110" rx="120" ry="44" fill="#64748b" />
            <ellipse cx="280" cy="96" rx="100" ry="40" fill="#64748b" />
            <ellipse cx="440" cy="108" rx="130" ry="48" fill="#64748b" />
            <ellipse cx="540" cy="92" rx="110" ry="42" fill="#64748b" />
            <ellipse cx="220" cy="170" rx="140" ry="46" fill="#475569" />
            <ellipse cx="430" cy="180" rx="150" ry="50" fill="#475569" />
            <path d="M0 320 C160 300 280 350 420 318 C520 296 590 340 640 315 L640 420 L0 420 Z" fill="#020617" />
            <rect x="268" y="268" width="104" height="18" rx="2" fill="#1e293b" />
            <rect x="286" y="286" width="68" height="52" fill="#0f172a" />
            <path d="M286 286 L320 256 L354 286 Z" fill="#334155" />
        </SceneShell>
    );
}

function RainScene() {
    return (
        <SceneShell
            sky={
                <linearGradient id="ckSkyRain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#020617" />
                </linearGradient>
            }
        >
            <rect width="640" height="420" fill="url(#ckSkyRain)" />
            <ellipse cx="220" cy="100" rx="120" ry="42" fill="#475569" />
            <ellipse cx="400" cy="92" rx="130" ry="46" fill="#475569" />
            <ellipse cx="540" cy="104" rx="90" ry="34" fill="#475569" />
            <g stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" opacity="0.75">
                <line x1="140" y1="170" x2="120" y2="240" />
                <line x1="200" y1="165" x2="180" y2="245" />
                <line x1="280" y1="175" x2="260" y2="250" />
                <line x1="360" y1="168" x2="340" y2="248" />
                <line x1="440" y1="178" x2="420" y2="252" />
                <line x1="520" y1="166" x2="500" y2="242" />
            </g>
            <path d="M0 330 C150 310 280 360 420 328 C530 304 590 350 640 325 L640 420 L0 420 Z" fill="#020617" />
            <rect x="268" y="278" width="104" height="18" rx="2" fill="#1e293b" />
            <rect x="286" y="296" width="68" height="48" fill="#0f172a" />
            <path d="M286 296 L320 268 L354 296 Z" fill="#334155" />
        </SceneShell>
    );
}

function FogScene() {
    return (
        <SceneShell
            sky={
                <linearGradient id="ckSkyFog" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#64748b" />
                    <stop offset="55%" stopColor="#334155" />
                    <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
            }
        >
            <rect width="640" height="420" fill="url(#ckSkyFog)" />
            <ellipse cx="160" cy="180" rx="180" ry="28" fill="#e2e8f0" opacity="0.28" />
            <ellipse cx="420" cy="210" rx="220" ry="32" fill="#e2e8f0" opacity="0.28" />
            <ellipse cx="280" cy="250" rx="240" ry="30" fill="#e2e8f0" opacity="0.28" />
            <ellipse cx="480" cy="290" rx="200" ry="26" fill="#e2e8f0" opacity="0.25" />
            <rect x="268" y="268" width="104" height="18" rx="2" fill="#475569" opacity="0.55" />
            <rect x="286" y="286" width="68" height="52" fill="#334155" opacity="0.45" />
            <path d="M286 286 L320 256 L354 286 Z" fill="#64748b" opacity="0.4" />
        </SceneShell>
    );
}

function StormScene() {
    return (
        <SceneShell
            sky={
                <linearGradient id="ckSkyStorm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#111827" />
                    <stop offset="100%" stopColor="#020617" />
                </linearGradient>
            }
        >
            <rect width="640" height="420" fill="url(#ckSkyStorm)" />
            <ellipse cx="220" cy="110" rx="130" ry="48" fill="#1f2937" />
            <ellipse cx="380" cy="92" rx="120" ry="46" fill="#1f2937" />
            <ellipse cx="500" cy="108" rx="120" ry="48" fill="#1f2937" />
            <path d="M340 168 L300 250 L328 250 L290 330 L390 230 L350 230 L390 168 Z" fill="#fbbf24" />
            <g stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" opacity="0.55">
                <line x1="150" y1="200" x2="135" y2="260" />
                <line x1="200" y1="210" x2="185" y2="275" />
                <line x1="500" y1="205" x2="485" y2="270" />
            </g>
            <path d="M0 330 C160 310 300 365 450 330 C540 308 600 350 640 328 L640 420 L0 420 Z" fill="#000" />
            <rect x="268" y="278" width="104" height="18" rx="2" fill="#1e293b" />
            <rect x="286" y="296" width="68" height="48" fill="#0f172a" />
            <path d="M286 296 L320 268 L354 296 Z" fill="#334155" />
        </SceneShell>
    );
}

function IdleScene() {
    return (
        <SceneShell
            sky={
                <linearGradient id="ckSkyIdle" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0f172a" />
                    <stop offset="100%" stopColor="#020617" />
                </linearGradient>
            }
        >
            <rect width="640" height="420" fill="url(#ckSkyIdle)" />
            <g stroke="#5eead4" strokeWidth="1.5" opacity="0.22" fill="none">
                <path d="M40 80 H600 M40 140 H600 M40 200 H600 M40 260 H600 M40 320 H600" />
                <path d="M80 40 V380 M160 40 V380 M240 40 V380 M320 40 V380 M400 40 V380 M480 40 V380 M560 40 V380" />
            </g>
            <circle cx="320" cy="190" r="54" fill="none" stroke="#5eead4" strokeWidth="3" opacity="0.55" />
            <circle cx="320" cy="190" r="8" fill="#5eead4" />
            <text x="320" y="290" textAnchor="middle" fill="#94a3b8" fontFamily="monospace" fontSize="18" letterSpacing="4">
                STANDBY
            </text>
        </SceneShell>
    );
}

const SCENE_ART = {
    clear: ClearScene,
    cloudy: CloudyScene,
    overcast: OvercastScene,
    rain: RainScene,
    fog: FogScene,
    storm: StormScene,
    idle: IdleScene,
};

export default function WeatherSceneArt({ sceneId }) {
    const Art = SCENE_ART[sceneId] || IdleScene;
    return <Art />;
}
