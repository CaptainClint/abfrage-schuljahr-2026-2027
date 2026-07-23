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
    </div>
  );
}
