import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext.jsx";

export default function AppFooter() {
    const { t } = useI18n();
    return (
        <footer className="site-footer" role="contentinfo">
            <div className="site-footer-inner">
                <div>
                    © {new Date().getFullYear()} Marquisa •{" "}
                    <Link to="/terms">{t("footer.terms")}</Link>
                    {" · "}
                    <Link to="/privacy">{t("footer.privacy")}</Link>
                    {" · "}
                    <Link to="/cancellation-policy">{t("footer.cancellation")}</Link>
                    {" · "}
                    <Link to="/contact">{t("footer.contact")}</Link>
                </div>
                <div className="site-footer-note">
                    {t("common.operationalDisclaimer")}
                </div>
            </div>
        </footer>
    );
}