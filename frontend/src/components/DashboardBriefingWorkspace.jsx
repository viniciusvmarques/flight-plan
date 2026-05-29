import { useState } from "react";
import StatusDot from "./StatusDot";
import StationDetailsCard from "./StationDetailsCard";
import RouteMapCard from "./RouteMapCard";
import { classifyFromMetar } from "../utils/classifyFlightCategory";
import { flightCategoryChipClass } from "../utils/flightCategoryChip";
import { decodeMetarSummary } from "../utils/metarDecoder";

function categoryLabel(category, t) {
    if (category === "VFR") return t("dashboard.catVfr");
    if (category === "MVFR") return t("dashboard.catMvfr");
    if (category === "IFR") return t("dashboard.catIfr");
    return t("dashboard.catNoData");
}

function BriefingWxColumn({
    role,
    station,
    active,
    onSelect,
    showFav,
    isFav,
    onToggleFav,
    t,
    locale,
}) {
    const [showRaw, setShowRaw] = useState(false);
    if (!station) return null;

    const category = classifyFromMetar(station.metar);
    const summary = decodeMetarSummary(station.metar, locale);
    const icao = station.icao || "----";

    return (
        <article
            className={`dash-wx-col ${active ? "dash-wx-col--active" : ""}`}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(icao)}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(icao);
                }
            }}
        >
            <div className="dash-wx-col-head">
                <div className="dash-wx-col-title">
                    <StatusDot category={category} />
                    <div>
                        <span className="dash-wx-role">{role}</span>
                        <strong>{icao}</strong>
                    </div>
                </div>
                <div className="dash-wx-col-actions">
                    {showFav ? (
                        <button
                            type="button"
                            className={`fp-btn-icon ${isFav ? "fp-btn-icon--active" : ""}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleFav(icao);
                            }}
                            aria-label={isFav ? t("dashboard.removeFav") : t("dashboard.addFav")}
                        >
                            {isFav ? "★" : "☆"}
                        </button>
                    ) : null}
                    <button
                        type="button"
                        className="fp-btn-icon fp-btn-icon--text"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowRaw((v) => !v);
                        }}
                    >
                        {showRaw ? t("dashboard.collapseWx") : t("dashboard.expandWx")}
                    </button>
                </div>
            </div>

            <div className="dash-wx-col-summary">
                <p className="dash-wx-airport">{station.airport?.name || t("dashboard.unknownAirport")}</p>
                <span className={flightCategoryChipClass(category)}>{categoryLabel(category, t)}</span>

                {summary.hints.length ? (
                    <ul className="dash-wx-hints">
                        {summary.hints.slice(0, 3).map((hint) => (
                            <li key={hint}>{hint}</li>
                        ))}
                    </ul>
                ) : null}
            </div>

            <div className={`dash-wx-raw ${showRaw ? "dash-wx-raw--open" : ""}`}>
                <div className="dash-wx-raw-block dash-wx-raw-block--metar">
                    <span className="wx-label">METAR</span>
                    <pre>{station.metar || t("dashboard.metarUnavailable")}</pre>
                </div>
                <div className="dash-wx-raw-block dash-wx-raw-block--taf">
                    <span className="wx-label">TAF</span>
                    <pre>{station.taf || t("dashboard.tafUnavailable")}</pre>
                </div>
            </div>
        </article>
    );
}

export default function DashboardBriefingWorkspace({
    base,
    counts,
    loading,
    user,
    selectedIcao,
    selectedStation,
    airportInfo,
    airportInfoLoading,
    markers,
    plannerSummary,
    onSelectStation,
    onCloseDetails,
    onRefresh,
    onSave,
    onPrint,
    onToggleFav,
    isFavorite,
    t,
    locale,
}) {
    const stations = [
        { role: base.mode === "single" ? `A · ${t("common.origin")}` : `A · ${t("common.origin")}`, item: base.origin },
        ...(base.dest ? [{ role: `B · ${t("common.destination")}`, item: base.dest }] : []),
        ...(base.alternate ? [{ role: `C · ${t("common.alternate")}`, item: base.alternate }] : []),
    ];

    const routeLabel = base.dest?.icao
        ? `${base.origin?.icao} → ${base.dest.icao}`
        : base.origin?.icao;

    return (
        <section className="dash-briefing-workspace" aria-label={t("dashboard.briefingWorkspaceTitle")}>
            <div className="dash-briefing-top">
                <div className="dash-briefing-route">
                    <span className="dash-briefing-kicker">{t("dashboard.briefingWorkspaceTitle")}</span>
                    <h2 className="dash-briefing-route-title">{routeLabel}</h2>
                    {base.alternate?.icao ? (
                        <p className="dash-briefing-route-sub">
                            {t("common.alternate")}: {base.alternate.icao}
                        </p>
                    ) : null}
                </div>
                <div className="page-actions dash-briefing-actions">
                    <button type="button" className="secondary" onClick={onRefresh} disabled={loading}>
                        {loading ? t("dashboard.refreshing") : t("dashboard.refreshBriefing")}
                    </button>
                    {onPrint ? (
                        <button type="button" className="secondary" onClick={onPrint}>
                            {t("dashboard.printBriefing")}
                        </button>
                    ) : null}
                    {user && onSave ? (
                        <button type="button" className="secondary" onClick={onSave}>
                            {t("dashboard.saveBriefing")}
                        </button>
                    ) : null}
                </div>
            </div>

            <div className="dash-rules-strip" aria-label={t("dashboard.rulesTitle")}>
                <span className="dash-rules-label">{t("dashboard.rulesTitle")}</span>
                <span className="chip ok">VFR · {counts.VFR || 0}</span>
                <span className="chip warn">MVFR · {counts.MVFR || 0}</span>
                <span className="chip bad">IFR · {counts.IFR || 0}</span>
                {(counts.NO_DATA || 0) + (counts.UNKNOWN || 0) > 0 ? (
                    <span className="chip muted">
                        {t("dashboard.catNoData")} · {(counts.NO_DATA || 0) + (counts.UNKNOWN || 0)}
                    </span>
                ) : null}
                {plannerSummary ? (
                    <span className="chip">
                        {t("dashboard.fuel")}: {plannerSummary.totalFuelL.toFixed(0)} L
                    </span>
                ) : null}
            </div>

            <div className="dash-wx-grid">
                {stations.map(({ role, item }) => (
                    <BriefingWxColumn
                        key={item.icao}
                        role={role}
                        station={item}
                        active={selectedIcao === item.icao}
                        onSelect={onSelectStation}
                        showFav={!!user}
                        isFav={isFavorite(item.icao)}
                        onToggleFav={onToggleFav}
                        t={t}
                        locale={locale}
                    />
                ))}
            </div>

            {selectedStation ? (
                <div className="dash-station-detail">
                    <div className="dash-station-detail-head">
                        <h3>{t("dashboard.stationDetails")} · {selectedStation.icao}</h3>
                        <button type="button" className="secondary" onClick={onCloseDetails}>
                            {t("dashboard.closeDetails")}
                        </button>
                    </div>
                    <StationDetailsCard
                        station={selectedStation}
                        airportInfo={
                            airportInfoLoading
                                ? { name: t("common.loading"), runwaysText: "—", elevationFt: null }
                                : airportInfo
                        }
                    />
                </div>
            ) : null}

            <div className="dash-map-block">
                <RouteMapCard markers={markers} selectedIcao={selectedIcao} onSelect={onSelectStation} />
                <p className="dash-map-note muted">{t("dashboard.mapLegendNote")}</p>
            </div>
        </section>
    );
}
