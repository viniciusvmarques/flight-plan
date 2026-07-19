export default function Card({ title, titleLeft, actions, children, className = "" }) {
    const showHeader = Boolean(title || titleLeft || actions);
    return (
        <section className={`card fp-card xp-card ${className}`.trim()}>
            {showHeader ? (
                <div className="card-header">
                    <div className="card-title-row">
                        {titleLeft}
                        {title ? <span className="card-title">{title}</span> : null}
                    </div>
                    {actions ? <div className="card-actions">{actions}</div> : null}
                </div>
            ) : null}
            <div className="card-body xp-card-body">{children}</div>
        </section>
    );
}
