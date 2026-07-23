# Abfrage-Formular für Essensbedarf Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ein Formular unterhalb des Dashboards bauen, in dem die Schule pro Ferientag (und für frei hinzufügbare Zusatztermine) angibt, ob und in welcher Form Essen benötigt wird, und die Antworten per Google Apps Script in eine Google-Tabelle schreibt.

**Architecture:** Neue Komponente `SurveyForm` (aus `PeriodGroup` und `CustomDatesSection` zusammengesetzt), in `App.tsx` unterhalb von `Dashboard` gerendert. Reine, testbare Logik (`getSurveyPeriods`, `buildSubmissionRows`) in `src/utils/survey.ts`. Absenden erfolgt per `fetch` (mode: "no-cors") an eine Google-Apps-Script-Web-App-URL aus `src/config.ts`. Die App bleibt vollständig statisch (GitHub Pages).

**Tech Stack:** React 18, TypeScript, Vite, Vitest, @testing-library/react (bestehender Stack, keine neuen Abhängigkeiten)

Referenz: [docs/superpowers/specs/2026-07-23-survey-form-design.md](../specs/2026-07-23-survey-form-design.md)

---

## Datei-Übersicht

```
google-apps-script/
  Code.gs                        (neu, kein Test — läuft nicht in diesem Build)
src/
  config.ts                      (neu)
  utils/
    survey.ts                    (neu)
    survey.test.ts               (neu)
  components/
    PeriodGroup.tsx               (neu)
    PeriodGroup.test.tsx          (neu)
    CustomDatesSection.tsx         (neu)
    CustomDatesSection.test.tsx    (neu)
    SurveyForm.tsx                 (neu)
    SurveyForm.test.tsx            (neu)
  App.tsx                         (geändert)
  App.test.tsx                    (geändert)
  index.css                       (geändert)
```

---

### Task 1: Google Apps Script Code und Konfigurationsdatei

**Files:**
- Create: `google-apps-script/Code.gs`
- Create: `src/config.ts`

Statische Artefakte ohne Testlogik: das `.gs`-Skript läuft ausschließlich in Googles Umgebung (nicht Teil des Vitest-Testlaufs), die Config-Datei ist eine reine Konstante.

- [ ] **Step 1: google-apps-script/Code.gs schreiben**

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Antworten") ||
    SpreadsheetApp.getActiveSpreadsheet().insertSheet("Antworten");

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Zeitstempel", "Name", "Datum", "Kategorie", "Kommentar"]);
  }

  var rows = JSON.parse(e.postData.contents);
  rows.forEach(function (row) {
    sheet.appendRow([row.timestamp, row.name, row.date, row.kategorie, row.kommentar]);
  });

  return ContentService.createTextOutput(
    JSON.stringify({ status: "ok" })
  ).setMimeType(ContentService.MimeType.JSON);
}
```

- [ ] **Step 2: src/config.ts schreiben**

```ts
// Nach dem Veröffentlichen des Google Apps Script (google-apps-script/Code.gs)
// als Web App die dabei erzeugte URL hier eintragen. Siehe
// docs/superpowers/specs/2026-07-23-survey-form-design.md für die Einrichtung.
export const SHEETS_ENDPOINT_URL = "https://script.google.com/macros/s/REPLACE_ME/exec";
```

- [ ] **Step 3: Commit**

```bash
git add google-apps-script/Code.gs src/config.ts
git commit -m "chore: add Google Apps Script code and endpoint config placeholder"
```

---

### Task 2: Ferientage pro Zeitraum berechnen (getSurveyPeriods)

**Files:**
- Create: `src/utils/survey.ts`
- Test: `src/utils/survey.test.ts`

- [ ] **Step 1: Fehlschlagende Tests schreiben (src/utils/survey.test.ts)**

```ts
import { describe, it, expect } from "vitest";
import { getSurveyPeriods } from "./survey";

describe("getSurveyPeriods", () => {
  it("gibt nur Werktage innerhalb eines Ferienzeitraums zurück", () => {
    const holidays = [{ name: "Herbstferien 2026", start: "2026-10-12", end: "2026-10-24" }];
    const periods = getSurveyPeriods(holidays, "2026-08-01", "2027-08-31");
    expect(periods).toHaveLength(1);
    expect(periods[0].name).toBe("Herbstferien 2026");
    expect(periods[0].dates).toEqual([
      "2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16",
      "2026-10-19", "2026-10-20", "2026-10-21", "2026-10-22", "2026-10-23",
    ]);
  });

  it("begrenzt einen Zeitraum, der vor dem Bereichsanfang beginnt, auf den Bereichsanfang", () => {
    const holidays = [{ name: "Sommerferien 2026", start: "2026-07-04", end: "2026-08-15" }];
    const periods = getSurveyPeriods(holidays, "2026-08-01", "2027-08-31");
    expect(periods).toHaveLength(1);
    expect(periods[0].dates[0]).toBe("2026-08-03");
    expect(periods[0].dates[periods[0].dates.length - 1]).toBe("2026-08-14");
  });

  it("lässt einen Zeitraum vollständig außerhalb des Bereichs weg", () => {
    const holidays = [{ name: "Außerhalb", start: "2025-01-01", end: "2025-01-10" }];
    const periods = getSurveyPeriods(holidays, "2026-08-01", "2027-08-31");
    expect(periods).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Test ausführen, Fehlschlag verifizieren**

Run: `npx vitest run src/utils/survey.test.ts`
Expected: FAIL mit "Failed to resolve import './survey'"

- [ ] **Step 3: src/utils/survey.ts schreiben**

```ts
import type { FerienPeriode } from "../data/holidays";

export interface SurveyPeriod {
  name: string;
  dates: string[]; // ISO-Daten, nur Werktage, innerhalb des angegebenen Bereichs
}

function addDaysISO(dateISO: string, days: number): string {
  const date = new Date(`${dateISO}T00:00:00`);
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isWeekday(dateISO: string): boolean {
  const day = new Date(`${dateISO}T00:00:00`).getDay();
  return day >= 1 && day <= 5;
}

export function getSurveyPeriods(
  holidays: FerienPeriode[],
  rangeStart: string,
  rangeEnd: string
): SurveyPeriod[] {
  const periods: SurveyPeriod[] = [];

  for (const holiday of holidays) {
    const start = holiday.start > rangeStart ? holiday.start : rangeStart;
    const end = holiday.end < rangeEnd ? holiday.end : rangeEnd;
    if (start > end) continue;

    const dates: string[] = [];
    let current = start;
    while (current <= end) {
      if (isWeekday(current)) {
        dates.push(current);
      }
      current = addDaysISO(current, 1);
    }

    if (dates.length > 0) {
      periods.push({ name: holiday.name, dates });
    }
  }

  return periods;
}
```

- [ ] **Step 4: Tests ausführen, Erfolg verifizieren**

Run: `npx vitest run src/utils/survey.test.ts`
Expected: PASS (3 Tests)

- [ ] **Step 5: Commit**

```bash
git add src/utils/survey.ts src/utils/survey.test.ts
git commit -m "feat: add getSurveyPeriods to compute weekday-only holiday dates in range"
```

---

### Task 3: Kategorie-Typ und Übermittlungszeilen (buildSubmissionRows)

**Files:**
- Modify: `src/utils/survey.ts`
- Modify: `src/utils/survey.test.ts`

- [ ] **Step 1: Fehlschlagende Tests ergänzen (an src/utils/survey.test.ts anhängen)**

```ts
import { buildSubmissionRows } from "./survey";

describe("buildSubmissionRows", () => {
  it("baut für jeden Ferientag und jeden Zusatztermin je eine Zeile", () => {
    const rows = buildSubmissionRows(
      { "2026-10-12": "normal", "2026-10-13": "keins" },
      [{ date: "2026-12-24", kategorie: "reduziert" }],
      "Max Mustermann",
      "Bitte vorher anrufen",
      "2026-09-01T10:00:00.000Z"
    );
    expect(rows).toHaveLength(3);
    expect(rows).toContainEqual({
      timestamp: "2026-09-01T10:00:00.000Z",
      name: "Max Mustermann",
      date: "2026-10-12",
      kategorie: "normal",
      kommentar: "Bitte vorher anrufen",
    });
    expect(rows).toContainEqual({
      timestamp: "2026-09-01T10:00:00.000Z",
      name: "Max Mustermann",
      date: "2026-12-24",
      kategorie: "reduziert",
      kommentar: "Bitte vorher anrufen",
    });
  });

  it("gibt eine leere Liste zurück, wenn keine Antworten und keine Zusatztermine vorhanden sind", () => {
    const rows = buildSubmissionRows({}, [], "Max Mustermann", "", "2026-09-01T10:00:00.000Z");
    expect(rows).toEqual([]);
  });
});
```

(Den bestehenden `import { getSurveyPeriods } from "./survey";` am Dateianfang um `buildSubmissionRows` ergänzen statt eines zweiten Imports.)

- [ ] **Step 2: Tests ausführen, Fehlschlag verifizieren**

Run: `npx vitest run src/utils/survey.test.ts`
Expected: FAIL, "buildSubmissionRows is not a function" bzw. Importfehler

- [ ] **Step 3: Kategorie-Typ und buildSubmissionRows in src/utils/survey.ts ergänzen**

```ts
export type Kategorie = "normal" | "reduziert" | "keins";

export interface SubmissionRow {
  timestamp: string;
  name: string;
  date: string;
  kategorie: Kategorie;
  kommentar: string;
}

export function buildSubmissionRows(
  ferienAntworten: Record<string, Kategorie>,
  zusatzTermine: { date: string; kategorie: Kategorie }[],
  name: string,
  kommentar: string,
  timestamp: string
): SubmissionRow[] {
  const rows: SubmissionRow[] = [];

  for (const [date, kategorie] of Object.entries(ferienAntworten)) {
    rows.push({ timestamp, name, date, kategorie, kommentar });
  }

  for (const termin of zusatzTermine) {
    rows.push({ timestamp, name, date: termin.date, kategorie: termin.kategorie, kommentar });
  }

  return rows;
}
```

- [ ] **Step 4: Tests ausführen, Erfolg verifizieren**

Run: `npx vitest run src/utils/survey.test.ts`
Expected: PASS (5 Tests)

- [ ] **Step 5: Commit**

```bash
git add src/utils/survey.ts src/utils/survey.test.ts
git commit -m "feat: add Kategorie type and buildSubmissionRows"
```

---

### Task 4: PeriodGroup-Komponente

**Files:**
- Create: `src/components/PeriodGroup.tsx`
- Test: `src/components/PeriodGroup.test.tsx`

- [ ] **Step 1: Fehlschlagende Tests schreiben (src/components/PeriodGroup.test.tsx)**

```tsx
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
```

- [ ] **Step 2: Tests ausführen, Fehlschlag verifizieren**

Run: `npx vitest run src/components/PeriodGroup.test.tsx`
Expected: FAIL mit "Failed to resolve import './PeriodGroup'"

- [ ] **Step 3: src/components/PeriodGroup.tsx schreiben**

```tsx
import type { Kategorie, SurveyPeriod } from "../utils/survey";

const KATEGORIE_LABELS: Record<Kategorie, string> = {
  normal: "Normales Angebot",
  reduziert: "Reduziertes Angebot (Notbetreuung)",
  keins: "Kein Essen nötig",
};

const WEEKDAY_LABELS: Record<number, string> = {
  1: "Mo",
  2: "Di",
  3: "Mi",
  4: "Do",
  5: "Fr",
};

interface PeriodGroupProps {
  period: SurveyPeriod;
  answers: Record<string, Kategorie>;
  onChange: (date: string, kategorie: Kategorie) => void;
}

export default function PeriodGroup({ period, answers, onChange }: PeriodGroupProps) {
  const handleBulkChange = (kategorie: Kategorie) => {
    period.dates.forEach((date) => onChange(date, kategorie));
  };

  return (
    <fieldset className="period-group">
      <legend className="period-group__title">{period.name}</legend>
      <label className="period-group__bulk">
        Alle Tage setzen auf:{" "}
        <select
          aria-label={`Alle Tage in ${period.name} setzen`}
          defaultValue=""
          onChange={(event) => {
            if (event.target.value) {
              handleBulkChange(event.target.value as Kategorie);
              event.target.value = "";
            }
          }}
        >
          <option value="" disabled>
            Bitte wählen
          </option>
          <option value="normal">{KATEGORIE_LABELS.normal}</option>
          <option value="reduziert">{KATEGORIE_LABELS.reduziert}</option>
          <option value="keins">{KATEGORIE_LABELS.keins}</option>
        </select>
      </label>
      <ul className="period-group__days">
        {period.dates.map((date) => {
          const weekday = new Date(`${date}T00:00:00`).getDay();
          return (
            <li key={date} className="period-group__day">
              <span className="period-group__day-label">
                {WEEKDAY_LABELS[weekday]} {date}
              </span>
              <select
                aria-label={date}
                value={answers[date] ?? "keins"}
                onChange={(event) => onChange(date, event.target.value as Kategorie)}
              >
                <option value="normal">{KATEGORIE_LABELS.normal}</option>
                <option value="reduziert">{KATEGORIE_LABELS.reduziert}</option>
                <option value="keins">{KATEGORIE_LABELS.keins}</option>
              </select>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
```

- [ ] **Step 4: Tests ausführen, Erfolg verifizieren**

Run: `npx vitest run src/components/PeriodGroup.test.tsx`
Expected: PASS (3 Tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/PeriodGroup.tsx src/components/PeriodGroup.test.tsx
git commit -m "feat: add PeriodGroup component with per-day and bulk category selection"
```

---

### Task 5: CustomDatesSection-Komponente

**Files:**
- Create: `src/components/CustomDatesSection.tsx`
- Test: `src/components/CustomDatesSection.test.tsx`

- [ ] **Step 1: Fehlschlagende Tests schreiben (src/components/CustomDatesSection.test.tsx)**

```tsx
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
});
```

- [ ] **Step 2: Tests ausführen, Fehlschlag verifizieren**

Run: `npx vitest run src/components/CustomDatesSection.test.tsx`
Expected: FAIL mit "Failed to resolve import './CustomDatesSection'"

- [ ] **Step 3: src/components/CustomDatesSection.tsx schreiben**

```tsx
import { useState } from "react";
import type { Kategorie } from "../utils/survey";

const KATEGORIE_LABELS: Record<Kategorie, string> = {
  normal: "Normales Angebot",
  reduziert: "Reduziertes Angebot (Notbetreuung)",
  keins: "Kein Essen nötig",
};

export interface ZusatzTermin {
  id: string;
  date: string;
  kategorie: Kategorie;
}

interface CustomDatesSectionProps {
  termine: ZusatzTermin[];
  onAdd: (date: string, kategorie: Kategorie) => void;
  onRemove: (id: string) => void;
}

export default function CustomDatesSection({ termine, onAdd, onRemove }: CustomDatesSectionProps) {
  const [date, setDate] = useState("");
  const [kategorie, setKategorie] = useState<Kategorie>("keins");

  const handleAdd = () => {
    if (!date) return;
    onAdd(date, kategorie);
    setDate("");
    setKategorie("keins");
  };

  return (
    <div className="custom-dates">
      <h3 className="custom-dates__title">Weitere Termine</h3>
      <div className="custom-dates__form">
        <input
          type="date"
          aria-label="Datum für weiteren Termin"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
        <select
          aria-label="Kategorie für weiteren Termin"
          value={kategorie}
          onChange={(event) => setKategorie(event.target.value as Kategorie)}
        >
          <option value="normal">{KATEGORIE_LABELS.normal}</option>
          <option value="reduziert">{KATEGORIE_LABELS.reduziert}</option>
          <option value="keins">{KATEGORIE_LABELS.keins}</option>
        </select>
        <button type="button" onClick={handleAdd}>
          Termin hinzufügen
        </button>
      </div>
      <ul className="custom-dates__list">
        {termine.map((termin) => (
          <li key={termin.id} className="custom-dates__item">
            {termin.date} – {KATEGORIE_LABELS[termin.kategorie]}
            <button
              type="button"
              onClick={() => onRemove(termin.id)}
              aria-label={`Termin ${termin.date} entfernen`}
            >
              Entfernen
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Tests ausführen, Erfolg verifizieren**

Run: `npx vitest run src/components/CustomDatesSection.test.tsx`
Expected: PASS (3 Tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/CustomDatesSection.tsx src/components/CustomDatesSection.test.tsx
git commit -m "feat: add CustomDatesSection component for ad-hoc dates"
```

---

### Task 6: SurveyForm-Komponente

**Files:**
- Create: `src/components/SurveyForm.tsx`
- Test: `src/components/SurveyForm.test.tsx`

- [ ] **Step 1: Fehlschlagende Tests schreiben (src/components/SurveyForm.test.tsx)**

```tsx
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
```

- [ ] **Step 2: Tests ausführen, Fehlschlag verifizieren**

Run: `npx vitest run src/components/SurveyForm.test.tsx`
Expected: FAIL mit "Failed to resolve import './SurveyForm'"

- [ ] **Step 3: src/components/SurveyForm.tsx schreiben**

```tsx
import { useState, type FormEvent } from "react";
import { getSurveyPeriods, buildSubmissionRows, type Kategorie } from "../utils/survey";
import { schoolHolidays } from "../data/holidays";
import { SHEETS_ENDPOINT_URL } from "../config";
import PeriodGroup from "./PeriodGroup";
import CustomDatesSection, { type ZusatzTermin } from "./CustomDatesSection";

const RANGE_START = "2026-08-01";
const RANGE_END = "2027-08-31";

type Status = "idle" | "submitting" | "success" | "error";

export default function SurveyForm() {
  const periods = getSurveyPeriods(schoolHolidays, RANGE_START, RANGE_END);

  const [ferienAntworten, setFerienAntworten] = useState<Record<string, Kategorie>>(() => {
    const initial: Record<string, Kategorie> = {};
    periods.forEach((period) => {
      period.dates.forEach((date) => {
        initial[date] = "keins";
      });
    });
    return initial;
  });
  const [zusatzTermine, setZusatzTermine] = useState<ZusatzTermin[]>([]);
  const [name, setName] = useState("");
  const [kommentar, setKommentar] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [nameError, setNameError] = useState(false);

  const handleDayChange = (date: string, kategorie: Kategorie) => {
    setFerienAntworten((prev) => ({ ...prev, [date]: kategorie }));
  };

  const handleAddTermin = (date: string, kategorie: Kategorie) => {
    setZusatzTermine((prev) => [...prev, { id: `${date}-${prev.length}`, date, kategorie }]);
  };

  const handleRemoveTermin = (id: string) => {
    setZusatzTermine((prev) => prev.filter((termin) => termin.id !== id));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!name.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);

    const rows = buildSubmissionRows(
      ferienAntworten,
      zusatzTermine,
      name,
      kommentar,
      new Date().toISOString()
    );

    setStatus("submitting");
    try {
      await fetch(SHEETS_ENDPOINT_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(rows),
      });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <form className="survey-form" onSubmit={handleSubmit}>
      <h2>Essensbedarf angeben</h2>
      {periods.map((period) => (
        <PeriodGroup
          key={period.name}
          period={period}
          answers={ferienAntworten}
          onChange={handleDayChange}
        />
      ))}
      <CustomDatesSection
        termine={zusatzTermine}
        onAdd={handleAddTermin}
        onRemove={handleRemoveTermin}
      />
      <div className="survey-form__field">
        <label htmlFor="survey-name">Name</label>
        <input
          id="survey-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        {nameError && <p className="survey-form__error">Bitte gib Deinen Namen an.</p>}
      </div>
      <div className="survey-form__field">
        <label htmlFor="survey-kommentar">Kommentar (optional)</label>
        <textarea
          id="survey-kommentar"
          value={kommentar}
          onChange={(event) => setKommentar(event.target.value)}
        />
      </div>
      <button type="submit" disabled={status === "submitting"}>
        Absenden
      </button>
      {status === "success" && (
        <p className="survey-form__success">Danke, Deine Angaben wurden übermittelt.</p>
      )}
      {status === "error" && (
        <p className="survey-form__error">
          Beim Absenden ist ein Fehler aufgetreten. Bitte versuche es erneut.
        </p>
      )}
    </form>
  );
}
```

- [ ] **Step 4: Tests ausführen, Erfolg verifizieren**

Run: `npx vitest run src/components/SurveyForm.test.tsx`
Expected: PASS (4 Tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/SurveyForm.tsx src/components/SurveyForm.test.tsx
git commit -m "feat: add SurveyForm component composing periods, custom dates, and submission"
```

---

### Task 7: App auf SurveyForm erweitern

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Fehlschlagenden Test ergänzen (an src/App.test.tsx anhängen)**

```tsx
it("zeigt auch das Abfrage-Formular", () => {
  render(<App />);
  expect(screen.getByText("Essensbedarf angeben")).toBeInTheDocument();
});
```

- [ ] **Step 2: Test ausführen, Fehlschlag verifizieren**

Run: `npx vitest run src/App.test.tsx`
Expected: FAIL, da "Essensbedarf angeben" noch nicht gerendert wird

- [ ] **Step 3: src/App.tsx anpassen**

```tsx
import Dashboard from "./components/Dashboard";
import SurveyForm from "./components/SurveyForm";

export default function App() {
  return (
    <>
      <Dashboard />
      <SurveyForm />
    </>
  );
}
```

- [ ] **Step 4: Tests ausführen, Erfolg verifizieren**

Run: `npx vitest run src/App.test.tsx`
Expected: PASS (2 Tests)

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/App.test.tsx
git commit -m "feat: render SurveyForm below Dashboard in App"
```

---

### Task 8: Styling für das Formular

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: CSS für das Formular an src/index.css anhängen**

```css
.survey-form {
  max-width: 900px;
  margin: 2rem auto 0;
  padding: 0 1.5rem 3rem;
}

.survey-form h2 {
  color: var(--color-primary-dark);
}

.period-group {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.period-group__title {
  padding: 0 0.5rem;
  font-weight: bold;
  color: var(--color-primary-dark);
}

.period-group__bulk {
  display: block;
  margin: 0.5rem 0 1rem;
  color: var(--color-text-secondary);
}

.period-group__days {
  list-style: none;
  margin: 0;
  padding: 0;
}

.period-group__day {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.3rem 0;
  border-top: 1px solid #f0f0f0;
}

.period-group__day-label {
  font-size: 0.9rem;
}

.custom-dates {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.custom-dates__title {
  margin-top: 0;
  color: var(--color-primary-dark);
}

.custom-dates__form {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.custom-dates__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.custom-dates__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.3rem 0;
  border-top: 1px solid #f0f0f0;
}

.survey-form__field {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.survey-form__field input,
.survey-form__field textarea {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font: inherit;
}

.survey-form button[type="submit"] {
  background: var(--color-primary);
  color: #ffffff;
  border: none;
  border-radius: 4px;
  padding: 0.6rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
}

.survey-form button[type="submit"]:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.survey-form__error {
  color: #b00020;
}

.survey-form__success {
  color: var(--color-primary-dark);
  font-weight: bold;
}
```

- [ ] **Step 2: Volle Testsuite ausführen, Erfolg verifizieren (Styling ändert kein Verhalten)**

Run: `npm test`
Expected: PASS, alle Tests weiterhin grün

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: add brand-colored styling for the survey form"
```

---

### Task 9: Testsuite, Typecheck, Browser-Verifikation, Google-Sheets-Einrichtung

**Files:**
- None (Verifikation, keine Codeänderung)

- [ ] **Step 1: Gesamte Testsuite ausführen**

Run: `npm test`
Expected: PASS, alle Tests grün

- [ ] **Step 2: TypeScript-Typprüfung ausführen**

Run: `npm run typecheck`
Expected: Keine Fehler

- [ ] **Step 3: Dev-Server starten und im Browser manuell verifizieren**

Run: `npm run dev`

Prüfe im Browser:
- Formular erscheint unterhalb des Dashboards
- Jeder Ferienzeitraum zeigt seine Werktage mit Standardkategorie „Kein Essen nötig"
- Schnellauswahl setzt alle Tage eines Zeitraums, einzelne Tage bleiben danach änderbar
- „Weitere Termine": Termin hinzufügen (Datum + Kategorie) und wieder entfernen funktioniert
- Absenden ohne Namen zeigt Hinweis, kein Netzwerkaufruf
- Absenden mit Namen zeigt Erfolgsmeldung (Netzwerkfehler ist an dieser Stelle erwartet, solange die Platzhalter-URL in `src/config.ts` noch nicht ersetzt ist — dann erscheint die Fehlermeldung statt der Erfolgsmeldung, was ebenfalls korrektes Verhalten ist)

- [ ] **Step 4: Google Sheets einrichten und Endpoint eintragen**

1. Neue Google-Tabelle in Google Drive anlegen.
2. Erweiterungen → Apps Script öffnen, den Inhalt von `google-apps-script/Code.gs` einfügen.
3. Über „Bereitstellen" → „Neue Bereitstellung" → Typ „Web App" veröffentlichen: Ausführen als „Ich", Zugriff „Jeder".
4. Die dabei erzeugte Web-App-URL kopieren und in `src/config.ts` als `SHEETS_ENDPOINT_URL` eintragen.
5. Formular im Browser erneut absenden und prüfen, dass eine Zeile pro Tag in der Google-Tabelle „Antworten" erscheint.

- [ ] **Step 5: Commit der eingetragenen Endpoint-URL**

```bash
git add src/config.ts
git commit -m "chore: set live Google Sheets endpoint URL"
```

---

## Self-Review-Notizen

- **Spec-Abdeckung:** Alle Abschnitte der Spec sind abgedeckt — Architektur (Task 1, 6, 7), Umfang & Datenmodell inkl. Werktage-Filter und Bereichsbegrenzung (Task 2), Kategorien und Voreinstellung „keins" (Task 3, 6), Schnellauswahl (Task 4), Zusatztermine (Task 5), Absenden inkl. `no-cors`-Fetch, Namenspflichtfeld, Erfolgs-/Fehlermeldung (Task 6), UI-Struktur und Markenfarben (Task 8), Testing-Ansatz (durchgehend TDD + Task 9 manuelle Prüfung), Google-Sheets-Einrichtung (Task 9).
- **Platzhalter-Scan:** Die einzige "Platzhalter"-URL in `src/config.ts` ist ein bewusster, im Spec dokumentierter Konfigurationswert, der vom Nutzer nach dem Deployment ersetzt wird (Task 9, Step 4-5) — kein unvollständiger Plan-Schritt.
- **Typ-Konsistenz:** `Kategorie`, `SurveyPeriod`, `SubmissionRow` aus `src/utils/survey.ts` werden konsistent in `PeriodGroup.tsx`, `CustomDatesSection.tsx` (dort zusätzlich `ZusatzTermin`) und `SurveyForm.tsx` importiert und verwendet. `buildSubmissionRows`-Signatur ist an der einzigen Aufrufstelle (`SurveyForm.tsx`) identisch zur Definition. `getSurveyPeriods(schoolHolidays, "2026-08-01", "2027-08-31")` wird in `SurveyForm.tsx` und `SurveyForm.test.tsx` mit denselben Literalen aufgerufen (bewusste Duplikation, konsistent mit dem bestehenden Muster in `Dashboard.tsx`/`Dashboard.test.tsx`).
