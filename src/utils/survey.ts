import type { FerienPeriode } from "../data/holidays";

export interface SurveyPeriod {
  name: string;
  dates: string[]; // ISO-Daten, nur Werktage, innerhalb des angegebenen Bereichs
}

function addDaysISO(dateISO: string, days: number): string {
  const date = new Date(`${dateISO}T00:00:00`);
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isWeekday(dateISO: string): boolean {
  const day = new Date(`${dateISO}T00:00:00`).getDay();
  return day >= 1 && day <= 5;
}

export function getSurveyPeriods(
  holidays: FerienPeriode[],
  rangeStart: string,
  rangeEnd: string
): SurveyPeriod[] {
  const periods: SurveyPeriod[] = [];

  for (const holiday of holidays) {
    const start = holiday.start > rangeStart ? holiday.start : rangeStart;
    const end = holiday.end < rangeEnd ? holiday.end : rangeEnd;
    if (start > end) continue;

    const dates: string[] = [];
    let current = start;
    while (current <= end) {
      if (isWeekday(current)) {
        dates.push(current);
      }
      current = addDaysISO(current, 1);
    }

    if (dates.length > 0) {
      periods.push({ name: holiday.name, dates });
    }
  }

  return periods;
}
