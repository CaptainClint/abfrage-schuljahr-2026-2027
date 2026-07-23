import { describe, it, expect } from "vitest";
import { isFerientag, isFeiertag, isWeekend, getDayType } from "./calendar";

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
