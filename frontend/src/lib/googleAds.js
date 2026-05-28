/** Google Ads conversion ID (same as gtag config in index.html). */
export const GOOGLE_ADS_ID = "AW-17070043109";

/**
 * Fire a Google Ads conversion. Create the action in Google Ads and paste the
 * full send_to value (e.g. AW-17070043109/AbCdEfGh) into VITE_GOOGLE_ADS_CONV_*.
 */
export function trackGoogleAdsConversion(sendTo, params = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  if (!sendTo) return;
  window.gtag("event", "conversion", { send_to: sendTo, ...params });
}

export function trackSignupConversion() {
  trackGoogleAdsConversion(import.meta.env.VITE_GOOGLE_ADS_CONV_SIGNUP);
}

export function trackPurchaseConversion(value, currency = "BRL") {
  trackGoogleAdsConversion(import.meta.env.VITE_GOOGLE_ADS_CONV_PURCHASE, {
    value,
    currency,
  });
}
