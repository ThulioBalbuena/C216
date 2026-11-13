const date = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  timeZone: "America/Sao_Paulo",
});
const time = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});
const day = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  timeZone: "America/Sao_Paulo",
});
const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export const matchDate = (value) =>
  date.format(new Date(value)).replace(".", "");
export const matchTime = (value) => time.format(new Date(value));
export const matchDay = (value) => day.format(new Date(value));
export const money = (cents) => currency.format(cents / 100);
