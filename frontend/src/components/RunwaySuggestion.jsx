import { suggestRunwayFromMetar } from "../utils/suggestRunwayFromMetar";
import { useI18n } from "../i18n/I18nContext.jsx";

/**
 * Sugestão de cabeceira a partir do METAR — com destaque visual e disclaimer.
 * Badge de vento: verde (fraco), âmbar (moderado), vermelho (forte / forte+rajada).
 */
export default function RunwaySuggestion({ runways, metar, className = "" }) {
    const { t } = useI18n();
    const result = suggestRunwayFromMetar(runways, metar);

    if (!metar) return null;

    if (result.mode === "unavailable" || !result.suggested) {
        return (
            <aside className={`ck-rwy-suggest ck-rwy-suggest--empty ${className}`.trim()} role="status">
                <div className="ck-rwy-suggest__rail" aria-hidden />
                <div className="ck-rwy-suggest__body">
                    <span className="ck-rwy-suggest__eyebrow">{t("weather.runwaySuggestTitle")}</span>
                    <p className="ck-rwy-suggest__empty">{t("weather.runwaySuggestUnavailable")}</p>
                    <p className="ck-rwy-suggest__disclaimer">{t("weather.runwaySuggestDisclaimer")}</p>
                </div>
            </aside>
        );
    }

    const { suggested, mode, wind, windBand } = result;
    const band = windBand || "light";
    const head = Math.round(suggested.headKt ?? 0);
    const cross = Math.round(Math.abs(suggested.crossKt ?? 0));
    const spd = wind?.spdKt != null ? Math.round(wind.spdKt) : null;
    const gust = wind?.gustKt != null ? Math.round(wind.gustKt) : null;
    const hdg = Number.isFinite(suggested.hdg) ? Math.round(suggested.hdg) : null;
    const isStrongAlert = band === "strong" || band === "strong-gust";

    let modeLabel = t("weather.runwaySuggestModeModerate");
    if (mode === "calm") modeLabel = t("weather.runwaySuggestModeCalm");
    else if (mode === "vrb" && band === "light") modeLabel = t("weather.runwaySuggestModeVrb");
    else if (band === "light") modeLabel = t("weather.runwaySuggestModeLight");
    else if (band === "strong-gust") modeLabel = t("weather.runwaySuggestModeStrongGust");
    else if (band === "strong") modeLabel = t("weather.runwaySuggestModeStrong");

    let detail = t("weather.runwaySuggestModerateDetail", { spd: spd ?? "—" });
    if (mode === "calm") detail = t("weather.runwaySuggestCalmDetail");
    else if (mode === "vrb" && band === "light") detail = t("weather.runwaySuggestVrbDetail");
    else if (band === "light") detail = t("weather.runwaySuggestLightDetail", { spd: spd ?? "—" });
    else if (band === "strong-gust") {
        detail = t("weather.runwaySuggestStrongGustDetail", {
            spd: spd ?? "—",
            gust: gust ?? "—",
        });
    } else if (band === "strong") {
        detail = t("weather.runwaySuggestStrongDetail", { spd: spd ?? "—" });
    }

    const attention = t("weather.runwaySuggestAttention");
    const bandClass = `is-band-${band}`;

    return (
        <aside className={`ck-rwy-suggest ${bandClass} ${className}`.trim()} role="status">
            <div className="ck-rwy-suggest__glow" aria-hidden />
            <div className="ck-rwy-suggest__rail" aria-hidden />

            <div className="ck-rwy-suggest__stage">
                <div className="ck-rwy-suggest__runway" aria-hidden>
                    <span className="ck-rwy-suggest__threshold" />
                    <span className="ck-rwy-suggest__centerline" />
                    <span className="ck-rwy-suggest__edge ck-rwy-suggest__edge--l" />
                    <span className="ck-rwy-suggest__edge ck-rwy-suggest__edge--r" />
                    <span className="ck-rwy-suggest__arrow">▲</span>
                </div>

                <div className="ck-rwy-suggest__hero">
                    <span className="ck-rwy-suggest__eyebrow">{t("weather.runwaySuggestTitle")}</span>
                    <div className="ck-rwy-suggest__ident-row">
                        <span className="ck-rwy-suggest__ident">{suggested.ident}</span>
                        {hdg != null ? <span className="ck-rwy-suggest__hdg">{String(hdg).padStart(3, "0")}°</span> : null}
                    </div>
                    <span className={`ck-rwy-suggest__mode ${bandClass}`}>
                        {isStrongAlert ? <span className="ck-rwy-suggest__mode-alert" aria-hidden>⚠</span> : null}
                        {modeLabel}
                    </span>
                </div>
            </div>

            <div className="ck-rwy-suggest__body">
                <p className="ck-rwy-suggest__detail">{detail}</p>

                <div className={`ck-rwy-suggest__alert${isStrongAlert ? " is-critical" : ""}`} role="alert">
                    <strong className="ck-rwy-suggest__alert-label">
                        {isStrongAlert ? (
                            <span className="ck-rwy-suggest__alert-icon" aria-hidden>
                                ⚠
                            </span>
                        ) : null}
                        {t("weather.runwaySuggestAttentionLabel")}
                    </strong>
                    <span className="ck-rwy-suggest__alert-text">{attention}</span>
                </div>

                <div className="ck-rwy-suggest__metrics">
                    <div className="ck-rwy-metric">
                        <span className="ck-rwy-metric__label">{t("weather.runwaySuggestHead")}</span>
                        <strong className="ck-rwy-metric__value">
                            {head}
                            <small>kt</small>
                        </strong>
                    </div>
                    <div className="ck-rwy-metric">
                        <span className="ck-rwy-metric__label">{t("weather.runwaySuggestCross")}</span>
                        <strong className="ck-rwy-metric__value">
                            {cross}
                            <small>kt</small>
                        </strong>
                    </div>
                    <div className="ck-rwy-metric">
                        <span className="ck-rwy-metric__label">{t("weather.runwaySuggestWindSpd")}</span>
                        <strong className="ck-rwy-metric__value">
                            {spd != null ? spd : "—"}
                            {gust != null ? <small className="ck-rwy-metric__gust">G{gust}</small> : null}
                            <small>kt</small>
                        </strong>
                    </div>
                </div>

                <p className="ck-rwy-suggest__disclaimer">{t("weather.runwaySuggestDisclaimer")}</p>
            </div>
        </aside>
    );
}
