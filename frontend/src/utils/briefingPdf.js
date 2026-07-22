/**
 * PDF mínimo (PDF 1.4) com Courier — tipografia estilo escala / strip ATC.
 * Sem dependências externas.
 */

function escapePdf(text) {
    return String(text ?? "")
        .replace(/\\/g, "\\\\")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)")
        .replace(/[^\x20-\x7E]/g, (ch) => {
            // Remove acentos para Courier Type1 (WinAnsi limitado); mantém ASCII operacional.
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

    const writeLine = (text, size = fontSize, bold = false) => {
        if (y < minY) pushPage();
        const safe = escapePdf(text);
        const font = bold ? "F2" : "F1";
        commands.push("BT");
        commands.push(`/${font} ${size} Tf`);
        commands.push(`${margin} ${y.toFixed(2)} Td`);
        commands.push(`(${safe}) Tj`);
        commands.push("ET");
        y -= leading;
    };

    const rule = () => writeLine("-".repeat(86), 8, false);

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
            writeLine(line.text || "", line.size || fontSize, !!line.bold);
            continue;
        }
        writeLine(String(line ?? ""), fontSize, false);
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

    // Patch Parent references in page objects
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

function modelToLines(model, labels) {
    const L = labels || {};
    const lines = [];

    lines.push({ text: `${model.brand}  ·  BRIEFING OPS STRIP`, size: 12, bold: true });
    lines.push({ text: `${L.generated || "GERADO"}  ${model.generatedAtUtc}   UTC`, size: 9, bold: false });
    lines.push("__RULE__");
    lines.push({ text: `ROUTE   ${model.route}`, size: 14, bold: true });
    lines.push(
        `RULE ${model.flightRule}   CALLSIGN ${model.callsign}   ACFT ${model.aircraft}   ALTN ${model.altnIcao || "—"}`
    );
    lines.push("__RULE__");
    lines.push({ text: L.nav || "NAVEGACAO", size: 10, bold: true });
    lines.push(
        `DIST ${model.distNm}   ALTN DIST ${model.altnDistNm}   ETE ${model.ete}   ENDURANCE ${model.endurance}`
    );
    lines.push(`TAS ${model.tas}   GS ${model.gs}   HDG ${model.hdg}   MH ${model.magHdg}   CRZ ${model.cruise}`);
    lines.push(`WIND ${model.wind}`);
    lines.push("__GAP__");
    lines.push({ text: L.fuel || "COMBUSTIVEL", size: 10, bold: true });
    lines.push(
        `REQ ${model.fuelRequired}   FOB ${model.fuelOnBoard}   MARGIN ${model.fuelMargin}   FLOW ${model.fuelFlow}`
    );
    lines.push("__RULE__");
    lines.push({ text: L.weather || "METEOROLOGIA", size: 10, bold: true });

    for (const st of model.stations || []) {
        lines.push("__GAP__");
        lines.push({ text: `${st.role}  ${st.icao}  [${st.category}]`, size: 10, bold: true });
        if (st.name) lines.push(st.name);
        for (const hint of st.hints || []) lines.push(`- ${hint}`);
        lines.push(`METAR  ${st.metar}`);
        lines.push(`TAF    ${st.taf}`);
    }

    if (model.warnings?.length) {
        lines.push("__RULE__");
        lines.push({ text: L.warnings || "ALERTAS", size: 10, bold: true });
        for (const w of model.warnings) lines.push(`! ${w}`);
    }

    lines.push("__RULE__");
    lines.push({ text: model.disclaimer, size: 7, bold: false });
    lines.push({ text: `${model.brand} · VOE SEGURO · VOE PREPARADO`, size: 8, bold: true });

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
