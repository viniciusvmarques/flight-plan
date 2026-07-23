import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext.jsx";

export default function AppFooter() {
    const { t } = useI18n();
    return (
        <footer className="site-footer" role="contentinfo">
            <div className="site-footer-inner">
                <div className="site-footer-top">
                    <div className="site-footer-brand">
                        <span className="ck-footer-mark" aria-hidden="true">
                            <img src="/marquisa-mark.png?v=20260722c" alt="" width="18" height="18" style={{ borderRadius: 4 }} />
                        </span>
                        <span className="ck-footer-phases" aria-hidden="true">
                            CLR · TAXI · DEP · ENR · APP · LDG
                        </span>
                        <span className="ck-footer-badge">{t("footer.slogan")}</span>
                    </div>
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
                <p className="site-footer-disclaimer">{t("footer.disclaimer")}</p>
            </div>
        </footer>
    );
}
