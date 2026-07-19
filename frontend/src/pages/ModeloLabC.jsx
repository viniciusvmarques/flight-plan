import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchStationWeather } from "../services/weatherService";
import { decodeMetarSummary } from "../utils/metarDecoder";
import { classifyFromMetar } from "../utils/classifyFlightCategory";
import "../styles/modelo-placa.css";

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
  return "nodata";
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
    <div className="mc-shell">
      <header className="mc-top">
        <div className="mc-brand">
          <div className="mc-mark">MQ</div>
          <div>
            <h1>MARQUISA</h1>
            <p>Placa de voo · Modelo C</p>
          </div>
        </div>
        <div className="mc-clock">
          <time>{utc}</time>
          <span>UTC · Zulu</span>
        </div>
        <div className="mc-actions">{actions}</div>
      </header>
      <div className="mc-stage">{children}</div>
      <footer className="mc-footer">
        <span>Painel · METAR · Ferramentas · Simulados</span>
        <span>
          <b>Voe seguro</b> · Voe preparado
        </span>
      </footer>
    </div>
  );
}

function WxLivePanel({ icao, setIcao, onLoad, loading, error, metar, taf, airportName, category, summary }) {
  const tone = toneOf(category);
  return (
    <div className="mc-plate mc-wx">
      <div className="mc-wx-head">
        <div>
          <strong className="mc-wx-icao">{icao || "----"}</strong>
          <span className="mc-wx-name">{airportName || "Aeródromo"}</span>
        </div>
        <div className={`mc-cat mc-cat--${tone}`}>
          <strong>{category === "NO_DATA" || category === "UNKNOWN" ? "—" : category}</strong>
          <span>{plainOf(category)}</span>
        </div>
      </div>
      <p className="mc-lead" style={{ maxWidth: "none" }}>
        {summary.categoryLabel}
      </p>
      {summary.hints?.length ? (
        <ul className="mc-hints">
          {summary.hints.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      ) : (
        <p className="mc-empty">{loading ? "Carregando…" : "Digite um ICAO e consulte."}</p>
      )}
      {error ? <div className="mc-error">{error}</div> : null}
      <div className="mc-raw">
        <header>METAR</header>
        <pre>{metar || "—"}</pre>
      </div>
      <div className="mc-raw">
        <header>TAF</header>
        <pre>{taf || "—"}</pre>
      </div>
      <form
        className="mc-form-row"
        onSubmit={(e) => {
          e.preventDefault();
          onLoad(icao);
        }}
      >
        <label className="mc-field">
          <span>ICAO</span>
          <input
            value={icao}
            onChange={(e) => setIcao(e.target.value.toUpperCase().slice(0, 4))}
            maxLength={4}
            placeholder="SBGR"
          />
        </label>
        <button type="submit" className="mc-btn mc-btn--primary" disabled={loading}>
          {loading ? "…" : "Consultar"}
        </button>
      </form>
      <div className="mc-quick">
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
      <section className="mc-hero">
        <div className="mc-plate">
          <span className="mc-kicker">Marquisa</span>
          <h2 className="mc-title">Placa de voo do aeronauta</h2>
          <p className="mc-lead">
            METAR e TAF grátis, com categoria VFR/MVFR/IFR fácil de ler. Briefing e
            simulados liberam com conta.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
            <button type="button" className="mc-btn mc-btn--primary">
              Consultar meteorologia
            </button>
            <button type="button" className="mc-btn mc-btn--ghost">
              Criar conta grátis
            </button>
          </div>
        </div>
        <WxLivePanel {...wx} />
      </section>
      <div className="mc-grid-3">
        <article className="mc-plate mc-module">
          <span className="mc-tag">Livre</span>
          <h3 style={{ marginTop: 10 }}>METAR / TAF</h3>
          <p>Boletim por ICAO + leitura clara da categoria de voo.</p>
        </article>
        <article className="mc-plate mc-module">
          <span className="mc-tag mc-tag--lock">Conta</span>
          <h3 style={{ marginTop: 10 }}>Briefing A–B–C</h3>
          <p>Rota, mapa, combustível e alternativa no mesmo painel.</p>
        </article>
        <article className="mc-plate mc-module">
          <span className="mc-tag mc-tag--lock">Conta</span>
          <h3 style={{ marginTop: 10 }}>Simulados ANAC</h3>
          <p>PP, Comissário e trilha PRO com histórico.</p>
        </article>
      </div>
    </>
  );
}

function WeatherScreen({ wx }) {
  return (
    <div className="mc-grid-2">
      <div className="mc-plate">
        <span className="mc-kicker">Consulta pública</span>
        <h2 className="mc-title" style={{ fontSize: "1.6rem" }}>
          METAR e TAF
        </h2>
        <p className="mc-lead">Sem cadastro. Digite o ICAO e leia o boletim.</p>
        <form
          className="mc-form-row"
          onSubmit={(e) => {
            e.preventDefault();
            wx.onLoad(wx.icao);
          }}
        >
          <label className="mc-field">
            <span>ICAO</span>
            <input
              value={wx.icao}
              onChange={(e) => wx.setIcao(e.target.value.toUpperCase().slice(0, 4))}
              maxLength={4}
            />
          </label>
          <button type="submit" className="mc-btn mc-btn--primary" disabled={wx.loading}>
            Consultar
          </button>
        </form>
        <div className="mc-quick">
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
      <WxLivePanel {...wx} />
    </div>
  );
}

function DashboardScreen() {
  return (
    <>
      <div className="mc-plate" style={{ marginBottom: 14 }}>
        <span className="mc-kicker">Painel operacional</span>
        <h2 className="mc-title" style={{ fontSize: "1.5rem" }}>
          Briefing de rota
        </h2>
        <form
          className="mc-route-form"
          onSubmit={(e) => e.preventDefault()}
        >
          <label className="mc-field">
            <span>A · Origem</span>
            <input defaultValue="SBCF" maxLength={4} />
          </label>
          <label className="mc-field">
            <span>B · Destino</span>
            <input defaultValue="SBGR" maxLength={4} />
          </label>
          <label className="mc-field">
            <span>C · Alternativa</span>
            <input defaultValue="SBRJ" maxLength={4} />
          </label>
          <button type="submit" className="mc-btn mc-btn--primary">
            Gerar briefing
          </button>
        </form>
      </div>
      <div className="mc-grid-3">
        <article className="mc-plate mc-module">
          <span className="mc-tag">VFR</span>
          <h3 style={{ marginTop: 10 }}>SBCF</h3>
          <p>Origem · Tancredo Neves</p>
        </article>
        <article className="mc-plate mc-module">
          <span className="mc-tag">VFR</span>
          <h3 style={{ marginTop: 10 }}>SBGR</h3>
          <p>Destino · Guarulhos</p>
        </article>
        <article className="mc-plate mc-module">
          <span className="mc-tag">VFR</span>
          <h3 style={{ marginTop: 10 }}>SBRJ</h3>
          <p>Alternativa · Santos Dumont</p>
        </article>
      </div>
    </>
  );
}

function LoginScreen() {
  return (
    <div className="mc-auth">
      <div className="mc-plate">
        <span className="mc-kicker">Acesso</span>
        <h2 className="mc-title" style={{ fontSize: "1.5rem" }}>
          Entrar no painel
        </h2>
        <p className="mc-lead">Conta libera briefing, ferramentas e simulados.</p>
        <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
          <label className="mc-field">
            <span>E-mail</span>
            <input type="email" placeholder="voce@email.com" style={{ letterSpacing: "0.02em", fontWeight: 500 }} />
          </label>
          <label className="mc-field">
            <span>Senha</span>
            <input type="password" placeholder="••••••••" style={{ letterSpacing: "0.08em" }} />
          </label>
          <button type="button" className="mc-btn mc-btn--primary">
            Entrar
          </button>
          <button type="button" className="mc-btn mc-btn--ghost">
            Continuar com Google
          </button>
        </div>
      </div>
    </div>
  );
}

function ExamsScreen() {
  return (
    <div className="mc-grid-2">
      <div className="mc-plate">
        <span className="mc-kicker">Simulado</span>
        <h2 className="mc-title" style={{ fontSize: "1.5rem" }}>
          PP-A · Questão 12
        </h2>
        <p className="mc-lead">Em relação às regras de voo VFR, assinale a correta.</p>
        <button type="button" className="mc-option is-selected">
          A) Manter referência visual com o solo
        </button>
        <button type="button" className="mc-option">
          B) Dispensar comunicação em espaços controlados
        </button>
        <button type="button" className="mc-option">
          C) Operar sem teto mínimo definido
        </button>
        <button type="button" className="mc-option">
          D) Ignorar restrições de visibilidade
        </button>
      </div>
      <div className="mc-plate">
        <span className="mc-kicker">Cursos</span>
        <ul className="mc-list">
          <li>PP-A complete — conta free</li>
          <li>CMS Comissário — conta free</li>
          <li>PC / IFR — PRO</li>
        </ul>
        <button type="button" className="mc-btn mc-btn--amber" style={{ marginTop: 16 }}>
          Ver PRO
        </button>
      </div>
    </div>
  );
}

function BillingScreen() {
  return (
    <div className="mc-grid-2">
      <div className="mc-plate">
        <span className="mc-kicker">Assinatura</span>
        <h2 className="mc-title" style={{ fontSize: "1.5rem" }}>
          Marquisa PRO
        </h2>
        <div className="mc-price">
          R$ 19,90 <small>/ mês</small>
        </div>
        <ul className="mc-list">
          <li>Simulados ilimitados</li>
          <li>Todas as matérias</li>
          <li>Briefings na nuvem</li>
        </ul>
        <button type="button" className="mc-btn mc-btn--amber" style={{ marginTop: 16 }}>
          Assinar PRO
        </button>
      </div>
      <div className="mc-plate">
        <span className="mc-kicker">Conta free</span>
        <ul className="mc-list">
          <li>METAR/TAF público</li>
          <li>Briefing e ferramentas</li>
          <li>Prova PP/CMS</li>
        </ul>
      </div>
    </div>
  );
}

export default function ModeloLabC() {
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
        <button type="button" className="mc-btn mc-btn--ghost">
          Entrar
        </button>
        <button type="button" className="mc-btn mc-btn--primary">
          Criar conta
        </button>
      </>
    ) : (
      <>
        <button type="button" className="mc-btn mc-btn--ghost">
          Perfil
        </button>
        <button type="button" className="mc-btn mc-btn--amber">
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
    <div className="mc-lab">
      <div className="mc-toolbar">
        <strong>Modelo C · placa de voo</strong>
        {SCREENS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`mc-chip${screen === item.id ? " is-active" : ""}`}
            onClick={() => setScreen(item.id)}
          >
            {item.label}
          </button>
        ))}
        <Link className="mc-link" to="/modelo-b">
          Ver Modelo B
        </Link>
        <Link className="mc-link" to="/" style={{ marginLeft: 0 }}>
          Site atual
        </Link>
      </div>
      <Shell utc={utc} actions={actions}>
        {body}
      </Shell>
    </div>
  );
}
