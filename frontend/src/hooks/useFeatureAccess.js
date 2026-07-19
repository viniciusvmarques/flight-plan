import { useEffect, useState } from "react";
import { api, ApiError } from "../services/apiClient";

/** Consome 1 crédito do recurso ao montar a página (PRO = ilimitado). */
export function useFeatureAccess(feature) {
    const [loading, setLoading] = useState(true);
    const [allowed, setAllowed] = useState(false);
    const [limitFeature, setLimitFeature] = useState(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                await api("/api/usage/consume", {
                    method: "POST",
                    auth: true,
                    body: { feature },
                });
                if (!cancelled) {
                    setAllowed(true);
                    setLimitFeature(null);
                }
            } catch (e) {
                if (cancelled) return;
                if (e instanceof ApiError && e.status === 402) {
                    setAllowed(false);
                    setLimitFeature(e.data?.feature || feature);
                } else {
                    setAllowed(true);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [feature]);

    return {
        loading,
        allowed,
        limitFeature,
        clearLimit: () => setLimitFeature(null),
    };
}
