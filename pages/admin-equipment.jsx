// pages/admin-equipment.jsx
const AdminEquipmentPage = ({ toast }) => {
  const { t, lang } = useI18n();
  const { equipment, addEquipment, editEquipment, removeEquipment } = useData();
  const [editing, setEditing] = React.useState(null);
  const [confirmDel, setConfirmDel] = React.useState(null);
  const [busy, setBusy] = React.useState(false);

  const save = async (item) => {
    setBusy(true);
    try {
      if (item.id) {
        await editEquipment(item);
        toast(lang === "th" ? "บันทึกข้อมูลอุปกรณ์เรียบร้อย" : "Equipment saved");
      } else {
        await addEquipment(item);
        toast(lang === "th" ? "เพิ่มอุปกรณ์ใหม่เรียบร้อย" : "Equipment added");
      }
      setEditing(null);
    } catch (err) {
      toast(lang === "th" ? `เกิดข้อผิดพลาด: ${err.message}` : `Error: ${err.message}`, "err");
    } finally {
      setBusy(false);
    }
  };

  const doRemove = async (id) => {
    setBusy(true);
    try {
      await removeEquipment(id);
      setConfirmDel(null);
      toast(lang === "th" ? "ยกเลิกอุปกรณ์เรียบร้อย" : "Equipment removed");
    } catch (err) {
      toast(lang === "th" ? `เกิดข้อผิดพลาด: ${err.message}` : `Error: ${err.message}`, "err");
    } finally {
      setBusy(false);
    }
  };

  const totalItems = equipment.reduce((s, e) => s + e.total, 0);
  const availableItems = equipment.reduce((s, e) => s + e.available, 0);

  return (
    <div className="col" style={{ gap: 14 }}>
      <div className="row">
        <div style={{ display: "flex", gap: 18, fontSize: 12.5, color: "var(--text-2)" }}>
          <span><span className="muted">{lang === "th" ? "ทั้งหมด" : "Total items"}: </span><b className="mono">{totalItems}</b></span>
          <span><span className="muted">{lang === "th" ? "ว่าง" : "Available"}: </span><b className="mono" style={{ color: "var(--success)" }}>{availableItems}</b></span>
          <span><span className="muted">{lang === "th" ? "ถูกยืม" : "Out"}: </span><b className="mono" style={{ color: "var(--info)" }}>{totalItems - availableItems}</b></span>
        </div>
        <div className="grow"></div>
        <button className="btn btn-primary" onClick={() => setEditing({})}>
          {ico.plus()} {t("ade_new")}
        </button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>{t("ade_name")}</th>
              <th>{t("ade_category")}</th>
              <th>{t("ade_serial")}</th>
              <th style={{ textAlign: "right" }}>{lang === "th" ? "ว่าง / ทั้งหมด" : "Available / Total"}</th>
              <th>{t("col_status")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {equipment.map(e => {
              const Icon = ico[e.icon] || ico.box;
              return (
                <tr key={e.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 6, background: "var(--bg-2)", display: "grid", placeItems: "center", color: "var(--text-2)" }}>
                        {Icon({ width: 16, height: 16 })}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{e.name}</div>
                        <div className="muted mono" style={{ fontSize: 11 }}>{e.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>{e.category}</td>
                  <td className="mono" style={{ fontSize: 11.5, color: "var(--text-2)" }}>{e.serial}</td>
                  <td style={{ textAlign: "right" }}>
                    <span className="mono">
                      <b style={{ color: e.available === 0 ? "var(--danger)" : "var(--text)" }}>{e.available}</b> / {e.total}
                    </span>
                  </td>
                  <td>
                    <Badge status={e.available === 0 ? "borrowed" : "available"}>
                      {e.available === 0 ? (lang === "th" ? "ไม่ว่าง" : "Out") : (lang === "th" ? "ว่าง" : "Available")}
                    </Badge>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-sm btn-ghost" onClick={() => setEditing(e)}>{t("edit")}</button>
                    <button className="btn btn-sm btn-ghost btn-danger" onClick={() => setConfirmDel(e)}>{t("delete")}</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editing && <EquipEditModal item={editing.id ? editing : null} onClose={() => setEditing(null)} onSave={save} busy={busy} />}
      {confirmDel && (
        <Modal open onClose={() => setConfirmDel(null)} title={t("ade_confirm_delete")} sub={confirmDel.name}
          footer={<>
            <button className="btn" onClick={() => setConfirmDel(null)}>{t("cancel")}</button>
            <button className="btn btn-danger" disabled={busy} onClick={() => doRemove(confirmDel.id)}>{t("delete")}</button>
          </>}>
          <div className="muted" style={{ fontSize: 13 }}>
            {lang === "th"
              ? "การยกเลิกอุปกรณ์จะไม่กระทบกับการยืมที่ผ่านมา แต่จะถูกซ่อนจากหน้ายืมทันที"
              : "Deleting will not affect past borrowings but hides this item from the catalog."}
          </div>
        </Modal>
      )}
    </div>
  );
};

const EquipEditModal = ({ item, onClose, onSave, busy }) => {
  const { t, lang } = useI18n();
  const [form, setForm] = React.useState(item || { name: "", category: "Notebook", total: 1, serial: "", note: "", icon: "box" });
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const categories = ["Notebook", "Microphone", "Projector", "Camera", "Speaker", "Accessory", lang === "th" ? "อื่น ๆ" : "Other"];
  const iconChoices = [
    ["laptop", "Notebook"], ["mic", "Mic"], ["projector", "Projector"], ["camera", "Camera"],
    ["tripod", "Tripod"], ["speaker", "Speaker"], ["clicker", "Clicker"], ["adapter", "Adapter"], ["box", "Other"]
  ];

  return (
    <Modal open onClose={onClose}
      title={item ? (lang === "th" ? "แก้ไขอุปกรณ์" : "Edit equipment") : (lang === "th" ? "เพิ่มอุปกรณ์ใหม่" : "New equipment")}
      sub={item?.id && `ID: ${item.id}`}
      footer={<>
        <button className="btn" onClick={onClose}>{t("cancel")}</button>
        <button className="btn btn-primary" disabled={busy || !form.name.trim()} onClick={() => onSave(form)}>{t("save")}</button>
      </>}>
      <div className="col" style={{ gap: 14 }}>
        <div className="field">
          <label className="field-label">{t("ade_name")}</label>
          <input className="input" value={form.name} onChange={e => upd("name", e.target.value)} placeholder={lang === "th" ? "เช่น Notebook ThinkPad X1" : "e.g. Notebook ThinkPad X1"} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div className="field">
            <label className="field-label">{t("ade_category")}</label>
            <select className="select" value={form.category} onChange={e => upd("category", e.target.value)}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-label">{t("ade_total")}</label>
            <input className="input mono" type="number" min="1" value={form.total} onChange={e => upd("total", +e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label className="field-label">{t("ade_serial")}</label>
          <input className="input mono" value={form.serial} onChange={e => upd("serial", e.target.value)} placeholder="NB-001 ~ 008" />
        </div>
        <div className="field">
          <label className="field-label">{lang === "th" ? "ไอคอน" : "Icon"}</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {iconChoices.map(([key, label]) => {
              const Icon = ico[key] || ico.box;
              const on = form.icon === key;
              return (
                <button key={key} onClick={() => upd("icon", key)} title={label} style={{
                  width: 40, height: 40, borderRadius: 6,
                  background: on ? "var(--accent-soft)" : "var(--bg-2)",
                  border: on ? "1px solid var(--accent-line)" : "1px solid var(--border)",
                  color: on ? "var(--accent)" : "var(--text-2)",
                  display: "grid", placeItems: "center", cursor: "pointer"
                }}>{Icon({ width: 18, height: 18 })}</button>
              );
            })}
          </div>
        </div>
        <div className="field">
          <label className="field-label">{t("ade_note")}</label>
          <textarea className="textarea" value={form.note || ""} onChange={e => upd("note", e.target.value)} placeholder={lang === "th" ? "บันทึกเพิ่มเติม" : "Additional notes"} />
        </div>
      </div>
    </Modal>
  );
};

window.AdminEquipmentPage = AdminEquipmentPage;
