const SHEET_NAME = "Votes";
const DEV_LIST = ["1", "2", "3"];

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};

  const dev = String(params.dev || "")
    .replace(/^Dev\s+/i, "")
    .trim();

  const paslon = String(params.paslon || "").trim();

  if (!DEV_LIST.includes(dev)) {
    return json({
      success: false,
      error: "Dev harus 1, 2, atau 3."
    });
  }

  if (!paslon) {
    return json({
      success: true,
      message: "Dev valid.",
      dev: "Dev " + dev
    });
  }

  if (!/^Paslon [123]$/.test(paslon)) {
    return json({
      success: false,
      error: "Paslon tidak valid."
    });
  }

  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);

    const ss = SpreadsheetApp.getActiveSpreadsheet();

    let sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    sheet.getRange("A1:C1").setValues([
      ["Timeline", "Paslon", "Dev"]
    ]);

    const timestamp = new Date();

    sheet.appendRow([
      timestamp,
      paslon,
      "Dev " + dev
    ]);

    return json({
      success: true,
      dev: "Dev " + dev,
      paslon: paslon,
      timestamp: timestamp.toISOString()
    });

  } catch (error) {
    return json({
      success: false,
      error: String(error)
    });

  } finally {
    try {
      lock.releaseLock();
    } catch (error) {
      // Abaikan.
    }
  }
}

function doPost(e) {
  return doGet(e);
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
