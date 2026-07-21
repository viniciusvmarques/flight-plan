import { useEffect, useState } from "react";
import { resolveWeatherScene } from "../utils/weatherScenes";
import WeatherSceneArt from "./WeatherSceneArt";
import { useI18n } from "../i18n/I18nContext.jsx";

/**
 * Cena climática × período do dia a partir do METAR.
 * Prefere foto realista; fallback SVG se a imagem falhar.
 */
export default function WeatherScene({ metar, icao = "", airport = null, className = "" }) {
    const { t } = useI18n();
    const scene = resolveWeatherScene(metar, airport);
    const [src, setSrc] = useState(scene.src);
    const [imgFailed, setImgFailed] = useState(false);

    useEffect(() => {
        setSrc(scene.src);
        setImgFailed(false);
    }, [scene.id, scene.src]);

    function handleImgError() {
        if (src !== scene.fallbackSrc && scene.fallbackSrc) {
            setSrc(scene.fallbackSrc);
            return;
        }
        setImgFailed(true);
    }

    const weatherLabel = t(scene.labelKey);
    const periodLabel = t(scene.periodLabelKey);

    return (
        <figure className={`ck-wx-scene ${className}`.trim()} data-scene={scene.id}>
            <div className="ck-wx-scene__frame">
                {!imgFailed ? (
                    <img
                        className="ck-wx-scene__img"
                        src={src}
                        alt={`${weatherLabel} · ${periodLabel}`}
                        loading="lazy"
                        decoding="async"
                        onError={handleImgError}
                    />
                ) : (
                    <WeatherSceneArt sceneId={scene.weather === "idle" ? "idle" : scene.weather} />
                )}
                <div className="ck-wx-scene__veil" aria-hidden />
                <figcaption className="ck-wx-scene__caption">
                    <strong className="ck-wx-scene__label">{weatherLabel}</strong>
                    <span className="ck-wx-scene__period">{periodLabel}</span>
                    {icao ? <span className="ck-wx-scene__icao">{icao}</span> : null}
                </figcaption>
            </div>
            <p className="ck-wx-scene__note">{t("plannerWx.sceneDisclaimer")}</p>
        </figure>
    );
}
