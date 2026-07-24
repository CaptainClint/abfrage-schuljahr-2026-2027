import { getMonthGrid, getDayType, MONTH_NAMES, WEEKDAY_LABELS } from "../utils/calendar";
import type { FerienPeriode, Feiertag } from "../data/holidays";
import type { Kategorie } from "../utils/survey";

interface MonthCardProps {
  year: number;
  month: number; // 1-12
  holidays: FerienPeriode[];
  feiertage: Feiertag[];
  categoryByDate?: Record<string, Kategorie>;
}

export default function MonthCard({
  year,
  month,
  holidays,
  feiertage,
  categoryByDate = {},
}: MonthCardProps) {
  const weeks = getMonthGrid(year, month);

  return (
    <div className="month-card">
      <h3 className="month-card__title">
        {MONTH_NAMES[month - 1]} {year}
      </h3>
      <table className="month-card__grid">
        <thead>
          <tr>
            {WEEKDAY_LABELS.map((label) => (
              <th key={label}>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, weekIndex) => (
            <tr key={weekIndex}>
              {week.map((cell) => {
                const className = cell.inMonth
                  ? `month-card__day month-card__day--${getDayType(cell.date, holidays, feiertage)}`
                  : "month-card__day month-card__day--outside";
                const kategorie = cell.inMonth ? categoryByDate[cell.date] : undefined;
                return (
                  <td key={cell.date} data-testid={`day-${cell.date}`} className={className}>
                    <span className="month-card__day-number">{cell.day}</span>
                    {kategorie && (
                      <span
                        data-testid={`day-${cell.date}-kategorie`}
                        className={`month-card__day-kategorie month-card__day-kategorie--${kategorie}`}
                      />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
