// pages/dashboard.jsx
const DashboardPage = ({ role, navigate }) => {
  const { t, lang } = useI18n();

  const todays = BOOKINGS.filter(b => sameDay(b.start, new Date())).sort((a, b) => a.start - b.start);
  const pending = BOOKINGS.filter(b => b.status === "pending").length + EQ_REQUESTS.filter(r => r.status === "pending").length;
  const eqOut = EQ_REQUESTS.filter(r => r.status === "approved").reduce((s, r) => s + r.qty, 0);

  const now = new Date();
  const roomsBusy = todays.filter(b => b.status === "approved" && b.start <= now && b.end >= now).map(b => b.roomId);
  const roomsAvail = ROOMS.length - new Set(roomsBusy).size;

  const stats = [
    { label: t("stat_bookings_today"), value: todays.length, unit: lang === "th" ? "การจอง" : "bookings", trend: { dir: "up", text: lang === "th" ? "+2 จากเมื่อวาน" : "+2 vs yesterday" } },
    { label: t("stat_rooms_avail"), value: roomsAvail, unit: `/ ${ROOMS.length} ${lang === "th" ? "ห้อง" : "rooms"}`, trend: { text: lang === "th" ? "ดูปฏิทิน" : "View calendar" } },
    { label: t("stat_pending"), value: pending, unit: lang === "th" ? "รายการ" : "items", trend: { text: role === "approver" ? (lang === "th" ? "รออนุมัติของคุณ" : "Awaiting your action") : (lang === "th" ? "รอเจ้าหน้าที่" : "Awaiting approver") } },
    { label: t("stat_equip_out"), value: eqOut, unit: lang === "th" ? "ชิ้น" : "items", trend: { dir: "down", text: lang === "th" ? "-3 จากสัปดาห์ก่อน" : "-3 vs last week" } },
  ];

  const weekly = [
    { day: lang === "th" ? "จ" : "Mon", a: 3, b: 2 },
    { day: lang === "th" ? "อ" : "Tue", a: 4, b: 1 },
    { day: lang === "th" ? "พ" : "Wed", a: 5, b: 2 },
    { day: lang === "th" ? "พฤ" : "Thu", a: 4, b: 3 },
    { day: lang === "th" ? "ศ" : "Fri", a: 6, b: 2 },
  ];
  const maxBar = Math.max(...weekly.map(d => d.a + d.b));

  const util = 64;
  const donutGradient = `conic-gradient(var(--accent) ${util * 3.6}deg, var(--border) 0)`;

  const activity = [
    { who: "เจ้าหน้าที่", what: lang === "th" ? "อนุมัติคำขอ" : "Approved", target: BOOKINGS[0].topic, when: "10 " + (lang === "th" ? "นาทีที่แล้ว" : "min ago"), icon: ico.check, color: "var(--success)" },
    { who: "ภาคิน Dev", what: lang === "th" ? "ส่งคำขอ" : "Requested", target: BOOKINGS[7].topic, when: "32 " + (lang === "th" ? "นาทีที่แล้ว" : "min ago"), icon: ico.plus, color: "var(--accent)" },
    { who: "Google Calendar", what: lang === "th" ? "ซิงค์ event 12 รายการ" : "Synced 12 events", target: "", when: "1 " + (lang === "th" ? "ชม. ที่แล้ว" : "hr ago"), icon: ico.gcal, color: "var(--info)" },
    { who: "วาสนา เซลส์", what: lang === "th" ? "ส่งคำขอยืม" : "Borrowed", target: "Projector Epson", when: "2 " + (lang === "th" ? "ชม. ที่แล้ว" : "hr ago"), icon: ico.box, color: "var(--accent)" },
    { who: "Admin", what: lang === "th" ? "เพิ่มอุปกรณ์" : "Added equipment", target: "MacBook Pro 14″ M3", when: lang === "th" ? "เมื่อวาน" : "Yesterday", icon: ico.wrench, color: "var(--text-2)" },
  ];

  return (
    <div className="col" style={{ gap: 20 }}>
      {/* Stats */}
      <div className="stat-grid">
        {stats.map((s, i) => (
          <div key={i} className="stat">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">
              <span className="mono">{s.value}</span>
              <span className="unit">{s.unit}</span>
            </div>
            <div className={`stat-trend ${s.trend.dir || ""}`}>
              {s.trend.dir === "up" && ico.arrowUp()}
              {s.trend.dir === "down" && ico.arrowDown()}
              {s.trend.text}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
        {/* Today schedule */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">{t("today_schedule")}</div>
            <span className="card-sub mono">{fmtDate(new Date(), lang)}</span>
          </div>
          <div style={{ padding: "4px 0" }}>
            {todays.length === 0 ? (
              <Empty title={lang === "th" ? "ยังไม่มีการจองวันนี้" : "No bookings today"} sub={lang === "th" ? "ใช้ปุ่ม + เพื่อจองห้อง" : "Tap + to create one"} icon={ico.calendar({ width: 28, height: 28 })} />
            ) : todays.map((b, i) => {
              const room = ROOMS.find(r => r.id === b.roomId);
              const isNow = b.start <= new Date() && b.end >= new Date();
              return (
                <div key={b.id} style={{
                  display: "grid", gridTemplateColumns: "70px 6px 1fr auto", gap: 12, alignItems: "center",
                  padding: "11px 16px", borderTop: i === 0 ? 0 : "1px solid var(--border)"
                }}>
                  <div className="mono" style={{ fontSize: 12, color: "var(--text-2)", textAlign: "right" }}>
                    {fmtTime(b.start)}<br /><span style={{ color: "var(--text-3)" }}>{fmtTime(b.end)}</span>
                  </div>
                  <div style={{ width: 4, height: 36, borderRadius: 2, background: room.color }} />
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{b.topic}</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 2 }}>
                      {room.short} · {b.attendees} {lang === "th" ? "คน" : "people"} {b.meet && (<span style={{ marginLeft: 6 }}>{ico.meet()}</span>)}
                    </div>
                  </div>
                  {isNow && <Badge status="approved">{lang === "th" ? "กำลังประชุม" : "Now"}</Badge>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick actions + Room utilization */}
        <div className="col">
          <div className="card">
            <div className="card-head"><div className="card-title">{t("quick_actions")}</div></div>
            <div className="card-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button className="btn btn-primary btn-lg" onClick={() => navigate("book")} style={{ justifyContent: "flex-start" }}>
                {ico.plus()} {t("qa_book")}
              </button>
              <button className="btn btn-lg" onClick={() => navigate("equipment")} style={{ justifyContent: "flex-start" }}>
                {ico.box()} {t("qa_borrow")}
              </button>
              <button className="btn btn-lg" onClick={() => navigate("calendar")} style={{ justifyContent: "flex-start" }}>
                {ico.calendar()} {t("qa_view_cal")}
              </button>
              <button className="btn btn-lg" onClick={() => navigate("history")} style={{ justifyContent: "flex-start" }}>
                {ico.history()} {t("qa_history")}
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div className="card-title">{t("room_util")}</div>
              <span className="card-sub">{t("room_util_sub")}</span>
            </div>
            <div className="card-body" style={{ display: "flex", gap: 18, alignItems: "center" }}>
              <div className="donut" style={{ background: donutGradient }}>
                <div className="donut-center">
                  <div className="donut-value mono">{util}<span style={{ fontSize: 13 }}>%</span></div>
                  <div className="donut-label">avg</div>
                </div>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                {ROOMS.slice(0, 4).map((r, i) => {
                  const pct = [78, 64, 52, 41][i];
                  return (
                    <div key={r.id}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <RoomDot roomId={r.id} />
                          <span>{r.short}</span>
                        </div>
                        <span className="mono muted">{pct}%</span>
                      </div>
                      <div style={{ height: 4, background: "var(--bg-2)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: r.color, opacity: 0.7 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly + Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
        <div className="card">
          <div className="card-head">
            <div className="card-title">{t("weekly_usage")}</div>
            <span className="card-sub">{t("weekly_usage_sub")}</span>
          </div>
          <div className="card-body">
            <div className="bar-chart">
              {weekly.map((d, i) => {
                const totalH = ((d.a + d.b) / maxBar) * 130;
                const aH = (d.a / (d.a + d.b)) * totalH;
                const bH = (d.b / (d.a + d.b)) * totalH;
                return (
                  <div key={i} className="bar-col">
                    <div className="bar-stack" style={{ height: 130 }}>
                      <div className="bar-seg" style={{ height: aH, background: "var(--accent)" }} />
                      <div className="bar-seg b" style={{ height: bH }} />
                    </div>
                    <div className="bar-label">{d.day}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 14, fontSize: 11.5, color: "var(--text-3)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><i style={{ width: 10, height: 10, background: "var(--accent)", borderRadius: 2, display: "inline-block" }}/>{lang === "th" ? "ห้องประชุม" : "Rooms"}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><i style={{ width: 10, height: 10, background: "var(--info)", borderRadius: 2, display: "inline-block", opacity: 0.85 }}/>{lang === "th" ? "อุปกรณ์" : "Equipment"}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><div className="card-title">{t("recent_activity")}</div></div>
          <div style={{ padding: 4 }}>
            {activity.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "10px 14px", borderTop: i === 0 ? 0 : "1px solid var(--border)", alignItems: "flex-start" }}>
                <div style={{ width: 24, height: 24, borderRadius: 5, background: "var(--surface-2)", color: a.color, display: "grid", placeItems: "center", flexShrink: 0 }}>
                  {a.icon({ width: 13, height: 13 })}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, lineHeight: 1.4 }}>
                    <span style={{ fontWeight: 500 }}>{a.who}</span>
                    <span style={{ color: "var(--text-3)" }}> {a.what} </span>
                    {a.target && <span style={{ fontWeight: 500 }}>{a.target}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{a.when}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

window.DashboardPage = DashboardPage;
