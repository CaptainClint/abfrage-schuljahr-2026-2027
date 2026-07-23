export interface FerienPeriode {
  name: string;
  start: string; // ISO-Datum, z.B. "2026-10-12"
  end: string; // ISO-Datum, inklusive
}

export interface Feiertag {
  name: string;
  date: string; // ISO-Datum
}

export const schoolHolidays: FerienPeriode[] = [
  { name: "Sommerferien 2026", start: "2026-07-04", end: "2026-08-15" },
  { name: "Herbstferien 2026", start: "2026-10-12", end: "2026-10-24" },
  { name: "Weihnachtsferien 2026/27", start: "2026-12-21", end: "2027-01-06" },
  { name: "Osterferien 2027", start: "2027-03-30", end: "2027-04-10" },
  { name: "Schulfreier Tag nach Christi Himmelfahrt", start: "2027-05-07", end: "2027-05-07" },
  { name: "Sommerferien 2027", start: "2027-07-03", end: "2027-08-14" },
];

export const publicHolidays: Feiertag[] = [
  { name: "Tag der Deutschen Einheit", date: "2026-10-03" },
  { name: "Reformationstag", date: "2026-10-31" },
  { name: "1. Weihnachtsfeiertag", date: "2026-12-25" },
  { name: "2. Weihnachtsfeiertag", date: "2026-12-26" },
  { name: "Neujahr", date: "2027-01-01" },
  { name: "Karfreitag", date: "2027-03-26" },
  { name: "Ostermontag", date: "2027-03-29" },
  { name: "Tag der Arbeit", date: "2027-05-01" },
  { name: "Christi Himmelfahrt", date: "2027-05-06" },
  { name: "Pfingstmontag", date: "2027-05-17" },
  { name: "Tag der Deutschen Einheit", date: "2027-10-03" },
  { name: "Reformationstag", date: "2027-10-31" },
  { name: "1. Weihnachtsfeiertag", date: "2027-12-25" },
  { name: "2. Weihnachtsfeiertag", date: "2027-12-26" },
];
