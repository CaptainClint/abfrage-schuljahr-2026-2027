export default function Legend() {
  return (
    <div className="legend">
      <div className="legend__item">
        <span className="legend__swatch legend__swatch--ferien" />
        Ferientag
      </div>
      <div className="legend__item">
        <span className="legend__swatch legend__swatch--feiertag" />
        Gesetzlicher Feiertag
      </div>
      <div className="legend__item">
        <span className="legend__swatch legend__swatch--kategorie-normal" />
        Normales Angebot
      </div>
      <div className="legend__item">
        <span className="legend__swatch legend__swatch--kategorie-reduziert" />
        Lunchtüten
      </div>
      <div className="legend__item">
        <span className="legend__swatch legend__swatch--kategorie-keins" />
        Kein Essen nötig
      </div>
    </div>
  );
}
