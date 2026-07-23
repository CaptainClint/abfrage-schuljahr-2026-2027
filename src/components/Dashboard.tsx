import { getMonthRange } from "../utils/calendar";
import { schoolHolidays, publicHolidays } from "../data/holidays";
import MonthCard from "./MonthCard";
import Legend from "./Legend";

export default function Dashboard() {
  const months = getMonthRange(2026, 8, 2027, 8);

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <h1>Essensbedarf Schuljahr 2026/2027</h1>
        <p>
          Übersicht über Ferientage und gesetzliche Feiertage in Schleswig-Holstein von August
          2026 bis August 2027.
        </p>
      </header>
      <div className="dashboard__grid">
        {months.map(({ year, month }) => (
          <MonthCard
            key={`${year}-${month}`}
            year={year}
            month={month}
            holidays={schoolHolidays}
            feiertage={publicHolidays}
          />
        ))}
      </div>
      <Legend />
    </div>
  );
}
