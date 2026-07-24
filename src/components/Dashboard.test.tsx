import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Dashboard from "./Dashboard";

describe("Dashboard", () => {
  it("zeigt 13 Monatsüberschriften von August 2026 bis August 2027", () => {
    render(<Dashboard />);
    expect(screen.getByText("August 2026")).toBeInTheDocument();
    expect(screen.getByText("August 2027")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(13);
  });

  it("zeigt die Legende mit beiden Kategorien", () => {
    render(<Dashboard />);
    expect(screen.getByText("Ferientag")).toBeInTheDocument();
    expect(screen.getByText("Gesetzlicher Feiertag")).toBeInTheDocument();
  });

  it("zeigt den Seitentitel", () => {
    render(<Dashboard />);
    expect(screen.getByText("Essensbedarf Schuljahr 2026/2027")).toBeInTheDocument();
  });

  it("reicht categoryByDate an die Monatskarten weiter", () => {
    render(<Dashboard categoryByDate={{ "2026-10-15": "normal" }} />);
    expect(screen.getByTestId("day-2026-10-15-kategorie")).toHaveClass(
      "month-card__day-kategorie--normal"
    );
  });
});
