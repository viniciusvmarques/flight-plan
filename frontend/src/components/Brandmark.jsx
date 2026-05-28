import { MarquisaWordmark } from "./MarquisaWordmark";

/**
 * Marca visual principal.
 */
export default function BrandMark({ size = 40, showText = true, compact = false }) {
    const s = Number(size) || 40;
    const subFs = Math.max(10, Math.round(s * 0.2));

    return (
        <div
            className={`fp-brand fp-brand--wordmark ${compact ? "fp-brand--compact" : ""} ${showText ? "" : "fp-brand--mark-only"}`}
            style={{
                "--fp-brand-gap": showText ? `${compact ? 2 : 4}px` : "0px",
                "--fp-brand-tag-size": `${subFs}px`,
            }}
        >
            <MarquisaWordmark scale={s} compact={compact} />
            {showText ? (
                <div className="fp-brand-tagline">Simulados ANAC, METAR/TAF e plano de voo</div>
            ) : null}
        </div>
    );
}
