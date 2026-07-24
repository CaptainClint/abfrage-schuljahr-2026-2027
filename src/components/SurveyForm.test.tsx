import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import SurveyForm from "./SurveyForm";
import { getSurveyPeriods } from "../utils/survey";
import { schoolHolidays } from "../data/holidays";

describe("SurveyForm", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({}));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("verhindert das Absenden ohne Namen und zeigt einen Hinweis", () => {
    render(<SurveyForm />);
    fireEvent.click(screen.getByText("Absenden"));
    expect(screen.getByText("Bitte gib Deinen Namen an.")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("sendet für jeden Ferientag eine Zeile mit Standardkategorie und zeigt eine Erfolgsmeldung", async () => {
    render(<SurveyForm />);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Max Mustermann" } });
    fireEvent.click(screen.getByText("Absenden"));

    await waitFor(() => {
      expect(screen.getByText("Danke, Deine Angaben wurden übermittelt.")).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    const [, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(options.method).toBe("POST");
    expect(options.mode).toBe("no-cors");

    const sentRows = JSON.parse(options.body as string);
    const expectedPeriods = getSurveyPeriods(schoolHolidays, "2026-08-01", "2027-08-31");
    const expectedDayCount = expectedPeriods.reduce((sum, p) => sum + p.dates.length, 0);
    expect(sentRows).toHaveLength(expectedDayCount);
    expect(
      sentRows.every((row: { kategorie: string }) => row.kategorie === "keins")
    ).toBe(true);
  });

  it("zeigt eine Fehlermeldung, wenn fetch fehlschlägt", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network error")));
    render(<SurveyForm />);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Max Mustermann" } });
    fireEvent.click(screen.getByText("Absenden"));

    await waitFor(() => {
      expect(
        screen.getByText("Beim Absenden ist ein Fehler aufgetreten. Bitte versuche es erneut.")
      ).toBeInTheDocument();
    });
  });

  it("zeigt den Bereich für weitere Termine", () => {
    render(<SurveyForm />);
    expect(screen.getByText("Weitere Termine")).toBeInTheDocument();
  });
});
