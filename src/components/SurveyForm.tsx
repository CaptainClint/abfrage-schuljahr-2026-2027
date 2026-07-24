import { useState, type FormEvent } from "react";
import { buildSubmissionRows, type Kategorie, type SurveyPeriod } from "../utils/survey";
import { SHEETS_ENDPOINT_URL } from "../config";
import PeriodGroup from "./PeriodGroup";
import CustomDatesSection, { type ZusatzTermin } from "./CustomDatesSection";

type Status = "idle" | "submitting" | "success" | "error";

interface SurveyFormProps {
  periods: SurveyPeriod[];
  ferienAntworten: Record<string, Kategorie>;
  zusatzTermine: ZusatzTermin[];
  onDayChange: (date: string, kategorie: Kategorie) => void;
  onAddTermin: (date: string, kategorie: Kategorie) => void;
  onRemoveTermin: (id: string) => void;
}

export default function SurveyForm({
  periods,
  ferienAntworten,
  zusatzTermine,
  onDayChange,
  onAddTermin,
  onRemoveTermin,
}: SurveyFormProps) {
  const [name, setName] = useState("");
  const [kommentar, setKommentar] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [nameError, setNameError] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!name.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);

    if (SHEETS_ENDPOINT_URL.includes("REPLACE_ME")) {
      setStatus("error");
      return;
    }

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
          onChange={onDayChange}
        />
      ))}
      <CustomDatesSection
        termine={zusatzTermine}
        onAdd={onAddTermin}
        onRemove={onRemoveTermin}
      />
      <div className="survey-form__field">
        <label htmlFor="survey-name">Name</label>
        <input
          id="survey-name"
          type="text"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (event.target.value.trim()) {
              setNameError(false);
            }
          }}
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
