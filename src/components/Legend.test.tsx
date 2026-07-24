import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Legend from "./Legend";

describe("Legend", () => {
  it("zeigt beide Legenden-Einträge an", () => {
    render(<Legend />);
    expect(screen.getByText("Ferientag")).toBeInTheDocument();
    expect(screen.getByText("Gesetzlicher Feiertag")).toBeInTheDocument();
  });

  it("zeigt die drei Kategorie-Markierungen an", () => {
    render(<Legend />);
    expect(screen.getByText("Normales Angebot")).toBeInTheDocument();
    expect(screen.getByText("Lunchtüten")).toBeInTheDocument();
    expect(screen.getByText("Kein Essen nötig")).toBeInTheDocument();
  });
});
