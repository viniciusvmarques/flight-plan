import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchStationWeather } from "../services/weatherService";
import { decodeMetarSummary } from "../utils/metarDecoder";
import { classifyFromMetar } from "../utils/classifyFlightCategory";
import "../styles/modelo-ops.css";
import MarquisaMark from "../components/MarquisaMark";

const SCREENS = [
  { id: "home", label: "Home" },
  { id: "weather", label: "METAR" },
  { id: "dashboard", label: "Briefing" },
  { id: "login", label: "Login" },
  { id: "exams", label: "Simulados" },
  { id: "billing", label: "PRO" },
];

const QUICK = ["SBGR", "SBRJ", "SBSP", "SBCF", "SBGL"];

function toneOf(cat) {
  const c = String(cat || "").toUpperCase();
  if (c === "VFR") return "vfr";
  if (c === "MVFR") return "mvfr";
  if (c === "IFR" || c === "LIFR") return "ifr";
  return "";
}

function plainOf(cat) {
  const c = String(cat || "").toUpperCase();
  if (c === "VFR") return "Condições visuais boas";
  if (c === "MVFR") return "Visual com restrições";
  if (c === "IFR" || c === "LIFR") return "Condições instrumentais";
  return "Aguardando boletim";
}

function Shell({ utc, actions, children }) {
  return (
    <div className="mh-shell">
      <div className="mh-frame">
        <header className="mh-top">
          <div className="mh-brand">
            <div className="mh-mark" aria-hidden="true">
              <MarquisaMark size={22} />
            </div>
            <div>
              <h1>MARQUISA</h1>
              <p>Ops de voo</p>
            </div>
          </div>
          <div className="mh-clock">
            <time>{utc}</time>
            <span>UTC · Zulu</span>
          </div>
          <div className="mh-actions">{actions}</div>
        </header>
        <div className="mh-atis">
          <span>
            ATIS <b>BRAVO</b>
          </span>
          <span>
            QNH <b>1018</b>
          </span>
          <span>
            RWY <b>09L</b>
          </span>
          <span>
            TWR <b>118.400</b>
          </span>
          <span>
            GND <b>121.700</b>
          </span>
          <span>
            TRANS <b>ALT 5000</b>
          </span>
        </div>
        <div className="mh-stage">{children}</div>
        <footer className="mh-footer">
          <span>Painel · METAR · Briefing · Simulados</span>
          <span>
            <b>Voe seguro</b> · Voe preparado
          </span>
        </footer>
      </div>
    </div>
  );
}

function WxPanel({ icao, setIcao, onLoad, loading, error, metar, taf, airportName, category, summary }) {
  const tone = toneOf(category);
  const catLabel =
    category === "NO_DATA" || category === "UNKNOWN" || !category ? "—" : category;

  return (
    <div className="mh-card">
      <div className="mh-wx-head">
        <div>
          <div className="mh-icao">{icao || "----"}</div>
          <span className="mh-airport">{airportName || "Aeródromo"}</span>
        </div>
        <div className={`mh-cat${tone ? ` mh-cat--${tone}` : ""}`}>
          <strong>{catLabel}</strong>
          <span>{plainOf(category)}</span>
        </div>
      </div>
      {summary?.hints?.length ? (
        <ul className="mh-hints">
          {summary.hints.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      ) : (
        <p className="mh-empty">{loading ? "Carregando boletim…" : "Digite um ICAO e consulte."}</p>
      )}
      {error ? <div className="mh-error">{error}</div> : null}
      <div className="mh-raw">
        <header>METAR</header>
        <pre>{metar || "—"}</pre>
      </div>
      <div className="mh-raw">
        <header>TAF</header>
        <pre>{taf || "—"}</pre>
      </div>
      <form
        className="mh-form"
        onSubmit={(e) => {
          e.preventDefault();
          onLoad(icao);
        }}
      >
        <label className="mh-field">
          <span>ICAO</span>
          <input
            value={icao}
            onChange={(e) => setIcao(e.target.value.toUpperCase().slice(0, 4))}
            maxLength={4}
            placeholder="SBGR"
          />
        </label>
        <button type="submit" className="mh-btn mh-btn--primary" disabled={loading}>
          {loading ? "…" : "Consultar"}
        </button>
      </form>
      <div className="mh-quick">
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
  );
}

function HomeScreen({ wx }) {
  return (
    <>
      <section className="mh-hero">
        <div className="mh-card">
          <span className="mh-kicker">Marquisa</span>
          <h2 className="mh-title">Painel operacional do aeronauta</h2>
          <p className="mh-lead">
            METAR e TAF sem cadastro. Briefing, ferramentas e simulados com conta
            gratuita.
          </p>
          <div className="mh-stripe" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            <button type="button" className="mh-btn mh-btn--primary">
              Consultar METAR / TAF
            </button>
            <button type="button" className="mh-btn mh-btn--navy">
              Criar conta grátis
            </button>
          </div>
        </div>
        <WxPanel {...wx} />
      </section>
      <div className="mh-grid-3">
        <article className="mh-card mh-module">
          <span className="mh-tag">Livre</span>
          <h3>METAR / TAF</h3>
          <p>Boletim por ICAO com categoria VFR · MVFR · IFR.</p>
        </article>
        <article className="mh-card mh-module">
          <span className="mh-tag mh-tag--lock">Conta</span>
          <h3>Briefing A–B–C</h3>
          <p>Origem, destino e alternativa no mesmo painel.</p>
        </article>
        <article className="mh-card mh-module">
          <span className="mh-tag mh-tag--lock">Conta</span>
          <h3>Simulados ANAC</h3>
          <p>PP, Comissário e trilha PRO com histórico.</p>
        </article>
      </div>
    </>
  );
}

function WeatherScreen({ wx }) {
  return (
    <div className="mh-grid-2">
      <div className="mh-card">
        <span className="mh-kicker">Consulta pública</span>
        <h2 className="mh-title" style={{ fontSize: "1.55rem" }}>
          METAR e TAF
        </h2>
        <p className="mh-lead">Sem cadastro. Digite o ICAO e leia o boletim com categoria de voo.</p>
        <form
          className="mh-form"
          onSubmit={(e) => {
            e.preventDefault();
            wx.onLoad(wx.icao);
          }}
        >
          <label className="mh-field">
            <span>ICAO</span>
            <input
              value={wx.icao}
              onChange={(e) => wx.setIcao(e.target.value.toUpperCase().slice(0, 4))}
              maxLength={4}
            />
          </label>
          <button type="submit" className="mh-btn mh-btn--primary" disabled={wx.loading}>
            Consultar
          </button>
        </form>
        <div className="mh-quick">
          {QUICK.map((code) => (
            <button
              key={code}
              type="button"
              className={wx.icao === code ? "is-active" : ""}
              onClick={() => {
                wx.setIcao(code);
                wx.onLoad(code);
              }}
            >
              {code}
            </button>
          ))}
        </div>
      </div>
      <WxPanel {...wx} />
    </div>
  );
}

function DashboardScreen() {
  return (
    <>
      <div className="mh-card" style={{ marginBottom: 12 }}>
        <span className="mh-kicker">Painel operacional</span>
        <h2 className="mh-title" style={{ fontSize: "1.45rem" }}>
          Briefing de rota
        </h2>
        <form className="mh-route" onSubmit={(e) => e.preventDefault()}>
          <label className="mh-field">
            <span>A · Origem</span>
            <input defaultValue="SBCF" maxLength={4} />
          </label>
          <label className="mh-field">
            <span>B · Destino</span>
            <input defaultValue="SBGR" maxLength={4} />
          </label>
          <label className="mh-field">
            <span>C · Alternativa</span>
            <input defaultValue="SBRJ" maxLength={4} />
          </label>
          <button type="submit" className="mh-btn mh-btn--primary">
            Gerar briefing
          </button>
        </form>
      </div>
      <div className="mh-grid-3">
        <article className="mh-card mh-module">
          <span className="mh-tag">VFR</span>
          <h3>SBCF</h3>
          <p>Origem · Tancredo Neves</p>
        </article>
        <article className="mh-card mh-module">
          <span className="mh-tag">VFR</span>
          <h3>SBGR</h3>
          <p>Destino · Guarulhos</p>
        </article>
        <article className="mh-card mh-module">
          <span className="mh-tag">VFR</span>
          <h3>SBRJ</h3>
          <p>Alternativa · Santos Dumont</p>
        </article>
      </div>
    </>
  );
}

function LoginScreen() {
  return (
    <div className="mh-auth">
      <div className="mh-card">
        <span className="mh-kicker">Acesso</span>
        <h2 className="mh-title" style={{ fontSize: "1.4rem" }}>
          Entrar no painel
        </h2>
        <p className="mh-lead">Conta libera briefing, ferramentas e simulados.</p>
        <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
          <label className="mh-field">
            <span>E-mail</span>
            <input
              type="email"
              placeholder="voce@email.com"
              style={{ letterSpacing: "0.02em", fontWeight: 500 }}
            />
          </label>
          <label className="mh-field">
            <span>Senha</span>
            <input type="password" placeholder="••••••••" style={{ letterSpacing: "0.08em" }} />
          </label>
          <button type="button" className="mh-btn mh-btn--primary">
            Entrar
          </button>
          <button type="button" className="mh-btn mh-btn--navy">
            Continuar com Google
          </button>
        </div>
      </div>
    </div>
  );
}

function ExamsScreen() {
  return (
    <div className="mh-grid-2">
      <div className="mh-card">
        <span className="mh-kicker">Simulado</span>
        <h2 className="mh-title" style={{ fontSize: "1.4rem" }}>
          PP-A · Questão 12
        </h2>
        <p className="mh-lead">Em relação às regras de voo VFR, assinale a correta.</p>
        <button type="button" className="mh-option is-selected">
          A) Manter referência visual com o solo
        </button>
        <button type="button" className="mh-option">
          B) Dispensar comunicação em espaços controlados
        </button>
        <button type="button" className="mh-option">
          C) Operar sem teto mínimo definido
        </button>
        <button type="button" className="mh-option">
          D) Ignorar restrições de visibilidade
        </button>
      </div>
      <div className="mh-card">
        <span className="mh-kicker">Cursos</span>
        <ul className="mh-list">
          <li>PP-A complete — conta free</li>
          <li>CMS Comissário — conta free</li>
          <li>PC / IFR — PRO</li>
        </ul>
        <button type="button" className="mh-btn mh-btn--primary" style={{ marginTop: 16 }}>
          Ver PRO
        </button>
      </div>
    </div>
  );
}

function BillingScreen() {
  return (
    <div className="mh-grid-2">
      <div className="mh-card">
        <span className="mh-kicker">Assinatura</span>
        <h2 className="mh-title" style={{ fontSize: "1.4rem" }}>
          Marquisa PRO
        </h2>
        <div className="mh-price">
          R$ 19,90 <small>/ mês</small>
        </div>
        <ul className="mh-list">
          <li>Simulados ilimitados</li>
          <li>Todas as matérias</li>
          <li>Briefings na nuvem</li>
        </ul>
        <button type="button" className="mh-btn mh-btn--primary" style={{ marginTop: 16 }}>
          Assinar PRO
        </button>
      </div>
      <div className="mh-card">
        <span className="mh-kicker">Conta free</span>
        <ul className="mh-list">
          <li>METAR/TAF público</li>
          <li>Briefing e ferramentas</li>
          <li>Prova PP/CMS</li>
        </ul>
      </div>
    </div>
  );
}

export default function ModeloLabH() {
  const [screen, setScreen] = useState("home");
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
      setError("Informe um ICAO de 4 letras.");
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
      setError(e?.message || "Falha ao consultar.");
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
  const wx = {
    icao,
    setIcao,
    onLoad: load,
    loading,
    error,
    metar,
    taf,
    airportName,
    category,
    summary,
  };

  const actions =
    screen === "home" || screen === "login" || screen === "weather" ? (
      <>
        <button type="button" className="mh-btn mh-btn--ghost">
          Entrar
        </button>
        <button type="button" className="mh-btn mh-btn--primary">
          Criar conta
        </button>
      </>
    ) : (
      <>
        <button type="button" className="mh-btn mh-btn--ghost">
          Perfil
        </button>
        <button type="button" className="mh-btn mh-btn--primary">
          PRO
        </button>
      </>
    );

  const body = {
    home: <HomeScreen wx={wx} />,
    weather: <WeatherScreen wx={wx} />,
    dashboard: <DashboardScreen />,
    login: <LoginScreen />,
    exams: <ExamsScreen />,
    billing: <BillingScreen />,
  }[screen];

  return (
    <div className="mh-lab">
      <div className="mh-toolbar">
        <strong>Modelo H · no ar (site)</strong>
        {SCREENS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`mh-chip${screen === item.id ? " is-active" : ""}`}
            onClick={() => setScreen(item.id)}
          >
            {item.label}
          </button>
        ))}
        <div className="mh-links">
          <Link to="/modelo-f">Modelo F</Link>
          <Link to="/">Site atual</Link>
        </div>
      </div>
      <Shell utc={utc} actions={actions}>
        {body}
      </Shell>
    </div>
  );
}
