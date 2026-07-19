import { useEffect, useState } from "react";

function formatUtcClock(date) {
    const hh = String(date.getUTCHours()).padStart(2, "0");
    const mm = String(date.getUTCMinutes()).padStart(2, "0");
    const ss = String(date.getUTCSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}Z`;
}

export default function UtcBar({ showAtis = true }) {
    const [utc, setUtc] = useState(() => formatUtcClock(new Date()));

    useEffect(() => {
        const id = window.setInterval(() => setUtc(formatUtcClock(new Date())), 1000);
        return () => window.clearInterval(id);
    }, []);

    return (
        <>
            <div className="av-utc-bar" aria-live="polite">
                <div className="av-utc-brand">
                    <span className="av-utc-badge" aria-hidden="true">
                        MQ
                    </span>
                    <div>
                        <div className="av-utc-brand-name">Marquisa</div>
                        <div className="av-utc-brand-sub">Ops · Glass cockpit</div>
                    </div>
                </div>
                <div className="av-utc-clock-wrap">
                    <time className="av-utc-clock" dateTime={new Date().toISOString()}>
                        {utc}
                    </time>
                    <div className="av-utc-label">UTC · Zulu time</div>
                </div>
                <div className="av-utc-tag">Station online</div>
            </div>
            {showAtis ? (
                <div className="av-atis-bar" aria-label="ATIS">
                    <span>
                        ATIS <b>BRAVO</b>
                    </span>
                    <span>
                        QNH <b>1018</b>
                    </span>
                    <span>
                        RWY <b>09L / 27R</b>
                    </span>
                    <span>
                        TWR <b>118.400</b>
                    </span>
                    <span>
                        SQUAWK <b>1200</b>
                    </span>
                </div>
            ) : null}
        </>
    );
}
