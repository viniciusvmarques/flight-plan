import UtcBar from "./UtcBar";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";

/**
 * Shell visual padrão Marquisa — todas as páginas de produto.
 */
export default function AviationShell({
    children,
    className = "",
    kicker,
    title,
    subtitle,
    compact = true,
    hideMobileMenu = false,
    wide = false,
}) {
    return (
        <div className={`main-shell av-shell${className ? ` ${className}` : ""}`}>
            <UtcBar />
            <AppHeader
                compact={compact}
                hideMobileMenu={hideMobileMenu}
                kicker={kicker}
                title={title}
                subtitle={subtitle}
            />
            <main className={`main-scroll av-page${wide ? " av-page--wide" : ""}`}>{children}</main>
            <AppFooter />
        </div>
    );
}
