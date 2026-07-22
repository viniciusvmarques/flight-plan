/**
 * PDF mínimo (PDF 1.4) com Courier — tipografia estilo escala / strip ATC.
 * Sem dependências externas. Quebra linhas longas (METAR/TAF).
 */

function escapePdf(text) {
    return String(text ?? "")
        .replace(/\\/g, "\\\\")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)")
        .replace(/[^\x20-\x7E]/g, (ch) => {
            const map = {
                Á: "A",
                À: "A",
                Â: "A",
                Ã: "A",
                Ä: "A",
                á: "a",
                à: "a",
                â: "a",
                ã: "a",
                ä: "a",
                É: "E",
                È: "E",
                Ê: "E",
                é: "e",
                è: "e",
                ê: "e",
                Í: "I",
                Í: "I",
                î: "i",
                í: "i",
                Ó: "O",
                Ò: "O",
                Ô: "O",
                Õ: "O",
                Ö: "O",
                ó: "o",
                ò: "o",
                ô: "o",
                õ: "o",
                ö: "o",
                Ú: "U",
                Ù: "U",
                Ü: "U",
                ú: "u",
                ù: "u",
                ü: "u",
                Ç: "C",
                ç: "c",
                Ñ: "N",
                ñ: "n",
                "—": "-",
                "–": "-",
                "→": "->",
                "·": "-",
                "°": " DEG",
            };
            return map[ch] || " ";
        });
}

/** Courier é monoespaçada: largura ≈ 0.6 * fontSize. */
function maxCharsFor(fontSize, pageWidth = 595.28, margin = 36) {
    const usable = pageWidth - margin * 2;
    const charW = Math.max(1, fontSize * 0.6);
    return Math.max(24, Math.floor(usable / charW));
}

/**
 * Quebra texto em linhas sem estourar a margem.
 * Prefere quebrar em espaços; se um token for maior que a linha, corta o token.
 */
function wrapText(text, maxChars) {
    const raw = String(text ?? "").replace(/\s+/g, " ").trim();
    if (!raw) return [""];
    if (raw.length <= maxChars) return [raw];

    const words = raw.split(" ");
    const lines = [];
    let current = "";

    const pushChunk = (chunk) => {
        if (!chunk) return;
        if (chunk.length <= maxChars) {
            lines.push(chunk);
            return;
        }
        for (let i = 0; i < chunk.length; i += maxChars) {
            lines.push(chunk.slice(i, i + maxChars));
        }
    };

    for (const word of words) {
        if (!current) {
            if (word.length <= maxChars) {
                current = word;
            } else {
                pushChunk(word);
                current = "";
            }
            continue;
        }
        const next = `${current} ${word}`;
        if (next.length <= maxChars) {
            current = next;
        } else {
            lines.push(current);
            if (word.length <= maxChars) {
                current = word;
            } else {
                pushChunk(word);
                current = "";
            }
        }
    }
    if (current) lines.push(current);
    return lines.length ? lines : [""];
}

function buildContentStream(lines, { pageWidth = 595.28, pageHeight = 841.89, margin = 36, fontSize = 9, leading = 11 } = {}) {
    const maxY = pageHeight - margin;
    const minY = margin + 18;
    const pages = [];
    let commands = [];
    let y = maxY;

    const pushPage = () => {
        pages.push(commands.join("\n"));
        commands = [];
        y = maxY;
    };

    const writeRawLine = (text, size = fontSize, bold = false) => {
        if (y < minY) pushPage();
        const safe = escapePdf(text);
        const font = bold ? "F2" : "F1";
        commands.push("BT");
        commands.push(`/${font} ${size} Tf`);
        commands.push(`${margin} ${y.toFixed(2)} Td`);
        commands.push(`(${safe}) Tj`);
        commands.push("ET");
        y -= Math.max(leading, size + 2);
    };

    const writeWrapped = (text, size = fontSize, bold = false, indent = "") => {
        const width = maxCharsFor(size, pageWidth, margin) - indent.length;
        const parts = wrapText(text, width);
        parts.forEach((part, index) => {
            writeRawLine(`${index === 0 ? indent : indent}${part}`, size, bold);
        });
    };

    const rule = () => writeRawLine("-".repeat(maxCharsFor(8, pageWidth, margin)), 8, false);

    for (const line of lines) {
        if (line === "__RULE__") {
            rule();
            continue;
        }
        if (line === "__GAP__") {
            y -= leading * 0.55;
            continue;
        }
        if (typeof line === "object" && line) {
            if (line.wrap) {
                writeWrapped(line.text || "", line.size || fontSize, !!line.bold, line.indent || "");
            } else {
                writeWrapped(line.text || "", line.size || fontSize, !!line.bold, "");
            }
            continue;
        }
        writeWrapped(String(line ?? ""), fontSize, false, "");
    }

    if (commands.length) pushPage();
    return pages;
}

function assemblePdf(pageStreams) {
    const objects = [];
    const add = (body) => {
        objects.push(body);
        return objects.length;
    };

    const fontRegular = add("<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>");
    const fontBold = add("<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold >>");

    const contentIds = pageStreams.map((stream) => {
        const body = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
        return add(body);
    });

    const pageIds = contentIds.map((contentId) =>
        add(
            `<< /Type /Page /Parent 0 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> >> /Contents ${contentId} 0 R >>`
        )
    );

    const kids = pageIds.map((id) => `${id} 0 R`).join(" ");
    const pagesId = add(`<< /Type /Pages /Kids [ ${kids} ] /Count ${pageIds.length} >>`);

    for (let i = 0; i < pageIds.length; i += 1) {
        const idx = pageIds[i] - 1;
        objects[idx] = objects[idx].replace("/Parent 0 0 R", `/Parent ${pagesId} 0 R`);
    }

    const catalogId = add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

    let pdf = "%PDF-1.4\n";
    const offsets = [0];
    for (let i = 0; i < objects.length; i += 1) {
        offsets.push(pdf.length);
        pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
    }
    const xrefPos = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += "0000000000 65535 f \n";
    for (let i = 1; i <= objects.length; i += 1) {
        pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\n`;
    pdf += `startxref\n${xrefPos}\n%%EOF`;
    return pdf;
}

function pushBulletin(lines, label, text) {
    lines.push({ text: label, size: 9, bold: true, wrap: true });
    lines.push({ text: text || "—", size: 8, bold: false, wrap: true, indent: "  " });
}

function cell(text, width, align = "left") {
    const raw = String(text ?? "").replace(/\s+/g, " ").trim();
    const clipped = raw.length > width ? raw.slice(0, Math.max(0, width - 1)) + "." : raw;
    return align === "right" ? clipped.padStart(width, " ") : clipped.padEnd(width, " ");
}

function row(parts) {
    return parts.join(" ");
}

function modelToLines(model, labels) {
    const L = labels || {};
    const lines = [];
    const h = model.header || {};
    const atc = h.atc || {};
    const fuel = model.fuelBreakdown || {};
    const cruiseFuel =
        fuel.legsTotal && fuel.legsTotal !== "—" ? fuel.legsTotal : fuel.cruise || "—";

    lines.push({ text: `${model.brand} — BRIEFING DE VOO`, size: 12, bold: true, wrap: true });
    lines.push({
        text: `${L.generated || "Gerado"} ${model.generatedAtUtc} UTC   |   Regra ${model.flightRule}`,
        size: 9,
        wrap: true,
    });
    lines.push("__RULE__");

    lines.push({ text: L.header || "IDENTIFICACAO", size: 10, bold: true, wrap: true });
    lines.push({
        text: `Aeronave ${h.aircraft || model.aircraft || "—"}   Piloto ${h.pilot || "—"}   Data ${h.date || "—"}`,
        size: 9,
        wrap: true,
    });
    lines.push({
        text: `Origem ${h.origin || model.originIcao || "—"}   Destino ${h.dest || model.destIcao || "—"}   Velocidade ${h.speed || model.tas || "—"}   Nivel ${h.level || model.cruise || "—"}   Distancia ${h.distance || model.distNm || "—"}`,
        size: 9,
        wrap: true,
    });
    lines.push({
        text: `UTC ${h.utc || "—"}   Acionamento ${h.startup || "________"}   Decolagem ${h.takeoff || "________"}   Pouso ${h.landing || "________"}   Corte ${h.shutdown || "________"}`,
        size: 9,
        wrap: true,
    });
    lines.push({
        text: `Frequencias  CLR ${atc.clr || "____"}  GND ${atc.gnd || "____"}  TWR ${atc.twr || "____"}  APP ${atc.app || "____"}  CTR ${atc.ctr || "____"}  DEST ${atc.dest || "____"}`,
        size: 8,
        wrap: true,
    });
    lines.push({
        text: `DEP  pista ${h.depRwy || "—"}  elev ${h.depAlt || "—"}  notes ${h.depNotes || "—"}`,
        size: 9,
        wrap: true,
    });
    lines.push({
        text: `ARR  pista ${h.arrRwy || "—"}  elev ${h.arrAlt || "—"}  notes ${h.arrNotes || "—"}`,
        size: 9,
        wrap: true,
    });
    lines.push({
        text: `ALTN ${h.altn || model.altnIcao || "—"}  pista ${h.altnRwy || "—"}  elev ${h.altnAlt || "—"}  notes ${h.altnNotes || "—"}`,
        size: 9,
        wrap: true,
    });

    lines.push("__RULE__");
    lines.push({ text: `ROTA  ${model.route}`, size: 11, bold: true, wrap: true });
    lines.push({ text: L.nav || "NAVEGACAO", size: 10, bold: true, wrap: true });
    lines.push({
        text: `Distancia ${model.distNm}   ETE ${model.ete}   Autonomia ${model.endurance}   Dist ALTN ${model.altnDistNm}`,
        size: 9,
        wrap: true,
    });
    lines.push({
        text: `TAS ${model.tas}   GS ${model.gs}   Proa ${model.hdg}   MH ${model.magHdg}   Nivel ${model.cruise}`,
        size: 9,
        wrap: true,
    });
    lines.push({ text: `Vento ${model.wind}   ${model.toc || ""}   ${model.tod || ""}`, size: 9, wrap: true });

    if (model.useNavLegs && model.navLegs?.length) {
        lines.push("__GAP__");
        lines.push({ text: L.navLog || "PERNAS DA ROTA", size: 10, bold: true, wrap: true });
        lines.push({
            text: row([
                cell("#", 3),
                cell("Perna", 24),
                cell("NM", 5, "right"),
                cell("RV", 6, "right"),
                cell("RM", 6, "right"),
                cell("Proa", 6, "right"),
                cell("VI", 5, "right"),
                cell("TAS", 5, "right"),
                cell("GS", 5, "right"),
                cell("ETE", 7, "right"),
                cell("Comb", 6, "right"),
            ]),
            size: 7,
            bold: true,
            wrap: true,
        });
        for (const leg of model.navLegs) {
            lines.push({
                text: row([
                    cell(String(leg.index).padStart(2, "0"), 3),
                    cell(leg.label, 24),
                    cell(leg.distanceRaw || "-", 5, "right"),
                    cell(leg.courseRaw || "-", 6, "right"),
                    cell(leg.magCourseRaw || "-", 6, "right"),
                    cell(leg.headingRaw || "-", 6, "right"),
                    cell(leg.iasRaw || "-", 5, "right"),
                    cell(leg.tasRaw || "-", 5, "right"),
                    cell(leg.gsRaw || "-", 5, "right"),
                    cell(leg.eteRaw || "-", 7, "right"),
                    cell(leg.fuelRaw || "-", 6, "right"),
                ]),
                size: 7,
                wrap: true,
            });
        }
    }

    lines.push("__GAP__");
    lines.push({ text: L.fuel || "COMBUSTIVEL", size: 10, bold: true, wrap: true });
    lines.push({
        text: `Taxi ${fuel.taxi || "—"}   Subida ${fuel.climb || "—"}   Pernas/cruzeiro ${cruiseFuel}   Descida ${fuel.descent || "—"}`,
        size: 9,
        wrap: true,
    });
    lines.push({
        text: `Aproximacao ${fuel.approach || "—"}   Etapa ${fuel.trip || "—"}   Alternativa ${fuel.alternate || "—"}   Contingencia ${fuel.contingency || "—"}   Reserva final ${fuel.finalReserve || "—"}`,
        size: 8,
        wrap: true,
    });
    lines.push({
        text: `Requerido ${model.fuelRequired}   A bordo ${model.fuelOnBoard}   No pouso ${fuel.landing || "—"}   Margem ${model.fuelMargin}   Consumo ${model.fuelFlow}`,
        size: 9,
        bold: true,
        wrap: true,
    });

    if (model.ifrNotes || model.vfrNotes) {
        lines.push("__GAP__");
        lines.push({ text: L.notes || "OBSERVACOES", size: 10, bold: true, wrap: true });
        if (model.ifrNotes) lines.push({ text: `IFR: ${model.ifrNotes}`, size: 8, wrap: true });
        if (model.vfrNotes) lines.push({ text: `VFR: ${model.vfrNotes}`, size: 8, wrap: true });
    }

    lines.push("__RULE__");
    lines.push({ text: L.weather || "METEOROLOGIA", size: 10, bold: true, wrap: true });

    for (const st of model.stations || []) {
        lines.push("__GAP__");
        lines.push({ text: `${st.role}  ${st.icao}  [${st.category}]`, size: 10, bold: true, wrap: true });
        if (st.name) lines.push({ text: st.name, size: 8, wrap: true });
        for (const hint of st.hints || []) lines.push({ text: `- ${hint}`, size: 8, wrap: true });
        pushBulletin(lines, "METAR", st.metar);
        pushBulletin(lines, "TAF", st.taf);
    }

    if (model.warnings?.length) {
        lines.push("__RULE__");
        lines.push({ text: L.warnings || "ALERTAS", size: 10, bold: true, wrap: true });
        for (const w of model.warnings) lines.push({ text: `! ${w}`, size: 8, wrap: true });
    }

    lines.push("__RULE__");
    lines.push({ text: model.disclaimer, size: 7, bold: false, wrap: true });
    lines.push({ text: `${model.brand} · VOE SEGURO · VOE PREPARADO`, size: 8, bold: true, wrap: true });

    return lines;
}

export function buildBriefingPdfBlob(model, labels) {
    const lines = modelToLines(model, labels);
    const pageStreams = buildContentStream(lines);
    const pdfText = assemblePdf(pageStreams);
    const pdfBytes = new TextEncoder().encode(pdfText);
    return new Blob([pdfBytes], { type: "application/pdf" });
}

export function downloadBriefingPdf(model, fileName, labels) {
    const blob = buildBriefingPdfBlob(model, labels);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "Marquisa_Briefing.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    return blob;
}
