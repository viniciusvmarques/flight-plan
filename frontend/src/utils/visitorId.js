const STORAGE_KEY = "mq_visitor_id";

function randomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return `v${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

export function getVisitorId() {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing && existing.length >= 8) return existing;
    const next = randomId();
    localStorage.setItem(STORAGE_KEY, next);
    return next;
  } catch {
    return randomId();
  }
}

export function visitorHeaders() {
  return { "X-Visitor-Id": getVisitorId() };
}
