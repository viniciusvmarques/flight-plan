import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchStationWeather } from "../services/weatherService";
import { decodeMetarSummary } from "../utils/metarDecoder";
import { classifyFromMetar } from "../utils/classifyFlightCategory";
import "../styles/modelo-pro.css";
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
  return "nodata";
}

function plainOf(cat) {
  const c = String(cat || "").toUpperCase();
  if (c === "VFR") return "Condições visuais boas";
  if (c === "MVFR") return "Visual com restrições";
  if (c === "IFR" || c === "LIFR") return "Condições instrumentais";
  return "Sem classificação";
}

function Shell({ utc, actions, children }) {
  return (
    <div className="me-shell">
      <header className="me-top">
        <div className="me-brand">
          <MarquisaMark size={22} className="me-brand-mark" />
          <div className="me-brand-copy">
            <h1>Marquisa</h1>
            <span>Painel do aeronauta</span>
          </div>
        </div>
        <div className="me-top-right">
          <div className="me-utc">
            UTC <b>{utc}</b>
          </div>
          {actions}
        </div>
      </header>
      {children}
      <footer className="me-footer">
        <span>Modelo E · protótipo visual</span>
        <span>Voe seguro. Voe preparado.</span>
      </footer>
    </div>
  );
}

function WeatherCard({ icao, setIcao, onLoad, loading, error, metar, taf, airportName, category, summary, showForm = true }) {
  const tone = toneOf(category);
  return (
    <section className="me-card me-wx">
      <div className="me-wx-head">
        <div>
          <div className="me-icao">{icao || "----"}</div>
          <span className="me-airport">{airportName || "Aeródromo"}</span>
        </div>
        <div className={`me-badge me-badge--${tone}`}>
          <strong>{category === "NO_DATA" || category === "UNKNOWN" ? "—" : category}</strong>
          <span>{plainOf(category)}</span>
        </div>
      </div>

      <p className="me-readout">{summary.categoryLabel}</p>

      {summary.hints?.length ? (
        <ul className="me-hints">
          {summary.hints.map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ul>
      ) : (
        <p className="me-empty">{loading ? "Carregando boletim…" : "Informe um ICAO para consultar."}</p>
      )}

      {error ? <div className="me-error">{error}</div> : null}

      <div className="me-raw">
        <header>METAR</header>
        <pre>{metar || "—"}</pre>
      </div>
      <div className="me-raw">
        <header>TAF</header>
        <pre>{taf || "—"}</pre>
      </div>

      {showForm ? (
        <>
          <form
            className="me-form"
            onSubmit={(e) => {
              e.preventDefault();
              onLoad(icao);
            }}
          >
            <label className="me-field">
              <span>ICAO</span>
              <input
                value={icao}
                onChange={(e) => setIcao(e.target.value.toUpperCase().slice(0, 4))}
                maxLength={4}
                placeholder="SBGR"
                autoComplete="off"
              />
            </label>
            <button type="submit" className="me-btn me-btn--primary" disabled={loading}>
              {loading ? "…" : "Consultar"}
            </button>
          </form>
          <div className="me-quick">
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
        </>
      ) : null}
    </section>
  );
}

function HomeScreen({ wx }) {
  return (
    <>
      <section className="me-hero">
        <article className="me-card">
          <span className="me-kicker">Operações de voo</span>
          <h2 className="me-title">Meteorologia clara. Briefing completo com conta.</h2>
          <p className="me-lead">
            Consulte METAR e TAF sem cadastro, com categoria de voo fácil de entender.
            Ferramentas, computador e simulados liberam após criar sua conta.
          </p>
          <div className="me-actions">
            <button type="button" className="me-btn me-btn--primary">
              Consultar METAR / TAF
            </button>
            <button type="button" className="me-btn me-btn--ghost">
              Criar conta grátis
            </button>
          </div>
        </article>
        <WeatherCard {...wx} />
      </section>

      <div className="me-grid-3">
        <article className="me-card me-module">
          <span className="me-pill">Sem cadastro</span>
          <h3>METAR / TAF</h3>
          <p>Boletim por ICAO com leitura objetiva de VFR, MVFR e IFR.</p>
        </article>
        <article className="me-card me-module">
          <span className="me-pill me-pill--muted">Com conta</span>
          <h3>Briefing A–B–C</h3>
          <p>Rota, alternativa, combustível e mapa no mesmo fluxo.</p>
        </article>
        <article className="me-card me-module">
          <span className="me-pill me-pill--muted">Com conta</span>
          <h3>Simulados ANAC</h3>
          <p>PP, Comissário e trilha PRO com correção e histórico.</p>
        </article>
      </div>
    </>
  );
}

function WeatherScreen({ wx }) {
  return (
    <div className="me-grid-2">
      <article className="me-card">
        <span className="me-kicker">Consulta pública</span>
        <h2 className="me-title" style={{ fontSize: "1.7rem" }}>
          METAR e TAF
        </h2>
        <p className="me-lead">Digite o ICAO do aeródromo. Sem conta, sem limite de teatro visual.</p>
        <form
          className="me-form"
          style={{ marginTop: 20 }}
          onSubmit={(e) => {
            e.preventDefault();
            wx.onLoad(wx.icao);
          }}
        >
          <label className="me-field">
            <span>ICAO</span>
            <input
              value={wx.icao}
              onChange={(e) => wx.setIcao(e.target.value.toUpperCase().slice(0, 4))}
              maxLength={4}
            />
          </label>
          <button type="submit" className="me-btn me-btn--primary" disabled={wx.loading}>
            Consultar
          </button>
        </form>
        <div className="me-quick" style={{ marginTop: 12 }}>
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
      </article>
      <WeatherCard {...wx} showForm={false} />
    </div>
  );
}

function DashboardScreen() {
  return (
    <>
      <article className="me-card">
        <span className="me-kicker">Briefing</span>
        <h2 className="me-title" style={{ fontSize: "1.7rem" }}>
          Planejamento de rota
        </h2>
        <p className="me-lead">Origem, destino e alternativa em campos claros — sem ruído visual.</p>
        <form className="me-route" onSubmit={(e) => e.preventDefault()}>
          <label className="me-field">
            <span>Origem</span>
            <input defaultValue="SBCF" maxLength={4} />
          </label>
          <label className="me-field">
            <span>Destino</span>
            <input defaultValue="SBGR" maxLength={4} />
          </label>
          <label className="me-field">
            <span>Alternativa</span>
            <input defaultValue="SBRJ" maxLength={4} />
          </label>
          <button type="submit" className="me-btn me-btn--primary">
            Gerar briefing
          </button>
        </form>
      </article>
      <div className="me-grid-3" style={{ marginTop: 16 }}>
        {[
          ["SBCF", "Tancredo Neves"],
          ["SBGR", "Guarulhos"],
          ["SBRJ", "Santos Dumont"],
        ].map(([icao, name]) => (
          <article key={icao} className="me-card me-module">
            <span className="me-pill">VFR</span>
            <h3>{icao}</h3>
            <p>{name}</p>
          </article>
        ))}
      </div>
    </>
  );
}

function LoginScreen() {
  return (
    <div className="me-auth">
      <article className="me-card">
        <span className="me-kicker">Acesso</span>
        <h2 className="me-title" style={{ fontSize: "1.55rem" }}>
          Entrar
        </h2>
        <p className="me-lead">Sua conta libera briefing, ferramentas e simulados.</p>
        <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
          <label className="me-field">
            <span>E-mail</span>
            <input type="email" placeholder="voce@email.com" style={{ letterSpacing: "0.02em", fontWeight: 500 }} />
          </label>
          <label className="me-field">
            <span>Senha</span>
            <input type="password" placeholder="••••••••" />
          </label>
          <button type="button" className="me-btn me-btn--primary">
            Entrar
          </button>
          <button type="button" className="me-btn me-btn--ghost">
            Continuar com Google
          </button>
        </div>
      </article>
    </div>
  );
}

function ExamsScreen() {
  return (
    <div className="me-grid-2">
      <article className="me-card">
        <span className="me-kicker">Simulado PP-A</span>
        <h2 className="me-title" style={{ fontSize: "1.5rem" }}>
          Questão 12 · Regulamentos
        </h2>
        <p className="me-lead">Em relação às regras de voo VFR, assinale a alternativa correta.</p>
        <button type="button" className="me-option is-selected">
          A) Manter referência visual com o solo
        </button>
        <button type="button" className="me-option">
          B) Dispensar comunicação em espaços controlados
        </button>
        <button type="button" className="me-option">
          C) Operar sem teto mínimo definido
        </button>
        <button type="button" className="me-option">
          D) Ignorar restrições de visibilidade
        </button>
      </article>
      <article className="me-card">
        <span className="me-kicker">Cursos</span>
        <ul className="me-list">
          <li>PP-A — prova completa com conta</li>
          <li>Comissário — prova completa com conta</li>
          <li>PC / IFR — incluso no PRO</li>
        </ul>
        <button type="button" className="me-btn me-btn--dark" style={{ marginTop: 18 }}>
          Ver planos
        </button>
      </article>
    </div>
  );
}

function BillingScreen() {
  return (
    <div className="me-grid-2">
      <article className="me-card">
        <span className="me-kicker">Assinatura</span>
        <h2 className="me-title" style={{ fontSize: "1.5rem" }}>
          Marquisa PRO
        </h2>
        <div className="me-price">
          R$ 19,90 <small>/ mês</small>
        </div>
        <ul className="me-list">
          <li>Simulados e matérias sem limite</li>
          <li>Histórico de desempenho</li>
          <li>Briefings salvos na nuvem</li>
        </ul>
        <button type="button" className="me-btn me-btn--primary" style={{ marginTop: 18 }}>
          Assinar PRO
        </button>
      </article>
      <article className="me-card">
        <span className="me-kicker">Conta gratuita</span>
        <ul className="me-list">
          <li>METAR e TAF públicos</li>
          <li>Briefing e ferramentas</li>
          <li>Prova completa PP e CMS</li>
        </ul>
      </article>
    </div>
  );
}

export default function ModeloLabE() {
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
      setError(e?.message || "Não foi possível consultar agora.");
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

  const actions = (
    <>
      <button type="button" className="me-btn me-btn--ghost">
        Entrar
      </button>
      <button type="button" className="me-btn me-btn--primary">
        Criar conta
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
    <div className="me-lab">
      <div className="me-toolbar">
        <strong>Modelo E · profissional</strong>
        {SCREENS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`me-chip${screen === item.id ? " is-active" : ""}`}
            onClick={() => setScreen(item.id)}
          >
            {item.label}
          </button>
        ))}
        <div className="me-links">
          <Link to="/">Site atual</Link>
          <Link to="/modelo-c">Modelo C</Link>
        </div>
      </div>
      <Shell utc={utc} actions={actions}>
        {body}
      </Shell>
    </div>
  );
}
