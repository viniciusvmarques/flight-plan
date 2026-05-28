import { flightCategoryChipClass } from "../../utils/flightCategoryChip";

export function ExperienceHero({ kicker, title, copy, statValue, statLabel, badge }) {
    return (
        <section className="xp-hero">
            <div className="xp-hero-copy">
                {kicker ? <p className="xp-kicker">{kicker}</p> : null}
                <h1>{title}</h1>
                {copy ? <p className="xp-lead">{copy}</p> : null}
            </div>
            {(statValue != null || badge) && (
                <div className="xp-hero-aside">
                    {badge ? <span className={flightCategoryChipClass(badge)}>{badge}</span> : null}
                    {statValue != null ? (
                        <div className="xp-hero-stat">
                            <strong>{statValue}</strong>
                            {statLabel ? <span>{statLabel}</span> : null}
                        </div>
                    ) : null}
                </div>
            )}
        </section>
    );
}

export function ExperienceCommandBar({ children, footer }) {
    return (
        <section className="xp-command">
            <div className="xp-command-main">{children}</div>
            {footer ? <div className="xp-command-footer">{footer}</div> : null}
        </section>
    );
}

export function WxCategoryPanel({ category, categoryLabel, hints }) {
    const tone = category === "VFR" ? "vfr" : category === "MVFR" ? "mvfr" : category === "IFR" ? "ifr" : "nodata";
    return (
        <section className={`xp-category-panel xp-category-panel--${tone.toLowerCase()}`} aria-label={categoryLabel}>
            <div className="xp-category-panel-main">
                <span className={flightCategoryChipClass(category)}>{category}</span>
                <p>{categoryLabel}</p>
            </div>
            {hints?.length ? (
                <ul className="xp-hint-list">
                    {hints.map((hint) => (
                        <li key={hint}>{hint}</li>
                    ))}
                </ul>
            ) : null}
        </section>
    );
}

export function BulletinPanel({ label, text, emptyLabel, onCopy, copyLabel = "Copy" }) {
    return (
        <article className="xp-bulletin">
            <div className="xp-bulletin-head">
                <span className="xp-bulletin-label">{label}</span>
                {onCopy && text ? (
                    <button type="button" className="xp-text-btn" onClick={onCopy}>
                        {copyLabel}
                    </button>
                ) : null}
            </div>
            <pre className="xp-bulletin-body">{text || emptyLabel}</pre>
        </article>
    );
}

export function ResultHighlight({ items, primaryIndex = 0 }) {
    return (
        <div className="xp-result-grid" role="group">
            {items.map((item, index) => (
                <div
                    key={item.label}
                    className={`xp-result-tile ${index === primaryIndex ? "xp-result-tile--primary" : ""} ${item.muted ? "xp-result-tile--muted" : ""}`}
                >
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                    {item.hint ? <em>{item.hint}</em> : null}
                </div>
            ))}
        </div>
    );
}

export function SegmentedControl({ tabs, value, onChange, ariaLabel }) {
    return (
        <div className="xp-segmented" role="tablist" aria-label={ariaLabel}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={value === tab.id}
                    className={`xp-segmented-btn ${value === tab.id ? "xp-segmented-btn--active" : ""}`}
                    onClick={() => onChange(tab.id)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

export function WorkbenchCard({ title, lead, inputs, results, footer, children }) {
    return (
        <section className="xp-workbench">
            <header className="xp-workbench-head">
                <h2>{title}</h2>
                {lead ? <p>{lead}</p> : null}
            </header>
            <div className="xp-workbench-body">
                <div className="xp-workbench-inputs">{inputs}</div>
                {results ? <div className="xp-workbench-results">{results}</div> : null}
            </div>
            {children}
            {footer ? <footer className="xp-workbench-foot">{footer}</footer> : null}
        </section>
    );
}

export function ToolNavCard({ active, icon, title, description, onClick }) {
    return (
        <button type="button" className={`xp-tool-nav ${active ? "xp-tool-nav--active" : ""}`} onClick={onClick}>
            <span className="xp-tool-nav-icon" aria-hidden>
                {icon}
            </span>
            <span className="xp-tool-nav-copy">
                <strong>{title}</strong>
                <span>{description}</span>
            </span>
        </button>
    );
}
