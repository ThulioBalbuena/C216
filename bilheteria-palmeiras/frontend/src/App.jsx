import { useEffect, useState } from "react";
import { api } from "./api";
import { matchDate, matchDay, matchTime } from "./format";
import { SectorSelection } from "./SectorSelection";

const crests = {
  PAL: "/media/palmeiras.png",
  SAN: "/media/santos.png",
  BAH: "/media/bahia.png",
  GRE: "/media/gremio.png",
};

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

function MatchPage({ id }) {
  const { data: match, error, retry } = useCatalog(`/matches/${id}`);
  if (!match) return <Pending error={error} retry={retry} />;

  return (
    <>
      <a className="back" href="#/">
        ← Voltar aos jogos
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
      <SectorSelection sectors={match.sectors} />
    </>
  );
}

function currentRoute() {
  return window.location.hash.slice(1) || "/";
}

export default function App() {
  const [route, setRoute] = useState(currentRoute);
  const match = route.match(/^\/jogos\/(\d+)$/);

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
          </nav>
        </div>
      </header>
      <main className={route === "/" ? "home" : "shell frame"} key={route}>
        {route === "/" ? (
          <Home />
        ) : match ? (
          <MatchPage id={match[1]} />
        ) : (
          <p className="panel empty">Página não encontrada.</p>
        )}
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
