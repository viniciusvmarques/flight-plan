import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

function buildReturnPath(location) {
    const path = `${location.pathname || ""}${location.search || ""}${location.hash || ""}`;
    if (!path || path === "/") return "";
    if (!path.startsWith("/") || path.startsWith("//")) return "";
    return path;
}

/** Redireciona para cadastro (com next) — prioriza conversão. */
export default function RequireAuth({ children }) {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        const next = buildReturnPath(location);
        const registerTo = next ? `/register?next=${encodeURIComponent(next)}` : "/register";
        return <Navigate to={registerTo} replace state={{ from: location }} />;
    }

    return children;
}
