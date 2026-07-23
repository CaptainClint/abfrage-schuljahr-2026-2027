import { describe, it, expect } from "vitest";
import { getSurveyPeriods } from "./survey";

describe("getSurveyPeriods", () => {
  it("gibt nur Werktage innerhalb eines Ferienzeitraums zurück", () => {
    const holidays = [{ name: "Herbstferien 2026", start: "2026-10-12", end: "2026-10-24" }];
    const periods = getSurveyPeriods(holidays, "2026-08-01", "2027-08-31");
    expect(periods).toHaveLength(1);
    expect(periods[0].name).toBe("Herbstferien 2026");
    expect(periods[0].dates).toEqual([
      "2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16",
      "2026-10-19", "2026-10-20", "2026-10-21", "2026-10-22", "2026-10-23",
    ]);
  });

  it("begrenzt einen Zeitraum, der vor dem Bereichsanfang beginnt, auf den Bereichsanfang", () => {
    const holidays = [{ name: "Sommerferien 2026", start: "2026-07-04", end: "2026-08-15" }];
    const periods = getSurveyPeriods(holidays, "2026-08-01", "2027-08-31");
    expect(periods).toHaveLength(1);
    expect(periods[0].dates[0]).toBe("2026-08-03");
    expect(periods[0].dates[periods[0].dates.length - 1]).toBe("2026-08-14");
  });

  it("lässt einen Zeitraum vollständig außerhalb des Bereichs weg", () => {
    const holidays = [{ name: "Außerhalb", start: "2025-01-01", end: "2025-01-10" }];
    const periods = getSurveyPeriods(holidays, "2026-08-01", "2027-08-31");
    expect(periods).toHaveLength(0);
  });
});
