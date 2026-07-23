import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import MonthCard from "./MonthCard";

describe("MonthCard", () => {
  it("zeigt den Monatsnamen und das Jahr in der Überschrift", () => {
    render(<MonthCard year={2026} month={10} holidays={[]} feiertage={[]} />);
    expect(screen.getByText("Oktober 2026")).toBeInTheDocument();
  });

  it("markiert einen Ferientag mit der ferien-Klasse", () => {
    const holidays = [{ name: "Herbstferien", start: "2026-10-12", end: "2026-10-24" }];
    render(<MonthCard year={2026} month={10} holidays={holidays} feiertage={[]} />);
    expect(screen.getByTestId("day-2026-10-15")).toHaveClass("month-card__day--ferien");
  });

  it("markiert einen gesetzlichen Feiertag mit der feiertag-Klasse", () => {
    const feiertage = [{ name: "Tag der Deutschen Einheit", date: "2026-10-03" }];
    render(<MonthCard year={2026} month={10} holidays={[]} feiertage={feiertage} />);
    expect(screen.getByTestId("day-2026-10-03")).toHaveClass("month-card__day--feiertag");
  });

  it("markiert einen normalen Schultag mit der normal-Klasse", () => {
    render(<MonthCard year={2026} month={10} holidays={[]} feiertage={[]} />);
    expect(screen.getByTestId("day-2026-10-06")).toHaveClass("month-card__day--normal");
  });
});
