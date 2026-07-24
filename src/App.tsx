import { useRef, useState } from "react";
import Dashboard from "./components/Dashboard";
import SurveyForm from "./components/SurveyForm";
import type { ZusatzTermin } from "./components/CustomDatesSection";
import { getSurveyPeriods, type Kategorie } from "./utils/survey";
import { schoolHolidays } from "./data/holidays";

const RANGE_START = "2026-08-01";
const RANGE_END = "2027-08-31";

export default function App() {
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
  const nextTerminId = useRef(0);

  const handleDayChange = (date: string, kategorie: Kategorie) => {
    setFerienAntworten((prev) => ({ ...prev, [date]: kategorie }));
  };

  const handleAddTermin = (date: string, kategorie: Kategorie) => {
    const id = `termin-${nextTerminId.current++}`;
    setZusatzTermine((prev) => [...prev, { id, date, kategorie }]);
  };

  const handleRemoveTermin = (id: string) => {
    setZusatzTermine((prev) => prev.filter((termin) => termin.id !== id));
  };

  const categoryByDate: Record<string, Kategorie> = { ...ferienAntworten };
  zusatzTermine.forEach((termin) => {
    categoryByDate[termin.date] = termin.kategorie;
  });

  return (
    <>
      <Dashboard categoryByDate={categoryByDate} />
      <SurveyForm
        periods={periods}
        ferienAntworten={ferienAntworten}
        zusatzTermine={zusatzTermine}
        onDayChange={handleDayChange}
        onAddTermin={handleAddTermin}
        onRemoveTermin={handleRemoveTermin}
      />
    </>
  );
}
