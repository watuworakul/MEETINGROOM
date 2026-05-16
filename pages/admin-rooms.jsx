// pages/admin-rooms.jsx
const AdminRoomsPage = ({ toast }) => {
  const { t, lang } = useI18n();
  const { rooms, addRoom, editRoom, removeRoom: removeRoomApi } = useData();
  const [editing, setEditing] = React.useState(null);
  const [confirmDel, setConfirmDel] = React.useState(null);
  const [busy, setBusy] = React.useState(false);

  const saveRoom = async (r) => {
    setBusy(true);
    try {
      if (r.id) {
        await editRoom(r);
        toast(lang === "th" ? "บันทึกข้อมูลห้องเรียบร้อย" : "Room saved");
      } else {
        await addRoom(r);
        toast(lang === "th" ? "เพิ่มห้องใหม่เรียบร้อย" : "Room added");
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
      await removeRoomApi(id);
      setConfirmDel(null);
      toast(lang === "th" ? "ยกเลิกห้องเรียบร้อย" : "Room removed");
    } catch (err) {
      toast(lang === "th" ? `เกิดข้อผิดพลาด: ${err.message}` : `Error: ${err.message}`, "err");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="col" style={{ gap: 14 }}>
      <div className="row">
        <div className="grow"></div>
        <button className="btn btn-primary" onClick={() => setEditing({})}>
          {ico.plus()} {t("adr_new")}
        </button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>{t("col_name")}</th>
              <th>{t("col_cap")}</th>
              <th>{t("col_floor")}</th>
              <th>{t("col_amenities")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(r => (
              <tr key={r.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <RoomDot roomId={r.id} size={10}/>
                    <div>
                      <div style={{ fontWeight: 500 }}>{r.name}</div>
                      <div className="muted mono" style={{ fontSize: 11 }}>{r.id}</div>
                    </div>
                  </div>
                </td>
                <td className="mono">{r.capacity}</td>
                <td className="mono">{r.floor}</td>
                <td>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {r.amenities.slice(0, 3).map(a => <span key={a} className="chip" style={{ fontSize: 11 }}>{a}</span>)}
                    {r.amenities.length > 3 && <span className="muted" style={{ fontSize: 11 }}>+{r.amenities.length - 3}</span>}
                  </div>
                </td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn btn-sm btn-ghost" onClick={() => setEditing(r)}>{t("edit")}</button>
                  <button className="btn btn-sm btn-ghost btn-danger" onClick={() => setConfirmDel(r)}>{t("delete")}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && <RoomEditModal room={editing.id ? editing : null} onClose={() => setEditing(null)} onSave={saveRoom} busy={busy} />}
      {confirmDel && (
        <Modal open onClose={() => setConfirmDel(null)} title={lang === "th" ? "ยืนยันยกเลิกห้อง" : "Confirm delete"} sub={confirmDel.name}
          footer={<>
            <button className="btn" onClick={() => setConfirmDel(null)}>{t("cancel")}</button>
            <button className="btn btn-danger" disabled={busy} onClick={() => doRemove(confirmDel.id)}>{t("delete")}</button>
          </>}>
          <div className="muted" style={{ fontSize: 13 }}>
            {lang === "th"
              ? "หากยกเลิกห้องนี้ การจองในอนาคตจะถูกย้ายเข้าสถานะรอจัดสรรห้องใหม่"
              : "Future bookings for this room will be moved to pending re-assignment."}
          </div>
        </Modal>
      )}
    </div>
  );
};

const RoomEditModal = ({ room, onClose, onSave, busy }) => {
  const { t, lang } = useI18n();
  const [form, setForm] = React.useState(room || { name: "", short: "", capacity: 6, floor: 11, amenities: [], color: "#fbbf24" });
  const [newAmenity, setNewAmenity] = React.useState("");
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const addAmenity = () => {
    const v = newAmenity.trim();
    if (!v) return;
    upd("amenities", [...form.amenities, v]);
    setNewAmenity("");
  };
  const palette = ["#4ade80", "#60a5fa", "#a78bfa", "#fb923c", "#f87171", "#fbbf24", "#34d399", "#ec4899"];

  return (
    <Modal open onClose={onClose}
      title={room ? (lang === "th" ? "แก้ไขห้องประชุม" : "Edit room") : (lang === "th" ? "เพิ่มห้องประชุมใหม่" : "New room")}
      sub={room?.id && `ID: ${room.id}`}
      footer={<>
        <button className="btn" onClick={onClose}>{t("cancel")}</button>
        <button className="btn btn-primary" disabled={busy || !form.name.trim()} onClick={() => onSave(form)}>{t("save")}</button>
      </>}>
      <div className="col" style={{ gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
          <div className="field">
            <label className="field-label">{t("col_name")}</label>
            <input className="input" value={form.name} onChange={e => upd("name", e.target.value)} placeholder={lang === "th" ? "เช่น Sukhumvit Boardroom" : "e.g. Sukhumvit Boardroom"} />
          </div>
          <div className="field">
            <label className="field-label">{lang === "th" ? "ชื่อย่อ" : "Short name"}</label>
            <input className="input mono" value={form.short || ""} onChange={e => upd("short", e.target.value)} placeholder="SKV" style={{ maxWidth: 90 }} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <div className="field">
            <label className="field-label">{t("col_cap")}</label>
            <input className="input mono" type="number" value={form.capacity} onChange={e => upd("capacity", +e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">{t("col_floor")}</label>
            <input className="input mono" type="number" value={form.floor} onChange={e => upd("floor", +e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">{lang === "th" ? "สี" : "Color"}</label>
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              {palette.map(c => (
                <button key={c} onClick={() => upd("color", c)} style={{
                  width: 22, height: 22, borderRadius: 6,
                  background: c, border: form.color === c ? "2px solid var(--text)" : "1px solid var(--border)",
                  cursor: "pointer"
                }} />
              ))}
            </div>
          </div>
        </div>
        <div className="field">
          <label className="field-label">{t("col_amenities")}</label>
          <div className="chip-row">
            {form.amenities.map((a, i) => (
              <span key={i} className="chip on" style={{ paddingRight: 6 }}>
                {a}
                <button onClick={() => upd("amenities", form.amenities.filter((_, j) => j !== i))} style={{ background: "transparent", border: 0, color: "inherit", padding: 0, marginLeft: 4, display: "grid", placeItems: "center" }}>
                  {ico.x({ width: 11, height: 11 })}
                </button>
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input className="input" value={newAmenity} onChange={e => setNewAmenity(e.target.value)} placeholder={lang === "th" ? "เพิ่มสิ่งอำนวยความสะดวก…" : "Add amenity…"} onKeyDown={e => e.key === "Enter" && addAmenity()} />
            <button className="btn" onClick={addAmenity}>{t("add")}</button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

window.AdminRoomsPage = AdminRoomsPage;
