export default function GrowthPageHero({ kicker, title, copy, statValue, statLabel }) {
    return (
        <section className="growth-hero">
            <div className="growth-hero-copy">
                {kicker ? <p className="exam-kicker">{kicker}</p> : null}
                <h1>{title}</h1>
                {copy ? <p>{copy}</p> : null}
            </div>
            {statValue != null ? (
                <div className="exam-hero-stat">
                    <strong>{statValue}</strong>
                    {statLabel ? <span>{statLabel}</span> : null}
                </div>
            ) : null}
        </section>
    );
}
