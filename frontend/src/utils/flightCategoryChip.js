export function flightCategoryChipClass(category) {
    if (category === "VFR") return "chip ok";
    if (category === "MVFR") return "chip warn";
    if (category === "IFR") return "chip bad";
    return "chip muted";
}
