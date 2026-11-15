import { matchDate } from "./format";

export function PalmeirasTv({ data, error }) {
  return (
    <section className="palmeiras-tv" aria-labelledby="palmeiras-tv-title">
      <div className="frame">
        <div className="section-heading media-heading">
          <h2 id="palmeiras-tv-title">TV Palmeiras</h2>
          <a
            className="tv-channel"
            href="https://www.youtube.com/@Palmeiras/videos"
          >
            Ver canal no YouTube <span aria-hidden="true">↗</span>
          </a>
        </div>
        {data?.length ? (
          <ul className="tv-grid">
            {data.map((video) => (
              <li key={video.id}>
                <a href={`https://www.youtube.com/watch?v=${video.id}`}>
                  <div className="tv-thumbnail">
                    <img
                      src={`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`}
                      alt=""
                      width="320"
                      height="180"
                      loading="lazy"
                    />
                    <span className="tv-play" aria-hidden="true">
                      ▶
                    </span>
                  </div>
                  <time dateTime={video.published_at}>
                    {matchDate(video.published_at)}
                  </time>
                  <h3>{video.title}</h3>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="tv-status" role="status">
            {error || data
              ? "Os vídeos recentes ainda não estão disponíveis aqui."
              : "Carregando vídeos recentes…"}
          </p>
        )}
      </div>
    </section>
  );
}
