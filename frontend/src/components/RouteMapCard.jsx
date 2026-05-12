import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, ScaleControl, TileLayer, Tooltip, useMap, ZoomControl } from "react-leaflet";
import Card from "./Card";
import { haversineNm } from "../utils/distance";

function makeMarkerIcon(role, isSelected) {
    const label = role === "origin" ? "A" : role === "dest" ? "B" : "C";
    return L.divIcon({
        className: "fp-map-marker-wrap",
        html: `<span class="fp-map-marker fp-map-marker--${role} ${isSelected ? "fp-map-marker--selected" : ""}">${label}</span>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
    });
}

function MapViewport({ points }) {
    const map = useMap();

    useEffect(() => {
        if (!points.length) return;
        if (points.length === 1) {
            map.setView(points[0], 6);
            return;
        }
        map.fitBounds(points, { padding: [34, 34] });
    }, [map, points]);

    return null;
}

export default function RouteMapCard({ markers, selectedIcao, onSelect }) {
    const origin = markers.find((marker) => marker.role === "origin");
    const dest = markers.find((marker) => marker.role === "dest");
    const alternate = markers.find((marker) => marker.role === "alternate");

    const points = useMemo(
        () =>
            (markers || [])
                .filter((marker) => Number.isFinite(marker.lat) && Number.isFinite(marker.lon))
                .map((marker) => [marker.lat, marker.lon]),
        [markers]
    );

    const mainLine = useMemo(() => {
        if (!origin || !dest) return [];
        return [
            [origin.lat, origin.lon],
            [dest.lat, dest.lon],
        ];
    }, [dest, origin]);

    const alternateLine = useMemo(() => {
        if (!alternate) return [];
        const start = dest || origin;
        if (!start) return [];
        return [
            [start.lat, start.lon],
            [alternate.lat, alternate.lon],
        ];
    }, [alternate, dest, origin]);

    const routeMetrics = useMemo(() => {
        const items = [];
        if (origin && dest) {
            const legNm = haversineNm(origin.lat, origin.lon, dest.lat, dest.lon);
            items.push(`Trecho A-B: ${Math.round(legNm)} NM`);
        }
        if (alternate && (dest || origin)) {
            const start = dest || origin;
            const legNm = haversineNm(start.lat, start.lon, alternate.lat, alternate.lon);
            items.push(`Alternativa até C: ${Math.round(legNm)} NM`);
        }
        items.push("Arraste o mapa para explorar a rota");
        return items;
    }, [alternate, dest, origin]);

    if (!points.length) {
        return (
            <Card title="Mapa da rota">
                <div className="empty-note">Sem coordenadas suficientes para desenhar a rota. Gere um briefing com ICAOs válidos para exibir o mapa.</div>
            </Card>
        );
    }

    return (
        <Card title="Mapa da rota">
            <div className="route-map-card">
                <div className="route-map-meta">
                    {routeMetrics.map((item) => (
                        <span key={item} className="chip">
                            {item}
                        </span>
                    ))}
                </div>

                <div className="route-map-legend">
                    <span className="chip">A · Origem</span>
                    <span className="chip">B · Destino</span>
                    <span className="chip">C · Alternativa</span>
                    <span className="chip">Clique em um ponto para abrir detalhes</span>
                </div>

                <div className="route-map-frame">
                    <MapContainer className="route-map-surface" center={points[0]} zoom={6} scrollWheelZoom={false} zoomControl={false}>
                        <MapViewport points={points} />
                        <ZoomControl position="bottomright" />
                        <ScaleControl position="bottomleft" imperial={false} />
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                            subdomains="abcd"
                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        />

                        {mainLine.length === 2 ? (
                            <>
                                <Polyline positions={mainLine} pathOptions={{ color: "#1d4ed8", weight: 10, opacity: 0.18, interactive: false }} />
                                <Polyline positions={mainLine} pathOptions={{ color: "#2563eb", weight: 4, opacity: 0.92, interactive: false }} />
                            </>
                        ) : null}
                        {alternateLine.length === 2 ? (
                            <>
                                <Polyline positions={alternateLine} pathOptions={{ color: "#d97706", weight: 8, opacity: 0.16, interactive: false }} />
                                <Polyline
                                    positions={alternateLine}
                                    pathOptions={{ color: "#d97706", weight: 3, opacity: 0.82, dashArray: "8 8", interactive: false }}
                                />
                            </>
                        ) : null}

                        {markers.map((marker) => (
                            <Marker
                                key={marker.icao}
                                position={[marker.lat, marker.lon]}
                                icon={makeMarkerIcon(marker.role, selectedIcao === marker.icao)}
                                eventHandlers={{
                                    click: () => onSelect?.(marker.icao),
                                }}
                            >
                                <Tooltip direction="top" offset={[0, -12]} opacity={1}>
                                    {marker.label}
                                </Tooltip>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>
        </Card>
    );
}
