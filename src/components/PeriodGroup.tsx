import type { Kategorie, SurveyPeriod } from "../utils/survey";

const KATEGORIE_LABELS: Record<Kategorie, string> = {
  normal: "Normales Angebot",
  reduziert: "Lunchtüten",
  keins: "Kein Essen nötig",
};

const WEEKDAY_LABELS: Record<number, string> = {
  1: "Mo",
  2: "Di",
  3: "Mi",
  4: "Do",
  5: "Fr",
};

interface PeriodGroupProps {
  period: SurveyPeriod;
  answers: Record<string, Kategorie>;
  onChange: (date: string, kategorie: Kategorie) => void;
}

export default function PeriodGroup({ period, answers, onChange }: PeriodGroupProps) {
  const handleBulkChange = (kategorie: Kategorie) => {
    period.dates.forEach((date) => onChange(date, kategorie));
  };

  return (
    <fieldset className="period-group">
      <legend className="period-group__title">{period.name}</legend>
      <label className="period-group__bulk">
        Alle Tage setzen auf:{" "}
        <select
          aria-label={`Alle Tage in ${period.name} setzen`}
          defaultValue=""
          onChange={(event) => {
            if (event.target.value) {
              handleBulkChange(event.target.value as Kategorie);
              event.target.value = "";
            }
          }}
        >
          <option value="" disabled>
            Bitte wählen
          </option>
          <option value="normal">{KATEGORIE_LABELS.normal}</option>
          <option value="reduziert">{KATEGORIE_LABELS.reduziert}</option>
          <option value="keins">{KATEGORIE_LABELS.keins}</option>
        </select>
      </label>
      <ul className="period-group__days">
        {period.dates.map((date) => {
          const weekday = new Date(`${date}T00:00:00`).getDay();
          return (
            <li key={date} className="period-group__day">
              <span className="period-group__day-label">
                {WEEKDAY_LABELS[weekday]} {date}
              </span>
              <select
                aria-label={`${WEEKDAY_LABELS[weekday]} ${date}`}
                value={answers[date] ?? "keins"}
                onChange={(event) => onChange(date, event.target.value as Kategorie)}
              >
                <option value="normal">{KATEGORIE_LABELS.normal}</option>
                <option value="reduziert">{KATEGORIE_LABELS.reduziert}</option>
                <option value="keins">{KATEGORIE_LABELS.keins}</option>
              </select>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
