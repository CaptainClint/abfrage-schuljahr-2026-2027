import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Legend from "./Legend";

describe("Legend", () => {
  it("zeigt beide Legenden-Einträge an", () => {
    render(<Legend />);
    expect(screen.getByText("Ferientag")).toBeInTheDocument();
    expect(screen.getByText("Gesetzlicher Feiertag")).toBeInTheDocument();
  });
});
