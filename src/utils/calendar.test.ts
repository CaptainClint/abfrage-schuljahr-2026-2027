import { describe, it, expect } from "vitest";
import { isFerientag, isFeiertag, isWeekend, getDayType, getMonthGrid, getMonthRange } from "./calendar";

const holidays = [{ name: "Herbstferien", start: "2026-10-12", end: "2026-10-24" }];
const feiertage = [{ name: "Tag der Deutschen Einheit", date: "2026-10-03" }];

describe("isFerientag", () => {
  it("gibt true für den ersten Tag einer Ferienperiode zurück", () => {
    expect(isFerientag("2026-10-12", holidays)).toBe(true);
  });

  it("gibt true für den letzten Tag einer Ferienperiode zurück", () => {
    expect(isFerientag("2026-10-24", holidays)).toBe(true);
  });

  it("gibt false für einen Tag außerhalb der Ferienperiode zurück", () => {
    expect(isFerientag("2026-10-25", holidays)).toBe(false);
  });
});

describe("isFeiertag", () => {
  it("gibt true für ein passendes Datum zurück", () => {
    expect(isFeiertag("2026-10-03", feiertage)).toBe(true);
  });

  it("gibt false für ein nicht passendes Datum zurück", () => {
    expect(isFeiertag("2026-10-04", feiertage)).toBe(false);
  });
});

describe("isWeekend", () => {
  it("erkennt einen Samstag als Wochenende", () => {
    expect(isWeekend("2026-08-01")).toBe(true);
  });

  it("erkennt einen Montag nicht als Wochenende", () => {
    expect(isWeekend("2026-08-03")).toBe(false);
  });
});

describe("getDayType", () => {
  it("priorisiert Ferientag über Feiertag, wenn beide zutreffen", () => {
    const overlappingHolidays = [{ name: "Weihnachtsferien", start: "2026-12-21", end: "2027-01-06" }];
    const overlappingFeiertage = [{ name: "1. Weihnachtsfeiertag", date: "2026-12-25" }];
    expect(getDayType("2026-12-25", overlappingHolidays, overlappingFeiertage)).toBe("ferien");
  });

  it("erkennt einen normalen Feiertag", () => {
    expect(getDayType("2026-10-03", [], feiertage)).toBe("feiertag");
  });

  it("erkennt ein normales Wochenende", () => {
    expect(getDayType("2026-08-01", [], [])).toBe("weekend");
  });

  it("erkennt einen normalen Schultag", () => {
    expect(getDayType("2026-08-04", [], [])).toBe("normal");
  });
});

describe("getMonthGrid", () => {
  it("erzeugt ausschließlich Wochen mit je 7 Tagen", () => {
    const weeks = getMonthGrid(2026, 8);
    weeks.forEach((week) => expect(week).toHaveLength(7));
  });

  it("füllt die erste Woche mit Tagen des Vormonats auf (August 2026 beginnt an einem Samstag)", () => {
    const weeks = getMonthGrid(2026, 8);
    expect(weeks[0][0]).toEqual({ date: "2026-07-27", day: 27, inMonth: false });
    expect(weeks[0][5]).toEqual({ date: "2026-08-01", day: 1, inMonth: true });
  });

  it("enthält den letzten Tag des Monats mit inMonth: true", () => {
    const weeks = getMonthGrid(2026, 8);
    const allCells = weeks.flat();
    const last = allCells.find((c) => c.date === "2026-08-31");
    expect(last?.inMonth).toBe(true);
  });
});

describe("getMonthRange", () => {
  it("erzeugt 13 Monate von August 2026 bis August 2027", () => {
    const months = getMonthRange(2026, 8, 2027, 8);
    expect(months).toHaveLength(13);
    expect(months[0]).toEqual({ year: 2026, month: 8 });
    expect(months[12]).toEqual({ year: 2027, month: 8 });
  });

  it("wechselt bei Monat 12 korrekt ins nächste Jahr", () => {
    const months = getMonthRange(2026, 11, 2027, 2);
    expect(months).toEqual([
      { year: 2026, month: 11 },
      { year: 2026, month: 12 },
      { year: 2027, month: 1 },
      { year: 2027, month: 2 },
    ]);
  });
});
