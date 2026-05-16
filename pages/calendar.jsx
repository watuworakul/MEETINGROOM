// pages/calendar.jsx - Google-style week view
const CalendarPage = ({ navigate, openBooking, selectedBookingId, setSelectedBookingId }) => {
  const { t, lang } = useI18n();
  const [view, setView] = React.useState("week");
  const [anchor, setAnchor] = React.useState(new Date());
  const [roomFilter, setRoomFilter] = React.useState("all");

  const weekStart = startOfWeek(anchor);
  const days = view === "week"
    ? Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(d.getDate() + i); return d; })
    : [new Date(anchor)];

  const goPrev = () => { const d = new Date(anchor); d.setDate(d.getDate() - (view === "week" ? 7 : 1)); setAnchor(d); };
  const goNext = () => { const d = new Date(anchor); d.setDate(d.getDate() + (view === "week" ? 7 : 1)); setAnchor(d); };
  const goToday = () => setAnchor(new Date());

  const titleStr = view === "week"
    ? `${fmtDate(days[0], lang)} – ${fmtDate(days[6], lang)}`
    : fmtDate(days[0], lang);

  const hours = Array.from({ length: 11 }, (_, i) => 8 + i);
  const cellH = 56;

  const visible = BOOKINGS.filter(b => roomFilter === "all" || b.roomId === roomFilter);

  const now = new Date();
  const nowMinutes = (now.getHours() - hours[0]) * 60 + now.getMinutes();
  const nowPx = (nowMinutes / 60) * cellH;
  const showNow = nowMinutes >= 0 && nowMinutes <= hours.length * 60;

  const eventStyle = (b) => {
    const startMin = (b.start.getHours() - hours[0]) * 60 + b.start.getMinutes();
    const dur = (b.end - b.start) / 60000;
    return {
      top: (startMin / 60) * cellH,
      height: (dur / 60) * cellH - 2,
    };
  };

  const monthYear = new Intl.DateTimeFormat(lang === "th" ? "th-TH-u-ca-gregory" : "en-GB", { month: "long", year: "numeric" }).format(days[0]);

  return (
    <div className="col" style={{ gap: 14 }}>
      <div className="cal-wrap">
        <div className="cal-head">
          <button className="btn btn-sm" onClick={goToday}>{t("cal_today")}</button>
          <div className="cal-nav">
            <button className="icon-btn" onClick={goPrev}>{ico.chevL()}</button>
            <button className="icon-btn" onClick={goNext}>{ico.chevR()}</button>
          </div>
          <div className="cal-title">{view === "week" ? monthYear : titleStr}</div>

          <div className="cal-view-toggle">
            <button className={view === "day" ? "on" : ""} onClick={() => setView("day")}>{t("cal_view_day")}</button>
            <button className={view === "week" ? "on" : ""} onClick={() => setView("week")}>{t("cal_view_week")}</button>
          </div>

          <button className="btn btn-primary btn-sm" onClick={() => openBooking()}>
            {ico.plus()} {lang === "th" ? "จองใหม่" : "New"}
          </button>
        </div>

        <div className="cal-room-filter">
          <span className="muted" style={{ fontSize: 11.5 }}>{t("cal_filter_room")}:</span>
          <button className={`chip ${roomFilter === "all" ? "on" : ""}`} onClick={() => setRoomFilter("all")}>{t("cal_filter_all")}</button>
          {ROOMS.map(r => (
            <button key={r.id} className={`chip ${roomFilter === r.id ? "on" : ""}`} onClick={() => setRoomFilter(r.id)}>
              <RoomDot roomId={r.id} />
              {r.short}
            </button>
          ))}
          <div className="grow"></div>
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: "var(--text-3)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><i style={{ width: 9, height: 9, background: "rgba(74,222,128,.6)", borderLeft: "2px solid #4ade80", borderRadius: 2 }} />{lang === "th" ? "อนุมัติ" : "Approved"}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><i style={{ width: 9, height: 9, background: "var(--accent-soft)", borderLeft: "2px solid var(--accent)", borderRadius: 2 }} />{lang === "th" ? "รออนุมัติ" : "Pending"}</span>
          </span>
        </div>

        <div className={`cal-grid ${view === "day" ? "day" : ""}`}>
          <div className="cal-corner" />
          {days.map((d, i) => (
            <div key={i} className={`cal-day-head ${sameDay(d, new Date()) ? "today" : ""}`}>
              <div className="cal-day-name">
                {new Intl.DateTimeFormat(lang === "th" ? "th-TH-u-ca-gregory" : "en-GB", { weekday: "short" }).format(d)}
              </div>
              <div className="cal-day-num mono">{d.getDate()}</div>
            </div>
          ))}

          <div className="cal-time-col">
            {hours.map((h, i) => (
              <div key={i} className="cal-time-slot" style={{ height: cellH }}>
                <span className="label">{String(h).padStart(2, "0")}:00</span>
              </div>
            ))}
          </div>

          {days.map((d, di) => (
            <div key={di} className="cal-col">
              {hours.map((h, i) => (
                <div key={i} className="cal-cell" style={{ height: cellH }} onClick={() => openBooking({ date: d, hour: h, roomId: roomFilter !== "all" ? roomFilter : undefined })} />
              ))}
              {showNow && sameDay(d, now) && (
                <div className="now-line" style={{ top: nowPx }} />
              )}
              {visible.filter(b => sameDay(b.start, d)).map(b => {
                const room = ROOMS.find(r => r.id === b.roomId);
                const isMe = b.email === "you@hfc.co.th";
                const cls = b.status === "approved" ? (isMe ? "me" : "approved") : "pending";
                return (
                  <div
                    key={b.id}
                    className={`cal-event ${cls}`}
                    style={{ ...eventStyle(b), borderLeftColor: room.color }}
                    onClick={(e) => { e.stopPropagation(); setSelectedBookingId(b.id); }}
                  >
                    <div className="ev-title">{b.topic}</div>
                    <div className="ev-meta">{fmtTime(b.start)} – {fmtTime(b.end)}</div>
                    <div className="ev-room">{room.short} · {b.attendees} {lang === "th" ? "คน" : ""}</div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <BookingDetailModal id={selectedBookingId} onClose={() => setSelectedBookingId(null)} />
    </div>
  );
};

const BookingDetailModal = ({ id, onClose }) => {
  const { t, lang } = useI18n();
  const b = id && BOOKINGS.find(x => x.id === id);
  if (!b) return null;
  const room = ROOMS.find(r => r.id === b.roomId);
  return (
    <Modal open={!!b} onClose={onClose} title={b.topic} sub={`${room.name} · ${fmtDate(b.start, lang)}`} width={520}
      footer={<>
        <button className="btn" onClick={onClose}>{lang === "th" ? "ปิด" : "Close"}</button>
        {b.meet && <button className="btn btn-primary">{ico.meet()} {lang === "th" ? "เข้าร่วม Meet" : "Join Meet"}</button>}
      </>}
    >
      <div className="col" style={{ gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 10, fontSize: 13 }}>
          <span className="muted">{lang === "th" ? "สถานะ" : "Status"}</span>
          <span><Badge status={b.status} /></span>
          <span className="muted">{lang === "th" ? "เวลา" : "Time"}</span>
          <span className="mono">{fmtTime(b.start)} – {fmtTime(b.end)}</span>
          <span className="muted">{lang === "th" ? "ห้อง" : "Room"}</span>
          <span><RoomDot roomId={room.id}/> {room.name} · {lang === "th" ? "ชั้น" : "Fl."} {room.floor}</span>
          <span className="muted">{lang === "th" ? "ผู้จอง" : "Organizer"}</span>
          <span>{b.requester} <span className="muted">&lt;{b.email}&gt;</span></span>
          <span className="muted">{lang === "th" ? "ผู้เข้าร่วม" : "Attendees"}</span>
          <span>{b.attendees} {lang === "th" ? "คน" : "people"}</span>
        </div>
        {b.meet && (
          <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", padding: 11, borderRadius: 6, display: "flex", alignItems: "center", gap: 10 }}>
            {ico.meet({ width: 18, height: 18 })}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500 }}>Google Meet</div>
              <div className="mono muted" style={{ fontSize: 11.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>meet.google.com/hfc-axyz-bcd</div>
            </div>
            <button className="btn btn-sm">{ico.link()} {lang === "th" ? "คัดลอก" : "Copy"}</button>
          </div>
        )}
        {b.status === "rejected" && b.rejectionReason && (
          <div style={{ background: "var(--danger-soft)", border: "1px solid rgba(248,113,113,.2)", padding: 11, borderRadius: 6, fontSize: 12.5 }}>
            <div style={{ fontWeight: 500, marginBottom: 2 }}>{lang === "th" ? "เหตุผลที่ปฏิเสธ" : "Reason for rejection"}</div>
            <div className="muted">{b.rejectionReason}</div>
          </div>
        )}
      </div>
    </Modal>
  );
};

window.CalendarPage = CalendarPage;
window.BookingDetailModal = BookingDetailModal;
