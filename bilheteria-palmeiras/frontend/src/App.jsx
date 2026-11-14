import { useEffect, useState } from "react";
import { api } from "./api";
import { matchDate, matchDay, matchTime, money, tickets } from "./format";
import { SectorSelection } from "./SectorSelection";

const crests = {
  PAL: "/media/palmeiras.png",
  SAN: "/media/santos.png",
  BAH: "/media/bahia.png",
  GRE: "/media/gremio.png",
};
const historyUrl = "#/ingressos";
const reviewUrl = (id) => `${historyUrl}/${id}`;

function Crest({ initials = "PAL" }) {
  const source = crests[initials];
  return source ? (
    <img className="crest" src={source} alt="" width="56" height="56" />
  ) : (
    <span className="crest crest-fallback" aria-hidden="true">
      {initials}
    </span>
  );
}

function ClubBrand() {
  return (
    <a href="#/" className="brand">
      <Crest />
      <span>
        <span className="brand-club">Sociedade Esportiva</span>
        <strong>Palmeiras</strong>
      </span>
    </a>
  );
}

function showFixtures() {
  const fixtures = document.getElementById("jogos");
  fixtures.focus({ preventScroll: true });
  fixtures.scrollIntoView();
}

function useCatalog(path) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ data: null, error: "" });

  // biome-ignore lint/correctness/useExhaustiveDependencies: Retrying fetches the same path again.
  useEffect(() => {
    if (!path) return;
    const controller = new AbortController();
    api(path, { signal: controller.signal }).then(
      (data) => {
        if (!controller.signal.aborted) setState({ data, error: "" });
      },
      (error) => {
        if (!controller.signal.aborted)
          setState({ data: null, error: error.message });
      },
    );
    return () => controller.abort();
  }, [path, attempt]);

  function retry() {
    setState({ data: null, error: "" });
    setAttempt((previous) => previous + 1);
  }

  return { ...state, retry };
}

function Pending({ error, retry }) {
  if (error) {
    return (
      <div className="panel empty">
        <p role="alert">{error}</p>
        <button className="button light" type="button" onClick={retry}>
          Tentar novamente
        </button>
      </div>
    );
  }
  return (
    <div className="panel empty" role="status">
      Carregando…
    </div>
  );
}

function Fixture({ match }) {
  return (
    <article className="fixture">
      <div className="fixture-top">
        <span className="fixture-competition">
          <span aria-hidden="true" />
          {match.competition}
        </span>
        <time dateTime={match.starts_at}>
          {matchDate(match.starts_at)} · {matchTime(match.starts_at)}
        </time>
      </div>
      <div className="crests" aria-hidden="true">
        <Crest />
        <span>×</span>
        <Crest initials={match.opponent_initials} />
      </div>
      <h3>
        Palmeiras <span>×</span> {match.opponent}
      </h3>
      <p>{match.venue}</p>
      <a className="button primary" href={`#/jogos/${match.id}`}>
        Ver setores <span aria-hidden="true">→</span>
        <span className="sr-only"> de Palmeiras e {match.opponent}</span>
      </a>
    </article>
  );
}

function Home() {
  const { data: matches, error, retry } = useCatalog("/matches");

  return (
    <>
      <section className="hero">
        <img
          className="hero-photo"
          src="/media/bandeiras.webp"
          alt="Bandeiras do Palmeiras nas arquibancadas lotadas"
          fetchPriority="high"
          width="1050"
          height="1400"
        />
        <div className="hero-content frame">
          <span className="eyebrow">Bilheteria do Verdão</span>
          <h1>
            É dia de <em>Palmeiras.</em>
          </h1>
          <p>Escolha seu jogo e venha torcer pelo Verdão na arquibancada.</p>
          <button className="button gold" type="button" onClick={showFixtures}>
            Ver próximos jogos <span aria-hidden="true">↓</span>
          </button>
        </div>
        <span className="hero-caption">
          São Paulo, SP <span aria-hidden="true">·</span> Nubank Parque
        </span>
      </section>
      <section
        id="jogos"
        className="fixtures frame"
        aria-labelledby="fixtures-title"
        tabIndex={-1}
      >
        <div className="section-heading">
          <span className="eyebrow">Ingressos</span>
          <h2 id="fixtures-title">Próximos jogos</h2>
        </div>
        {!matches ? (
          <Pending error={error} retry={retry} />
        ) : matches.length ? (
          <div className="fixture-grid">
            {matches.map((match) => (
              <Fixture key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <p className="panel empty">Nenhuma partida disponível.</p>
        )}
      </section>
    </>
  );
}

function MatchPage({ id, draftId }) {
  const { data: match, error, retry } = useCatalog(`/matches/${id}`);
  const draftRequest = useCatalog(draftId ? `/simulations/${draftId}` : null);
  if (!match) return <Pending error={error} retry={retry} />;
  const draft = draftRequest.data;
  if (draftId && !draft)
    return <Pending error={draftRequest.error} retry={draftRequest.retry} />;
  if (draft && draft.match.id !== match.id) {
    return <p className="panel empty">Este pedido pertence a outra partida.</p>;
  }

  async function save(body) {
    const order = await api(
      draftId ? `/simulations/${draftId}` : "/simulations",
      {
        method: draftId ? "PUT" : "POST",
        body,
      },
    );
    window.location.hash = reviewUrl(order.id);
  }

  return (
    <>
      <a className="back" href={draftId ? reviewUrl(draftId) : "#/"}>
        ← {draftId ? "Voltar à revisão" : "Voltar aos jogos"}
      </a>
      <div className="match-banner">
        <div>
          <span className="eyebrow">{match.competition}</span>
          <h1 className="page-title">Palmeiras × {match.opponent}</h1>
          <p className="match-facts">
            {matchDay(match.starts_at)} · {matchTime(match.starts_at)} ·{" "}
            {match.venue}
          </p>
        </div>
        <div className="crests" aria-hidden="true">
          <Crest />
          <span>×</span>
          <Crest initials={match.opponent_initials} />
        </div>
      </div>
      <SectorSelection sectors={match.sectors} draft={draft} onSave={save} />
    </>
  );
}

function Review({ id }) {
  const { data: order, error, retry } = useCatalog(`/simulations/${id}`);
  const [askDelete, setAskDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [failure, setFailure] = useState("");

  async function remove() {
    setDeleting(true);
    setFailure("");
    try {
      await api(`/simulations/${id}`, { method: "DELETE" });
      window.location.hash = historyUrl;
    } catch (problem) {
      setFailure(problem.message);
    } finally {
      setDeleting(false);
    }
  }

  if (!order) return <Pending error={error} retry={retry} />;
  return (
    <div className="review-layout">
      <a className="back" href={historyUrl}>
        ← Meus ingressos
      </a>
      <h1 className="page-title">Revise seu pedido</h1>
      <p className="page-lead">Confira a partida, o setor e a quantidade.</p>
      <section className="panel review">
        <div className="ticket-summary">
          <div className="ticket-match">
            <Crest />
            <div>
              <h2>Palmeiras × {order.match.opponent}</h2>
              <p className="match-facts">
                {matchDay(order.match.starts_at)} ·{" "}
                {matchTime(order.match.starts_at)} · {order.match.venue}
              </p>
            </div>
          </div>
          <dl>
            <div>
              <dt>Setor</dt>
              <dd>{order.sector.name}</dd>
            </div>
            <div>
              <dt>Quantidade</dt>
              <dd>{tickets(order.quantity)}</dd>
            </div>
            <div>
              <dt>Valor unitário</dt>
              <dd>{money(order.unit_price_cents)}</dd>
            </div>
          </dl>
          <div className="total">
            <span>Total</span>
            <strong>{money(order.total_cents)}</strong>
          </div>
        </div>
        {failure && (
          <p className="error" role="alert">
            {failure}
          </p>
        )}
        <div className="review-actions">
          <a href={`#/jogos/${order.match.id}/editar/${id}`}>Editar pedido</a>
          <button
            type="button"
            disabled={deleting}
            onClick={() => setAskDelete(true)}
          >
            Excluir rascunho
          </button>
        </div>
        {askDelete && (
          <div className="delete-confirm">
            <p>Excluir este rascunho?</p>
            <button
              className="button light"
              disabled={deleting}
              type="button"
              onClick={() => setAskDelete(false)}
            >
              Voltar
            </button>
            <button
              className="button danger"
              disabled={deleting}
              type="button"
              onClick={remove}
            >
              {deleting ? "Excluindo…" : "Sim, excluir"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function History() {
  const { data: orders, error, retry } = useCatalog("/simulations");

  return (
    <>
      <a className="back" href="#/">
        ← Voltar aos jogos
      </a>
      <div className="match-banner history-banner">
        <div>
          <span className="eyebrow">Bilheteria</span>
          <h1 className="page-title">Meus ingressos</h1>
          <p>Consulte seus pedidos ou continue de onde parou.</p>
        </div>
      </div>
      {!orders ? (
        <Pending error={error} retry={retry} />
      ) : orders.length ? (
        <div className="history">
          {orders.map((order) => (
            <article key={order.id} className="panel history-item">
              <div>
                <span className="pill">Rascunho</span>
                <h2>Palmeiras × {order.match.opponent}</h2>
                <p>
                  {order.sector.name} · {tickets(order.quantity)} ·{" "}
                  {money(order.total_cents)}
                </p>
              </div>
              <a className="button light" href={reviewUrl(order.id)}>
                Revisar rascunho →
              </a>
            </article>
          ))}
        </div>
      ) : (
        <div className="panel empty">
          <p>Você ainda não tem ingressos neste navegador.</p>
          <a className="button primary" href="#/">
            Escolher um jogo →
          </a>
        </div>
      )}
    </>
  );
}

function currentRoute() {
  return window.location.hash.slice(1) || "/";
}

function renderRoute(route) {
  const match = route.match(/^\/jogos\/(\d+)(?:\/editar\/([a-f0-9-]+))?$/i);
  const review = route.match(/^\/ingressos\/([a-f0-9-]+)$/i);
  if (route === "/") return <Home />;
  if (match) return <MatchPage id={match[1]} draftId={match[2]} />;
  if (review) return <Review id={review[1]} />;
  if (route === "/ingressos") return <History />;
  return <p className="panel empty">Página não encontrada.</p>;
}

export default function App() {
  const [route, setRoute] = useState(currentRoute);

  useEffect(() => {
    function onRoute() {
      setRoute(currentRoute());
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    window.addEventListener("hashchange", onRoute);
    return () => window.removeEventListener("hashchange", onRoute);
  }, []);

  return (
    <>
      <header className="site-header">
        <div className="header-inner frame">
          <ClubBrand />
          <nav aria-label="Navegação principal">
            {route === "/" ? (
              <button
                type="button"
                className="nav-games"
                onClick={showFixtures}
              >
                Jogos
              </button>
            ) : (
              <a href="#/">Jogos</a>
            )}
            <a
              className="nav-tickets"
              href={historyUrl}
              aria-current={route.startsWith("/ingressos") ? "page" : undefined}
            >
              <span className="ticket-icon" aria-hidden="true" />
              Meus ingressos
            </a>
          </nav>
        </div>
      </header>
      <main className={route === "/" ? "home" : "shell frame"} key={route}>
        {renderRoute(route)}
      </main>
      <footer className="site-footer">
        <div className="footer-inner frame">
          <ClubBrand />
          <span>Thulio balbuena - 249</span>
        </div>
      </footer>
    </>
  );
}
