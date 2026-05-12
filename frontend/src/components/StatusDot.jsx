export default function StatusDot({ category }) {
    const cat = (category || "").toUpperCase();

    let cls = "nodata";
    if (cat === "VFR") cls = "vfr";
    if (cat === "MVFR") cls = "mvfr";
    if (cat === "IFR") cls = "ifr";

    return <span className={`status-dot ${cls}`} title={cat || "Sem dados"} />;
}
