// pages/approvals.jsx
const ApprovalsPage = ({ toast }) => {
  const { t, lang } = useI18n();
  const { rooms, bookings, eqRequests, updateBookingStatus, updateEqRequestStatus } = useData();
  const [tab, setTab]         = React.useState("rooms");
  const [detailId, setDetailId] = React.useState(null);
  const [note, setNote]       = React.useState("");
  const [busy, setBusy]       = React.useState(null);

  const pendingBookings = bookings.filter(b => b.status === "pending");
  const pendingEq       = eqRequests.filter(r => r.status === "pending");

  const decide = async (id, decision, isEq = false) => {
    setBusy(id);
    try {
      if (isEq) {
        await updateEqRequestStatus(id, decision);
      } else {
        const reason = decision === "rejected" ? note : "";
        await updateBookingStatus(id, decision, reason);
      }
      setDetailId(null);
      setNote("");
      toast(decision === "approved" ? t("appr_approved_toast") : t("appr_rejected_toast"));
    } catch (err) {
      toast(lang === "th" ? `เกิดข้อผิดพลาด: ${err.message}` : `Error: ${err.message}`, "err");
    } finally {
      setBusy(null);
    }
  };

  const detail     = detailId && (bookings.find(b => b.id === detailId) || eqRequests.find(r => r.id === detailId));
  const detailIsEq = detail && detail.equipmentName;

  return (
    <div className="col" style={{ gap: 14 }}>
      <div className="row" style={{ gap: 10 }}>
        <div className="chip-row">
          <button className={`chip ${tab === "rooms" ? "on" : ""}`} onClick={() => setTab("rooms")}>
            {t("appr_tab_rooms")} <span className="mono" style={{ marginLeft: 4 }}>· {pendingBookings.length}</span>
          </button>
          <button className={`chip ${tab === "eq" ? "on" : ""}`} onClick={() => setTab("eq")}>
            {t("appr_tab_eq")} <span className="mono" style={{ marginLeft: 4 }}>· {pendingEq.length}</span>
          </button>
        </div>
        <div className="grow"></div>
        <div className="muted" style={{ fontSize: 12 }}>
          {lang === "th" ? `รออนุมัติทั้งหมด ${pendingBookings.length + pendingEq.length} รายการ` : `${pendingBookings.length + pendingEq.length} pending`}
        </div>
      </div>

      {tab === "rooms" && (
        <div className="col" style={{ gap: 10 }}>
          {pendingBookings.length === 0 ? (
            <div className="card"><Empty title={lang === "th" ? "ไม่มีคำขอที่รออนุมัติ" : "Inbox zero"} sub={lang === "th" ? "คุณเคลียร์เรียบร้อย" : "All caught up"} icon={ico.check({ width: 28, height: 28 })} /></div>
          ) : pendingBookings.map(b => {
            const room = rooms.find(r => r.id === b.roomId);
            const isBusy = busy === b.id;
            return (
              <div key={b.id} className="card">
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, padding: 16, alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: 14 }}>
                    <div className="avatar" style={{ width: 36, height: 36, fontSize: 13 }}>{b.requester.charAt(0)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{b.topic}</div>
                      <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{b.requester} · {b.email}</div>
                      <div style={{ display: "flex", gap: 18, marginTop: 10, fontSize: 12.5, flexWrap: "wrap" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-2)" }}>{ico.door({ width: 13, height: 13 })} <RoomDot roomId={room?.id} /> {room?.short}</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-2)" }}>{ico.calendar({ width: 13, height: 13 })} {fmtDate(b.start, lang)}</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-2)" }} className="mono">{ico.clock({ width: 13, height: 13 })} {fmtTime(b.start)}–{fmtTime(b.end)}</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-2)" }}>{ico.users({ width: 13, height: 13 })} {b.attendees} {lang === "th" ? "คน" : ""}</span>
                        {b.meet && <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--info)" }}>{ico.meet()} Google Meet</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className="muted mono" style={{ fontSize: 11 }}>#{b.id}</span>
                    <button className="btn btn-sm" onClick={() => { setDetailId(b.id); setNote(""); }}>{t("appr_view")}</button>
                    <button className="btn btn-sm btn-danger" disabled={isBusy} onClick={() => decide(b.id, "rejected")}>{ico.x({ width: 13, height: 13 })} {t("appr_reject")}</button>
                    <button className="btn btn-sm btn-primary" disabled={isBusy} onClick={() => decide(b.id, "approved")}>{ico.check({ width: 13, height: 13 })} {t("appr_approve")}</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "eq" && (
        <div className="col" style={{ gap: 10 }}>
          {pendingEq.length === 0 ? (
            <div className="card"><Empty title={lang === "th" ? "ไม่มีคำขอที่รออนุมัติ" : "Inbox zero"} sub={lang === "th" ? "คุณเคลียร์เรียบร้อย" : "All caught up"} icon={ico.check({ width: 28, height: 28 })} /></div>
          ) : pendingEq.map(r => {
            const isBusy = busy === r.id;
            return (
              <div key={r.id} className="card">
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, padding: 16 }}>
                  <div style={{ display: "flex", gap: 14 }}>
                    <div className="avatar" style={{ width: 36, height: 36, fontSize: 13 }}>{r.requester.charAt(0)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{r.equipmentName}</div>
                      <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{r.requester} · {r.email}</div>
                      <div style={{ display: "flex", gap: 18, marginTop: 10, fontSize: 12.5, flexWrap: "wrap" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-2)" }}>{ico.box({ width: 13, height: 13 })} {lang === "th" ? "จำนวน" : "Qty"} <b className="mono" style={{ color: "var(--text)" }}>{r.qty}</b></span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-2)" }}>{ico.calendar({ width: 13, height: 13 })} {fmtDate(r.start, lang)} → {fmtDate(r.end, lang)}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className="muted mono" style={{ fontSize: 11 }}>#{r.id}</span>
                    <button className="btn btn-sm" onClick={() => setDetailId(r.id)}>{t("appr_view")}</button>
                    <button className="btn btn-sm btn-danger" disabled={isBusy} onClick={() => decide(r.id, "rejected", true)}>{ico.x({ width: 13, height: 13 })} {t("appr_reject")}</button>
                    <button className="btn btn-sm btn-primary" disabled={isBusy} onClick={() => decide(r.id, "approved", true)}>{ico.check({ width: 13, height: 13 })} {t("appr_approve")}</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      <Modal open={!!detail} onClose={() => setDetailId(null)} title={t("appr_detail")}
        sub={detail && (detailIsEq ? detail.equipmentName : detail.topic)} width={680}
        footer={detail && <>
          <button className="btn" onClick={() => setDetailId(null)}>{t("cancel")}</button>
          <button className="btn btn-danger" disabled={!!busy} onClick={() => decide(detailId, "rejected", !!detailIsEq)}>{ico.x({ width: 13, height: 13 })} {t("appr_reject")}</button>
          <button className="btn btn-primary" disabled={!!busy} onClick={() => decide(detailId, "approved", !!detailIsEq)}>{ico.check({ width: 13, height: 13 })} {t("appr_approve")}</button>
        </>}>
        {detail && !detailIsEq && (() => {
          const b = detail;
          const room = rooms.find(r => r.id === b.roomId);
          return (
            <div className="col" style={{ gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 8, fontSize: 13 }}>
                <span className="muted">{lang === "th" ? "หัวข้อ" : "Topic"}</span><b>{b.topic}</b>
                <span className="muted">{lang === "th" ? "ผู้ขอ" : "Requester"}</span><span>{b.requester} <span className="muted">&lt;{b.email}&gt;</span></span>
                <span className="muted">{lang === "th" ? "ห้อง" : "Room"}</span><span><RoomDot roomId={room?.id} /> {room?.name} · {lang === "th" ? "ชั้น" : "Fl."} {room?.floor}</span>
                <span className="muted">{lang === "th" ? "วันที่" : "Date"}</span><span>{fmtDate(b.start, lang)}</span>
                <span className="muted">{lang === "th" ? "เวลา" : "Time"}</span><span className="mono">{fmtTime(b.start)} – {fmtTime(b.end)}</span>
                <span className="muted">{lang === "th" ? "ผู้เข้าร่วม" : "Attendees"}</span><span>{b.attendees} {lang === "th" ? "คน" : "people"}</span>
                <span className="muted">Google Meet</span><span>{b.meet ? <Badge status="approved">{lang === "th" ? "จะสร้างลิงก์" : "Will be created"}</Badge> : <Badge status="draft">{lang === "th" ? "ปิด" : "Off"}</Badge>}</span>
              </div>
              <div className="divider"></div>
              <div>
                <div className="h3" style={{ marginBottom: 8 }}>{lang === "th" ? "อีเมลที่จะส่งเมื่ออนุมัติ" : "Email on approval"}</div>
                <EmailPreview booking={b} lang={lang} />
              </div>
              <div className="field">
                <label className="field-label">{t("appr_note")}</label>
                <textarea className="textarea" value={note} onChange={e => setNote(e.target.value)} placeholder={t("appr_note_ph")} />
              </div>
            </div>
          );
        })()}
        {detail && detailIsEq && (
          <div className="col" style={{ gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 8, fontSize: 13 }}>
              <span className="muted">{lang === "th" ? "อุปกรณ์" : "Equipment"}</span><b>{detail.equipmentName}</b>
              <span className="muted">{lang === "th" ? "จำนวน" : "Quantity"}</span><span className="mono">{detail.qty}</span>
              <span className="muted">{lang === "th" ? "ผู้ขอ" : "Requester"}</span><span>{detail.requester} <span className="muted">&lt;{detail.email}&gt;</span></span>
              <span className="muted">{lang === "th" ? "ช่วงเวลา" : "Period"}</span><span>{fmtDate(detail.start, lang)} → {fmtDate(detail.end, lang)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

window.ApprovalsPage = ApprovalsPage;
