import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext.jsx";

export default function AppFooter() {
    const { t } = useI18n();
    return (
        <footer className="site-footer" role="contentinfo">
            <div className="site-footer-inner">
                <div className="site-footer-brand">
                    <div className="ck-footer-phases" aria-hidden="true">
                        CLR · TAXI · DEP · ENR · APP · LDG
                    </div>
                    <div className="ck-footer-badge">{t("footer.slogan")}</div>
                </div>

                <p className="site-footer-disclaimer">{t("common.operationalDisclaimer")}</p>

                <div className="site-footer-note">
                    © {new Date().getFullYear()} Marquisa ·{" "}
                    <Link to="/terms">{t("footer.terms")}</Link>
                    {" · "}
                    <Link to="/privacy">{t("footer.privacy")}</Link>
                    {" · "}
                    <Link to="/cancellation-policy">{t("footer.cancellation")}</Link>
                    {" · "}
                    <Link to="/contact">{t("footer.contact")}</Link>
                </div>
            </div>
        </footer>
    );
}
