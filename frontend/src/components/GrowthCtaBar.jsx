export default function GrowthCtaBar({ primaryLabel, secondaryLabel, onPrimary, onSecondary, primaryDisabled }) {
    return (
        <div className="growth-cta-bar">
            {secondaryLabel && onSecondary ? (
                <button type="button" className="secondary" onClick={onSecondary}>
                    {secondaryLabel}
                </button>
            ) : null}
            <button type="button" className="primary" onClick={onPrimary} disabled={primaryDisabled}>
                {primaryLabel}
            </button>
        </div>
    );
}
