import { useEffect, useState } from "react";
import { resolveWeatherScene } from "../utils/weatherScenes";
import WeatherSceneArt from "./WeatherSceneArt";
import { useI18n } from "../i18n/I18nContext.jsx";

/**
 * Cena climática ilustrativa a partir do METAR.
 * Prefere foto realista (assets); fallback para SVG se a imagem falhar.
 */
export default function WeatherScene({ metar, icao = "", className = "" }) {
    const { t } = useI18n();
    const scene = resolveWeatherScene(metar);
    const [imgFailed, setImgFailed] = useState(false);

    useEffect(() => {
        setImgFailed(false);
    }, [scene.id, scene.src]);

    return (
        <figure className={`ck-wx-scene ${className}`.trim()} data-scene={scene.id}>
            <div className="ck-wx-scene__frame">
                {!imgFailed && scene.src ? (
                    <img
                        className="ck-wx-scene__img"
                        src={scene.src}
                        alt={t(scene.labelKey)}
                        loading="lazy"
                        decoding="async"
                        onError={() => setImgFailed(true)}
                    />
                ) : (
                    <WeatherSceneArt sceneId={scene.id} />
                )}
                <div className="ck-wx-scene__veil" aria-hidden />
                <figcaption className="ck-wx-scene__caption">
                    <span className="ck-wx-scene__eyebrow">{t("plannerWx.sceneTitle")}</span>
                    <strong className="ck-wx-scene__label">{t(scene.labelKey)}</strong>
                    {icao ? <span className="ck-wx-scene__icao">{icao}</span> : null}
                </figcaption>
            </div>
            <p className="ck-wx-scene__note">{t("plannerWx.sceneDisclaimer")}</p>
        </figure>
    );
}
