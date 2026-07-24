import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import SurveyForm from "./SurveyForm";
import { getSurveyPeriods } from "../utils/survey";
import { schoolHolidays } from "../data/holidays";

// The real config still points at the unconfigured placeholder endpoint at
// this stage of the project (see src/config.ts). Tests that exercise the
// happy submission path stub it out with a real-looking URL so they verify
// the row-building/submission logic independently of the placeholder guard,
// which has its own dedicated test below.
vi.mock("../config", () => ({
  SHEETS_ENDPOINT_URL: "https://script.google.com/macros/s/CONFIGURED/exec",
}));

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

  it("entfernt den Namens-Hinweis, sobald mit der Eingabe eines Namens begonnen wird", () => {
    render(<SurveyForm />);
    fireEvent.click(screen.getByText("Absenden"));
    expect(screen.getByText("Bitte gib Deinen Namen an.")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "M" } });
    expect(screen.queryByText("Bitte gib Deinen Namen an.")).not.toBeInTheDocument();
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
    expect(screen.getByText("Weitere Termine (z.B. bewegliche Ferientage)")).toBeInTheDocument();
  });

  it("entfernt genau den richtigen Termin nach Hinzufügen/Entfernen/Hinzufügen an demselben Datum", () => {
    render(<SurveyForm />);

    const dateInput = screen.getByLabelText("Datum für weiteren Termin");
    const addButton = screen.getByText("Termin hinzufügen");

    // Add two custom dates for the same date, so ids would collide under the
    // old `${date}-${prev.length}` scheme once one is removed and a third is added.
    fireEvent.change(dateInput, { target: { value: "2026-09-15" } });
    fireEvent.click(addButton);
    fireEvent.change(dateInput, { target: { value: "2026-09-15" } });
    fireEvent.click(addButton);

    const removeButtons = screen.getAllByLabelText("Termin 2026-09-15 entfernen");
    expect(removeButtons).toHaveLength(2);

    // Remove the first of the two entries.
    fireEvent.click(removeButtons[0]);
    expect(screen.getAllByLabelText("Termin 2026-09-15 entfernen")).toHaveLength(1);

    // Add a third entry for the same date - under the old buggy id scheme
    // (`${date}-${prev.length}`), prev.length is now 1 again, so this would
    // reuse the id of the remaining entry.
    fireEvent.change(dateInput, { target: { value: "2026-09-15" } });
    fireEvent.click(addButton);
    expect(screen.getAllByLabelText("Termin 2026-09-15 entfernen")).toHaveLength(2);

    // Removing one entry now must remove exactly one, not both/none.
    const remaining = screen.getAllByLabelText("Termin 2026-09-15 entfernen");
    fireEvent.click(remaining[0]);
    expect(screen.getAllByLabelText("Termin 2026-09-15 entfernen")).toHaveLength(1);
  });

  it("drückt Enter im Datumsfeld der weiteren Termine ohne das gesamte Formular abzusenden", () => {
    render(<SurveyForm />);

    fireEvent.change(screen.getByLabelText("Datum für weiteren Termin"), {
      target: { value: "2026-09-15" },
    });
    fireEvent.keyDown(screen.getByLabelText("Datum für weiteren Termin"), {
      key: "Enter",
      code: "Enter",
    });

    // The custom date was added ...
    expect(screen.getByLabelText("Termin 2026-09-15 entfernen")).toBeInTheDocument();
    // ... but the outer form was not submitted (no name given, so a real
    // submit attempt would show the name-required error or call fetch).
    expect(screen.queryByText("Bitte gib Deinen Namen an.")).not.toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("SurveyForm mit unkonfiguriertem Sheets-Endpoint", () => {
  // This block intentionally does NOT rely on the `vi.mock("../config", ...)`
  // stub above's replacement value; vi.mock is hoisted per-module and applies
  // to the whole file, so to exercise the real placeholder guard we re-mock
  // it locally with the actual REPLACE_ME-style URL for this suite.
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({}));
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("zeigt die Fehlermeldung statt einer Erfolgsmeldung, wenn der Endpoint noch der Platzhalter ist", async () => {
    vi.doMock("../config", () => ({
      SHEETS_ENDPOINT_URL: "https://script.google.com/macros/s/REPLACE_ME/exec",
    }));
    const { default: SurveyFormWithPlaceholder } = await import("./SurveyForm");

    render(<SurveyFormWithPlaceholder />);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Max Mustermann" } });
    fireEvent.click(screen.getByText("Absenden"));

    await waitFor(() => {
      expect(
        screen.getByText("Beim Absenden ist ein Fehler aufgetreten. Bitte versuche es erneut.")
      ).toBeInTheDocument();
    });
    expect(screen.queryByText("Danke, Deine Angaben wurden übermittelt.")).not.toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();

    vi.doUnmock("../config");
  });
});
