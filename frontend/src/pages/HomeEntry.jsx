import { useAuth } from "../auth/AuthContext";
import Dashboard from "./Dashboard";
import PlannerLanding from "./PlannerLanding";

/** Home: visitante vê landing de cadastro; logado usa o planejador. */
export default function HomeEntry() {
    const { user } = useAuth();
    return user ? <Dashboard /> : <PlannerLanding />;
}
