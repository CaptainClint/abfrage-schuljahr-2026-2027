import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import CustomDatesSection from "./CustomDatesSection";

describe("CustomDatesSection", () => {
  it("ruft onAdd mit Datum und Kategorie auf und leert danach die Eingabe", () => {
    const onAdd = vi.fn();
    render(<CustomDatesSection termine={[]} onAdd={onAdd} onRemove={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Datum für weiteren Termin"), {
      target: { value: "2026-09-15" },
    });
    fireEvent.change(screen.getByLabelText("Kategorie für weiteren Termin"), {
      target: { value: "reduziert" },
    });
    fireEvent.click(screen.getByText("Termin hinzufügen"));

    expect(onAdd).toHaveBeenCalledWith("2026-09-15", "reduziert");
    expect(screen.getByLabelText("Datum für weiteren Termin")).toHaveValue("");
  });

  it("ruft onAdd nicht auf, wenn kein Datum gewählt wurde", () => {
    const onAdd = vi.fn();
    render(<CustomDatesSection termine={[]} onAdd={onAdd} onRemove={vi.fn()} />);
    fireEvent.click(screen.getByText("Termin hinzufügen"));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("zeigt vorhandene Termine an und ruft onRemove mit der richtigen ID auf", () => {
    const onRemove = vi.fn();
    render(
      <CustomDatesSection
        termine={[{ id: "abc", date: "2026-09-15", kategorie: "normal" }]}
        onAdd={vi.fn()}
        onRemove={onRemove}
      />
    );
    expect(screen.getByText(/2026-09-15/)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Termin 2026-09-15 entfernen"));
    expect(onRemove).toHaveBeenCalledWith("abc");
  });

  it("löst beim Drücken von Enter im Datumsfeld onAdd aus und verhindert das Standardverhalten (Formularabsenden)", () => {
    const onAdd = vi.fn();
    render(<CustomDatesSection termine={[]} onAdd={onAdd} onRemove={vi.fn()} />);

    const dateInput = screen.getByLabelText("Datum für weiteren Termin");
    fireEvent.change(dateInput, { target: { value: "2026-09-15" } });

    // Capture the actual dispatched (cancelable) keydown event so we can
    // check its defaultPrevented flag after React's handler runs.
    let capturedEvent: Event | undefined;
    dateInput.addEventListener("keydown", (event) => {
      capturedEvent = event;
    });

    fireEvent.keyDown(dateInput, { key: "Enter", code: "Enter" });

    expect(onAdd).toHaveBeenCalledWith("2026-09-15", "keins");
    expect(capturedEvent?.defaultPrevented).toBe(true);
  });

  it("ruft onAdd nicht auf, wenn Enter ohne gewähltes Datum gedrückt wird", () => {
    const onAdd = vi.fn();
    render(<CustomDatesSection termine={[]} onAdd={onAdd} onRemove={vi.fn()} />);

    fireEvent.keyDown(screen.getByLabelText("Datum für weiteren Termin"), {
      key: "Enter",
      code: "Enter",
    });

    expect(onAdd).not.toHaveBeenCalled();
  });
});
