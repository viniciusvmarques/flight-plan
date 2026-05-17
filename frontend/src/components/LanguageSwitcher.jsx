import { LOCALE_LABELS, SUPPORTED_LOCALES, useI18n } from "../i18n/I18nContext.jsx";

export default function LanguageSwitcher({ compact = false }) {
    const { locale, setLocale, t } = useI18n();

    return (
        <div className={`language-switcher ${compact ? "language-switcher--compact" : ""}`} aria-label={t("common.language")}>
            {SUPPORTED_LOCALES.map((item) => (
                <button
                    key={item}
                    type="button"
                    className={`language-switcher-item ${locale === item ? "language-switcher-item--active" : ""}`}
                    onClick={() => setLocale(item)}
                    aria-pressed={locale === item}
                    title={item === "pt-BR" ? t("common.portuguese") : item === "en" ? t("common.english") : t("common.spanish")}
                >
                    {LOCALE_LABELS[item]}
                </button>
            ))}
        </div>
    );
}
