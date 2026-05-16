// Code.gs — Google Apps Script Web App
// วิธีใช้:
//   1. เปิด Google Sheets → Extensions → Apps Script
//   2. วางโค้ดนี้ทับใน Code.gs
//   3. Deploy → New deployment → Web app
//      Execute as: Me  |  Who has access: Anyone
//   4. Copy Web App URL → วางใน Settings ของแอป

function doGet(e) {
  try {
    const sheet = e.parameter.sheet;
    if (!sheet) return respond({ ok: false, error: "Missing ?sheet= param" });
    return respond({ ok: true, data: readSheet(sheet) });
  } catch (err) {
    return respond({ ok: false, error: err.message });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const { action, sheet, data, id } = body;
    let result;
    switch (action) {
      case "create": result = createRow(sheet, data); break;
      case "update": result = updateRow(sheet, id, data); break;
      case "delete": result = deleteRow(sheet, id); break;
      case "seed":   result = seedRows(sheet, data);  break;
      default: return respond({ ok: false, error: "Unknown action: " + action });
    }
    return respond({ ok: true, result });
  } catch (err) {
    return respond({ ok: false, error: err.message });
  }
}

function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreate(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function readSheet(name) {
  const sheet = getOrCreate(name);
  const vals = sheet.getDataRange().getValues();
  if (vals.length < 2) return [];
  const headers = vals[0].map(String);
  return vals.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i] === "" ? null : row[i]; });
    return obj;
  });
}

function createRow(name, data) {
  const sheet = getOrCreate(name);
  const vals = sheet.getDataRange().getValues();
  let headers;
  if (vals.length === 0) {
    headers = Object.keys(data);
    sheet.appendRow(headers);
  } else {
    headers = vals[0].map(String);
  }
  sheet.appendRow(headers.map(h => (data[h] !== undefined && data[h] !== null) ? data[h] : ""));
  return data;
}

function updateRow(name, id, data) {
  const sheet = getOrCreate(name);
  const vals = sheet.getDataRange().getValues();
  if (vals.length < 2) return null;
  const headers = vals[0].map(String);
  const idCol = headers.indexOf("id");
  for (let i = 1; i < vals.length; i++) {
    if (String(vals[i][idCol]) === String(id)) {
      headers.forEach((h, j) => {
        if (data[h] !== undefined) {
          sheet.getRange(i + 1, j + 1).setValue(data[h] !== null ? data[h] : "");
        }
      });
      return { id, ...data };
    }
  }
  return null;
}

function deleteRow(name, id) {
  const sheet = getOrCreate(name);
  const vals = sheet.getDataRange().getValues();
  if (vals.length < 2) return false;
  const headers = vals[0].map(String);
  const idCol = headers.indexOf("id");
  for (let i = 1; i < vals.length; i++) {
    if (String(vals[i][idCol]) === String(id)) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

function seedRows(name, rows) {
  if (!rows || rows.length === 0) return 0;
  const sheet = getOrCreate(name);
  sheet.clearContents();
  const headers = Object.keys(rows[0]);
  sheet.appendRow(headers);
  rows.forEach(row => {
    sheet.appendRow(headers.map(h => (row[h] !== undefined && row[h] !== null) ? row[h] : ""));
  });
  return rows.length;
}
