const SHEET_NAME = "Votes";
const DEV_LIST = ["1", "2", "3"];

function doGet(e) {
  const p = e && e.parameter ? e.parameter : {};
  const dev = String(p.dev || "").replace(/^Dev\s+/i, "").trim();
  const paslon = String(p.paslon || "").trim();

  if (!DEV_LIST.includes(dev)) {
    return json({success:false, error:"Dev harus 1, 2, atau 3."});
  }

  // Request heartbeat kalau paslon kosong.
  if (!paslon) {
    return json({success:true, message:"Online", dev:"Dev " + dev});
  }

  if (!/^Paslon [123]$/.test(paslon)) {
    return json({success:false, error:"Paslon tidak valid."});
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(5000);

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.getRange(1,1,1,4).setValues([["Dev","Status","Paslon","Last Update"]]);
    }

    const data = sheet.getDataRange().getValues();

    // Satu baris per Dev: vote baru meng-update hasil terakhir.
    let row = -1;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === "Dev " + dev) {
        row = i + 1;
        break;
      }
    }

    const values = ["Dev " + dev, "Online", paslon, new Date()];

    if (row === -1) {
      sheet.appendRow(values);
    } else {
      sheet.getRange(row, 1, 1, 4).setValues([values]);
    }

    return json({
      success:true,
      dev:"Dev " + dev,
      paslon:paslon
    });
  } finally {
    lock.releaseLock();
  }
}

function doPost(e) {
  // Tetap menerima POST kalau nanti dibutuhkan.
  return doGet({
    parameter: {
      dev: e && e.parameter ? e.parameter.dev : "",
      paslon: e && e.parameter ? e.parameter.paslon : ""
    }
  });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
