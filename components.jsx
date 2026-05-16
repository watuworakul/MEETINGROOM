// components.jsx - reusable UI atoms

const Badge = ({ status, children }) => {
  const { t } = useI18n();
  const labels = {
    approved: t("status_approved"),
    pending: t("status_pending"),
    rejected: t("status_rejected"),
    available: t("status_available"),
    borrowed: t("status_borrowed"),
    maintenance: t("status_maintenance"),
  };
  return (
    <span className={`badge ${status}`}>
      <span className="b-dot"></span>
      {children || labels[status]}
    </span>
  );
};

const RoomDot = ({ roomId, size = 8 }) => {
  const room = ROOMS.find(r => r.id === roomId);
  return <span style={{ width: size, height: size, borderRadius: 99, background: room?.color || '#888', display: 'inline-block', flexShrink: 0 }} />;
};

const SwitchToggle = ({ checked, onChange, label }) => (
  <label className="switch">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    <span className="track"></span>
    {label && <span style={{ fontSize: 12.5 }}>{label}</span>}
  </label>
);

const Modal = ({ open, onClose, title, sub, children, footer, width = 640 }) => {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: width }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div style={{ flex: 1 }}>
            <div className="modal-title">{title}</div>
            {sub && <div className="modal-sub">{sub}</div>}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            {ico.x()}
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
};

const Empty = ({ title, sub, icon }) => (
  <div className="empty">
    <div className="empty-icon">{icon || ico.inbox({ width: 32, height: 32 })}</div>
    <div className="empty-title">{title}</div>
    <div className="empty-sub">{sub}</div>
  </div>
);

const EmailPreview = ({ booking, lang = "th", from = "system@hfc.co.th" }) => {
  const room = ROOMS.find(r => r.id === booking.roomId);
  const subj = lang === "th"
    ? `[อนุมัติแล้ว] ${booking.topic} · ${room?.short || ""}`
    : `[Approved] ${booking.topic} · ${room?.short || ""}`;
  const meetLink = "https://meet.google.com/hfc-axyz-bcd";

  return (
    <div className="email-card">
      <div className="email-header">
        <div className="row" style={{ gap: 8 }}>
          <span className="muted" style={{ fontSize: 11.5 }}>From</span>
          <span className="from">HFC Booking System</span>
          <span className="muted" style={{ fontSize: 11.5 }}>&lt;{from}&gt;</span>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <span className="muted" style={{ fontSize: 11.5 }}>To</span>
          <span className="to">{booking.email}</span>
        </div>
        <div className="subj" style={{ marginTop: 4 }}>{subj}</div>
      </div>
      <div className="email-body">
        <p style={{ margin: "0 0 12px" }}>
          {lang === "th" ? `เรียน ${booking.requester},` : `Dear ${booking.requester},`}
        </p>
        <p style={{ margin: "0 0 12px" }}>
          {lang === "th"
            ? "คำขอจองห้องประชุมของคุณได้รับการอนุมัติแล้ว รายละเอียดดังนี้:"
            : "Your meeting room request has been approved. Details below:"}
        </p>
        <table style={{ borderCollapse: "collapse", fontSize: 12.5, margin: "0 0 14px" }}>
          <tbody>
            <tr><td style={{ padding: "3px 12px 3px 0", color: "var(--text-3)" }}>{lang === "th" ? "หัวข้อ" : "Topic"}</td><td style={{ padding: "3px 0", color: "var(--text)" }}>{booking.topic}</td></tr>
            <tr><td style={{ padding: "3px 12px 3px 0", color: "var(--text-3)" }}>{lang === "th" ? "ห้อง" : "Room"}</td><td style={{ padding: "3px 0", color: "var(--text)" }}>{room?.name} · {lang === "th" ? "ชั้น" : "Floor"} {room?.floor}</td></tr>
            <tr><td style={{ padding: "3px 12px 3px 0", color: "var(--text-3)" }}>{lang === "th" ? "วันที่" : "Date"}</td><td style={{ padding: "3px 0", color: "var(--text)" }}>{fmtDate(booking.start, lang)}</td></tr>
            <tr><td style={{ padding: "3px 12px 3px 0", color: "var(--text-3)" }}>{lang === "th" ? "เวลา" : "Time"}</td><td style={{ padding: "3px 0", color: "var(--text)" }} className="mono">{fmtTime(booking.start)} – {fmtTime(booking.end)}</td></tr>
            <tr><td style={{ padding: "3px 12px 3px 0", color: "var(--text-3)" }}>{lang === "th" ? "ผู้เข้าร่วม" : "Attendees"}</td><td style={{ padding: "3px 0", color: "var(--text)" }}>{booking.attendees} {lang === "th" ? "คน" : "people"}</td></tr>
          </tbody>
        </table>
        {booking.meet && (
          <p style={{ margin: "0 0 12px" }}>
            <span style={{ color: "var(--text-3)" }}>{lang === "th" ? "ลิงก์ Google Meet:" : "Google Meet link:"}</span>{" "}
            <a href="#" className="meet-link" onClick={(e) => e.preventDefault()}>
              {ico.meet()}
              {meetLink}
            </a>
          </p>
        )}
        <p style={{ margin: "0 0 6px", fontSize: 12, color: "var(--text-3)" }}>
          {lang === "th" ? "ระบบได้เพิ่มอีเวนต์นี้ลงใน Google Calendar ของผู้เข้าร่วมทุกคนแล้ว" : "This event has been added to all attendees' Google Calendar."}
        </p>
      </div>
    </div>
  );
};

window.Badge = Badge;
window.RoomDot = RoomDot;
window.SwitchToggle = SwitchToggle;
window.Modal = Modal;
window.Empty = Empty;
window.EmailPreview = EmailPreview;
