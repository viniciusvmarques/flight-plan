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
    // Reserva faixa do rodapé (logo)
    const minY = margin + 44;
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
            const size = line.size || fontSize;
            const bold = !!line.bold;
            if (line.nowrap) {
                const max = maxCharsFor(size, pageWidth, margin);
                const text = String(line.text || "");
                writeRawLine(text.length > max ? text.slice(0, max) : text, size, bold);
            } else if (line.wrap) {
                writeWrapped(line.text || "", size, bold, line.indent || "");
            } else {
                writeWrapped(line.text || "", size, bold, "");
            }
            continue;
        }
        writeWrapped(String(line ?? ""), fontSize, false, "");
    }

    if (commands.length) pushPage();
    return pages;
}

function enc(str) {
    return new TextEncoder().encode(str);
}

function concatBytes(chunks) {
    const total = chunks.reduce((n, c) => n + c.length, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
        out.set(chunk, offset);
        offset += chunk.length;
    }
    return out;
}

function footerLogoOps(logo, pageWidth = 595.28, margin = 36) {
    if (!logo?.bytes?.length) return "";
    const drawW = 118;
    const drawH = Math.max(16, (logo.height / logo.width) * drawW);
    const x = margin;
    const y = 16;
    return [
        "q",
        `${drawW.toFixed(2)} 0 0 ${drawH.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm`,
        "/ImLogo Do",
        "Q",
    ].join("\n");
}

/**
 * Monta PDF binário (texto + JPEG opcional no rodapé de cada página).
 */
function assemblePdf(pageStreams, logo = null) {
    const objects = []; // string | { header: string, binary: Uint8Array }

    const add = (body) => {
        objects.push(body);
        return objects.length;
    };

    const fontRegular = add("<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>");
    const fontBold = add("<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold >>");

    let imageId = null;
    if (logo?.bytes?.length) {
        const header =
            `<< /Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} ` +
            `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${logo.bytes.length} >>\n` +
            `stream\n`;
        imageId = add({ header, binary: logo.bytes, tail: "\nendstream" });
    }

    const footer = footerLogoOps(logo);
    const contentIds = pageStreams.map((stream) => {
        const full = footer ? `${stream}\n${footer}` : stream;
        const body = `<< /Length ${full.length} >>\nstream\n${full}\nendstream`;
        return add(body);
    });

    const xObjectRes = imageId ? `/XObject << /ImLogo ${imageId} 0 R >>` : "";
    const pageIds = contentIds.map((contentId) =>
        add(
            `<< /Type /Page /Parent 0 0 R /MediaBox [0 0 595.28 841.89] ` +
                `/Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> ${xObjectRes} >> ` +
                `/Contents ${contentId} 0 R >>`
        )
    );

    const kids = pageIds.map((id) => `${id} 0 R`).join(" ");
    const pagesId = add(`<< /Type /Pages /Kids [ ${kids} ] /Count ${pageIds.length} >>`);

    for (let i = 0; i < pageIds.length; i += 1) {
        const idx = pageIds[i] - 1;
        objects[idx] = objects[idx].replace("/Parent 0 0 R", `/Parent ${pagesId} 0 R`);
    }

    const catalogId = add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

    const parts = [enc("%PDF-1.4\n")];
    const offsets = [0];
    let size = parts[0].length;

    for (let i = 0; i < objects.length; i += 1) {
        offsets.push(size);
        const obj = objects[i];
        if (typeof obj === "string") {
            const chunk = enc(`${i + 1} 0 obj\n${obj}\nendobj\n`);
            parts.push(chunk);
            size += chunk.length;
        } else {
            const head = enc(`${i + 1} 0 obj\n${obj.header}`);
            const tail = enc(`${obj.tail}\nendobj\n`);
            parts.push(head, obj.binary, tail);
            size += head.length + obj.binary.length + tail.length;
        }
    }

    const xrefPos = size;
    let xref = `xref\n0 ${objects.length + 1}\n`;
    xref += "0000000000 65535 f \n";
    for (let i = 1; i <= objects.length; i += 1) {
        xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
    }
    xref += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\n`;
    xref += `startxref\n${xrefPos}\n%%EOF`;
    parts.push(enc(xref));

    return concatBytes(parts);
}

async function loadWordmarkJpeg() {
    const src = "/marquisa-wordmark.png?v=20260722g";
    const img = await new Promise((resolve, reject) => {
        const el = new Image();
        el.decoding = "async";
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("WORDMARK_LOAD_FAILED"));
        el.src = src;
    });

    const maxW = 480;
    const scale = maxW / Math.max(1, img.naturalWidth || img.width);
    const width = Math.max(1, Math.round((img.naturalWidth || img.width) * scale));
    const height = Math.max(1, Math.round((img.naturalHeight || img.height) * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("CANVAS_UNAVAILABLE");
    // Mantém placa preta do wordmark (legível no papel branco do PDF)
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
    if (!blob) throw new Error("JPEG_ENCODE_FAILED");
    const bytes = new Uint8Array(await blob.arrayBuffer());
    return { bytes, width, height };
}

function pushBulletin(lines, label, text) {
    lines.push({ text: label, size: 9, bold: true, wrap: true });
    lines.push({ text: text || "—", size: 8, bold: false, wrap: true, indent: "  " });
}

function cell(text, width, align = "left") {
    const raw = String(text ?? "")
        .replace(/\s+/g, " ")
        .replace(/ DEG/gi, "")
        .replace(/°/g, "")
        .trim();
    const clipped = raw.length > width ? raw.slice(0, Math.max(1, width - 1)) + "." : raw;
    return align === "right" ? clipped.padStart(width, " ") : clipped.padEnd(width, " ");
}

function row(parts) {
    return parts.join(" ");
}

/** Par rótulo/valor alinhado em colunas fixas. */
function field(label, value, labelW = 12, valueW = 14) {
    return `${cell(label, labelW)}${cell(value ?? "—", valueW)}`;
}

function trio(a, b, c) {
    return row([a, b, c || cell("", 26)]);
}

function cleanDeg(value) {
    return String(value ?? "")
        .replace(/\s*DEG/gi, "")
        .replace(/°/g, "")
        .trim();
}

function modelToLines(model, labels) {
    const L = labels || {};
    const lines = [];
    const h = model.header || {};
    const atc = h.atc || {};
    const fuel = model.fuelBreakdown || {};
    const cruiseFuel =
        fuel.legsTotal && fuel.legsTotal !== "—" ? fuel.legsTotal : fuel.cruise || "—";

    const pushFixed = (text, size = 8, bold = false) => {
        lines.push({ text, size, bold, nowrap: true });
    };

    lines.push({ text: `${model.brand} — BRIEFING DE VOO`, size: 12, bold: true, wrap: true });
    lines.push({
        text: `${L.generated || "Gerado"} ${model.generatedAtUtc} UTC          Regra: ${model.flightRule}`,
        size: 9,
        nowrap: true,
    });
    lines.push("__RULE__");

    lines.push({ text: L.header || "IDENTIFICACAO", size: 10, bold: true, wrap: true });
    pushFixed(
        trio(
            field("Aeronave", h.aircraft || model.aircraft || "—", 10, 16),
            field("Piloto", h.pilot || "—", 8, 22),
            field("Data", h.date || "—", 6, 12)
        )
    );
    pushFixed(
        trio(
            field("Origem", h.origin || model.originIcao || "—", 10, 8),
            field("Destino", h.dest || model.destIcao || "—", 9, 8),
            field("Veloc.", h.speed || model.tas || "—", 8, 10)
        )
    );
    pushFixed(
        trio(
            field("Nivel", h.level || model.cruise || "—", 10, 10),
            field("Distancia", h.distance || model.distNm || "—", 10, 10),
            field("UTC", h.utc || "—", 6, 10)
        )
    );
    pushFixed(
        trio(
            field("Acionam.", h.startup || "________", 10, 10),
            field("Decolagem", h.takeoff || "________", 10, 10),
            field("Pouso", h.landing || "________", 8, 12)
        )
    );
    pushFixed(field("Corte", h.shutdown || "________", 10, 12));
    lines.push("__GAP__");
    pushFixed(
        trio(
            field("CLR", atc.clr || "____", 5, 9),
            field("GND", atc.gnd || "____", 5, 9),
            field("TWR", atc.twr || "____", 5, 9)
        )
    );
    pushFixed(
        trio(
            field("APP", atc.app || "____", 5, 9),
            field("CTR", atc.ctr || "____", 5, 9),
            field("DEST", atc.dest || "____", 5, 9)
        )
    );
    lines.push("__GAP__");
    pushFixed(
        trio(
            field("DEP pista", h.depRwy || "—", 10, 6),
            field("DEP elev", h.depAlt || "—", 9, 10),
            field("DEP notes", h.depNotes || "—", 10, 18)
        )
    );
    pushFixed(
        trio(
            field("ARR pista", h.arrRwy || "—", 10, 6),
            field("ARR elev", h.arrAlt || "—", 9, 10),
            field("ARR notes", h.arrNotes || "—", 10, 18)
        )
    );
    pushFixed(
        trio(
            field("ALTN", h.altn || model.altnIcao || "—", 10, 6),
            field("ALTN pista", h.altnRwy || "—", 10, 6),
            field("ALTN elev", h.altnAlt || "—", 10, 10)
        )
    );
    if (h.altnNotes && h.altnNotes !== "—") {
        pushFixed(field("ALTN notes", h.altnNotes, 10, 50));
    }

    lines.push("__RULE__");
    lines.push({ text: `ROTA  ${model.route}`, size: 11, bold: true, wrap: true });
    lines.push({ text: L.nav || "NAVEGACAO", size: 10, bold: true, wrap: true });
    pushFixed(
        trio(
            field("Distancia", model.distNm || "—", 10, 12),
            field("ETE", model.ete || "—", 5, 10),
            field("Autonomia", model.endurance || "—", 10, 10)
        )
    );
    pushFixed(
        trio(
            field("Dist ALTN", model.altnDistNm || "—", 10, 12),
            field("TAS", model.tas || "—", 5, 10),
            field("GS", model.gs || "—", 4, 10)
        )
    );
    pushFixed(
        trio(
            field("Proa", cleanDeg(model.hdg) || "—", 10, 10),
            field("MH", cleanDeg(model.magHdg) || "—", 4, 10),
            field("Nivel", model.cruise || "—", 7, 12)
        )
    );
    pushFixed(field("Vento", model.wind || "—", 10, 40));
    pushFixed(`${cell(model.toc || "", 28)}${cell(model.tod || "", 28)}`);

    if (model.useNavLegs && model.navLegs?.length) {
        lines.push("__GAP__");
        lines.push({ text: L.navLog || "PERNAS DA ROTA", size: 10, bold: true, wrap: true });
        // Larguras totais ~ 86 chars (cabe em Courier 8pt).
        pushFixed(
            row([
                cell("#", 2),
                cell("Perna", 18),
                cell("NM", 4, "right"),
                cell("RV", 5, "right"),
                cell("RM", 5, "right"),
                cell("Proa", 5, "right"),
                cell("VI", 4, "right"),
                cell("TAS", 4, "right"),
                cell("GS", 4, "right"),
                cell("ETE", 6, "right"),
                cell("Comb", 5, "right"),
            ]),
            8,
            true
        );
        for (const leg of model.navLegs) {
            pushFixed(
                row([
                    cell(String(leg.index).padStart(2, "0"), 2),
                    cell(leg.label, 18),
                    cell(leg.distanceRaw || "-", 4, "right"),
                    cell(cleanDeg(leg.courseRaw) || "-", 5, "right"),
                    cell(cleanDeg(leg.magCourseRaw) || "-", 5, "right"),
                    cell(cleanDeg(leg.headingRaw) || "-", 5, "right"),
                    cell(leg.iasRaw || "-", 4, "right"),
                    cell(leg.tasRaw || "-", 4, "right"),
                    cell(leg.gsRaw || "-", 4, "right"),
                    cell(leg.eteRaw || "-", 6, "right"),
                    cell(leg.fuelRaw || "-", 5, "right"),
                ]),
                8,
                false
            );
        }
    }

    lines.push("__GAP__");
    lines.push({ text: L.fuel || "COMBUSTIVEL", size: 10, bold: true, wrap: true });
    pushFixed(
        trio(
            field("Taxi", fuel.taxi || "—", 10, 10),
            field("Subida", fuel.climb || "—", 8, 10),
            field("Pernas", cruiseFuel, 8, 12)
        )
    );
    pushFixed(
        trio(
            field("Descida", fuel.descent || "—", 10, 10),
            field("Aprox.", fuel.approach || "—", 8, 10),
            field("Etapa", fuel.trip || "—", 7, 12)
        )
    );
    pushFixed(
        trio(
            field("Alternativa", fuel.alternate || "—", 12, 10),
            field("Conting.", fuel.contingency || "—", 9, 10),
            field("Reserva", fuel.finalReserve || "—", 8, 12)
        )
    );
    pushFixed(
        trio(
            field("Requerido", model.fuelRequired || "—", 10, 10),
            field("A bordo", model.fuelOnBoard || "—", 9, 10),
            field("Margem", model.fuelMargin || "—", 8, 12)
        ),
        8,
        true
    );
    pushFixed(
        trio(
            field("No pouso", fuel.landing || "—", 10, 10),
            field("Consumo", model.fuelFlow || "—", 9, 12),
            ""
        )
    );

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

export async function buildBriefingPdfBlob(model, labels) {
    const lines = modelToLines(model, labels);
    const pageStreams = buildContentStream(lines);
    let logo = null;
    try {
        logo = await loadWordmarkJpeg();
    } catch {
        logo = null;
    }
    const pdfBytes = assemblePdf(pageStreams, logo);
    return new Blob([pdfBytes], { type: "application/pdf" });
}

export async function downloadBriefingPdf(model, fileName, labels) {
    const blob = await buildBriefingPdfBlob(model, labels);
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
