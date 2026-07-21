import { suggestRunwayFromMetar } from "../utils/suggestRunwayFromMetar";
import { useI18n } from "../i18n/I18nContext.jsx";

/**
 * Sugestão de cabeceira a partir do METAR — com destaque visual e disclaimer.
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

    const { suggested, mode, wind } = result;
    const head = Math.round(suggested.headKt ?? 0);
    const cross = Math.round(Math.abs(suggested.crossKt ?? 0));
    const spd = wind?.spdKt != null ? Math.round(wind.spdKt) : null;
    const hdg = Number.isFinite(suggested.hdg) ? Math.round(suggested.hdg) : null;

    let modeLabel = t("weather.runwaySuggestModeWind");
    let modeClass = "is-wind";
    if (mode === "calm") {
        modeLabel = t("weather.runwaySuggestModeCalm");
        modeClass = "is-calm";
    } else if (mode === "vrb") {
        modeLabel = t("weather.runwaySuggestModeVrb");
        modeClass = "is-vrb";
    } else if (mode === "light") {
        modeLabel = t("weather.runwaySuggestModeLight");
        modeClass = "is-light";
    }

    let detail = t("weather.runwaySuggestWindDetail", { head, cross });
    if (mode === "calm") detail = t("weather.runwaySuggestCalmDetail");
    else if (mode === "vrb") detail = t("weather.runwaySuggestVrbDetail");
    else if (mode === "light") detail = t("weather.runwaySuggestLightDetail", { spd: spd ?? "—", head, cross });

    return (
        <aside className={`ck-rwy-suggest ${modeClass} ${className}`.trim()} role="status">
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
                    <span className={`ck-rwy-suggest__mode ${modeClass}`}>{modeLabel}</span>
                </div>
            </div>

            <div className="ck-rwy-suggest__body">
                <p className="ck-rwy-suggest__detail">{detail}</p>

                {mode === "wind" || mode === "light" ? (
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
                        {spd != null ? (
                            <div className="ck-rwy-metric">
                                <span className="ck-rwy-metric__label">{t("weather.runwaySuggestWindSpd")}</span>
                                <strong className="ck-rwy-metric__value">
                                    {spd}
                                    <small>kt</small>
                                </strong>
                            </div>
                        ) : null}
                    </div>
                ) : null}

                <p className="ck-rwy-suggest__disclaimer">{t("weather.runwaySuggestDisclaimer")}</p>
            </div>
        </aside>
    );
}
