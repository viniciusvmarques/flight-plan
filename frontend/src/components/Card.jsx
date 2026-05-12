export default function Card({ title, titleLeft, actions, children }) {
    return (
        <section className="card fp-card">
            <div className="card-header">
                <div className="card-title-row">
                    {titleLeft}
                    <span className="card-title">{title}</span>
                </div>
                {actions ? <div className="card-actions">{actions}</div> : null}
            </div>
            <div className="card-body">{children}</div>
        </section>
    );
}
