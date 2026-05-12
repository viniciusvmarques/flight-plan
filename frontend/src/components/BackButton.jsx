import { useNavigate } from "react-router-dom";

export default function BackButton({ label = "← Voltar" }) {
    const nav = useNavigate();
    return (
        <button className="secondary detail-back" type="button" onClick={() => nav(-1)}>
            {label}
        </button>
    );
}
