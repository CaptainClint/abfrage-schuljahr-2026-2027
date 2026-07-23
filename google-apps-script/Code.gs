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
