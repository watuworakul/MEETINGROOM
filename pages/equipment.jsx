// pages/equipment.jsx
const EquipmentPage = ({ toast }) => {
  const { t, lang } = useI18n();
  const [filter, setFilter] = React.useState("all");
  const [cat, setCat] = React.useState("all");
  const [borrowItem, setBorrowItem] = React.useState(null);

  const categories = ["all", ...Array.from(new Set(EQUIPMENT.map(e => e.category)))];

  const filtered = EQUIPMENT.filter(e => {
    if (filter === "avail" && e.available === 0) return false;
    if (cat !== "all" && e.category !== cat) return false;
    return true;
  });

  return (
    <div className="col" style={{ gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div className="chip-row">
          <button className={`chip ${filter === "all" ? "on" : ""}`} onClick={() => setFilter("all")}>{t("eq_filter_all")}</button>
          <button className={`chip ${filter === "avail" ? "on" : ""}`} onClick={() => setFilter("avail")}>{t("eq_filter_avail")}</button>
        </div>
        <div style={{ width: 1, height: 18, background: "var(--border)" }} />
        <div className="chip-row">
          {categories.map(c => (
            <button key={c} className={`chip ${cat === c ? "on" : ""}`} onClick={() => setCat(c)}>{c === "all" ? (lang === "th" ? "ทุกหมวด" : "All categories") : c}</button>
          ))}
        </div>
      </div>

      <div className="eq-grid">
        {filtered.map(e => {
          const Icon = ico[e.icon] || ico.box;
          const pct = (e.available / e.total) * 100;
          const out = e.available === 0;
          return (
            <div key={e.id} className="eq-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div className="eq-icon">{Icon({ width: 22, height: 22 })}</div>
                <Badge status={out ? "borrowed" : "available"}>{out ? (lang === "th" ? "ไม่ว่าง" : "Out") : (lang === "th" ? "ว่าง" : "Available")}</Badge>
              </div>
              <div>
                <div className="eq-name">{e.name}</div>
                <div className="eq-meta">{e.category} {e.note ? "· " + e.note : ""}</div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--text-3)", marginBottom: 4 }}>
                  <span>{t("eq_stock")}</span>
                  <span className="mono"><span style={{ color: "var(--text)", fontWeight: 600 }}>{e.available}</span> / {e.total}</span>
                </div>
                <div style={{ height: 4, background: "var(--bg-2)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: out ? "var(--danger)" : "var(--accent)" }} />
                </div>
              </div>
              <button className="btn btn-primary btn-sm" disabled={out} onClick={() => setBorrowItem(e)}>
                {out ? (lang === "th" ? "ไม่ว่าง" : "Unavailable") : t("eq_borrow")}
              </button>
            </div>
          );
        })}
      </div>

      {borrowItem && <BorrowModal item={borrowItem} onClose={() => setBorrowItem(null)} onSubmit={() => { setBorrowItem(null); toast(lang === "th" ? "ส่งคำขอยืมเรียบร้อย" : "Request submitted"); }} />}
    </div>
  );
};

const BorrowModal = ({ item, onClose, onSubmit }) => {
  const { t, lang } = useI18n();
  const Icon = ico[item.icon] || ico.box;
  const [qty, setQty] = React.useState(1);
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const [from, setFrom] = React.useState(today);
  const [to, setTo] = React.useState(tomorrow);
  const [purpose, setPurpose] = React.useState("");

  return (
    <Modal open onClose={onClose} title={lang === "th" ? "ยืมอุปกรณ์" : "Borrow equipment"} sub={item.name} width={520}
      footer={<>
        <button className="btn" onClick={onClose}>{t("cancel")}</button>
        <button className="btn btn-primary" onClick={onSubmit}>{ico.check()} {t("eq_request")}</button>
      </>}>
      <div className="col" style={{ gap: 14 }}>
        <div style={{ display: "flex", gap: 12, padding: 12, background: "var(--bg-2)", borderRadius: 6, border: "1px solid var(--border)", alignItems: "center" }}>
          <div className="eq-icon">{Icon({ width: 22, height: 22 })}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, fontSize: 13 }}>{item.name}</div>
            <div className="muted" style={{ fontSize: 11.5 }}>{item.category} · {item.serial}</div>
          </div>
          <div className="mono" style={{ fontSize: 11.5, color: "var(--text-2)" }}>
            <span style={{ color: "var(--text)", fontWeight: 600 }}>{item.available}</span> / {item.total}
          </div>
        </div>

        <div className="field">
          <label className="field-label">{t("eq_qty")}</label>
          <input className="input mono" type="number" min="1" max={item.available} value={qty} onChange={e => setQty(+e.target.value)} style={{ maxWidth: 120 }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div className="field">
            <label className="field-label">{t("eq_from")}</label>
            <input className="input" type="date" value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">{t("eq_to")}</label>
            <input className="input" type="date" value={to} onChange={e => setTo(e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label className="field-label">{lang === "th" ? "วัตถุประสงค์" : "Purpose"}</label>
          <textarea className="textarea" value={purpose} onChange={e => setPurpose(e.target.value)} placeholder={lang === "th" ? "อธิบายสั้น ๆ ว่าใช้ทำอะไร" : "Brief description"} />
        </div>

        <div className="muted" style={{ fontSize: 11.5 }}>
          {lang === "th"
            ? "คำขอจะถูกส่งให้เจ้าหน้าที่อนุมัติ คุณจะได้รับอีเมลแจ้งเตือนเมื่อมีการตอบรับ"
            : "Your request will be sent for approval. You'll receive an email once it's reviewed."}
        </div>
      </div>
    </Modal>
  );
};

window.EquipmentPage = EquipmentPage;
window.BorrowModal = BorrowModal;
