import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

function buildReturnPath(location) {
    const path = `${location.pathname || ""}${location.search || ""}${location.hash || ""}`;
    if (!path || path === "/") return "";
    if (!path.startsWith("/") || path.startsWith("//")) return "";
    return path;
}

export default function RequireAuth({ children }) {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        const next = buildReturnPath(location);
        const loginTo = next ? `/login?next=${encodeURIComponent(next)}` : "/login";
        return <Navigate to={loginTo} replace state={{ from: location }} />;
    }

    return children;
}
