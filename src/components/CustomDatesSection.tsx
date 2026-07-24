import { useState } from "react";
import type { Kategorie } from "../utils/survey";

const KATEGORIE_LABELS: Record<Kategorie, string> = {
  normal: "Normales Angebot",
  reduziert: "Lunchtüten",
  keins: "Kein Essen nötig",
};

export interface ZusatzTermin {
  id: string;
  date: string;
  kategorie: Kategorie;
}

interface CustomDatesSectionProps {
  termine: ZusatzTermin[];
  onAdd: (date: string, kategorie: Kategorie) => void;
  onRemove: (id: string) => void;
}

export default function CustomDatesSection({ termine, onAdd, onRemove }: CustomDatesSectionProps) {
  const [date, setDate] = useState("");
  const [kategorie, setKategorie] = useState<Kategorie>("keins");

  const handleAdd = () => {
    if (!date) return;
    onAdd(date, kategorie);
    setDate("");
    setKategorie("keins");
  };

  return (
    <div className="custom-dates">
      <h3 className="custom-dates__title">Weitere Termine</h3>
      <div className="custom-dates__form">
        <input
          type="date"
          aria-label="Datum für weiteren Termin"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleAdd();
            }
          }}
        />
        <select
          aria-label="Kategorie für weiteren Termin"
          value={kategorie}
          onChange={(event) => setKategorie(event.target.value as Kategorie)}
        >
          <option value="normal">{KATEGORIE_LABELS.normal}</option>
          <option value="reduziert">{KATEGORIE_LABELS.reduziert}</option>
          <option value="keins">{KATEGORIE_LABELS.keins}</option>
        </select>
        <button type="button" onClick={handleAdd}>
          Termin hinzufügen
        </button>
      </div>
      <ul className="custom-dates__list">
        {termine.map((termin) => (
          <li key={termin.id} className="custom-dates__item">
            {termin.date} – {KATEGORIE_LABELS[termin.kategorie]}
            <button
              type="button"
              onClick={() => onRemove(termin.id)}
              aria-label={`Termin ${termin.date} entfernen`}
            >
              Entfernen
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
