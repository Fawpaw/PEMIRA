const SHEET_NAME = "Votes";
const DEV_LIST = ["1", "2", "3"];


/*
 * =========================================================
 * GET
 * =========================================================
 */

function doGet(e) {

  const params = e && e.parameter
    ? e.parameter
    : {};

  const dev = String(params.dev || "")
    .replace(/^Dev\s+/i, "")
    .trim();

  const paslon = String(params.paslon || "")
    .trim();

  const callback = String(params.callback || "")
    .trim();


  /*
   * =======================================================
   * VALIDASI DEV
   * =======================================================
   */

  if (!DEV_LIST.includes(dev)) {

    return json({
      success: false,
      error: "Dev harus 1, 2, atau 3."
    }, callback);
  }


  /*
   * =======================================================
   * VALIDASI PASLON
   * =======================================================
   *
   * Kalau paslon kosong, hanya cek apakah
   * Dev valid.
   *
   * Ini berguna untuk test endpoint.
   */

  if (!paslon) {

    return json({
      success: true,
      message: "Dev valid.",
      dev: "Dev " + dev
    }, callback);
  }


  /*
   * =======================================================
   * VALIDASI PASLON
   * =======================================================
   */

  if (!/^Paslon [123]$/.test(paslon)) {

    return json({
      success: false,
      error: "Paslon tidak valid."
    }, callback);
  }


  /*
   * =======================================================
   * LOCK
   * =======================================================
   *
   * Mencegah dua request menulis Sheet
   * secara bersamaan.
   */

  const lock = LockService.getScriptLock();


  try {

    lock.waitLock(10000);


    /*
     * =====================================================
     * SPREADSHEET
     * =====================================================
     */

    const ss = SpreadsheetApp.getActiveSpreadsheet();

    let sheet = ss.getSheetByName(SHEET_NAME);


    /*
     * Kalau Sheet Votes belum ada,
     * buat Sheet + header.
     */

    if (!sheet) {

      sheet = ss.insertSheet(SHEET_NAME);

      sheet.getRange("A1:C1").setValues([
        ["Timeline", "Paslon", "Dev"]
      ]);
    }


    /*
     * =====================================================
     * SIMPAN VOTE
     * =====================================================
     */

    const timestamp = new Date();

    sheet.appendRow([
      timestamp,
      paslon,
      "Dev " + dev
    ]);


    /*
     * =====================================================
     * SUCCESS RESPONSE
     * =====================================================
     */

    return json({
      success: true,
      dev: "Dev " + dev,
      paslon: paslon,
      timestamp: timestamp.toISOString()
    }, callback);


  } catch (error) {


    /*
     * =====================================================
     * ERROR RESPONSE
     * =====================================================
     */

    return json({
      success: false,
      error: String(error)
    }, callback);


  } finally {


    /*
     * =====================================================
     * RELEASE LOCK
     * =====================================================
     */

    try {

      lock.releaseLock();

    } catch (error) {

      // Tidak perlu melakukan apa-apa.

    }
  }
}


/*
 * =========================================================
 * POST
 * =========================================================
 */

function doPost(e) {

  return doGet(e);
}


/*
 * =========================================================
 * JSON / JSONP RESPONSE
 * =========================================================
 */

function json(obj, callback) {


  /*
   * =======================================================
   * JSON BIASA
   * =======================================================
   *
   * Dipakai kalau callback tidak diberikan.
   */

  if (!callback) {

    return ContentService
      .createTextOutput(
        JSON.stringify(obj)
      )
      .setMimeType(
        ContentService.MimeType.JSON
      );
  }


  /*
   * =======================================================
   * VALIDASI CALLBACK
   * =======================================================
   *
   * Frontend PEMIRA hanya menggunakan:
   *
   * __pemiraCallback
   *
   * Jadi kita tidak perlu menerima callback
   * dengan nama lain.
   */

  if (callback !== "__pemiraCallback") {

    return ContentService
      .createTextOutput(
        JSON.stringify({
          success: false,
          error: "Callback tidak valid."
        })
      )
      .setMimeType(
        ContentService.MimeType.JSON
      );
  }


  /*
   * =======================================================
   * JSONP
   * =======================================================
   *
   * Hasil:
   *
   * __pemiraCallback({
   *   success: true,
   *   ...
   * });
   */

  const output =
    callback +
    "(" +
    JSON.stringify(obj) +
    ");";


  return ContentService
    .createTextOutput(output)
    .setMimeType(
      ContentService.MimeType.JAVASCRIPT
    );
}
