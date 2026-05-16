// api.jsx — Google Sheets API client via Apps Script Web App
// URL ถูกเก็บใน localStorage — ตั้งได้จากหน้า Settings

const _getUrl = () => localStorage.getItem("hfc_gas_url") || "";

const _post = (body) => {
  const url = _getUrl();
  if (!url) return Promise.reject(new Error("ยังไม่ได้ตั้งค่า Apps Script URL (ไปที่ Settings)"));
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(body),
  })
    .then(r => r.json())
    .then(j => { if (!j.ok) throw new Error(j.error || "API error"); return j; });
};

const _get = (sheet) => {
  const url = _getUrl();
  if (!url) return Promise.reject(new Error("ยังไม่ได้ตั้งค่า Apps Script URL (ไปที่ Settings)"));
  return fetch(`${url}?sheet=${encodeURIComponent(sheet)}`)
    .then(r => r.json())
    .then(j => { if (!j.ok) throw new Error(j.error || "API error"); return j.data; });
};

const gasApi = {
  isConfigured: () => !!_getUrl(),
  getUrl:       () => _getUrl(),
  setUrl:       (url) => { localStorage.setItem("hfc_gas_url", url.trim()); },
  get:          (sheet)           => _get(sheet),
  create:       (sheet, data)     => _post({ action: "create", sheet, data }),
  update:       (sheet, id, data) => _post({ action: "update", sheet, id, data }),
  delete:       (sheet, id)       => _post({ action: "delete", sheet, id }),
  seed:         (sheet, rows)     => _post({ action: "seed",   sheet, data: rows }),
};

window.gasApi = gasApi;
