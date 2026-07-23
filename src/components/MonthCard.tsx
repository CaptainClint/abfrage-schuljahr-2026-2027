import { getMonthGrid, getDayType, MONTH_NAMES, WEEKDAY_LABELS } from "../utils/calendar";
import type { FerienPeriode, Feiertag } from "../data/holidays";

interface MonthCardProps {
  year: number;
  month: number; // 1-12
  holidays: FerienPeriode[];
  feiertage: Feiertag[];
}

export default function MonthCard({ year, month, holidays, feiertage }: MonthCardProps) {
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
                return (
                  <td key={cell.date} data-testid={`day-${cell.date}`} className={className}>
                    {cell.day}
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
