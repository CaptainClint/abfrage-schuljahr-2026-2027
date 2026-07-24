import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import PeriodGroup from "./PeriodGroup";
import type { Kategorie, SurveyPeriod } from "../utils/survey";

function TestHarness({ period }: { period: SurveyPeriod }) {
  const [answers, setAnswers] = useState<Record<string, Kategorie>>({});
  return (
    <PeriodGroup
      period={period}
      answers={answers}
      onChange={(date, kategorie) => setAnswers((prev) => ({ ...prev, [date]: kategorie }))}
    />
  );
}

const period: SurveyPeriod = {
  name: "Herbstferien 2026",
  dates: ["2026-10-12", "2026-10-13"],
};

describe("PeriodGroup", () => {
  it("zeigt den Zeitraumnamen und eine Zeile pro Tag", () => {
    render(<TestHarness period={period} />);
    expect(screen.getByText("Herbstferien 2026")).toBeInTheDocument();
    expect(screen.getByLabelText("2026-10-12")).toBeInTheDocument();
    expect(screen.getByLabelText("2026-10-13")).toBeInTheDocument();
  });

  it("setzt per Schnellauswahl alle Tage des Zeitraums auf eine Kategorie", () => {
    render(<TestHarness period={period} />);
    fireEvent.change(screen.getByLabelText("Alle Tage in Herbstferien 2026 setzen"), {
      target: { value: "normal" },
    });
    expect(screen.getByLabelText("2026-10-12")).toHaveValue("normal");
    expect(screen.getByLabelText("2026-10-13")).toHaveValue("normal");
  });

  it("erlaubt danach weiterhin das individuelle Ändern eines einzelnen Tages", () => {
    render(<TestHarness period={period} />);
    fireEvent.change(screen.getByLabelText("Alle Tage in Herbstferien 2026 setzen"), {
      target: { value: "normal" },
    });
    fireEvent.change(screen.getByLabelText("2026-10-12"), { target: { value: "reduziert" } });
    expect(screen.getByLabelText("2026-10-12")).toHaveValue("reduziert");
    expect(screen.getByLabelText("2026-10-13")).toHaveValue("normal");
  });
});
