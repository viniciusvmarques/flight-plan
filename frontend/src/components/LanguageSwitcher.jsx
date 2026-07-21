import { LOCALE_LABELS, SUPPORTED_LOCALES, useI18n } from "../i18n/I18nContext.jsx";
import { useAuth } from "../auth/AuthContext";
import { api } from "../services/apiClient";

export default function LanguageSwitcher({ compact = false }) {
    const { locale, setLocale, t } = useI18n();
    const { token } = useAuth();

    async function choose(item) {
        setLocale(item);
        if (!token) return;
        try {
            await api("/me/locale", { method: "PATCH", body: { locale: item }, token });
        } catch {
            /* idioma local já aplicado; sync remoto é best-effort */
        }
    }

    return (
        <div className={`language-switcher ${compact ? "language-switcher--compact" : ""}`} aria-label={t("common.language")}>
            {SUPPORTED_LOCALES.map((item) => (
                <button
                    key={item}
                    type="button"
                    className={`language-switcher-item ${locale === item ? "language-switcher-item--active" : ""}`}
                    onClick={() => choose(item)}
                    aria-pressed={locale === item}
                    title={item === "pt-BR" ? t("common.portuguese") : item === "en" ? t("common.english") : t("common.spanish")}
                >
                    {LOCALE_LABELS[item]}
                </button>
            ))}
        </div>
    );
}
