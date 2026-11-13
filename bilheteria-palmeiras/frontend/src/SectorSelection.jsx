import { useState } from "react";
import { money } from "./format";

const stadiumAreas = new Map([
  ["Gol Norte", "north"],
  ["Gol Sul", "south"],
  ["Central Oeste", "west"],
  ["Central Leste", "east"],
  ["Superior Norte", "upper-north"],
  ["Superior Sul", "upper-south"],
  ["Superior Oeste", "upper-west"],
  ["Superior Leste", "upper-east"],
]);

function SectorPicker({ sectors, selected, quantity, onSelect, onQuantity }) {
  const sector = sectors.find((item) => item.id === selected);
  const limit = sector ? Math.min(4, sector.remaining) : 1;
  return (
    <>
      <fieldset className="sector-list">
        <legend className="sr-only">Setores disponíveis</legend>
        {sectors.map((item) => (
          <button
            type="button"
            key={item.id}
            className="sector"
            aria-pressed={selected === item.id}
            disabled={!item.remaining}
            onClick={() => onSelect(item)}
          >
            <span className="selection-dot" aria-hidden="true" />
            <span className="sector-text">
              <strong>{item.name}</strong>
              <small>{item.description}</small>
              <small
                className={
                  item.remaining && item.remaining <= 8 ? "scarce" : ""
                }
              >
                {item.remaining ? `${item.remaining} disponíveis` : "Esgotado"}
              </small>
            </span>
            <strong className="sector-price">{money(item.price_cents)}</strong>
          </button>
        ))}
      </fieldset>
      <div className="quantity">
        <div>
          <strong>Quantidade</strong>
          <small>Até 4 ingressos</small>
        </div>
        <div className="quantity-controls">
          <button
            type="button"
            aria-label="Diminuir quantidade"
            disabled={quantity <= 1}
            onClick={() => onQuantity(quantity - 1)}
          >
            −
          </button>
          <output aria-label="Quantidade de ingressos">{quantity}</output>
          <button
            type="button"
            aria-label="Aumentar quantidade"
            disabled={quantity >= limit}
            onClick={() => onQuantity(quantity + 1)}
          >
            +
          </button>
        </div>
      </div>
    </>
  );
}

function Stadium({ sectors, selected, onSelect }) {
  return (
    <div className="stadium panel">
      <div className="stadium-heading">
        <h2>Visão dos setores</h2>
        <small>Mapa ilustrativo</small>
      </div>
      <div className="stadium-layout">
        {sectors
          .filter((sector) => stadiumAreas.has(sector.name))
          .map((sector) => (
            <button
              key={sector.id}
              type="button"
              className="stand"
              style={{ gridArea: stadiumAreas.get(sector.name) }}
              aria-pressed={selected === sector.id}
              disabled={!sector.remaining}
              onClick={() => onSelect(sector)}
            >
              {sector.name}
            </button>
          ))}
        <div className="pitch" aria-hidden="true">
          <div className="pitch-inner">
            <span />
            <i />
            <b />
          </div>
        </div>
      </div>
      <div className="legend">
        <span>
          <i className="available" />
          Disponível
        </span>
        <span>
          <i className="chosen" />
          Selecionado
        </span>
        <span>
          <i />
          Esgotado
        </span>
      </div>
    </div>
  );
}

export function SectorSelection({ sectors }) {
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const sector = sectors.find((item) => item.id === selected);

  function select(item) {
    setSelected(item.id);
    setQuantity((current) => Math.min(current, item.remaining));
  }

  if (!sectors.length)
    return <p className="panel empty">Nenhum setor disponível.</p>;

  return (
    <div className="selection-layout">
      <Stadium sectors={sectors} selected={selected} onSelect={select} />
      <section className="panel picker" aria-labelledby="picker-title">
        <h2 id="picker-title">Escolha seu setor</h2>
        <SectorPicker
          sectors={sectors}
          selected={selected}
          quantity={quantity}
          onSelect={select}
          onQuantity={setQuantity}
        />
        <div className="total" aria-live="polite">
          <span>Total</span>
          <strong>{sector ? money(sector.price_cents * quantity) : "—"}</strong>
        </div>
      </section>
    </div>
  );
}
