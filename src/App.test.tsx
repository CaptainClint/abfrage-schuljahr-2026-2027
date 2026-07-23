import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("App", () => {
  it("zeigt die Überschrift 'Essensbedarf Schuljahr 2026/2027'", () => {
    render(<App />);
    expect(screen.getByText("Essensbedarf Schuljahr 2026/2027")).toBeInTheDocument();
  });
});
