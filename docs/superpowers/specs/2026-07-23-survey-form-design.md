# Design: Abfrage-Formular für Essensbedarf an Ferientagen

## Kontext

Aufbauend auf dem bestehenden Dashboard (siehe [2026-07-23-dashboard-design.md](2026-07-23-dashboard-design.md)), das die Ferien- und Feiertage für das Schuljahr 2026/2027 anzeigt, soll die Schule nun direkt auf derselben Seite angeben können, ob und in welcher Form sie an den Ferientagen sowie an noch nicht feststehenden beweglichen Ferientagen/Brückentagen Essen benötigt.

## Architektur

- Neue Komponente `SurveyForm`, komponiert in `App.tsx` unterhalb von `Dashboard`: `<Dashboard /><SurveyForm />`. `Dashboard` selbst bleibt unverändert und ausschließlich für die Kalenderanzeige zuständig (keine Vermischung der Verantwortlichkeiten).
- Die App bleibt eine rein statische React-App (GitHub Pages). Beim Absenden sendet `SurveyForm` die Formulardaten per `fetch` an ein Google Apps Script, das als Web App veröffentlicht ist und die Daten als Zeilen in eine Google-Tabelle schreibt.
- **Einmaliger Einrichtungsschritt (durch den Nutzer, mit Anleitung):** Google-Tabelle anlegen, ein vorgefertigtes Apps-Script-Snippet als Web App veröffentlichen ("Jeder kann ausführen"), resultierende Web-App-URL in `src/config.ts` eintragen. Dies kann analog zum bereits erfolgten GitHub-Pages-Setup nach der Implementierung erfolgen.

## Umfang & Datenmodell

- Abgefragt werden alle **Werktage (Mo–Fr)** innerhalb der bereits im Dashboard markierten Ferienzeiträume (`schoolHolidays` aus `src/data/holidays.ts`), begrenzt auf den Dashboard-Anzeigezeitraum **01.08.2026–31.08.2027** (z. B. bei den Sommerferien 2026 nur der ab 01.08. sichtbare Teil, nicht die Tage im Juli davor).
- Pro Tag wählt die Schule eine von drei festen Kategorien:

```ts
type Kategorie = "normal" | "reduziert" | "keins";
// "normal"    = Normales Angebot
// "reduziert" = Reduziertes Angebot (Notbetreuung)
// "keins"     = Kein Essen nötig
```

- Voreinstellung für jeden Tag: `"keins"`.
- Pro Ferienzeitraum gibt es eine **Schnellauswahl** (Dropdown), die alle Werktage dieses Zeitraums auf eine Kategorie setzt. Einzelne Tage bleiben danach weiterhin individuell änderbar.
- Zusätzlicher Bereich **„Weitere Termine"**: Die Schule kann über eine Datumsauswahl beliebig viele zusätzliche Termine (bewegliche Ferientage, Brückentage) mit jeweils eigener Kategorie hinzufügen und wieder entfernen. Diese Termine sind nicht auf den Dashboard-Zeitraum beschränkt, müssen aber ein gültiges Datum sein.
- Abschließende Felder: **Name** (Pflichtfeld, Ansprechpartner:in der Schule) und ein optionales **Kommentarfeld** (Freitext).

```ts
interface TagesAntwort {
  date: string; // ISO-Datum
  kategorie: Kategorie;
}

interface FormularZustand {
  ferienAntworten: Record<string, Kategorie>; // Schlüssel: ISO-Datum
  zusatzTermine: { id: string; date: string; kategorie: Kategorie }[];
  name: string;
  kommentar: string;
}
```

## Absenden der Daten

Beim Klick auf „Absenden" wird aus `ferienAntworten` und `zusatzTermine` eine flache Liste von Zeilen gebaut (eine Zeile pro Tag) und als JSON an die Apps-Script-Web-App-URL gesendet:

| Spalte | Inhalt |
|---|---|
| Zeitstempel | Zeitpunkt des Absendens (ISO) |
| Name | Name aus dem Formular |
| Datum | ISO-Datum des jeweiligen Tages |
| Kategorie | `normal` / `reduziert` / `keins` |
| Kommentar | Freitext aus dem Kommentarfeld (auf jeder Zeile wiederholt) |

```ts
function buildSubmissionRows(
  ferienAntworten: Record<string, Kategorie>,
  zusatzTermine: { date: string; kategorie: Kategorie }[],
  name: string,
  kommentar: string
): { timestamp: string; name: string; date: string; kategorie: Kategorie; kommentar: string }[]
```

Es gibt kein Login/keine Authentifizierung in dieser Ausbaustufe. Erneutes Absenden erzeugt neue Zeilen mit aktuellem Zeitstempel; der Caterer erkennt in der Tabelle anhand des Zeitstempels den jeweils aktuellsten Stand.

Der `fetch`-Aufruf erfolgt mit `mode: "no-cors"`, da Google-Apps-Script-Web-Apps aus dem Browser heraus keine auslesbare Antwort liefern (technische Einschränkung). Die App zeigt daher nach einer erfolgreich abgesetzten Anfrage optimistisch eine Erfolgsmeldung an. Ein echter Netzwerkfehler (z. B. offline) wird abgefangen und als Fehlermeldung mit Bitte um erneuten Versuch angezeigt. Das Name-Feld wird clientseitig auf "nicht leer" geprüft, bevor gesendet wird; ist es leer, wird nicht gesendet und ein Hinweis angezeigt.

## UI

- Neue Sektion direkt unterhalb des `dashboard__grid`, im selben Seiten-Look (Markenfarben, Typografie wie das Dashboard).
- Pro Ferienzeitraum ein Block: Überschrift mit Zeitraumname, Schnellauswahl-Dropdown, darunter eine Zeile pro Werktag (Datum, Wochentagskürzel, Kategorie-Auswahl als `<select>`).
- Bereich „Weitere Termine": „Termin hinzufügen"-Button öffnet eine Datumsauswahl + Kategorie-Auswahl; hinzugefügte Termine erscheinen als Liste mit Entfernen-Button pro Eintrag.
- Abschließend: Name-Feld (Pflicht, mit Fehlermarkierung falls leer beim Absenden), Kommentarfeld (optional, mehrzeilig), „Absenden"-Button.
- Nach dem Absenden: Erfolgs- oder Fehlermeldung unterhalb des Buttons. Das Formular bleibt danach weiterhin ausfüllbar und erneut absendbar (kein Sperren, kein Zurücksetzen der Eingaben).

## Fehlerbehandlung / Edge Cases

- Leeres Name-Feld beim Absenden → Absenden wird verhindert, Hinweis wird angezeigt.
- Netzwerkfehler beim Absenden (z. B. offline) → Fehlermeldung, Formular-Eingaben bleiben erhalten, erneutes Absenden möglich.
- Zusatztermin mit Datum, das bereits ein regulärer Ferientag ist → wird als zusätzliche, unabhängige Zeile behandelt (keine Deduplizierung in dieser Ausbaustufe).
- Kein Zusatztermin hinzugefügt → nur die Ferientage werden übermittelt, das ist ein gültiger Zustand.

## Testing

- Unit-Tests für die reine Logik: Berechnung der Werktage pro Ferienzeitraum begrenzt auf den Dashboard-Zeitraum (`src/utils/surveyDays.ts`), Aufbau der zu sendenden Zeilen aus dem Formular-Zustand (`buildSubmissionRows`).
- Komponententests (React Testing Library) für: Schnellauswahl setzt alle Tage eines Zeitraums, einzelne Tage bleiben danach änderbar, Hinzufügen/Entfernen von Zusatzterminen, Validierung des Pflichtfelds Name, Anzeige von Erfolgs-/Fehlermeldung nach Absenden (mit gemocktem `fetch`).
- Manuelle Prüfung im Browser inklusive echtem Testversand an die Google-Tabelle, sobald die Web-App-URL eingerichtet ist (Verifikationsschritt nach Abschluss der Implementierung, analog zur Browser-Verifikation beim Dashboard).

## Out of Scope (spätere Ausbaustufen)

- Login/Authentifizierung der Schule
- Bearbeiten oder Zurückziehen bereits abgesendeter Antworten
- Automatische Deduplizierung mehrfacher Absendungen
- Auswertung/Visualisierung der gesammelten Antworten innerhalb der App (erfolgt vorerst direkt in der Google-Tabelle)
