/** Google Analytics 4 — mesmo ID do gtag em index.html */
export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || "G-LNQ29KDW7J";

export function trackPageView(path) {
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    window.gtag("config", GA_MEASUREMENT_ID, {
        page_path: path,
    });
}
