/**
 * Abre ficha operacional estilo escala de voo para impressão / "Salvar como PDF" do browser.
 */
export function openBriefingPrintWindow(model, labels = {}) {
    const L = labels;
    const stationsHtml = (model.stations || [])
        .map(
            (st) => `
      <section class="strip-block">
        <div class="strip-block-head">
          <span>${escapeHtml(st.role)}</span>
          <strong>${escapeHtml(st.icao)}</strong>
          <em>${escapeHtml(st.category)}</em>
        </div>
        ${st.name ? `<div class="strip-name">${escapeHtml(st.name)}</div>` : ""}
        ${(st.hints || []).map((h) => `<div class="strip-hint">• ${escapeHtml(h)}</div>`).join("")}
        <div class="strip-line"><span>METAR</span><pre>${escapeHtml(st.metar)}</pre></div>
        <div class="strip-line"><span>TAF</span><pre>${escapeHtml(st.taf)}</pre></div>
      </section>`
        )
        .join("");

    const warningsHtml = (model.warnings || []).length
        ? `<section class="strip-block">
            <div class="strip-section-title">${escapeHtml(L.warnings || "ALERTAS")}</div>
            ${(model.warnings || []).map((w) => `<div class="strip-warn">! ${escapeHtml(w)}</div>`).join("")}
          </section>`
        : "";

    const navLegsHtml =
        model.useNavLegs && model.navLegs?.length
            ? `<div class="section-title">${escapeHtml(L.navLog || "PERNAS / WAYPOINTS")}</div>
               <table class="nav-table">
                 <thead>
                   <tr>
                     <th>#</th><th>Perna</th><th>NM</th><th>TC</th><th>MH</th><th>HDG</th>
                     <th>VI</th><th>TAS</th><th>GS</th><th>ETE</th><th>FUEL</th>
                   </tr>
                 </thead>
                 <tbody>
                   ${model.navLegs
                       .map(
                           (leg) => `<tr>
                     <td>${escapeHtml(String(leg.index).padStart(2, "0"))}</td>
                     <td>${escapeHtml(leg.label)}</td>
                     <td>${escapeHtml(leg.distanceRaw || "—")}</td>
                     <td>${escapeHtml(leg.courseRaw || "—")}</td>
                     <td>${escapeHtml(leg.magCourseRaw || "—")}</td>
                     <td>${escapeHtml(leg.headingRaw || "—")}</td>
                     <td>${escapeHtml(leg.iasRaw || "—")}</td>
                     <td>${escapeHtml(leg.tasRaw || "—")}</td>
                     <td>${escapeHtml(leg.gsRaw || "—")}</td>
                     <td>${escapeHtml(leg.eteRaw || "—")}</td>
                     <td>${escapeHtml(leg.fuelRaw || "—")}</td>
                   </tr>`
                       )
                       .join("")}
                 </tbody>
               </table>`
            : "";

    const h = model.header || {};
    const atc = h.atc || {};
    const fuel = model.fuelBreakdown || {};
    const headerHtml = `
      <div class="section-title">${escapeHtml(L.header || "CABEÇALHO")}</div>
      <div class="brief-grid brief-grid-3">
        <div><span>ACFT</span><strong>${escapeHtml(h.aircraft || model.aircraft || "—")}</strong></div>
        <div><span>PILOTO</span><strong>${escapeHtml(h.pilot || "—")}</strong></div>
        <div><span>DATA</span><strong>${escapeHtml(h.date || "—")}</strong></div>
      </div>
      <div class="brief-grid brief-grid-5">
        <div><span>ORIG</span><strong>${escapeHtml(h.origin || model.originIcao || "—")}</strong></div>
        <div><span>DEST</span><strong>${escapeHtml(h.dest || model.destIcao || "—")}</strong></div>
        <div><span>VEL</span><strong>${escapeHtml(h.speed || model.tas || "—")}</strong></div>
        <div><span>FL</span><strong>${escapeHtml(h.level || model.cruise || "—")}</strong></div>
        <div><span>DIST</span><strong>${escapeHtml(h.distance || model.distNm || "—")}</strong></div>
      </div>
      <div class="brief-grid brief-grid-5">
        <div><span>UTC</span><strong>${escapeHtml(h.utc || "—")}</strong></div>
        <div><span>ACION</span><strong class="pen">${escapeHtml(h.startup || "________")}</strong></div>
        <div><span>DECOL</span><strong class="pen">${escapeHtml(h.takeoff || "________")}</strong></div>
        <div><span>POUSO</span><strong class="pen">${escapeHtml(h.landing || "________")}</strong></div>
        <div><span>CORTE</span><strong class="pen">${escapeHtml(h.shutdown || "________")}</strong></div>
      </div>
      <div class="brief-grid brief-grid-6">
        <div><span>CLR</span><strong>${escapeHtml(atc.clr || "____")}</strong></div>
        <div><span>GND</span><strong>${escapeHtml(atc.gnd || "____")}</strong></div>
        <div><span>TWR</span><strong>${escapeHtml(atc.twr || "____")}</strong></div>
        <div><span>APP</span><strong>${escapeHtml(atc.app || "____")}</strong></div>
        <div><span>CTR</span><strong>${escapeHtml(atc.ctr || "____")}</strong></div>
        <div><span>DEST</span><strong>${escapeHtml(atc.dest || "____")}</strong></div>
      </div>
      <div class="brief-grid brief-grid-3">
        <div><span>DEP RWY</span><strong>${escapeHtml(h.depRwy || "—")}</strong></div>
        <div><span>DEP ALT</span><strong>${escapeHtml(h.depAlt || "—")}</strong></div>
        <div><span>DEP NOTES</span><strong>${escapeHtml(h.depNotes || "—")}</strong></div>
      </div>
      <div class="brief-grid brief-grid-3">
        <div><span>ARR RWY</span><strong>${escapeHtml(h.arrRwy || "—")}</strong></div>
        <div><span>ARR ALT</span><strong>${escapeHtml(h.arrAlt || "—")}</strong></div>
        <div><span>ARR NOTES</span><strong>${escapeHtml(h.arrNotes || "—")}</strong></div>
      </div>
      <div class="brief-grid brief-grid-4">
        <div><span>ALTN</span><strong>${escapeHtml(h.altn || model.altnIcao || "—")}</strong></div>
        <div><span>ALTN RWY</span><strong>${escapeHtml(h.altnRwy || "—")}</strong></div>
        <div><span>ALTN ALT</span><strong>${escapeHtml(h.altnAlt || "—")}</strong></div>
        <div><span>NOTES</span><strong>${escapeHtml(h.altnNotes || "—")}</strong></div>
      </div>`;

    const fuelHtml = `
      <div class="section-title">${escapeHtml(L.fuel || "COMBUSTÍVEL (BIANCH)")}</div>
      <div class="brief-grid brief-grid-4">
        <div><span>TAXI</span><strong>${escapeHtml(fuel.taxi || "—")}</strong></div>
        <div><span>SUBIDA</span><strong>${escapeHtml(fuel.climb || "—")}</strong></div>
        <div><span>PERNAS/CRZ</span><strong>${escapeHtml(
            fuel.legsTotal && fuel.legsTotal !== "—" ? fuel.legsTotal : fuel.cruise || "—"
        )}</strong></div>
        <div><span>DESCIDA</span><strong>${escapeHtml(fuel.descent || "—")}</strong></div>
      </div>
      <div class="brief-grid brief-grid-5">
        <div><span>APP</span><strong>${escapeHtml(fuel.approach || "—")}</strong></div>
        <div><span>TRIP</span><strong>${escapeHtml(fuel.trip || "—")}</strong></div>
        <div><span>ALTN</span><strong>${escapeHtml(fuel.alternate || "—")}</strong></div>
        <div><span>CONT</span><strong>${escapeHtml(fuel.contingency || "—")}</strong></div>
        <div><span>FINAL</span><strong>${escapeHtml(fuel.finalReserve || "—")}</strong></div>
      </div>
      <div class="brief-grid brief-grid-4">
        <div><span>REQ</span><strong>${escapeHtml(model.fuelRequired)}</strong></div>
        <div><span>FOB</span><strong>${escapeHtml(model.fuelOnBoard)}</strong></div>
        <div><span>LDG</span><strong>${escapeHtml(fuel.landing || "—")}</strong></div>
        <div><span>MARGIN</span><strong>${escapeHtml(model.fuelMargin)}</strong></div>
      </div>`;

    const notesHtml =
        model.ifrNotes || model.vfrNotes
            ? `<div class="section-title">${escapeHtml(L.notes || "OBSERVAÇÕES")}</div>
               ${model.ifrNotes ? `<div class="note-line"><span>IFR</span><p>${escapeHtml(model.ifrNotes)}</p></div>` : ""}
               ${model.vfrNotes ? `<div class="note-line"><span>VFR</span><p>${escapeHtml(model.vfrNotes)}</p></div>` : ""}`
            : "";

    const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(model.brand)} · Briefing ${escapeHtml(model.route)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600;700&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #e8edf2;
      color: #0b1220;
      font-family: "IBM Plex Mono", "Share Tech Mono", ui-monospace, monospace;
    }
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 5;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: #0b1220;
      color: #e2e8f0;
    }
    .toolbar strong { letter-spacing: 0.08em; text-transform: uppercase; font-size: 12px; }
    .toolbar-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .toolbar button {
      appearance: none;
      border: 1px solid rgba(94,234,212,0.45);
      background: rgba(94,234,212,0.12);
      color: #5eead4;
      font: inherit;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
    }
    .sheet {
      max-width: 900px;
      margin: 18px auto 40px;
      padding: 22px 24px;
      background: #f7f4ea;
      border: 1px solid #c4b89a;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.18);
    }
    .mast {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: baseline;
      border-bottom: 2px solid #1f2937;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .mast h1 {
      margin: 0;
      font-size: 18px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    .mast time {
      font-size: 12px;
      letter-spacing: 0.08em;
    }
    .route {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: 0.08em;
      margin: 8px 0 10px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px 18px;
      font-size: 12px;
      line-height: 1.45;
      margin-bottom: 14px;
    }
    .section-title {
      margin: 14px 0 8px;
      font-size: 12px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      border-bottom: 1px dashed #6b7280;
      padding-bottom: 4px;
    }
    .kv {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 4px 16px;
      font-size: 12px;
      margin-bottom: 8px;
    }
    .strip-block {
      border: 1px solid #9ca3af;
      background: #fffdf6;
      padding: 10px 12px;
      margin: 10px 0;
    }
    .strip-block-head {
      display: flex;
      gap: 10px;
      align-items: baseline;
      flex-wrap: wrap;
      font-size: 12px;
      letter-spacing: 0.06em;
      margin-bottom: 6px;
    }
    .strip-block-head strong { font-size: 16px; letter-spacing: 0.12em; }
    .strip-block-head em {
      font-style: normal;
      border: 1px solid #111827;
      padding: 1px 6px;
      font-size: 11px;
      font-weight: 700;
    }
    .strip-name { font-size: 11px; margin-bottom: 6px; color: #374151; }
    .strip-hint { font-size: 11px; margin: 2px 0; }
    .strip-line {
      display: grid;
      grid-template-columns: 54px 1fr;
      gap: 8px;
      margin-top: 6px;
      font-size: 11px;
    }
    .strip-line span { font-weight: 700; letter-spacing: 0.08em; }
    .strip-line pre {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;
      font: inherit;
    }
    .strip-section-title {
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .strip-warn { font-size: 11px; margin: 3px 0; }
    .disclaimer {
      margin-top: 16px;
      padding-top: 8px;
      border-top: 2px solid #1f2937;
      font-size: 10px;
      line-height: 1.4;
      letter-spacing: 0.02em;
    }
    .footer-brand {
      margin-top: 8px;
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      font-weight: 700;
    }
    .nav-log {
      display: grid;
      gap: 4px;
      margin: 0 0 14px;
      font-size: 11px;
      line-height: 1.35;
    }
    .nav-log-line {
      padding: 4px 0;
      border-bottom: 1px dashed rgba(31, 41, 55, 0.25);
    }
    .brief-grid {
      display: grid;
      gap: 6px 10px;
      margin: 0 0 8px;
    }
    .brief-grid-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .brief-grid-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .brief-grid-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
    .brief-grid-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
    .brief-grid > div {
      border: 1px solid #9ca3af;
      background: #fff;
      padding: 6px 8px;
      min-height: 42px;
    }
    .brief-grid span {
      display: block;
      font-size: 9px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #4b5563;
      margin-bottom: 2px;
    }
    .brief-grid strong {
      display: block;
      font-size: 12px;
      letter-spacing: 0.02em;
      word-break: break-word;
    }
    .brief-grid strong.pen {
      border-bottom: 1px solid #111827;
      min-height: 16px;
    }
    .nav-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
      margin: 0 0 12px;
    }
    .nav-table th,
    .nav-table td {
      border: 1px solid #9ca3af;
      padding: 4px 5px;
      text-align: left;
      white-space: nowrap;
    }
    .nav-table th {
      background: #e5e7eb;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      font-size: 9px;
    }
    .nav-table td:nth-child(n+3) { text-align: right; }
    .note-line {
      display: grid;
      grid-template-columns: 48px 1fr;
      gap: 8px;
      margin: 0 0 8px;
      font-size: 11px;
    }
    .note-line span { font-weight: 700; letter-spacing: 0.08em; }
    .note-line p { margin: 0; }
    @media print {
      body { background: #fff; }
      .toolbar { display: none !important; }
      .sheet {
        margin: 0;
        max-width: none;
        box-shadow: none;
        border: 0;
        padding: 0;
      }
    }
    @media (max-width: 720px) {
      .meta-grid, .kv,
      .brief-grid-3, .brief-grid-4, .brief-grid-5, .brief-grid-6 { grid-template-columns: 1fr 1fr; }
      .route { font-size: 22px; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <strong>${escapeHtml(model.brand)} · ${escapeHtml(L.stripTitle || "FICHA OPERACIONAL")}</strong>
    <div class="toolbar-actions">
      <button type="button" onclick="window.print()">${escapeHtml(L.print || "Imprimir / Salvar como PDF")}</button>
      <button type="button" onclick="window.close()">${escapeHtml(L.close || "Fechar")}</button>
    </div>
  </div>
  <main class="sheet">
    <header class="mast">
      <h1>${escapeHtml(model.brand)} · BRIEFING DE VOO</h1>
      <time>${escapeHtml(model.generatedAtUtc)} UTC</time>
    </header>
    <div class="route">${escapeHtml(model.route)}</div>
    <div class="meta-grid">
      <div>RULE ${escapeHtml(model.flightRule)}</div>
      <div>CALLSIGN ${escapeHtml(model.callsign)}</div>
      <div>ACFT ${escapeHtml(model.aircraft)}</div>
      <div>ALTN ${escapeHtml(model.altnIcao || "—")}</div>
    </div>

    ${headerHtml}

    <div class="section-title">${escapeHtml(L.nav || "NAVEGAÇÃO")}</div>
    <div class="kv">
      <div>DIST ${escapeHtml(model.distNm)}</div>
      <div>ALTN DIST ${escapeHtml(model.altnDistNm)}</div>
      <div>ETE ${escapeHtml(model.ete)}</div>
      <div>ENDURANCE ${escapeHtml(model.endurance)}</div>
      <div>TAS ${escapeHtml(model.tas)}</div>
      <div>GS ${escapeHtml(model.gs)}</div>
      <div>HDG ${escapeHtml(model.hdg)}</div>
      <div>MH ${escapeHtml(model.magHdg)}</div>
      <div>CRZ ${escapeHtml(model.cruise)}</div>
      <div>WIND ${escapeHtml(model.wind)}</div>
      <div>${escapeHtml(model.toc || "TOC —")}</div>
      <div>${escapeHtml(model.tod || "TOD —")}</div>
      <div>CRZ DIST ${escapeHtml(model.cruiseDist || "—")}</div>
    </div>

    ${navLegsHtml}
    ${fuelHtml}
    ${notesHtml}

    <div class="section-title">${escapeHtml(L.weather || "METEOROLOGIA")}</div>
    ${stationsHtml}
    ${warningsHtml}

    <p class="disclaimer">${escapeHtml(model.disclaimer)}</p>
    <div class="footer-brand">${escapeHtml(model.brand)} · VOE SEGURO · VOE PREPARADO</div>
  </main>
</body>
</html>`;

    const win = window.open("", "_blank", "noopener,noreferrer,width=960,height=900");
    if (!win) {
        throw new Error("POPUP_BLOCKED");
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    return win;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
