# Design: Dashboard mit Monatsübersichten (Schuljahr 2026/2027)

## Kontext

Der Nutzer ist Caterer und beliefert eine Schule in Kiel (Schleswig-Holstein) an Schultagen mit Essen. Für das Schuljahr 2026/2027 soll die Schule per E-Mail (mit Link zu einer Web-App) gefragt werden, wann sie außerhalb der regulären Schultage (Ferien, bewegliche Ferientage, Brückentage) Essen benötigt und in welcher Form.

Dieses Dokument beschreibt die **erste Ausbaustufe** der Web-App: ein Dashboard, das für die Monate August 2026 bis August 2027 Monatsübersichten anzeigt, in denen Ferientage und gesetzliche Feiertage farblich markiert sind.

## Out of Scope (spätere Ausbaustufen)

- Die eigentliche Abfrage-Funktion (Schule beantwortet, wann/in welcher Form Essen an Ferientagen/beweglichen Ferientagen/Brückentagen benötigt wird)
- Versand-Mechanik der E-Mail an die Schule
- Speicherung/Auswertung der Antworten (Backend, Datenbank)
- Hosting/Deployment (bewusst noch offen)

## Architektur

- **Tech-Stack:** React + Vite + TypeScript, Single-Page-App
- Rein clientseitig für diese Ausbaustufe, kein Backend nötig
- Eine `Dashboard`-Komponente rendert 13 `MonthCard`-Komponenten (August 2026 bis einschließlich August 2027) in einem responsiven CSS-Grid
- Ferien-/Feiertagsdaten liegen als typisiertes TypeScript-Datenmodul vor (statisch, keine Laufzeit-API, keine externe Abhängigkeit)
- Eine Datums-Hilfsfunktion bestimmt für jeden angezeigten Tag, ob er in eine Ferienperiode fällt, ein gesetzlicher Feiertag ist, ein Wochenende ist, oder ein normaler Tag ist

## Datenmodell

```ts
interface FerienPeriode {
  name: string;       // z.B. "Herbstferien"
  start: string;       // ISO-Datum, z.B. "2026-10-12"
  end: string;         // ISO-Datum, inklusive
}

interface Feiertag {
  name: string;        // z.B. "Reformationstag"
  date: string;         // ISO-Datum
}
```

Zwei Arrays `schoolHolidays: FerienPeriode[]` und `publicHolidays: Feiertag[]`, hartkodiert für Schleswig-Holstein, Zeitraum August 2026 – August 2027.

### Ferientage (offiziell vom Land Schleswig-Holstein festgelegt, recherchiert über die Landesseite schleswig-holstein.de/Ferientermine sowie feiertage-deutschland.de)

| Name | Start | Ende |
|---|---|---|
| Sommerferien 2026 | 2026-07-04 | 2026-08-15 |
| Herbstferien 2026 | 2026-10-12 | 2026-10-24 |
| Weihnachtsferien 2026/27 | 2026-12-21 | 2027-01-06 |
| Osterferien 2027 | 2027-03-30 | 2027-04-10 |
| Schulfreier Tag nach Christi Himmelfahrt | 2027-05-07 | 2027-05-07 |
| Sommerferien 2027 | 2027-07-03 | 2027-08-14 |

Im Dashboard (Aug 2026 – Aug 2027) sichtbar ist jeweils nur der Teil dieser Perioden, der in den Anzeigezeitraum fällt (z.B. von Sommerferien 2026 nur 01.08.–15.08.2026).

**Wichtig:** Die für 2026/27 gemeldeten "2 beweglichen Ferientage" (von der Schule per Schulkonferenz selbst festgelegt) werden **nicht** vormarkiert — das ist genau das, was später über die eigentliche Abfrage-Funktion ermittelt werden soll.

Die exakten Grenzdaten sind während der Implementierung anhand der offiziellen Landesquelle (schleswig-holstein.de/DE/landesregierung/themen/bildung-hochschulen/ferientermine) noch einmal zu verifizieren, da verschiedene Quellen leicht abweichende Randtage nennen können.

### Gesetzliche Feiertage Schleswig-Holstein (2026–2027)

| Datum | Name |
|---|---|
| 2026-10-03 | Tag der Deutschen Einheit |
| 2026-10-31 | Reformationstag |
| 2026-12-25 | 1. Weihnachtsfeiertag |
| 2026-12-26 | 2. Weihnachtsfeiertag |
| 2027-01-01 | Neujahr |
| 2027-03-26 | Karfreitag |
| 2027-03-29 | Ostermontag |
| 2027-05-01 | Tag der Arbeit |
| 2027-05-06 | Christi Himmelfahrt |
| 2027-05-17 | Pfingstmontag |
| 2027-10-03 | Tag der Deutschen Einheit |
| 2027-10-31 | Reformationstag |
| 2027-12-25 | 1. Weihnachtsfeiertag |
| 2027-12-26 | 2. Weihnachtsfeiertag |

## UI / Layout

- **Anordnung:** Klassisches Kalenderraster pro Monat (Wochentag-Spalten Mo–So, Kalenderwochen als Zeilen), 13 Monatskarten in einem responsiven Mehrspalten-Grid (Desktop 3–4 Spalten, Tablet 2, Mobil 1 Spalte)
- **Randmonate:** August 2026 und August 2027 werden als volle Monate angezeigt (nicht nur der Ferienanteil) — auch Tage außerhalb der Sommerferien sind normal sichtbar
- **Legende:** unterhalb des Grids, erklärt die verwendeten Farben

### Farbcodierung (abgeleitet aus dem Logo/der Website gabel-freuden.de)

Recherchierte Markenfarben: Dunkelgrün `#0A3C2D` (Haupttext/Überschriften), Grün `#00963E` (Akzent/Buttons), Beige/Sand `#B0A493`, Grau `#696969` (Sekundärtext), Weiß (Hintergrund).

| Tagestyp | Darstellung |
|---|---|
| Ferientag | Hintergrund Grün `#00963E`, weiße Schrift |
| Gesetzlicher Feiertag | Hintergrund Beige/Sand `#B0A493`, dunkle Schrift |
| Wochenende (kein Ferien-/Feiertag) | dezentes Grau |
| Normaler Schultag | Weiß |

Fällt ein gesetzlicher Feiertag in eine Ferienperiode (z.B. 25./26.12.), hat die Ferientag-Farbe (Grün) visuellen Vorrang.

## Fehlerbehandlung / Edge Cases

- Tag ist sowohl Ferientag als auch Feiertag → Ferien-Farbe gewinnt (siehe oben)
- Monate am Rand des Zeitraums (Aug 2026, Aug 2027) zeigen den vollständigen Kalendermonat
- Keine beweglichen Ferientage/Brückentage werden vormarkiert (siehe Datenmodell-Abschnitt)

## Testing

- Unit-Tests (Vitest) für die Datums-Hilfsfunktionen (z.B. `isFerientag(date)`, `isFeiertag(date)`) mit Grenzfällen (erster/letzter Tag einer Ferienperiode, Überschneidung Ferien/Feiertag)
- Manuelle visuelle Prüfung aller 13 Monatskarten im Browser (Desktop und Mobil-Breite)
