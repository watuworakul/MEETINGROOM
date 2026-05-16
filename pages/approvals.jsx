// pages/approvals.jsx
const ApprovalsPage = ({ toast }) => {
  const { t, lang } = useI18n();
  const [tab, setTab] = React.useState("rooms");
  const [detailId, setDetailId] = React.useState(null);
  const [decisions, setDecisions] = React.useState({});

  const pendingBookings = BOOKINGS.filter(b => b.status === "pending" && !decisions[b.id]);
  const pendingEq = EQ_REQUESTS.filter(r => r.status === "pending" && !decisions[r.id]);

  const decide = (id, decision) => {
    setDecisions(d => ({ ...d, [id]: decision }));
    setDetailId(null);
    toast(decision === "approved" ? t("appr_approved_toast") : t("appr_rejected_toast"));
  };

  const detail = detailId && (BOOKINGS.find(b => b.id === detailId) || EQ_REQUESTS.find(r => r.id === detailId));
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
          {lang === "th"
            ? `รออนุมัติทั้งหมด ${pendingBookings.length + pendingEq.length} รายการ`
            : `${pendingBookings.length + pendingEq.length} pending`}
        </div>
      </div>

      {tab === "rooms" && (
        <div className="col" style={{ gap: 10 }}>
          {pendingBookings.length === 0 ? (
            <div className="card"><Empty title={lang === "th" ? "ไม่มีคำขอที่รออนุมัติ" : "Inbox zero"} sub={lang === "th" ? "คุณเคลียร์เรียบร้อย" : "All caught up"} icon={ico.check({ width: 28, height: 28 })} /></div>
          ) : pendingBookings.map(b => {
            const room = ROOMS.find(r => r.id === b.roomId);
            return (
              <div key={b.id} className="card">
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, padding: 16, alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: 14 }}>
                    <div className="avatar" style={{ width: 36, height: 36, fontSize: 13 }}>{b.requester.charAt(0)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{b.topic}</div>
                      <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                        {b.requester} · {b.email}
                      </div>
                      <div style={{ display: "flex", gap: 18, marginTop: 10, fontSize: 12.5, flexWrap: "wrap" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-2)" }}>{ico.door({ width: 13, height: 13 })} <RoomDot roomId={room.id}/> {room.short}</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-2)" }}>{ico.calendar({ width: 13, height: 13 })} {fmtDate(b.start, lang)}</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-2)" }} className="mono">{ico.clock({ width: 13, height: 13 })} {fmtTime(b.start)}–{fmtTime(b.end)}</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-2)" }}>{ico.users({ width: 13, height: 13 })} {b.attendees} {lang === "th" ? "คน" : ""}</span>
                        {b.meet && <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--info)" }}>{ico.meet()} Google Meet</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className="muted mono" style={{ fontSize: 11 }}>#{b.id}</span>
                    <button className="btn btn-sm" onClick={() => setDetailId(b.id)}>{t("appr_view")}</button>
                    <button className="btn btn-sm btn-danger" onClick={() => decide(b.id, "rejected")}>{ico.x({ width: 13, height: 13 })} {t("appr_reject")}</button>
                    <button className="btn btn-sm btn-primary" onClick={() => decide(b.id, "approved")}>{ico.check({ width: 13, height: 13 })} {t("appr_approve")}</button>
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
          ) : pendingEq.map(r => (
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
                  <button className="btn btn-sm btn-danger" onClick={() => decide(r.id, "rejected")}>{ico.x({ width: 13, height: 13 })} {t("appr_reject")}</button>
                  <button className="btn btn-sm btn-primary" onClick={() => decide(r.id, "approved")}>{ico.check({ width: 13, height: 13 })} {t("appr_approve")}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!detail} onClose={() => setDetailId(null)} title={t("appr_detail")}
        sub={detail && (detailIsEq ? detail.equipmentName : detail.topic)} width={680}
        footer={detail && <>
          <button className="btn" onClick={() => setDetailId(null)}>{t("cancel")}</button>
          <button className="btn btn-danger" onClick={() => decide(detailId, "rejected")}>{ico.x({ width: 13, height: 13 })} {t("appr_reject")}</button>
          <button className="btn btn-primary" onClick={() => decide(detailId, "approved")}>{ico.check({ width: 13, height: 13 })} {t("appr_approve")}</button>
        </>}
      >
        {detail && !detailIsEq && (() => {
          const b = detail;
          const room = ROOMS.find(r => r.id === b.roomId);
          return (
            <div className="col" style={{ gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 8, fontSize: 13 }}>
                <span className="muted">{lang === "th" ? "หัวข้อ" : "Topic"}</span><b>{b.topic}</b>
                <span className="muted">{lang === "th" ? "ผู้ขอ" : "Requester"}</span><span>{b.requester} <span className="muted">&lt;{b.email}&gt;</span></span>
                <span className="muted">{lang === "th" ? "ห้อง" : "Room"}</span><span><RoomDot roomId={room.id}/> {room.name} · {lang === "th" ? "ชั้น" : "Fl."} {room.floor}</span>
                <span className="muted">{lang === "th" ? "วันที่" : "Date"}</span><span>{fmtDate(b.start, lang)}</span>
                <span className="muted">{lang === "th" ? "เวลา" : "Time"}</span><span className="mono">{fmtTime(b.start)} – {fmtTime(b.end)}</span>
                <span className="muted">{lang === "th" ? "ผู้เข้าร่วม" : "Attendees"}</span><span>{b.attendees} {lang === "th" ? "คน" : "people"}</span>
                <span className="muted">Google Meet</span><span>{b.meet ? <Badge status="approved">{lang === "th" ? "จะสร้างลิงก์" : "Will be created"}</Badge> : <Badge status="draft">{lang === "th" ? "ปิด" : "Off"}</Badge>}</span>
                <span className="muted">{lang === "th" ? "ส่งคำขอเมื่อ" : "Submitted"}</span><span className="mono">{fmtDate(b.submitted, lang)} {fmtTime(b.submitted)}</span>
              </div>

              <div className="divider"></div>

              <div>
                <div className="h3" style={{ marginBottom: 8 }}>{lang === "th" ? "อีเมลที่จะส่งเมื่ออนุมัติ" : "Email that will be sent on approval"}</div>
                <EmailPreview booking={b} lang={lang} />
              </div>

              <div className="field">
                <label className="field-label">{t("appr_note")}</label>
                <textarea className="textarea" placeholder={t("appr_note_ph")} />
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
            <div className="field">
              <label className="field-label">{t("appr_note")}</label>
              <textarea className="textarea" placeholder={t("appr_note_ph")} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

window.ApprovalsPage = ApprovalsPage;
