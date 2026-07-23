# Dashboard mit Monatsübersichten (Schuljahr 2026/2027) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ein Dashboard bauen, das für August 2026 bis August 2027 Monatsübersichten zeigt, in denen Ferientage und gesetzliche Feiertage für Schleswig-Holstein farblich markiert sind.

**Architecture:** React + Vite + TypeScript Single-Page-App, rein clientseitig. Statische, typisierte Ferien-/Feiertagsdaten in `src/data/holidays.ts`. Reine Datums-Hilfsfunktionen in `src/utils/calendar.ts` (per TDD entwickelt) berechnen Kalenderraster und Tagestyp. `MonthCard`-Komponenten rendern je einen Monat, `Dashboard` ordnet 13 `MonthCard`s in einem responsiven Grid an.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, @testing-library/react

Referenz: [docs/superpowers/specs/2026-07-23-dashboard-design.md](../specs/2026-07-23-dashboard-design.md)

---

## Datei-Übersicht

```
package.json
tsconfig.json
vite.config.ts
index.html
.gitignore
src/
  setupTests.ts
  main.tsx
  App.tsx
  App.test.tsx
  index.css
  data/
    holidays.ts
  utils/
    calendar.ts
    calendar.test.ts
  components/
    MonthCard.tsx
    MonthCard.test.tsx
    Legend.tsx
    Legend.test.tsx
    Dashboard.tsx
    Dashboard.test.tsx
```

---

### Task 1: Projekt-Setup (Vite + React + TypeScript + Vitest)

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `.gitignore`
- Create: `src/setupTests.ts`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Test: `src/App.test.tsx`
- Create: `src/index.css`

- [ ] **Step 1: package.json schreiben**

```json
{
  "name": "abfrage-schuljahr-2026-2027",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.5.0",
    "@testing-library/react": "^16.0.1",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.3",
    "jsdom": "^25.0.1",
    "typescript": "^5.6.3",
    "vite": "^5.4.10",
    "vitest": "^2.1.4"
  }
}
```

- [ ] **Step 2: tsconfig.json schreiben**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src"]
}
```

- [ ] **Step 3: vite.config.ts schreiben**

```ts
/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.ts",
  },
});
```

- [ ] **Step 4: index.html schreiben**

```html
<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Essensbedarf Schuljahr 2026/2027</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: .gitignore schreiben**

```
node_modules
dist
```

- [ ] **Step 6: src/setupTests.ts schreiben**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 7: Dependencies installieren**

Run: `npm install`
Expected: Installation läuft ohne Fehler durch, `node_modules/` wird erzeugt.

- [ ] **Step 8: Fehlschlagenden Smoke-Test schreiben (src/App.test.tsx)**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("App", () => {
  it("zeigt die Überschrift 'Essensbedarf Schuljahr 2026/2027'", () => {
    render(<App />);
    expect(screen.getByText("Essensbedarf Schuljahr 2026/2027")).toBeInTheDocument();
  });
});
```

- [ ] **Step 9: Test ausführen, Fehlschlag verifizieren**

Run: `npx vitest run src/App.test.tsx`
Expected: FAIL mit "Failed to resolve import './App'" (Datei existiert noch nicht)

- [ ] **Step 10: src/main.tsx, src/App.tsx, src/index.css schreiben**

`src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

`src/App.tsx` (Platzhalter, wird in Task 9 durch das echte Dashboard ersetzt):

```tsx
export default function App() {
  return <h1>Essensbedarf Schuljahr 2026/2027</h1>;
}
```

`src/index.css`:

```css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
}
```

- [ ] **Step 11: Test ausführen, Erfolg verifizieren**

Run: `npx vitest run src/App.test.tsx`
Expected: PASS (1 Test)

- [ ] **Step 12: Commit**

```bash
git add package.json tsconfig.json vite.config.ts index.html .gitignore src/setupTests.ts src/main.tsx src/App.tsx src/App.test.tsx src/index.css package-lock.json
git commit -m "chore: set up Vite/React/TypeScript/Vitest project scaffold"
```

---

### Task 2: Ferien- und Feiertagsdaten (src/data/holidays.ts)

**Files:**
- Create: `src/data/holidays.ts`

Statisches Datenmodul, keine Logik → kein TDD nötig, Werte direkt aus der Spec übernehmen.

- [ ] **Step 1: src/data/holidays.ts schreiben**

```ts
export interface FerienPeriode {
  name: string;
  start: string; // ISO-Datum, z.B. "2026-10-12"
  end: string; // ISO-Datum, inklusive
}

export interface Feiertag {
  name: string;
  date: string; // ISO-Datum
}

export const schoolHolidays: FerienPeriode[] = [
  { name: "Sommerferien 2026", start: "2026-07-04", end: "2026-08-15" },
  { name: "Herbstferien 2026", start: "2026-10-12", end: "2026-10-24" },
  { name: "Weihnachtsferien 2026/27", start: "2026-12-21", end: "2027-01-06" },
  { name: "Osterferien 2027", start: "2027-03-30", end: "2027-04-10" },
  { name: "Schulfreier Tag nach Christi Himmelfahrt", start: "2027-05-07", end: "2027-05-07" },
  { name: "Sommerferien 2027", start: "2027-07-03", end: "2027-08-14" },
];

export const publicHolidays: Feiertag[] = [
  { name: "Tag der Deutschen Einheit", date: "2026-10-03" },
  { name: "Reformationstag", date: "2026-10-31" },
  { name: "1. Weihnachtsfeiertag", date: "2026-12-25" },
  { name: "2. Weihnachtsfeiertag", date: "2026-12-26" },
  { name: "Neujahr", date: "2027-01-01" },
  { name: "Karfreitag", date: "2027-03-26" },
  { name: "Ostermontag", date: "2027-03-29" },
  { name: "Tag der Arbeit", date: "2027-05-01" },
  { name: "Christi Himmelfahrt", date: "2027-05-06" },
  { name: "Pfingstmontag", date: "2027-05-17" },
  { name: "Tag der Deutschen Einheit", date: "2027-10-03" },
  { name: "Reformationstag", date: "2027-10-31" },
  { name: "1. Weihnachtsfeiertag", date: "2027-12-25" },
  { name: "2. Weihnachtsfeiertag", date: "2027-12-26" },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/data/holidays.ts
git commit -m "feat: add school holiday and public holiday data for Schleswig-Holstein 2026/27"
```

---

### Task 3: Kalender-Basisfunktionen (isFerientag, isFeiertag, isWeekend, getDayType)

**Files:**
- Create: `src/utils/calendar.ts`
- Test: `src/utils/calendar.test.ts`

- [ ] **Step 1: Fehlschlagende Tests schreiben (src/utils/calendar.test.ts)**

```ts
import { describe, it, expect } from "vitest";
import { isFerientag, isFeiertag, isWeekend, getDayType } from "./calendar";

const holidays = [{ name: "Herbstferien", start: "2026-10-12", end: "2026-10-24" }];
const feiertage = [{ name: "Tag der Deutschen Einheit", date: "2026-10-03" }];

describe("isFerientag", () => {
  it("gibt true für den ersten Tag einer Ferienperiode zurück", () => {
    expect(isFerientag("2026-10-12", holidays)).toBe(true);
  });

  it("gibt true für den letzten Tag einer Ferienperiode zurück", () => {
    expect(isFerientag("2026-10-24", holidays)).toBe(true);
  });

  it("gibt false für einen Tag außerhalb der Ferienperiode zurück", () => {
    expect(isFerientag("2026-10-25", holidays)).toBe(false);
  });
});

describe("isFeiertag", () => {
  it("gibt true für ein passendes Datum zurück", () => {
    expect(isFeiertag("2026-10-03", feiertage)).toBe(true);
  });

  it("gibt false für ein nicht passendes Datum zurück", () => {
    expect(isFeiertag("2026-10-04", feiertage)).toBe(false);
  });
});

describe("isWeekend", () => {
  it("erkennt einen Samstag als Wochenende", () => {
    expect(isWeekend("2026-08-01")).toBe(true);
  });

  it("erkennt einen Montag nicht als Wochenende", () => {
    expect(isWeekend("2026-08-03")).toBe(false);
  });
});

describe("getDayType", () => {
  it("priorisiert Ferientag über Feiertag, wenn beide zutreffen", () => {
    const overlappingHolidays = [{ name: "Weihnachtsferien", start: "2026-12-21", end: "2027-01-06" }];
    const overlappingFeiertage = [{ name: "1. Weihnachtsfeiertag", date: "2026-12-25" }];
    expect(getDayType("2026-12-25", overlappingHolidays, overlappingFeiertage)).toBe("ferien");
  });

  it("erkennt einen normalen Feiertag", () => {
    expect(getDayType("2026-10-03", [], feiertage)).toBe("feiertag");
  });

  it("erkennt ein normales Wochenende", () => {
    expect(getDayType("2026-08-01", [], [])).toBe("weekend");
  });

  it("erkennt einen normalen Schultag", () => {
    expect(getDayType("2026-08-04", [], [])).toBe("normal");
  });
});
```

- [ ] **Step 2: Tests ausführen, Fehlschlag verifizieren**

Run: `npx vitest run src/utils/calendar.test.ts`
Expected: FAIL mit "Failed to resolve import './calendar'"

- [ ] **Step 3: src/utils/calendar.ts schreiben**

```ts
import type { FerienPeriode, Feiertag } from "../data/holidays";

export type DayType = "ferien" | "feiertag" | "weekend" | "normal";

export function isFerientag(dateISO: string, holidays: FerienPeriode[]): boolean {
  return holidays.some((h) => dateISO >= h.start && dateISO <= h.end);
}

export function isFeiertag(dateISO: string, feiertage: Feiertag[]): boolean {
  return feiertage.some((f) => f.date === dateISO);
}

export function isWeekend(dateISO: string): boolean {
  const day = new Date(`${dateISO}T00:00:00`).getDay();
  return day === 0 || day === 6;
}

export function getDayType(
  dateISO: string,
  holidays: FerienPeriode[],
  feiertage: Feiertag[]
): DayType {
  if (isFerientag(dateISO, holidays)) return "ferien";
  if (isFeiertag(dateISO, feiertage)) return "feiertag";
  if (isWeekend(dateISO)) return "weekend";
  return "normal";
}
```

- [ ] **Step 4: Tests ausführen, Erfolg verifizieren**

Run: `npx vitest run src/utils/calendar.test.ts`
Expected: PASS (9 Tests)

- [ ] **Step 5: Commit**

```bash
git add src/utils/calendar.ts src/utils/calendar.test.ts
git commit -m "feat: add day-classification helpers (isFerientag, isFeiertag, isWeekend, getDayType)"
```

---

### Task 4: Monatsraster-Funktion (getMonthGrid)

**Files:**
- Modify: `src/utils/calendar.ts`
- Modify: `src/utils/calendar.test.ts`

- [ ] **Step 1: Fehlschlagende Tests ergänzen (an src/utils/calendar.test.ts anhängen)**

```ts
import { getMonthGrid } from "./calendar";

describe("getMonthGrid", () => {
  it("erzeugt ausschließlich Wochen mit je 7 Tagen", () => {
    const weeks = getMonthGrid(2026, 8);
    weeks.forEach((week) => expect(week).toHaveLength(7));
  });

  it("füllt die erste Woche mit Tagen des Vormonats auf (August 2026 beginnt an einem Samstag)", () => {
    const weeks = getMonthGrid(2026, 8);
    expect(weeks[0][0]).toEqual({ date: "2026-07-27", day: 27, inMonth: false });
    expect(weeks[0][5]).toEqual({ date: "2026-08-01", day: 1, inMonth: true });
  });

  it("enthält den letzten Tag des Monats mit inMonth: true", () => {
    const weeks = getMonthGrid(2026, 8);
    const allCells = weeks.flat();
    const last = allCells.find((c) => c.date === "2026-08-31");
    expect(last?.inMonth).toBe(true);
  });
});
```

(Den bestehenden `import { isFerientag, isFeiertag, isWeekend, getDayType } from "./calendar";` am Dateianfang um `getMonthGrid` ergänzen statt eines zweiten Imports.)

- [ ] **Step 2: Tests ausführen, Fehlschlag verifizieren**

Run: `npx vitest run src/utils/calendar.test.ts`
Expected: FAIL mit "getMonthGrid is not a function" bzw. Importfehler

- [ ] **Step 3: getMonthGrid in src/utils/calendar.ts ergänzen**

```ts
export interface DayCell {
  date: string; // ISO-Datum
  day: number;
  inMonth: boolean;
}

function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getMonthGrid(year: number, month: number): DayCell[][] {
  const firstOfMonth = new Date(year, month - 1, 1);
  const startWeekday = (firstOfMonth.getDay() + 6) % 7; // Montag = 0 ... Sonntag = 6
  const daysInMonth = new Date(year, month, 0).getDate();
  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

  const cells: DayCell[] = [];
  for (let i = 0; i < totalCells; i++) {
    const dayOffset = i - startWeekday + 1;
    const date = new Date(year, month - 1, dayOffset);
    cells.push({
      date: toISO(date),
      day: date.getDate(),
      inMonth: dayOffset >= 1 && dayOffset <= daysInMonth,
    });
  }

  const weeks: DayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}
```

- [ ] **Step 4: Tests ausführen, Erfolg verifizieren**

Run: `npx vitest run src/utils/calendar.test.ts`
Expected: PASS (12 Tests)

- [ ] **Step 5: Commit**

```bash
git add src/utils/calendar.ts src/utils/calendar.test.ts
git commit -m "feat: add getMonthGrid for building calendar week grids"
```

---

### Task 5: Monatsbereich und Beschriftungen (getMonthRange, MONTH_NAMES, WEEKDAY_LABELS)

**Files:**
- Modify: `src/utils/calendar.ts`
- Modify: `src/utils/calendar.test.ts`

- [ ] **Step 1: Fehlschlagenden Test ergänzen (an src/utils/calendar.test.ts anhängen)**

```ts
import { getMonthRange } from "./calendar";

describe("getMonthRange", () => {
  it("erzeugt 13 Monate von August 2026 bis August 2027", () => {
    const months = getMonthRange(2026, 8, 2027, 8);
    expect(months).toHaveLength(13);
    expect(months[0]).toEqual({ year: 2026, month: 8 });
    expect(months[12]).toEqual({ year: 2027, month: 8 });
  });

  it("wechselt bei Monat 12 korrekt ins nächste Jahr", () => {
    const months = getMonthRange(2026, 11, 2027, 2);
    expect(months).toEqual([
      { year: 2026, month: 11 },
      { year: 2026, month: 12 },
      { year: 2027, month: 1 },
      { year: 2027, month: 2 },
    ]);
  });
});
```

- [ ] **Step 2: Test ausführen, Fehlschlag verifizieren**

Run: `npx vitest run src/utils/calendar.test.ts`
Expected: FAIL, "getMonthRange is not a function" bzw. Importfehler

- [ ] **Step 3: getMonthRange und Beschriftungs-Konstanten in src/utils/calendar.ts ergänzen**

```ts
export interface MonthRef {
  year: number;
  month: number; // 1-12
}

export function getMonthRange(
  startYear: number,
  startMonth: number,
  endYear: number,
  endMonth: number
): MonthRef[] {
  const result: MonthRef[] = [];
  let year = startYear;
  let month = startMonth;
  while (year < endYear || (year === endYear && month <= endMonth)) {
    result.push({ year, month });
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return result;
}

export const MONTH_NAMES = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

export const WEEKDAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
```

- [ ] **Step 4: Tests ausführen, Erfolg verifizieren**

Run: `npx vitest run src/utils/calendar.test.ts`
Expected: PASS (14 Tests)

- [ ] **Step 5: Commit**

```bash
git add src/utils/calendar.ts src/utils/calendar.test.ts
git commit -m "feat: add getMonthRange and German month/weekday labels"
```

---

### Task 6: MonthCard-Komponente

**Files:**
- Create: `src/components/MonthCard.tsx`
- Test: `src/components/MonthCard.test.tsx`

- [ ] **Step 1: Fehlschlagende Tests schreiben (src/components/MonthCard.test.tsx)**

```tsx
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
```

- [ ] **Step 2: Tests ausführen, Fehlschlag verifizieren**

Run: `npx vitest run src/components/MonthCard.test.tsx`
Expected: FAIL mit "Failed to resolve import './MonthCard'"

- [ ] **Step 3: src/components/MonthCard.tsx schreiben**

```tsx
import { getMonthGrid, getDayType, MONTH_NAMES, WEEKDAY_LABELS } from "../utils/calendar";
import type { FerienPeriode, Feiertag } from "../data/holidays";

interface MonthCardProps {
  year: number;
  month: number; // 1-12
  holidays: FerienPeriode[];
  feiertage: Feiertag[];
}

export default function MonthCard({ year, month, holidays, feiertage }: MonthCardProps) {
  const weeks = getMonthGrid(year, month);

  return (
    <div className="month-card">
      <h3 className="month-card__title">
        {MONTH_NAMES[month - 1]} {year}
      </h3>
      <table className="month-card__grid">
        <thead>
          <tr>
            {WEEKDAY_LABELS.map((label) => (
              <th key={label}>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, weekIndex) => (
            <tr key={weekIndex}>
              {week.map((cell) => {
                const className = cell.inMonth
                  ? `month-card__day month-card__day--${getDayType(cell.date, holidays, feiertage)}`
                  : "month-card__day month-card__day--outside";
                return (
                  <td key={cell.date} data-testid={`day-${cell.date}`} className={className}>
                    {cell.day}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: Tests ausführen, Erfolg verifizieren**

Run: `npx vitest run src/components/MonthCard.test.tsx`
Expected: PASS (4 Tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/MonthCard.tsx src/components/MonthCard.test.tsx
git commit -m "feat: add MonthCard component rendering a color-coded month grid"
```

---

### Task 7: Legend-Komponente

**Files:**
- Create: `src/components/Legend.tsx`
- Test: `src/components/Legend.test.tsx`

- [ ] **Step 1: Fehlschlagenden Test schreiben (src/components/Legend.test.tsx)**

```tsx
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
```

- [ ] **Step 2: Test ausführen, Fehlschlag verifizieren**

Run: `npx vitest run src/components/Legend.test.tsx`
Expected: FAIL mit "Failed to resolve import './Legend'"

- [ ] **Step 3: src/components/Legend.tsx schreiben**

```tsx
export default function Legend() {
  return (
    <div className="legend">
      <div className="legend__item">
        <span className="legend__swatch legend__swatch--ferien" />
        Ferientag
      </div>
      <div className="legend__item">
        <span className="legend__swatch legend__swatch--feiertag" />
        Gesetzlicher Feiertag
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Test ausführen, Erfolg verifizieren**

Run: `npx vitest run src/components/Legend.test.tsx`
Expected: PASS (1 Test)

- [ ] **Step 5: Commit**

```bash
git add src/components/Legend.tsx src/components/Legend.test.tsx
git commit -m "feat: add Legend component"
```

---

### Task 8: Dashboard-Komponente

**Files:**
- Create: `src/components/Dashboard.tsx`
- Test: `src/components/Dashboard.test.tsx`

- [ ] **Step 1: Fehlschlagende Tests schreiben (src/components/Dashboard.test.tsx)**

```tsx
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
});
```

- [ ] **Step 2: Tests ausführen, Fehlschlag verifizieren**

Run: `npx vitest run src/components/Dashboard.test.tsx`
Expected: FAIL mit "Failed to resolve import './Dashboard'"

- [ ] **Step 3: src/components/Dashboard.tsx schreiben**

```tsx
import { getMonthRange } from "../utils/calendar";
import { schoolHolidays, publicHolidays } from "../data/holidays";
import MonthCard from "./MonthCard";
import Legend from "./Legend";

export default function Dashboard() {
  const months = getMonthRange(2026, 8, 2027, 8);

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <h1>Essensbedarf Schuljahr 2026/2027</h1>
        <p>
          Übersicht über Ferientage und gesetzliche Feiertage in Schleswig-Holstein von August
          2026 bis August 2027.
        </p>
      </header>
      <Legend />
      <div className="dashboard__grid">
        {months.map(({ year, month }) => (
          <MonthCard
            key={`${year}-${month}`}
            year={year}
            month={month}
            holidays={schoolHolidays}
            feiertage={publicHolidays}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Tests ausführen, Erfolg verifizieren**

Run: `npx vitest run src/components/Dashboard.test.tsx`
Expected: PASS (3 Tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/Dashboard.tsx src/components/Dashboard.test.tsx
git commit -m "feat: add Dashboard component composing 13 month cards and the legend"
```

---

### Task 9: App auf Dashboard umstellen und Markenfarben-Styling

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/index.css`

Der bestehende Smoke-Test `src/App.test.tsx` prüft nur auf den Text "Essensbedarf Schuljahr 2026/2027", der auch im `Dashboard`-Header steht — er bleibt unverändert gültig und dient hier als Regressionstest.

- [ ] **Step 1: Test vor der Änderung ausführen (muss aktuell mit Platzhalter grün sein)**

Run: `npx vitest run src/App.test.tsx`
Expected: PASS (1 Test, mit dem alten Platzhalter-App)

- [ ] **Step 2: src/App.tsx auf Dashboard umstellen**

```tsx
import Dashboard from "./components/Dashboard";

export default function App() {
  return <Dashboard />;
}
```

- [ ] **Step 3: Test erneut ausführen, weiterhin grün verifizieren**

Run: `npx vitest run src/App.test.tsx`
Expected: PASS (1 Test, jetzt über das echte Dashboard)

- [ ] **Step 4: src/index.css um Markenfarben und Layout ergänzen**

```css
:root {
  --color-primary-dark: #0a3c2d;
  --color-primary: #00963e;
  --color-accent-sand: #b0a493;
  --color-text-secondary: #696969;
  --color-bg: #ffffff;
  --color-weekend-bg: #f0f0f0;
  --color-outside-bg: #fafafa;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: var(--color-primary-dark);
  background: var(--color-bg);
}

.dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.dashboard__header h1 {
  color: var(--color-primary-dark);
  margin-bottom: 0.25rem;
}

.dashboard__header p {
  color: var(--color-text-secondary);
  margin-top: 0;
}

.dashboard__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-top: 1.5rem;
}

@media (max-width: 1100px) {
  .dashboard__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .dashboard__grid {
    grid-template-columns: 1fr;
  }
}

.month-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.75rem;
}

.month-card__title {
  text-align: center;
  margin: 0 0 0.5rem;
  color: var(--color-primary-dark);
}

.month-card__grid {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.month-card__grid th {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  font-weight: normal;
  padding-bottom: 0.25rem;
}

.month-card__day {
  text-align: center;
  padding: 0.35rem 0;
  font-size: 0.85rem;
  border-radius: 4px;
}

.month-card__day--normal {
  background: var(--color-bg);
}

.month-card__day--weekend {
  background: var(--color-weekend-bg);
}

.month-card__day--ferien {
  background: var(--color-primary);
  color: #ffffff;
}

.month-card__day--feiertag {
  background: var(--color-accent-sand);
  color: var(--color-primary-dark);
}

.month-card__day--outside {
  background: var(--color-outside-bg);
  color: #cccccc;
}

.legend {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: var(--color-primary-dark);
}

.legend__item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.legend__swatch {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  display: inline-block;
}

.legend__swatch--ferien {
  background: var(--color-primary);
}

.legend__swatch--feiertag {
  background: var(--color-accent-sand);
}
```

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/index.css
git commit -m "feat: wire App to Dashboard and add brand-colored styling"
```

---

### Task 10: Gesamte Testsuite, Typecheck und manuelle Browser-Verifikation

**Files:**
- None (Verifikation, keine Codeänderung)

- [ ] **Step 1: Gesamte Testsuite ausführen**

Run: `npm test`
Expected: PASS, alle Tests grün (Summe aus App, calendar, MonthCard, Legend, Dashboard)

- [ ] **Step 2: TypeScript-Typprüfung ausführen**

Run: `npm run typecheck`
Expected: Keine Fehler

- [ ] **Step 3: Dev-Server starten**

Run: `npm run dev`
Expected: Server startet, meldet lokale URL (z.B. `http://localhost:5173/`)

- [ ] **Step 4: Im Browser manuell verifizieren**

Öffne die gemeldete URL im Browser. Prüfe:
- Alle 13 Monatskarten von August 2026 bis August 2027 werden angezeigt
- Sommerferien (Anfang August 2026, Anfang August 2027), Herbstferien, Weihnachtsferien und Osterferien sind grün markiert
- Gesetzliche Feiertage (z.B. 3. Oktober, 25./26. Dezember) sind in der Sand-Farbe markiert
- Die Legende erklärt beide Farben
- Das Layout ist bei schmalerem Fenster (Tablet-/Mobilbreite) weiterhin lesbar (Grid bricht auf 2 bzw. 1 Spalte um)

- [ ] **Step 5: Dev-Server stoppen**

Den Dev-Server-Prozess beenden (Strg+C im Terminal, bzw. den Hintergrundprozess stoppen).

---

## Self-Review-Notizen

- **Spec-Abdeckung:** Alle Abschnitte der Spec sind abgedeckt — Architektur (Task 1, 9), Datenmodell inkl. aller recherchierten Ferien-/Feiertagsdaten (Task 2), Farbcodierung mit den aus gabel-freuden.de recherchierten Markenfarben (Task 9), Kalenderraster-Layout inkl. Randmonate (Task 4, 6), Mehrspalten-Grid-Anordnung (Task 9), Ferientag-Priorität bei Überschneidung mit Feiertag (Task 3, getestet in Task 3 Step 1), keine Vormarkierung beweglicher Ferientage (data/holidays.ts enthält nur offiziell fixierte Perioden), Legende (Task 7), Testing-Ansatz (Unit-Tests durchgehend, manuelle Browser-Prüfung in Task 10).
- **Platzhalter-Scan:** Keine TBD/TODO-Stellen; alle Code-Blöcke sind vollständig.
- **Typ-Konsistenz:** `FerienPeriode`/`Feiertag` (aus `data/holidays.ts`) werden identisch in `calendar.ts` und `MonthCard.tsx` verwendet. `DayCell`, `MonthRef`, `DayType` werden konsistent benannt und importiert. `getDayType`-Signatur ist über alle Aufrufstellen identisch.
