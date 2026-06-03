import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "../lib/googleAnalytics";

/** Envia page_view no GA4 a cada mudança de rota (SPA). */
export default function GoogleAnalyticsTracker() {
    const location = useLocation();

    useEffect(() => {
        const path = `${location.pathname}${location.search}${location.hash}`;
        trackPageView(path);
    }, [location.pathname, location.search, location.hash]);

    return null;
}
