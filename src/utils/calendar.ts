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
  if (isFerientag(dateISO, holidays)) return "ferien";
  if (isFeiertag(dateISO, feiertage)) return "feiertag";
  if (isWeekend(dateISO)) return "weekend";
  return "normal";
}
