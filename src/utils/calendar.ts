import type { FerienPeriode, Feiertag } from "../data/holidays";

export type DayType = "ferien" | "feiertag" | "weekend" | "normal";

export function isFerientag(dateISO: string, holidays: FerienPeriode[]): boolean {
  return holidays.some((h) => dateISO >= h.start && dateISO <= h.end);
}

export function isFeiertag(dateISO: string, feiertage: Feiertag[]): boolean {
  return feiertage.some((f) => f.date === dateISO);
}

export function isWeekend(dateISO: string): boolean {
  const day = new Date(`${dateISO}T00:00:00`).getDay();
  return day === 0 || day === 6;
}

export function getDayType(
  dateISO: string,
  holidays: FerienPeriode[],
  feiertage: Feiertag[]
): DayType {
  if (isFerientag(dateISO, holidays) && !isWeekend(dateISO)) return "ferien";
  if (isFeiertag(dateISO, feiertage)) return "feiertag";
  if (isWeekend(dateISO)) return "weekend";
  return "normal";
}

export interface DayCell {
  date: string; // ISO-Datum
  day: number;
  inMonth: boolean;
}

function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getMonthGrid(year: number, month: number): DayCell[][] {
  const firstOfMonth = new Date(year, month - 1, 1);
  const startWeekday = (firstOfMonth.getDay() + 6) % 7; // Montag = 0 ... Sonntag = 6
  const daysInMonth = new Date(year, month, 0).getDate();
  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

  const cells: DayCell[] = [];
  for (let i = 0; i < totalCells; i++) {
    const dayOffset = i - startWeekday + 1;
    const date = new Date(year, month - 1, dayOffset);
    cells.push({
      date: toISO(date),
      day: date.getDate(),
      inMonth: dayOffset >= 1 && dayOffset <= daysInMonth,
    });
  }

  const weeks: DayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export interface MonthRef {
  year: number;
  month: number; // 1-12
}

export function getMonthRange(
  startYear: number,
  startMonth: number,
  endYear: number,
  endMonth: number
): MonthRef[] {
  const result: MonthRef[] = [];
  let year = startYear;
  let month = startMonth;
  while (year < endYear || (year === endYear && month <= endMonth)) {
    result.push({ year, month });
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return result;
}

export const MONTH_NAMES = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

export const WEEKDAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
