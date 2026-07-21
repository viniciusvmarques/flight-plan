import { suggestRunwayFromMetar } from "../utils/suggestRunwayFromMetar";
import { useI18n } from "../i18n/I18nContext.jsx";

/**
 * Sugestão de cabeceira a partir do METAR — com disclaimer operacional.
 */
export default function RunwaySuggestion({ runways, metar, className = "" }) {
    const { t } = useI18n();
    const result = suggestRunwayFromMetar(runways, metar);

    if (!metar) return null;
    if (result.mode === "unavailable" || !result.suggested) {
        return (
            <div className={`ck-rwy-suggest ${className}`.trim()}>
                <div className="ck-rwy-suggest__title">{t("weather.runwaySuggestTitle")}</div>
                <p className="ck-rwy-suggest__empty">{t("weather.runwaySuggestUnavailable")}</p>
                <p className="ck-rwy-suggest__disclaimer">{t("weather.runwaySuggestDisclaimer")}</p>
            </div>
        );
    }

    const { suggested, mode, wind } = result;
    const head = Math.round(suggested.headKt ?? 0);
    const cross = Math.round(Math.abs(suggested.crossKt ?? 0));
    const spd = wind?.spdKt != null ? Math.round(wind.spdKt) : null;

    let lead = t("weather.runwaySuggestWind", { rwy: suggested.ident, head, cross });
    if (mode === "calm") lead = t("weather.runwaySuggestCalm", { rwy: suggested.ident });
    else if (mode === "vrb") lead = t("weather.runwaySuggestVrb", { rwy: suggested.ident });
    else if (mode === "light") lead = t("weather.runwaySuggestLight", { rwy: suggested.ident, head, cross, spd: spd ?? "—" });

    return (
        <div className={`ck-rwy-suggest ${className}`.trim()} role="status">
            <div className="ck-rwy-suggest__title">{t("weather.runwaySuggestTitle")}</div>
            <p className="ck-rwy-suggest__lead">{lead}</p>
            <p className="ck-rwy-suggest__disclaimer">{t("weather.runwaySuggestDisclaimer")}</p>
        </div>
    );
}
