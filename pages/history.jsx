// pages/history.jsx
const HistoryPage = ({ setSelectedBookingId, currentUser }) => {
  const { t, lang } = useI18n();
  const { bookings, eqRequests } = useData();
  const [tab, setTab]       = React.useState("all");
  const [status, setStatus] = React.useState("all");

  const myBookings = bookings.filter(b => b.email === currentUser.email).sort((a, b) => b.start - a.start);
  const myEq       = eqRequests.filter(r => r.email === currentUser.email).sort((a, b) => b.start - a.start);

  const showBookings = (tab === "all" || tab === "rooms") && myBookings.filter(b => status === "all" || b.status === status);
  const showEq       = (tab === "all" || tab === "eq")    && myEq.filter(r => status === "all" || r.status === status);

  return (
    <div className="col" style={{ gap: 14 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div className="chip-row">
          <button className={`chip ${tab === "all"   ? "on" : ""}`} onClick={() => setTab("all")}>{t("his_filter_all")}</button>
          <button className={`chip ${tab === "rooms" ? "on" : ""}`} onClick={() => setTab("rooms")}>{t("his_filter_rooms")}</button>
          <button className={`chip ${tab === "eq"    ? "on" : ""}`} onClick={() => setTab("eq")}>{t("his_filter_eq")}</button>
        </div>
        <div style={{ width: 1, height: 18, background: "var(--border)" }} />
        <div className="chip-row">
          {["all", "approved", "pending", "rejected"].map(s => (
            <button key={s} className={`chip ${status === s ? "on" : ""}`} onClick={() => setStatus(s)}>
              {s === "all" ? (lang === "th" ? "ทุกสถานะ" : "All status") : t("status_" + s)}
            </button>
          ))}
        </div>
      </div>

      {(tab === "all" || tab === "rooms") && (
        <div>
          <div className="h3" style={{ marginBottom: 8, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: 0.06, fontSize: 11.5 }}>
            {lang === "th" ? "การจองห้อง" : "Room bookings"}
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>{t("col_topic")}</th><th>{t("col_room")}</th><th>{t("col_date")}</th><th>{t("col_time")}</th><th>{t("col_status")}</th><th></th>
                </tr>
              </thead>
              <tbody>
                {showBookings && showBookings.length > 0 ? showBookings.map(b => {
                  const { rooms } = useData();
                  const room = rooms.find(r => r.id === b.roomId);
                  return (
                    <tr key={b.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{b.topic}</div>
                        <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>
                          {b.meet && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>{ico.meet({ width: 11, height: 11 })} Google Meet</span>}
                        </div>
                      </td>
                      <td><span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><RoomDot roomId={room?.id} /> {room?.short}</span></td>
                      <td>{fmtDate(b.start, lang)}</td>
                      <td className="mono">{fmtTime(b.start)}–{fmtTime(b.end)}</td>
                      <td><Badge status={b.status} /></td>
                      <td style={{ textAlign: "right" }}>
                        <button className="btn btn-sm btn-ghost" onClick={() => setSelectedBookingId(b.id)}>{lang === "th" ? "ดู" : "View"}</button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={6}><Empty title={lang === "th" ? "ไม่มีรายการ" : "Nothing here"} sub={lang === "th" ? "ลองสร้างการจองใหม่" : "Try a new booking"} /></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(tab === "all" || tab === "eq") && (
        <div>
          <div className="h3" style={{ marginBottom: 8, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: 0.06, fontSize: 11.5 }}>
            {lang === "th" ? "การยืมอุปกรณ์" : "Equipment borrowings"}
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>{t("col_equipment")}</th><th>{t("col_qty")}</th><th>{t("col_period")}</th><th>{t("col_status")}</th></tr>
              </thead>
              <tbody>
                {showEq && showEq.length > 0 ? showEq.map(r => (
                  <tr key={r.id}>
                    <td><div style={{ fontWeight: 500 }}>{r.equipmentName}</div></td>
                    <td className="mono">{r.qty}</td>
                    <td>{fmtDate(r.start, lang)} → {fmtDate(r.end, lang)}</td>
                    <td><Badge status={r.status} /></td>
                  </tr>
                )) : (
                  <tr><td colSpan={4}><Empty title={lang === "th" ? "ไม่มีรายการ" : "Nothing here"} sub={lang === "th" ? "ลองยืมอุปกรณ์" : "Try borrowing"} /></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

window.HistoryPage = HistoryPage;
