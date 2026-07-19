import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/modelo-cockpit.css";

const SCREENS = [
  { id: "home", label: "Home" },
  { id: "weather", label: "METAR" },
  { id: "dashboard", label: "Cockpit" },
  { id: "login", label: "Login" },
  { id: "exams", label: "Simulados" },
  { id: "billing", label: "PRO" },
];

function Shell({ utc, actions, children, atis }) {
  return (
    <div className="ck-shell">
      <header className="ck-topbar">
        <div className="ck-ident">
          <div className="ck-badge">MQ</div>
          <div>
            <h1>MARQUISA</h1>
            <p>Ops · Glass cockpit</p>
          </div>
        </div>
        <div className="ck-clock-block">
          <div className="ck-clock">{utc}</div>
          <div className="ck-clock-meta">UTC · Zulu time</div>
        </div>
        <div className="ck-top-actions">{actions}</div>
      </header>
      <div className="ck-atis">
        <span>
          ATIS <b>{atis.info}</b>
        </span>
        <span>
          QNH <b>{atis.qnh}</b>
        </span>
        <span>
          RWY <b>{atis.rwy}</b>
        </span>
        <span>
          TWR <b>{atis.twr}</b>
        </span>
        <span>
          SQUAWK <b>{atis.squawk}</b>
        </span>
      </div>
      <div className="ck-stage">{children}</div>
      <footer className="ck-footer">
        <span>CLR · TAXI · DEP · ENR · APP · LDG</span>
        <span>
          <b>VOE SEGURO</b> · VOE PREPARADO
        </span>
      </footer>
    </div>
  );
}

function HomeScreen() {
  return (
    <>
      <section className="ck-hero">
        <div className="ck-bezel">
          <span className="ck-kicker">Station online</span>
          <h2 className="ck-title">Painel do aeronauta</h2>
          <p className="ck-lead">
            METAR e TAF no ar sem cadastro. Briefing de rota, E6B e simulados ANAC
            armam depois do login.
          </p>

          <div className="ck-strips">
            <div className="ck-strip">
              <span className="ck-strip-code">A</span>
              <div>
                <span>Departure</span>
                <strong>SBGR</strong>
              </div>
              <em>VFR</em>
            </div>
            <div className="ck-strip">
              <span className="ck-strip-code">B</span>
              <div>
                <span>Destination</span>
                <strong>SBRJ</strong>
              </div>
              <em>185 NM</em>
            </div>
            <div className="ck-strip">
              <span className="ck-strip-code">C</span>
              <div>
                <span>Alternate</span>
                <strong>SBSP</strong>
              </div>
              <em>STBY</em>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
            <button type="button" className="ck-btn ck-btn--cyan">
              Abrir METAR / TAF
            </button>
            <button type="button" className="ck-btn ck-btn--amber">
              Criar conta
            </button>
          </div>
        </div>

        <div className="ck-pfd" aria-hidden="true">
          <div className="ck-pfd-horizon" />
          <div className="ck-tape ck-tape--spd">
            <span>140</span>
            <strong>128</strong>
            <span>110</span>
          </div>
          <div className="ck-tape ck-tape--alt">
            <span>4200</span>
            <strong>3500</strong>
            <span>2800</span>
          </div>
          <div className="ck-pfd-cross" />
          <div className="ck-hdg">HDG 147°</div>
        </div>
      </section>

      <div className="ck-grid-3">
        <article className="ck-bezel ck-module">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <span className="ck-tag">FREE</span>
            <span className="ck-cat ck-cat--vfr">VFR</span>
          </div>
          <h3 style={{ marginTop: 12 }}>METAR / TAF</h3>
          <p>Boletim por ICAO com leitura de categoria — sem conta.</p>
        </article>
        <article className="ck-bezel ck-module">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <span className="ck-tag ck-tag--lock">AUTH</span>
            <span className="ck-tag ck-tag--amber">A-B-C</span>
          </div>
          <h3 style={{ marginTop: 12 }}>Briefing</h3>
          <p>Rota, mapa, combustível e reserva no mesmo glass panel.</p>
        </article>
        <article className="ck-bezel ck-module">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <span className="ck-tag ck-tag--lock">AUTH</span>
            <span className="ck-tag">ANAC</span>
          </div>
          <h3 style={{ marginTop: 12 }}>Simulados</h3>
          <p>PP, CMS e trilha PRO — prova completa com conta.</p>
        </article>
      </div>
    </>
  );
}

function WeatherScreen() {
  return (
    <div className="ck-grid-2">
      <div className="ck-bezel">
        <span className="ck-kicker">WX decoder</span>
        <h2 className="ck-title" style={{ fontSize: "1.8rem" }}>
          METAR · TAF
        </h2>
        <p className="ck-lead">Consulta pública. Digite o ICAO e leia o boletim cru.</p>
        <div className="ck-form">
          <div className="ck-field">
            <label htmlFor="ck-icao">ICAO</label>
            <input id="ck-icao" defaultValue="SBGR" maxLength={4} />
          </div>
          <button type="button" className="ck-btn ck-btn--cyan">
            Request WX
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          <span className="ck-cat ck-cat--vfr">VFR</span>
          <span className="ck-tag">OBS 1100Z</span>
        </div>
        <pre className="ck-raw">METAR SBGR 191100Z 14008KT 9999 FEW025 24/18 Q1018=</pre>
        <pre className="ck-raw">TAF SBGR 191000Z 1912/2018 15010KT 9999 SCT025 TX27/1918Z TN19/2009Z=</pre>
      </div>
      <div className="ck-bezel">
        <span className="ck-kicker">Decoded</span>
        <h3>SBGR · Guarulhos</h3>
        <ul className="ck-list">
          <li>Wind 140 / 08 kt</li>
          <li>Vis 10 km+</li>
          <li>Clouds FEW 025</li>
          <li>Temp / Dew 24 / 18</li>
          <li>QNH 1018</li>
        </ul>
        <div className="ck-freq">
          <span>ATIS 127.925</span>
          <span>TWR 118.400</span>
          <span>GND 121.700</span>
        </div>
        <p className="ck-lead" style={{ marginTop: 16, fontSize: "0.95rem" }}>
          Quer a rota completa A–B–C? Arme a conta e entre no cockpit.
        </p>
        <button type="button" className="ck-btn ck-btn--amber" style={{ marginTop: 10 }}>
          Criar conta
        </button>
      </div>
    </div>
  );
}

function DashboardScreen() {
  return (
    <>
      <div className="ck-bezel" style={{ marginBottom: 14 }}>
        <span className="ck-kicker">Active flight strip</span>
        <div className="ck-strips" style={{ marginBottom: 0 }}>
          <div className="ck-strip">
            <span className="ck-strip-code">A</span>
            <div>
              <span>Origin</span>
              <strong>SBSP</strong>
            </div>
            <em>VFR</em>
          </div>
          <div className="ck-strip">
            <span className="ck-strip-code">B</span>
            <div>
              <span>Dest</span>
              <strong>SBRJ</strong>
            </div>
            <em>ETE 01+25</em>
          </div>
          <div className="ck-strip">
            <span className="ck-strip-code">C</span>
            <div>
              <span>Alt</span>
              <strong>SBGL</strong>
            </div>
            <em>FUEL OK</em>
          </div>
        </div>
      </div>
      <div className="ck-grid-3">
        <article className="ck-bezel ck-module">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3>WX</h3>
            <span className="ck-cat ck-cat--vfr">VFR</span>
          </div>
          <pre className="ck-raw">SBSP 191100Z 12006KT CAVOK 23/16 Q1019=</pre>
          <pre className="ck-raw">SBRJ 191100Z 09010KT 9999 SCT020 25/19 Q1017=</pre>
        </article>
        <article className="ck-bezel ck-module">
          <h3>Nav / Fuel</h3>
          <ul className="ck-list">
            <li>Dist 185 NM</li>
            <li>GS 130 kt</li>
            <li>Burn + reserve</li>
            <li>Alternate armed</li>
          </ul>
        </article>
        <article className="ck-bezel ck-module">
          <h3>Exams</h3>
          <p>Último PP-A · 78%</p>
          <div className="ck-progress">
            <i />
          </div>
          <button type="button" className="ck-btn ck-btn--cyan">
            Abrir simulados
          </button>
        </article>
      </div>
    </>
  );
}

function LoginScreen() {
  return (
    <div className="ck-auth">
      <div className="ck-bezel">
        <span className="ck-kicker">Crew login</span>
        <h2 className="ck-title" style={{ fontSize: "1.7rem" }}>
          Autorizar painel
        </h2>
        <p className="ck-lead">Identificação para liberar briefing e simulados.</p>
        <div className="ck-form">
          <div className="ck-field">
            <label htmlFor="ck-email">Crew ID / e-mail</label>
            <input id="ck-email" type="email" placeholder="PILOTO@MARQUISA" />
          </div>
          <div className="ck-field">
            <label htmlFor="ck-pass">Access code</label>
            <input id="ck-pass" type="password" placeholder="••••••••" />
          </div>
          <button type="button" className="ck-btn ck-btn--cyan">
            Login
          </button>
          <button type="button" className="ck-btn ck-btn--ghost">
            Continuar com Google
          </button>
        </div>
      </div>
    </div>
  );
}

function ExamsScreen() {
  return (
    <div className="ck-grid-2">
      <div className="ck-bezel">
        <span className="ck-kicker">Checkride mode</span>
        <h2 className="ck-title" style={{ fontSize: "1.7rem" }}>
          Simulado PP-A
        </h2>
        <p className="ck-lead">100 questões · cronômetro · correção imediata</p>
        <div className="ck-progress">
          <i />
        </div>
        <div style={{ marginTop: 8 }}>
          <strong style={{ letterSpacing: "0.08em" }}>Q12 · REGULAMENTOS</strong>
          <p className="ck-lead" style={{ marginTop: 8, fontSize: "0.95rem" }}>
            Em relação às regras de voo VFR, assinale a alternativa correta.
          </p>
          <button type="button" className="ck-option is-selected">
            A) Manter referência visual com o solo
          </button>
          <button type="button" className="ck-option">
            B) Dispensar comunicação em espaços controlados
          </button>
          <button type="button" className="ck-option">
            C) Operar sem teto mínimo definido
          </button>
          <button type="button" className="ck-option">
            D) Ignorar restrições de visibilidade
          </button>
        </div>
      </div>
      <div className="ck-bezel">
        <span className="ck-kicker">Courses</span>
        <ul className="ck-list">
          <li>PP-A complete — conta free</li>
          <li>CMS Comissário — conta free</li>
          <li>PC / IFR — PRO</li>
          <li>Histórico e matérias — PRO</li>
        </ul>
        <button type="button" className="ck-btn ck-btn--amber" style={{ marginTop: 16 }}>
          Ver PRO
        </button>
      </div>
    </div>
  );
}

function BillingScreen() {
  return (
    <div className="ck-grid-2">
      <div className="ck-bezel">
        <span className="ck-kicker">Subscription</span>
        <h2 className="ck-title" style={{ fontSize: "1.7rem" }}>
          Marquisa PRO
        </h2>
        <div className="ck-price">
          R$ 19,90 <small>/ mês</small>
        </div>
        <ul className="ck-list">
          <li>Simulados ilimitados</li>
          <li>Todas as matérias</li>
          <li>Briefings na nuvem</li>
          <li>Painel completo armado</li>
        </ul>
        <button type="button" className="ck-btn ck-btn--amber" style={{ marginTop: 16 }}>
          Armar PRO
        </button>
      </div>
      <div className="ck-bezel">
        <span className="ck-kicker">Free account</span>
        <ul className="ck-list">
          <li>METAR/TAF público</li>
          <li>Briefing + ferramentas</li>
          <li>Demo + prova PP/CMS</li>
        </ul>
        <p className="ck-lead" style={{ marginTop: 16, fontSize: "0.95rem" }}>
          Funil: WX livre → conta → PRO nos simulados.
        </p>
      </div>
    </div>
  );
}

export default function ModeloLabB() {
  const [screen, setScreen] = useState("home");
  const [utc, setUtc] = useState("--:--:--Z");

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

  const atis = useMemo(
    () => ({
      info: "INFO BRAVO",
      qnh: "1018",
      rwy: "09L / 27R",
      twr: "118.400",
      squawk: "1200",
    }),
    []
  );

  const actions = useMemo(() => {
    if (screen === "home" || screen === "login" || screen === "weather") {
      return (
        <>
          <button type="button" className="ck-btn ck-btn--ghost">
            Login
          </button>
          <button type="button" className="ck-btn ck-btn--cyan">
            Criar conta
          </button>
        </>
      );
    }
    return (
      <>
        <button type="button" className="ck-btn ck-btn--ghost">
          Perfil
        </button>
        <button type="button" className="ck-btn ck-btn--amber">
          PRO
        </button>
      </>
    );
  }, [screen]);

  const body = {
    home: <HomeScreen />,
    weather: <WeatherScreen />,
    dashboard: <DashboardScreen />,
    login: <LoginScreen />,
    exams: <ExamsScreen />,
    billing: <BillingScreen />,
  }[screen];

  return (
    <div className="ck-lab">
      <div className="ck-toolbar">
        <strong>Modelo B · cockpit</strong>
        {SCREENS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`ck-chip${screen === item.id ? " is-active" : ""}`}
            onClick={() => setScreen(item.id)}
          >
            {item.label}
          </button>
        ))}
        <Link className="ck-link" to="/modelo">
          ← Modelo A (painel claro)
        </Link>
      </div>
      <Shell utc={utc} actions={actions} atis={atis}>
        {body}
      </Shell>
    </div>
  );
}
