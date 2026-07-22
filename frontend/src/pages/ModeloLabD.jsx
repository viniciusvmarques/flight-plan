import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchStationWeather } from "../services/weatherService";
import { decodeMetarSummary } from "../utils/metarDecoder";
import { classifyFromMetar } from "../utils/classifyFlightCategory";
import "../styles/modelo-g1000.css";
import MarquisaMark from "../components/MarquisaMark";

const SCREENS = [
  { id: "home", label: "PFD/MFD" },
  { id: "weather", label: "WX" },
  { id: "dashboard", label: "FPL" },
  { id: "login", label: "Login" },
  { id: "exams", label: "Exams" },
  { id: "billing", label: "PRO" },
];

const QUICK = ["SBGR", "SBRJ", "SBSP", "SBCF", "SBGL"];
const SOFTKEYS = ["MAP", "WX", "FPL", "PROC", "NRST", "MENU"];

function toneOf(cat) {
  const c = String(cat || "").toUpperCase();
  if (c === "VFR") return "vfr";
  if (c === "MVFR") return "mvfr";
  if (c === "IFR" || c === "LIFR") return "ifr";
  return "nodata";
}

function Unit({ utc, actions, softActive, onSoft, children, dual = true }) {
  return (
    <div className="g1-unit">
      <div className="g1-bezel-top">
        <div className="g1-brand">
          <div className="g1-brand-badge">
            <MarquisaMark size={22} />
          </div>
          <div>
            <h1>MARQUISA</h1>
            <p>Integrated flight deck · Modelo D</p>
          </div>
        </div>
        <div className="g1-utc">
          <time>{utc}</time>
          <span>UTC</span>
        </div>
        <div className="g1-top-actions">{actions}</div>
      </div>

      <div className={`g1-screens${dual ? "" : " g1-single"}`}>{children}</div>

      <div className="g1-softkeys">
        {SOFTKEYS.map((key) => (
          <button
            key={key}
            type="button"
            className={`g1-softkey${softActive === key ? " is-active" : ""}`}
            onClick={() => onSoft?.(key)}
          >
            {key}
          </button>
        ))}
      </div>
      <div className="g1-knobs" aria-hidden="true">
        <div className="g1-knob" />
        <div className="g1-knob" />
        <div className="g1-knob" />
      </div>
    </div>
  );
}

function PfdScreen({ category }) {
  const tone = toneOf(category);
  return (
    <div className="g1-display">
      <span className="g1-display-label">PFD</span>
      <div className="g1-annunciator">
        <i className="ok">GPS</i>
        <i className={tone === "ifr" ? "warn" : "ok"}>{tone === "nodata" ? "WX" : category}</i>
      </div>
      <div className="g1-pfd">
        <div className="g1-tape g1-tape--ias">
          <span>140</span>
          <strong>128</strong>
          <span>110</span>
        </div>
        <div className="g1-tape g1-tape--alt">
          <span>4200</span>
          <strong>3500</strong>
          <span>2800</span>
        </div>
        <div className="g1-horizon-line" />
        <div className="g1-aircraft-ref" />
        <div className="g1-hsi">
          <b>HDG 147°</b>
          <span>GPS · CRS 150°</span>
        </div>
      </div>
    </div>
  );
}

function MfdWx({ icao, setIcao, onLoad, loading, error, metar, taf, airportName, category, summary }) {
  const tone = toneOf(category);
  return (
    <div className="g1-display">
      <span className="g1-display-label">MFD · WX</span>
      <div className="g1-mfd">
        <div className="g1-mfd-title">Aviation weather</div>
        <div className="g1-mfd-icao">{icao || "----"}</div>
        <div style={{ color: "var(--g1-muted)", fontSize: "0.85rem" }}>{airportName || "Station"}</div>
        <div className="g1-cat-row">
          <span className={`g1-cat g1-cat--${tone}`}>
            {category === "NO_DATA" || category === "UNKNOWN" ? "——" : category}
          </span>
          <span style={{ color: "var(--g1-muted)", fontSize: "0.85rem" }}>{summary.categoryLabel}</span>
        </div>
        {summary.hints?.length ? (
          <ul className="g1-hints">
            {summary.hints.slice(0, 4).map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        ) : null}
        {error ? <div className="g1-error">{error}</div> : null}
        <div className="g1-raw">{metar || "METAR ——"}</div>
        <div className="g1-raw">{taf || "TAF ——"}</div>
        <form
          className="g1-form"
          onSubmit={(e) => {
            e.preventDefault();
            onLoad(icao);
          }}
        >
          <input
            value={icao}
            onChange={(e) => setIcao(e.target.value.toUpperCase().slice(0, 4))}
            maxLength={4}
            placeholder="ICAO"
          />
          <button type="submit" className="g1-btn g1-btn--cyan" disabled={loading}>
            {loading ? "…" : "ENTR"}
          </button>
        </form>
        <div className="g1-quick">
          {QUICK.map((code) => (
            <button
              key={code}
              type="button"
              className={icao === code ? "is-active" : ""}
              onClick={() => {
                setIcao(code);
                onLoad(code);
              }}
            >
              {code}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function HomeDual({ wx }) {
  return (
    <>
      <PfdScreen category={wx.category} />
      <MfdWx {...wx} />
    </>
  );
}

function WeatherOnly({ wx }) {
  return (
    <div className="g1-plate">
      <span className="g1-kicker">MFD page</span>
      <h2 className="g1-title">Weather radar / METAR</h2>
      <p className="g1-lead">Consulta pública no estilo página WX do G1000 — boletim + categoria.</p>
      <div style={{ marginTop: 14 }}>
        <MfdWx {...wx} />
      </div>
    </div>
  );
}

function DashboardScreen() {
  return (
    <div className="g1-plate">
      <span className="g1-kicker">FPL</span>
      <h2 className="g1-title">Active flight plan</h2>
      <p className="g1-lead">Origem, destino e alternativa — strip operacional estilo G1000.</p>
      <form className="g1-route" onSubmit={(e) => e.preventDefault()}>
        <label className="g1-field">
          <span>A · Origin</span>
          <input defaultValue="SBCF" maxLength={4} />
        </label>
        <label className="g1-field">
          <span>B · Dest</span>
          <input defaultValue="SBGR" maxLength={4} />
        </label>
        <label className="g1-field">
          <span>C · Alt</span>
          <input defaultValue="SBRJ" maxLength={4} />
        </label>
        <button type="submit" className="g1-btn g1-btn--cyan">
          Activate
        </button>
      </form>
      <div className="g1-grid-3">
        {["SBCF", "SBGR", "SBRJ"].map((icao) => (
          <div key={icao} className="g1-plate" style={{ background: "#050708" }}>
            <div className="g1-kicker">LEG</div>
            <div className="g1-mfd-icao" style={{ fontSize: "1.3rem" }}>
              {icao}
            </div>
            <div style={{ color: "var(--g1-green)", fontFamily: "var(--g1-mono)", marginTop: 6 }}>VFR</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoginScreen() {
  return (
    <div className="g1-auth">
      <div className="g1-plate">
        <span className="g1-kicker">System</span>
        <h2 className="g1-title" style={{ fontSize: "1.5rem" }}>
          Crew login
        </h2>
        <p className="g1-lead">Autoriza briefing, E6B e simulados.</p>
        <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
          <label className="g1-field">
            <span>User</span>
            <input type="email" placeholder="PILOTO@MARQUISA" style={{ letterSpacing: "0.04em", fontWeight: 600 }} />
          </label>
          <label className="g1-field">
            <span>Pass</span>
            <input type="password" placeholder="••••••••" />
          </label>
          <button type="button" className="g1-btn g1-btn--cyan">
            Enter
          </button>
          <button type="button" className="g1-btn">
            Google
          </button>
        </div>
      </div>
    </div>
  );
}

function ExamsScreen() {
  return (
    <div className="g1-grid-2">
      <div className="g1-plate">
        <span className="g1-kicker">Checkride</span>
        <h2 className="g1-title" style={{ fontSize: "1.4rem" }}>
          PP-A · Q12
        </h2>
        <p className="g1-lead">Em relação às regras de voo VFR, assinale a correta.</p>
        <button type="button" className="g1-option is-selected">
          A) Manter referência visual com o solo
        </button>
        <button type="button" className="g1-option">
          B) Dispensar comunicação em espaços controlados
        </button>
        <button type="button" className="g1-option">
          C) Operar sem teto mínimo definido
        </button>
        <button type="button" className="g1-option">
          D) Ignorar restrições de visibilidade
        </button>
      </div>
      <div className="g1-plate">
        <span className="g1-kicker">Database</span>
        <ul className="g1-list">
          <li>PP-A complete — free account</li>
          <li>CMS — free account</li>
          <li>PC / IFR — PRO</li>
        </ul>
        <button type="button" className="g1-btn g1-btn--magenta" style={{ marginTop: 14 }}>
          PRO
        </button>
      </div>
    </div>
  );
}

function BillingScreen() {
  return (
    <div className="g1-grid-2">
      <div className="g1-plate">
        <span className="g1-kicker">Subscription</span>
        <h2 className="g1-title" style={{ fontSize: "1.4rem" }}>
          Marquisa PRO
        </h2>
        <div className="g1-price">R$ 19,90 / mês</div>
        <ul className="g1-list">
          <li>Simulados ilimitados</li>
          <li>Todas as matérias</li>
          <li>Briefings na nuvem</li>
        </ul>
        <button type="button" className="g1-btn g1-btn--magenta" style={{ marginTop: 14 }}>
          Activate PRO
        </button>
      </div>
      <div className="g1-plate">
        <span className="g1-kicker">Free pack</span>
        <ul className="g1-list">
          <li>METAR/TAF público</li>
          <li>Briefing + tools</li>
          <li>PP/CMS exam</li>
        </ul>
      </div>
    </div>
  );
}

export default function ModeloLabD() {
  const [screen, setScreen] = useState("home");
  const [softActive, setSoftActive] = useState("WX");
  const [utc, setUtc] = useState("--:--:--Z");
  const [icao, setIcao] = useState("SBGR");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [metar, setMetar] = useState("");
  const [taf, setTaf] = useState("");
  const [airportName, setAirportName] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const hh = String(now.getUTCHours()).padStart(2, "0");
      const mm = String(now.getUTCMinutes()).padStart(2, "0");
      const ss = String(now.getUTCSeconds()).padStart(2, "0");
      setUtc(`${hh}:${mm}:${ss}Z`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  async function load(code) {
    const clean = String(code || "").trim().toUpperCase();
    if (clean.length !== 4) {
      setError("ICAO inválido.");
      return;
    }
    setIcao(clean);
    setLoading(true);
    setError("");
    try {
      const station = await fetchStationWeather(clean);
      setMetar(station.metar || "");
      setTaf(station.taf || "");
      setAirportName(station.airport?.name || station.airport?.city || clean);
    } catch (e) {
      setMetar("");
      setTaf("");
      setAirportName("");
      setError(e?.message || "Falha WX.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load("SBGR");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const category = classifyFromMetar(metar);
  const summary = decodeMetarSummary(metar, "pt-BR");
  const wx = { icao, setIcao, onLoad: load, loading, error, metar, taf, airportName, category, summary };

  function onSoft(key) {
    setSoftActive(key);
    if (key === "WX") setScreen("weather");
    if (key === "FPL") setScreen("dashboard");
    if (key === "MAP") setScreen("home");
    if (key === "MENU") setScreen("login");
  }

  const actions =
    screen === "login" || screen === "home" || screen === "weather" ? (
      <>
        <button type="button" className="g1-btn">
          Login
        </button>
        <button type="button" className="g1-btn g1-btn--cyan">
          Conta
        </button>
      </>
    ) : (
      <>
        <button type="button" className="g1-btn">
          Perfil
        </button>
        <button type="button" className="g1-btn g1-btn--magenta">
          PRO
        </button>
      </>
    );

  const dual = screen === "home";
  const body = {
    home: <HomeDual wx={wx} />,
    weather: <WeatherOnly wx={wx} />,
    dashboard: <DashboardScreen />,
    login: <LoginScreen />,
    exams: <ExamsScreen />,
    billing: <BillingScreen />,
  }[screen];

  return (
    <div className="g1-lab">
      <div className="g1-toolbar">
        <strong>Modelo D · G1000</strong>
        {SCREENS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`g1-chip${screen === item.id ? " is-active" : ""}`}
            onClick={() => {
              setScreen(item.id);
              if (item.id === "home") setSoftActive("MAP");
              if (item.id === "weather") setSoftActive("WX");
              if (item.id === "dashboard") setSoftActive("FPL");
            }}
          >
            {item.label}
          </button>
        ))}
        <Link className="g1-link" to="/modelo-c">
          Modelo C
        </Link>
        <Link className="g1-link" to="/modelo-b" style={{ marginLeft: 0 }}>
          Modelo B
        </Link>
      </div>
      <Unit utc={utc} actions={actions} softActive={softActive} onSoft={onSoft} dual={dual}>
        {body}
      </Unit>
    </div>
  );
}
