import { Link } from "react-router-dom";
import { siteProfile } from "../content/siteProfile";

export default function AppFooter() {
    return (
        <footer className="site-footer" role="contentinfo">
            <div className="site-footer-inner">
                <div>
                    © {new Date().getFullYear()} Marquisa •{" "}
                    <Link to="/terms">Termos</Link>
                    {" · "}
                    <Link to="/privacy">Privacidade</Link>
                    {" · "}
                    <Link to="/cancellation-policy">Cancelamento</Link>
                    {" · "}
                    <Link to="/contact">Contato</Link>
                </div>
                <div className="site-footer-note">
                    {siteProfile.operationalDisclaimer}
                </div>
            </div>
        </footer>
    );
}