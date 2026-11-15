import { useEffect, useRef, useState } from "react";

const stories = [
  {
    title: "Uma estreia com taça",
    description:
      "Em 1915, o Palestra Italia venceu o Savoia por 2 a 0 na sua primeira partida e já voltou para casa com um troféu.",
    image: "/media/palestra-1916.webp",
    url: "https://www.palmeiras.com.br/linha-do-tempo/1914-1920-fundacao-do-palestra-italia-e-primeiro-titulo/",
  },
  {
    title: "A casa do Palmeiras desde 1920",
    description:
      "O Palestra Italia comprou o campo e parte do Parque Antarctica por 500 contos de réis. O Verdão joga no mesmo endereço até hoje.",
    image: "/media/parque-antarctica.webp",
    url: "https://www.palmeiras.com.br/parque-antartica/",
  },
  {
    title: "Três noites de Libertadores",
    description:
      "Deportivo Cali, Santos e Flamengo foram os adversários nas finais que renderam ao Palmeiras as taças de 1999, 2020 e 2021.",
    image: "/media/libertadores-2021.webp",
    url: "https://www.palmeiras.com.br/historico-libertadores/",
  },
  {
    title: "O que as oito estrelas contam",
    description:
      "As oito estrelas do escudo lembram agosto. As 26 linhas no centro remetem ao dia da fundação do clube, em 1914.",
    image: "/media/palmeiras.png",
    imageClass: "story-crest",
    url: "https://www.palmeiras.com.br/escudos/",
  },
];

export function ClubStories() {
  const carousel = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const track = carousel.current;
    const updateControls = () => {
      setAtStart(track.scrollLeft <= 1);
      setAtEnd(track.scrollLeft >= track.scrollWidth - track.clientWidth - 1);
    };
    const observer = new ResizeObserver(updateControls);
    observer.observe(track);
    track.addEventListener("scroll", updateControls, { passive: true });
    return () => {
      observer.disconnect();
      track.removeEventListener("scroll", updateControls);
    };
  }, []);

  function move(direction) {
    const track = carousel.current;
    const [first, second] = track.children;
    const step =
      second.getBoundingClientRect().left - first.getBoundingClientRect().left;
    track.scrollBy({ left: direction * step });
  }

  return (
    <section className="club-stories" aria-labelledby="club-stories-title">
      <div className="frame">
        <div className="section-heading media-heading">
          <h2 id="club-stories-title">Histórias do Verdão</h2>
          <div className="story-controls">
            <button
              className="story-arrow"
              type="button"
              aria-label="Curiosidade anterior"
              aria-controls="club-story-list"
              aria-disabled={atStart}
              onClick={() => !atStart && move(-1)}
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              className="story-arrow"
              type="button"
              aria-label="Próxima curiosidade"
              aria-controls="club-story-list"
              aria-disabled={atEnd}
              onClick={() => !atEnd && move(1)}
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
        <ul className="story-track" id="club-story-list" ref={carousel}>
          {stories.map((story, index) => (
            <li key={story.url}>
              <article>
                <a href={story.url} aria-labelledby={`club-story-${index}`}>
                  <img
                    className={story.imageClass}
                    src={story.image}
                    alt=""
                    width="768"
                    height="432"
                    loading="lazy"
                  />
                  <h3 id={`club-story-${index}`}>{story.title}</h3>
                  <p>{story.description}</p>
                </a>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
