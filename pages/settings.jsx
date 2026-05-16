// pages/settings.jsx
const SettingsPage = ({ toast }) => {
  const { t, lang } = useI18n();
  const { resetData } = useData();
  const [gcal, setGcal] = React.useState(true);
  const [gmeet, setGmeet] = React.useState(true);
  const [email, setEmail] = React.useState(true);

  const [gasUrl, setGasUrl] = React.useState(() => gasApi.getUrl() || "");
  const [testing, setTesting] = React.useState(false);
  const [resetting, setResetting] = React.useState(false);
  const [confirmReset, setConfirmReset] = React.useState(false);

  const saveUrl = () => {
    gasApi.setUrl(gasUrl);
    toast(lang === "th" ? "บันทึก URL เรียบร้อย กรุณารีโหลดหน้า" : "URL saved — please reload the page");
  };

  const testConnection = async () => {
    if (!gasUrl.trim()) {
      toast(lang === "th" ? "กรุณาใส่ URL ก่อน" : "Please enter a URL first", "err");
      return;
    }
    setTesting(true);
    try {
      gasApi.setUrl(gasUrl);
      const res = await gasApi.get("rooms");
      if (res && Array.isArray(res)) {
        toast(lang === "th" ? `เชื่อมต่อสำเร็จ พบข้อมูล ${res.length} ห้อง` : `Connected — ${res.length} rooms found`);
      } else {
        toast(lang === "th" ? "เชื่อมต่อได้ แต่ข้อมูลผิดรูปแบบ" : "Connected but unexpected response", "err");
      }
    } catch (err) {
      toast(lang === "th" ? `เชื่อมต่อไม่ได้: ${err.message}` : `Connection failed: ${err.message}`, "err");
    } finally {
      setTesting(false);
    }
  };

  const doReset = async () => {
    setResetting(true);
    setConfirmReset(false);
    try {
      await resetData();
      toast(lang === "th" ? "รีเซ็ตข้อมูลตัวอย่างเรียบร้อย" : "Sample data restored");
    } catch (err) {
      toast(lang === "th" ? `เกิดข้อผิดพลาด: ${err.message}` : `Error: ${err.message}`, "err");
    } finally {
      setResetting(false);
    }
  };

  const Row = ({ icon, title, sub, on, onChange }) => (
    <div style={{ display: "flex", gap: 14, padding: 16, alignItems: "center", borderTop: "1px solid var(--border)" }}>
      <div style={{ width: 38, height: 38, borderRadius: 8, background: "var(--bg-2)", display: "grid", placeItems: "center", border: "1px solid var(--border)" }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500, fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
          {title}
          {on && <Badge status="approved">{t("set_connected")}</Badge>}
          {!on && <Badge status="draft">{t("set_disconnected")}</Badge>}
        </div>
        <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{sub}</div>
      </div>
      <SwitchToggle checked={on} onChange={onChange} />
    </div>
  );

  return (
    <div className="col" style={{ gap: 14, maxWidth: 720 }}>

      {/* Google Apps Script / Backend */}
      <div className="card">
        <div className="card-head">
          <div className="card-title">{lang === "th" ? "การเชื่อมต่อ Google Sheets" : "Google Sheets Backend"}</div>
          {gasApi.isConfigured() && <Badge status="approved">{lang === "th" ? "ตั้งค่าแล้ว" : "Configured"}</Badge>}
          {!gasApi.isConfigured() && <Badge status="pending">{lang === "th" ? "ยังไม่ได้ตั้งค่า" : "Not configured"}</Badge>}
        </div>
        <div style={{ padding: 18 }} className="col" style={{ gap: 12, padding: 18 }}>
          <div className="muted" style={{ fontSize: 12.5 }}>
            {lang === "th"
              ? "วาง URL ของ Google Apps Script Web App ที่ Deploy แล้ว เพื่อให้แอปอ่านและบันทึกข้อมูลลง Google Sheets"
              : "Paste your deployed Google Apps Script Web App URL to enable reading and writing data to Google Sheets."}
          </div>
          <div className="field">
            <label className="field-label">{lang === "th" ? "Apps Script Web App URL" : "Apps Script Web App URL"}</label>
            <input
              className="input mono"
              value={gasUrl}
              onChange={e => setGasUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/…/exec"
              style={{ fontSize: 12 }}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary" onClick={saveUrl} disabled={!gasUrl.trim()}>
              {lang === "th" ? "บันทึก URL" : "Save URL"}
            </button>
            <button className="btn" onClick={testConnection} disabled={testing || !gasUrl.trim()}>
              {testing ? (lang === "th" ? "กำลังทดสอบ…" : "Testing…") : (lang === "th" ? "ทดสอบการเชื่อมต่อ" : "Test connection")}
            </button>
          </div>
          <div className="divider"></div>
          <div>
            <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 4 }}>{lang === "th" ? "รีเซ็ตข้อมูล" : "Reset data"}</div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 10 }}>
              {lang === "th"
                ? "ลบข้อมูลทั้งหมดใน Google Sheets แล้วเติมข้อมูลตัวอย่างใหม่ (ห้อง, อุปกรณ์, การจอง)"
                : "Wipe all Google Sheets data and re-seed with sample rooms, equipment, and bookings."}
            </div>
            <button className="btn btn-danger" disabled={resetting || !gasApi.isConfigured()} onClick={() => setConfirmReset(true)}>
              {resetting ? (lang === "th" ? "กำลังรีเซ็ต…" : "Resetting…") : (lang === "th" ? "รีเซ็ตเป็นข้อมูลตัวอย่าง" : "Reset to sample data")}
            </button>
          </div>
        </div>
      </div>

      {/* Google integrations */}
      <div className="card">
        <div className="card-head">
          <div className="card-title">{t("set_integration")}</div>
        </div>
        <div>
          <Row icon={ico.gcal({ width: 22, height: 22 })} title={t("set_gcal")} sub={t("set_gcal_sub")} on={gcal} onChange={setGcal} />
          <Row icon={ico.meet({ width: 22, height: 22 })} title={t("set_gmeet")} sub={t("set_gmeet_sub")} on={gmeet} onChange={setGmeet} />
          <Row icon={ico.bell({ width: 18, height: 18 })} title={t("set_email")} sub={t("set_email_sub")} on={email} onChange={setEmail} />
        </div>
      </div>

      {/* Account */}
      <div className="card">
        <div className="card-head">
          <div className="card-title">{t("set_account")}</div>
        </div>
        <div style={{ padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
          <div className="avatar" style={{ width: 44, height: 44, fontSize: 15 }}>Y</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500 }}>{lang === "th" ? "คุณ (You)" : "You"}</div>
            <div className="muted mono" style={{ fontSize: 12 }}>you@hfc.co.th</div>
          </div>
          <button className="btn">{lang === "th" ? "ออกจากระบบ" : "Sign out"}</button>
        </div>
      </div>

      {/* Confirm reset modal */}
      {confirmReset && (
        <Modal open onClose={() => setConfirmReset(false)}
          title={lang === "th" ? "ยืนยันรีเซ็ตข้อมูล" : "Confirm data reset"}
          footer={<>
            <button className="btn" onClick={() => setConfirmReset(false)}>{t("cancel")}</button>
            <button className="btn btn-danger" onClick={doReset}>{lang === "th" ? "รีเซ็ตเลย" : "Reset now"}</button>
          </>}>
          <div className="muted" style={{ fontSize: 13 }}>
            {lang === "th"
              ? "การรีเซ็ตจะลบข้อมูลทั้งหมดที่มีอยู่ใน Google Sheets และแทนที่ด้วยข้อมูลตัวอย่าง ไม่สามารถกู้คืนได้"
              : "This will permanently wipe all existing data in Google Sheets and replace it with sample data. This cannot be undone."}
          </div>
        </Modal>
      )}
    </div>
  );
};

window.SettingsPage = SettingsPage;
