import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("App", () => {
  it("zeigt die Überschrift 'Essensbedarf Schuljahr 2026/2027'", () => {
    render(<App />);
    expect(screen.getByText("Essensbedarf Schuljahr 2026/2027")).toBeInTheDocument();
  });

  it("zeigt auch das Abfrage-Formular", () => {
    render(<App />);
    expect(screen.getByText("Essensbedarf angeben")).toBeInTheDocument();
  });

  it("zeigt jeden Ferientag standardmäßig mit der Kein-Essen-Kategorie im Kalender", () => {
    render(<App />);
    // 2026-10-15 ist ein Werktag innerhalb der Herbstferien 2026.
    expect(screen.getByTestId("day-2026-10-15-kategorie")).toHaveClass(
      "month-card__day-kategorie--keins"
    );
  });

  it("aktualisiert die Kategorie-Markierung im Kalender, sobald im Formular eine Auswahl getroffen wird", () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText("Do 2026-10-15"), {
      target: { value: "reduziert" },
    });
    expect(screen.getByTestId("day-2026-10-15-kategorie")).toHaveClass(
      "month-card__day-kategorie--reduziert"
    );
  });
});
