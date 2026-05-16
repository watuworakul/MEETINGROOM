// pages/booking.jsx
const BookingPage = ({ prefill, onDone, toast, currentUser }) => {
  const { t, lang } = useI18n();
  const { rooms, equipment, addBooking } = useData();
  const [step, setStep] = React.useState(1);
  const [success, setSuccess] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [lastId, setLastId] = React.useState(null);

  const today = new Date();
  const defaultDate = prefill?.date || today;
  const defaultHour = prefill?.hour ?? 10;
  const dateStr = `${defaultDate.getFullYear()}-${String(defaultDate.getMonth() + 1).padStart(2, "0")}-${String(defaultDate.getDate()).padStart(2, "0")}`;

  const [form, setForm] = React.useState({
    topic: "", roomId: prefill?.roomId || (rooms[0]?.id || "r2"),
    date: dateStr,
    timeStart: `${String(defaultHour).padStart(2, "0")}:00`,
    timeEnd:   `${String(defaultHour + 1).padStart(2, "0")}:00`,
    attendees: 4, emails: "", purpose: "", equipment: [], meet: true, addToCalendar: true,
  });

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleEq = (id) => setForm(f => ({ ...f, equipment: f.equipment.includes(id) ? f.equipment.filter(x => x !== id) : [...f.equipment, id] }));

  const room = rooms.find(r => r.id === form.roomId) || rooms[0];
  const startDate = new Date(`${form.date}T${form.timeStart}`);
  const endDate   = new Date(`${form.date}T${form.timeEnd}`);

  const previewBooking = {
    topic:     form.topic || (lang === "th" ? "(ยังไม่ระบุหัวข้อ)" : "(Untitled)"),
    roomId:    form.roomId,
    start:     startDate,
    end:       endDate,
    requester: currentUser.name,
    email:     currentUser.email,
    attendees: form.attendees,
    meet:      form.meet,
  };

  const canNext1 = form.topic.trim().length > 0;

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const booking = await addBooking(form, currentUser);
      setLastId(booking.id);
      setSuccess(true);
      toast(lang === "th" ? "ส่งคำขอจองเรียบร้อยแล้ว" : "Booking request submitted");
    } catch (err) {
      toast(lang === "th" ? `เกิดข้อผิดพลาด: ${err.message}` : `Error: ${err.message}`, "err");
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    const reqNum = lastId || ("BK-" + Math.floor(Math.random() * 9000 + 1000));
    return (
      <div className="card" style={{ maxWidth: 520, margin: "60px auto", textAlign: "center", padding: "40px 32px" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--success-soft)", color: "var(--success)", display: "grid", placeItems: "center", margin: "0 auto 18px" }}>
          {ico.check({ width: 28, height: 28 })}
        </div>
        <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>{t("book_success")}</div>
        <div className="muted" style={{ fontSize: 13, marginBottom: 22 }}>
          {lang === "th" ? `คำขอ #${reqNum} ถูกส่งให้เจ้าหน้าที่แล้ว` : `Request #${reqNum} sent to approver`}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button className="btn" onClick={() => { setSuccess(false); setStep(1); setForm(f => ({ ...f, topic: "" })); }}>
            {lang === "th" ? "จองอีกครั้ง" : "Book another"}
          </button>
          <button className="btn btn-primary" onClick={() => onDone?.()}>{lang === "th" ? "ดูประวัติของฉัน" : "View my history"}</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 18, alignItems: "flex-start" }}>
      <div className="card">
        <div className="card-head">
          <div className="card-title">{t("book_title")}</div>
          <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
            {[1, 2, 3].map(n => (
              <div key={n} style={{ width: 22, height: 22, borderRadius: 50, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 600, background: step >= n ? "var(--accent)" : "var(--bg-2)", color: step >= n ? "var(--accent-ink)" : "var(--text-3)", border: "1px solid var(--border)" }}>{n}</div>
            ))}
          </div>
        </div>

        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", gap: 24, fontSize: 12, color: "var(--text-3)" }}>
            <span style={{ color: step === 1 ? "var(--text)" : undefined, fontWeight: step === 1 ? 600 : undefined }}>1. {t("book_step1")}</span>
            <span style={{ color: step === 2 ? "var(--text)" : undefined, fontWeight: step === 2 ? 600 : undefined }}>2. {t("book_step2")}</span>
            <span style={{ color: step === 3 ? "var(--text)" : undefined, fontWeight: step === 3 ? 600 : undefined }}>3. {t("book_step3")}</span>
          </div>

          {step === 1 && (
            <div className="col" style={{ gap: 14 }}>
              <div className="field">
                <label className="field-label">{t("book_meet_title")}</label>
                <input className="input" value={form.topic} onChange={e => upd("topic", e.target.value)} placeholder={t("book_meet_ph")} autoFocus />
              </div>
              <div className="field">
                <label className="field-label">{t("book_room")}</label>
                <div className="chip-row">
                  {rooms.map(r => (
                    <button key={r.id} className={`chip ${form.roomId === r.id ? "on" : ""}`} onClick={() => upd("roomId", r.id)}>
                      <RoomDot roomId={r.id} /> {r.short} · {r.capacity}{lang === "th" ? " คน" : "p"}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 10 }}>
                <div className="field"><label className="field-label">{t("book_date")}</label><input className="input" type="date" value={form.date} onChange={e => upd("date", e.target.value)} /></div>
                <div className="field"><label className="field-label">{t("book_time_start")}</label><input className="input mono" type="time" value={form.timeStart} onChange={e => upd("timeStart", e.target.value)} /></div>
                <div className="field"><label className="field-label">{t("book_time_end")}</label><input className="input mono" type="time" value={form.timeEnd} onChange={e => upd("timeEnd", e.target.value)} /></div>
              </div>
              <div className="field">
                <label className="field-label">{t("book_purpose")}</label>
                <textarea className="textarea" value={form.purpose} onChange={e => upd("purpose", e.target.value)} placeholder={t("book_purpose_ph")} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="col" style={{ gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 10 }}>
                <div className="field">
                  <label className="field-label">{t("book_attendees")}</label>
                  <input className="input mono" type="number" min="1" max={room?.capacity} value={form.attendees} onChange={e => upd("attendees", +e.target.value)} />
                </div>
                <div className="field">
                  <label className="field-label">{t("book_attendee_emails")}</label>
                  <input className="input" placeholder="a@hfc.co.th, b@hfc.co.th" value={form.emails} onChange={e => upd("emails", e.target.value)} />
                </div>
              </div>
              <div className="field-hint" style={{ marginTop: -8 }}>
                {lang === "th" ? `ห้อง ${room?.short} รองรับได้ ${room?.capacity} คน` : `Room ${room?.short} fits up to ${room?.capacity} people`}
              </div>
              <div className="field">
                <label className="field-label">{t("book_equipment")}</label>
                <div className="chip-row">
                  {equipment.filter(e => e.available > 0).map(e => (
                    <button key={e.id} className={`chip ${form.equipment.includes(e.id) ? "on" : ""}`} onClick={() => toggleEq(e.id)}>
                      {form.equipment.includes(e.id) && ico.check({ width: 12, height: 12 })}
                      {e.name.split(" ").slice(0, 3).join(" ")}
                    </button>
                  ))}
                </div>
              </div>
              <div className="divider"></div>
              <div className="field"><label className="field-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>{ico.meet()} {lang === "th" ? "การเชื่อมต่อกับ Google" : "Google integration"}</label></div>
              <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", padding: "10px 12px", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 6 }}>
                <input type="checkbox" checked={form.meet} onChange={e => upd("meet", e.target.checked)} style={{ marginTop: 2 }} />
                <div><div style={{ fontSize: 13, fontWeight: 500 }}>{t("book_gmeet")}</div><div className="field-hint">{t("book_gmeet_hint")}</div></div>
              </label>
              <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", padding: "10px 12px", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 6 }}>
                <input type="checkbox" checked={form.addToCalendar} onChange={e => upd("addToCalendar", e.target.checked)} style={{ marginTop: 2 }} />
                <div><div style={{ fontSize: 13, fontWeight: 500 }}>{t("book_calendar")}</div><div className="field-hint">{t("book_calendar_hint")}</div></div>
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="col" style={{ gap: 14 }}>
              <div>
                <div className="h3" style={{ marginBottom: 4 }}>{t("book_review")}</div>
                <div className="muted" style={{ fontSize: 12 }}>{t("book_review_sub")}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 10, fontSize: 13, background: "var(--bg-2)", padding: 14, borderRadius: 6, border: "1px solid var(--border)" }}>
                <span className="muted">{t("book_meet_title")}</span><span style={{ fontWeight: 500 }}>{form.topic || "—"}</span>
                <span className="muted">{t("book_room")}</span><span><RoomDot roomId={room?.id} /> {room?.name}</span>
                <span className="muted">{t("book_date")}</span><span>{fmtDate(startDate, lang)}</span>
                <span className="muted">{lang === "th" ? "เวลา" : "Time"}</span><span className="mono">{form.timeStart} – {form.timeEnd}</span>
                <span className="muted">{t("book_attendees")}</span><span>{form.attendees} {lang === "th" ? "คน" : "people"}</span>
                {form.equipment.length > 0 && <>
                  <span className="muted">{t("book_equipment")}</span>
                  <span>{form.equipment.map(id => equipment.find(e => e.id === id)?.name.split(" ").slice(0, 3).join(" ")).join(", ")}</span>
                </>}
                <span className="muted">Google Meet</span><span>{form.meet ? <Badge status="approved">{lang === "th" ? "เปิด" : "On"}</Badge> : <Badge status="draft">{lang === "th" ? "ปิด" : "Off"}</Badge>}</span>
                <span className="muted">Google Calendar</span><span>{form.addToCalendar ? <Badge status="approved">{lang === "th" ? "เปิด" : "On"}</Badge> : <Badge status="draft">{lang === "th" ? "ปิด" : "Off"}</Badge>}</span>
              </div>
              <div>
                <div className="h3" style={{ marginBottom: 8 }}>{t("book_email_preview")}</div>
                <EmailPreview booking={previewBooking} lang={lang} />
                <div className="muted" style={{ fontSize: 11.5, marginTop: 8 }}>
                  {lang === "th" ? "อีเมลนี้จะถูกส่งหลังจากเจ้าหน้าที่อนุมัติคำขอ" : "This email is sent once the approver confirms the request."}
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, padding: "14px 16px", borderTop: "1px solid var(--border)", background: "var(--bg-2)" }}>
          {step > 1 ? <button className="btn" onClick={() => setStep(step - 1)}>{t("back")}</button> : <span style={{ flex: 1 }} />}
          <span style={{ flex: 1 }} />
          {step < 3
            ? <button className="btn btn-primary" disabled={step === 1 && !canNext1} onClick={() => setStep(step + 1)}>{t("next")}</button>
            : <button className="btn btn-primary" disabled={saving} onClick={handleSubmit}>
                {saving ? (lang === "th" ? "กำลังส่ง…" : "Saving…") : <>{ico.check()} {t("book_submit")}</>}
              </button>
          }
        </div>
      </div>

      {/* Sidebar */}
      <div className="col" style={{ gap: 12 }}>
        {room && (
          <div className="card">
            <div className="card-head"><RoomDot roomId={room.id} /><div className="card-title">{room.name}</div></div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, fontSize: 12.5 }}>
                <span className="muted">{lang === "th" ? "ความจุ" : "Capacity"}</span><span><b>{room.capacity}</b> {lang === "th" ? "คน" : "people"}</span>
                <span className="muted">{lang === "th" ? "ชั้น" : "Floor"}</span><span>{room.floor}</span>
                <span className="muted">{lang === "th" ? "สถานะตอนนี้" : "Status"}</span><span><Badge status="approved">{lang === "th" ? "ว่าง" : "Available"}</Badge></span>
              </div>
              <div>
                <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>{lang === "th" ? "สิ่งอำนวยความสะดวก" : "Amenities"}</div>
                <div className="chip-row">{room.amenities.map(a => <span key={a} className="chip" style={{ fontSize: 11.5 }}>{a}</span>)}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

window.BookingPage = BookingPage;
