import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/modelo-lab.css";
import MarquisaMark from "../components/MarquisaMark";

const SCREENS = [
  { id: "home", label: "Home visitante" },
  { id: "weather", label: "METAR/TAF" },
  { id: "dashboard", label: "Painel logado" },
  { id: "login", label: "Login" },
  { id: "exams", label: "Simulados" },
  { id: "billing", label: "Assinatura" },
];

function Screws() {
  return (
    <>
      <i className="mq-screw-bl" aria-hidden="true" />
      <i className="mq-screw-br" aria-hidden="true" />
    </>
  );
}

function Shell({ utc, actions, children }) {
  return (
    <div className="mq-shell">
      <header className="mq-header">
        <div className="mq-brand">
          <div className="mq-emblem" aria-hidden="true">
            <MarquisaMark size={24} />
          </div>
          <div className="mq-brand-copy">
            <span className="mq-brand-name">MARQUISA</span>
            <span className="mq-brand-sub">Painel do aeronauta</span>
          </div>
        </div>
        <div className="mq-utc">
          <div className="mq-utc-time">{utc}</div>
          <div className="mq-utc-label">Tempo universal · Zulu</div>
        </div>
        <div className="mq-header-actions">{actions}</div>
      </header>
      <div className="mq-atis-bar">
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
      <div className="mq-stage">{children}</div>
      <footer className="mq-footer">
        <nav className="mq-footer-nav" aria-label="Rodapé modelo">
          <span>Painel</span>
          <span>METAR</span>
          <span>NOTAM</span>
          <span>Plano</span>
          <span>Simulados</span>
        </nav>
        <div className="mq-footer-badge">Voe seguro. Voe preparado.</div>
      </footer>
    </div>
  );
}

function HomeScreen() {
  return (
    <>
      <section className="mq-hero-home">
        <div className="mq-panel">
          <Screws />
          <span className="mq-kicker">Marquisa</span>
          <h1 className="mq-title">Painel do aeronauta</h1>
          <p className="mq-lead">
            METAR e TAF liberados sem cadastro. Briefing, ferramentas e simulados
            abrem com conta gratuita.
          </p>
          <div className="mq-route-strip">
            <div className="mq-pill">
              <span className="mq-code">A</span>
              <div>
                <span>Origem</span>
                <strong>SBGR</strong>
              </div>
            </div>
            <div className="mq-pill">
              <span className="mq-code">B</span>
              <div>
                <span>Destino</span>
                <strong>SBRJ</strong>
              </div>
            </div>
            <div className="mq-pill">
              <span className="mq-code">C</span>
              <div>
                <span>Alternativa</span>
                <strong>SBSP</strong>
              </div>
            </div>
          </div>
          <div className="mq-meta">
            <span className="mq-tag">METAR livre</span>
            <span className="mq-tag mq-tag--muted">Conta para o restante</span>
          </div>
          <div className="mq-notam">NOTAM: modelo visual A — painel claro com parafusos · não afeta produção</div>
          <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
            <button type="button" className="mq-btn mq-btn--primary">
              Consultar METAR / TAF
            </button>
            <button type="button" className="mq-btn mq-btn--dark">
              Criar conta grátis
            </button>
          </div>
        </div>
        <div className="mq-hero-visual" aria-hidden="true">
          <div className="mq-runway" />
          <div className="mq-compass">N 147°</div>
          <div className="mq-chart-label">CARTA IFR · SBGR → SBRJ · FL055</div>
        </div>
      </section>

      <div className="mq-grid-3">
        <article className="mq-panel mq-feature">
          <Screws />
          <div className="mq-feature-top">
            <span className="mq-feature-icon">WX</span>
            <span className="mq-tag">Livre</span>
          </div>
          <h3>METAR / TAF</h3>
          <p>Boletim por ICAO com categoria VFR · MVFR · IFR. Sem conta.</p>
          <button type="button" className="mq-btn mq-btn--primary">
            Abrir
          </button>
        </article>
        <article className="mq-panel mq-feature">
          <Screws />
          <div className="mq-feature-top">
            <span className="mq-feature-icon">PL</span>
            <span className="mq-tag mq-tag--muted">Conta</span>
          </div>
          <h3>Briefing de rota</h3>
          <p>Origem, destino, alternativa, mapa e combustível no mesmo painel.</p>
          <button type="button" className="mq-btn mq-btn--dark">
            Criar conta
          </button>
        </article>
        <article className="mq-panel mq-feature">
          <Screws />
          <div className="mq-feature-top">
            <span className="mq-feature-icon">AN</span>
            <span className="mq-tag mq-tag--muted">Conta</span>
          </div>
          <h3>Simulados ANAC</h3>
          <p>PP, Comissário e mais — prova completa após cadastro.</p>
          <button type="button" className="mq-btn mq-btn--dark">
            Criar conta
          </button>
        </article>
      </div>
    </>
  );
}

function WeatherScreen() {
  return (
    <div className="mq-grid-2">
      <div className="mq-panel">
        <Screws />
        <span className="mq-kicker">Consulta pública</span>
        <h2 className="mq-section-title">METAR e TAF</h2>
        <p className="mq-section-copy">Digite um ICAO de 4 letras. Sem cadastro.</p>
        <div className="mq-form">
          <div className="mq-field">
            <label htmlFor="mq-icao">ICAO</label>
            <input id="mq-icao" defaultValue="SBGR" maxLength={4} />
          </div>
          <button type="button" className="mq-btn mq-btn--primary">
            Consultar
          </button>
        </div>
        <div className="mq-meta" style={{ marginTop: 16 }}>
          <span className="mq-cat mq-cat--vfr">VFR</span>
          <span className="mq-tag mq-tag--muted">Atualizado agora</span>
        </div>
        <pre className="mq-metar-raw">
          METAR SBGR 191100Z 14008KT 9999 FEW025 24/18 Q1018=
        </pre>
        <pre className="mq-metar-raw">
          TAF SBGR 191000Z 1912/2018 15010KT 9999 SCT025 TX27/1918Z TN19/2009Z=
        </pre>
      </div>
      <div className="mq-panel">
        <Screws />
        <span className="mq-kicker">Leitura rápida</span>
        <h2 className="mq-section-title">Guarulhos · SBGR</h2>
        <ul className="mq-list">
          <li>Vento 140° / 08 kt</li>
          <li>Visibilidade 10 km+</li>
          <li>Poucas a 2.500 ft</li>
          <li>QNH 1018 hPa</li>
        </ul>
        <p className="mq-section-copy" style={{ marginTop: 18 }}>
          Quer briefing de rota completa? Crie a conta e liberamos o planejador A–B–C.
        </p>
        <button type="button" className="mq-btn mq-btn--dark">
          Criar conta grátis
        </button>
      </div>
    </div>
  );
}

function DashboardScreen() {
  return (
    <>
      <div className="mq-panel" style={{ marginBottom: 18 }}>
        <Screws />
        <span className="mq-kicker">Briefing ativo</span>
        <div className="mq-route-strip" style={{ marginTop: 8 }}>
          <div className="mq-pill">
            <span className="mq-code">A</span>
            <div>
              <span>Origem</span>
              <strong>SBSP</strong>
            </div>
          </div>
          <div className="mq-pill">
            <span className="mq-code">B</span>
            <div>
              <span>Destino</span>
              <strong>SBRJ</strong>
            </div>
          </div>
          <div className="mq-pill">
            <span className="mq-code">C</span>
            <div>
              <span>Alternativa</span>
              <strong>SBGL</strong>
            </div>
          </div>
          <button type="button" className="mq-btn mq-btn--ghost" style={{ borderColor: "var(--mq-line)", color: "var(--mq-ink)" }}>
            Atualizar
          </button>
        </div>
      </div>
      <div className="mq-grid-3">
        <article className="mq-panel">
          <Screws />
          <div className="mq-feature-top">
            <h3 className="mq-section-title" style={{ margin: 0 }}>
              METAR / TAF
            </h3>
            <span className="mq-cat mq-cat--vfr">VFR</span>
          </div>
          <pre className="mq-metar-raw">SBSP 191100Z 12006KT CAVOK 23/16 Q1019=</pre>
          <pre className="mq-metar-raw">SBRJ 191100Z 09010KT 9999 SCT020 25/19 Q1017=</pre>
        </article>
        <article className="mq-panel">
          <Screws />
          <h3 className="mq-section-title">Briefing de rota</h3>
          <ul className="mq-list">
            <li>Distância ~185 NM</li>
            <li>ETE ~01:25</li>
            <li>Combustível + reserva</li>
            <li>Mapa da rota no painel</li>
          </ul>
        </article>
        <article className="mq-panel">
          <Screws />
          <h3 className="mq-section-title">Simulados</h3>
          <p className="mq-section-copy">Último: PP-A · 78%</p>
          <div className="mq-progress">
            <span />
          </div>
          <button type="button" className="mq-btn mq-btn--primary">
            Abrir simulados
          </button>
        </article>
      </div>
    </>
  );
}

function LoginScreen() {
  return (
    <div className="mq-auth-wrap">
      <div className="mq-panel">
        <Screws />
        <span className="mq-kicker">Acesso</span>
        <h2 className="mq-section-title">Entrar no painel</h2>
        <p className="mq-section-copy">Sua conta libera briefing, ferramentas e simulados.</p>
        <div className="mq-form">
          <div className="mq-field">
            <label htmlFor="mq-email">E-mail</label>
            <input id="mq-email" type="email" placeholder="voce@email.com" />
          </div>
          <div className="mq-field">
            <label htmlFor="mq-pass">Senha</label>
            <input id="mq-pass" type="password" placeholder="••••••••" />
          </div>
          <button type="button" className="mq-btn mq-btn--primary">
            Entrar
          </button>
          <button type="button" className="mq-btn mq-btn--ghost" style={{ borderColor: "var(--mq-line)", color: "var(--mq-ink)" }}>
            Continuar com Google
          </button>
        </div>
      </div>
    </div>
  );
}

function ExamsScreen() {
  return (
    <div className="mq-grid-2">
      <div className="mq-panel">
        <Screws />
        <span className="mq-kicker">Banco ANAC</span>
        <h2 className="mq-section-title">Simulado PP-A</h2>
        <p className="mq-section-copy">Prova completa · 100 questões · cronometrado</p>
        <div className="mq-progress">
          <span />
        </div>
        <div className="mq-exam-q">
          <strong>Questão 12 · Regulamentos</strong>
          <p className="mq-section-copy" style={{ marginBottom: 0 }}>
            Em relação às regras de voo VFR, assinale a alternativa correta.
          </p>
          <div className="mq-options">
            <button type="button" className="mq-option is-selected">
              A) Manter referência visual com o solo
            </button>
            <button type="button" className="mq-option">
              B) Dispensar comunicação em espaços controlados
            </button>
            <button type="button" className="mq-option">
              C) Operar sem teto mínimo definido
            </button>
            <button type="button" className="mq-option">
              D) Ignorar restrições de visibilidade
            </button>
          </div>
        </div>
      </div>
      <div className="mq-panel">
        <Screws />
        <h2 className="mq-section-title">Cursos</h2>
        <ul className="mq-list">
          <li>PP-A — prova completa grátis (conta)</li>
          <li>CMS — Comissário</li>
          <li>PC / IFR — com PRO</li>
        </ul>
        <p className="mq-section-copy" style={{ marginTop: 18 }}>
          PRO libera todos os cursos, matérias e histórico ilimitado.
        </p>
        <button type="button" className="mq-btn mq-btn--primary">
          Ver assinatura
        </button>
      </div>
    </div>
  );
}

function BillingScreen() {
  return (
    <div className="mq-grid-2">
      <div className="mq-panel">
        <Screws />
        <span className="mq-kicker">Plano PRO</span>
        <h2 className="mq-section-title">Assinatura Marquisa</h2>
        <div className="mq-price">
          R$ 19,90 <small>/ mês</small>
        </div>
        <ul className="mq-list" style={{ marginTop: 16 }}>
          <li>Simulados completos e por matéria</li>
          <li>Histórico e desempenho</li>
          <li>Briefings salvos na nuvem</li>
          <li>Ferramentas e computador sem trava</li>
        </ul>
        <button type="button" className="mq-btn mq-btn--primary" style={{ marginTop: 16 }}>
          Assinar PRO
        </button>
      </div>
      <div className="mq-panel">
        <Screws />
        <h2 className="mq-section-title">Conta gratuita</h2>
        <ul className="mq-list">
          <li>METAR/TAF (também sem conta)</li>
          <li>Briefing e ferramentas</li>
          <li>Demo e prova completa PP/CMS</li>
        </ul>
        <p className="mq-section-copy" style={{ marginTop: 18 }}>
          Modelo: cadastro libera o painel. PRO aprofunda simulados e nuvem.
        </p>
      </div>
    </div>
  );
}

export default function ModeloLab() {
  const [screen, setScreen] = useState("home");
  const [utc, setUtc] = useState("--:--:-- Z");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const hh = String(now.getUTCHours()).padStart(2, "0");
      const mm = String(now.getUTCMinutes()).padStart(2, "0");
      const ss = String(now.getUTCSeconds()).padStart(2, "0");
      setUtc(`${hh}:${mm}:${ss} Z`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const actions = useMemo(() => {
    if (screen === "login" || screen === "home") {
      return (
        <>
          <button type="button" className="mq-btn mq-btn--ghost">
            Entrar
          </button>
          <button type="button" className="mq-btn mq-btn--primary">
            Criar conta
          </button>
        </>
      );
    }
    return (
      <>
        <button type="button" className="mq-btn mq-btn--ghost">
          Perfil
        </button>
        <button type="button" className="mq-btn mq-btn--primary">
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
    <div className="mq-lab">
      <div className="mq-lab-toolbar">
        <strong>Modelo · arrumar</strong>
        {SCREENS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`mq-lab-chip${screen === item.id ? " is-active" : ""}`}
            onClick={() => setScreen(item.id)}
          >
            {item.label}
          </button>
        ))}
        <span className="mq-lab-note">Rota: /modelo</span>
        <Link className="mq-lab-link" to="/modelo-b">
          Modelo B · cockpit →
        </Link>
      </div>
      <Shell utc={utc} actions={actions}>
        {body}
      </Shell>
    </div>
  );
}
