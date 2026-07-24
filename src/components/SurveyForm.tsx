import { useState, type FormEvent } from "react";
import { getSurveyPeriods, buildSubmissionRows, type Kategorie } from "../utils/survey";
import { schoolHolidays } from "../data/holidays";
import { SHEETS_ENDPOINT_URL } from "../config";
import PeriodGroup from "./PeriodGroup";
import CustomDatesSection, { type ZusatzTermin } from "./CustomDatesSection";

const RANGE_START = "2026-08-01";
const RANGE_END = "2027-08-31";

type Status = "idle" | "submitting" | "success" | "error";

export default function SurveyForm() {
  const periods = getSurveyPeriods(schoolHolidays, RANGE_START, RANGE_END);

  const [ferienAntworten, setFerienAntworten] = useState<Record<string, Kategorie>>(() => {
    const initial: Record<string, Kategorie> = {};
    periods.forEach((period) => {
      period.dates.forEach((date) => {
        initial[date] = "keins";
      });
    });
    return initial;
  });
  const [zusatzTermine, setZusatzTermine] = useState<ZusatzTermin[]>([]);
  const [name, setName] = useState("");
  const [kommentar, setKommentar] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [nameError, setNameError] = useState(false);

  const handleDayChange = (date: string, kategorie: Kategorie) => {
    setFerienAntworten((prev) => ({ ...prev, [date]: kategorie }));
  };

  const handleAddTermin = (date: string, kategorie: Kategorie) => {
    setZusatzTermine((prev) => [...prev, { id: `${date}-${prev.length}`, date, kategorie }]);
  };

  const handleRemoveTermin = (id: string) => {
    setZusatzTermine((prev) => prev.filter((termin) => termin.id !== id));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!name.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);

    const rows = buildSubmissionRows(
      ferienAntworten,
      zusatzTermine,
      name,
      kommentar,
      new Date().toISOString()
    );

    setStatus("submitting");
    try {
      await fetch(SHEETS_ENDPOINT_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(rows),
      });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <form className="survey-form" onSubmit={handleSubmit}>
      <h2>Essensbedarf angeben</h2>
      {periods.map((period) => (
        <PeriodGroup
          key={period.name}
          period={period}
          answers={ferienAntworten}
          onChange={handleDayChange}
        />
      ))}
      <CustomDatesSection
        termine={zusatzTermine}
        onAdd={handleAddTermin}
        onRemove={handleRemoveTermin}
      />
      <div className="survey-form__field">
        <label htmlFor="survey-name">Name</label>
        <input
          id="survey-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        {nameError && <p className="survey-form__error">Bitte gib Deinen Namen an.</p>}
      </div>
      <div className="survey-form__field">
        <label htmlFor="survey-kommentar">Kommentar (optional)</label>
        <textarea
          id="survey-kommentar"
          value={kommentar}
          onChange={(event) => setKommentar(event.target.value)}
        />
      </div>
      <button type="submit" disabled={status === "submitting"}>
        Absenden
      </button>
      {status === "success" && (
        <p className="survey-form__success">Danke, Deine Angaben wurden übermittelt.</p>
      )}
      {status === "error" && (
        <p className="survey-form__error">
          Beim Absenden ist ein Fehler aufgetreten. Bitte versuche es erneut.
        </p>
      )}
    </form>
  );
}
