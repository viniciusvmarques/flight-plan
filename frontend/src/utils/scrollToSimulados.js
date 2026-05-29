/**
 * Rola até a seção #simulados na home ou navega até lá.
 */
export function scrollToSimulados(navigate) {
    const el = document.getElementById("simulados");
    if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.replaceState(null, "", `${window.location.pathname}#simulados`);
        return true;
    }
    if (typeof navigate === "function") {
        navigate("/#simulados");
    } else {
        window.location.assign("/#simulados");
    }
    return false;
}
