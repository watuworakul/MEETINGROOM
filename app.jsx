// app.jsx — main shell, routing, role switching
const { useState, useEffect, useMemo } = React;

const DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#fbbf24",
  "theme": "dark",
  "lang": "th"
}/*EDITMODE-END*/;

function accentPalette(hex) {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return {
    accent: hex,
    soft: `rgba(${r},${g},${b},0.14)`,
    line: `rgba(${r},${g},${b},0.4)`,
    ink: lum > 0.55 ? "#1a1300" : "#ffffff",
  };
}

const NAV_ITEMS = {
  employee: [
    { group: "main", items: [
      { id: "dashboard", icon: "dashboard", label: "nav_dashboard" },
      { id: "calendar",  icon: "calendar",  label: "nav_calendar" },
      { id: "book",      icon: "plus",      label: "nav_book" },
      { id: "equipment", icon: "box",       label: "nav_equipment" },
      { id: "history",   icon: "history",   label: "nav_history" },
    ]},
  ],
  approver: [
    { group: "main", items: [
      { id: "dashboard", icon: "dashboard", label: "nav_dashboard" },
      { id: "calendar",  icon: "calendar",  label: "nav_calendar" },
    ]},
    { group: "work", items: [
      { id: "approvals", icon: "inbox", label: "nav_approvals", badge: true },
    ]},
    { group: "main", items: [
      { id: "history",   icon: "history",   label: "nav_history" },
    ]},
  ],
  admin: [
    { group: "main", items: [
      { id: "dashboard", icon: "dashboard", label: "nav_dashboard" },
      { id: "calendar",  icon: "calendar",  label: "nav_calendar" },
    ]},
    { group: "admin", items: [
      { id: "admin_rooms",     icon: "door",  label: "nav_admin_rooms" },
      { id: "admin_equipment", icon: "wrench",label: "nav_admin_equipment" },
      { id: "approvals",       icon: "inbox", label: "nav_approvals", badge: true },
    ]},
    { group: "main", items: [
      { id: "settings", icon: "settings", label: "nav_settings" },
    ]},
  ],
};

const PAGE_TITLES = {
  dashboard:       ["dash_title", "dash_sub"],
  calendar:        ["cal_title",  "cal_sub"],
  book:            ["book_title", "book_sub"],
  equipment:       ["eq_title",   "eq_sub"],
  history:         ["his_title",  "his_sub"],
  approvals:       ["appr_title", "appr_sub"],
  admin_rooms:     ["adr_title",  "adr_sub"],
  admin_equipment: ["ade_title",  "ade_sub"],
  settings:        ["set_title",  ""],
};

const currentUser = { name: "คุณ (You)", email: "you@hfc.co.th" };

function AppShell() {
  const [t, setTweak] = useTweaks(DEFAULTS);
  const lang = t.lang;
  const tr = (k) => I18N[lang]?.[k] || k;

  const { bookings, eqRequests, loading, apiError, reload } = useData();

  const [role, setRole] = useState("employee");
  const [page, setPage] = useState("dashboard");
  const [sideOpen, setSideOpen] = useState(false);
  const [bookingPrefill, setBookingPrefill] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", t.theme);
    const p = accentPalette(t.accent);
    const r = document.documentElement.style;
    r.setProperty("--accent",      p.accent);
    r.setProperty("--accent-soft", p.soft);
    r.setProperty("--accent-line", p.line);
    r.setProperty("--accent-ink",  p.ink);
    r.setProperty("--pending",      p.accent);
    r.setProperty("--pending-soft", p.soft);
    document.documentElement.lang = lang;
  }, [t.theme, t.accent, lang]);

  useEffect(() => {
    const validIds = NAV_ITEMS[role].flatMap(g => g.items.map(i => i.id));
    if (!validIds.includes(page) && page !== "book" && page !== "equipment") {
      setPage("dashboard");
    }
  }, [role]);

  const toast = (msg, kind = "ok") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, msg, kind }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 3200);
  };

  const navigate = (p, prefill = null) => {
    if (p === "book") setBookingPrefill(prefill);
    setPage(p);
    setSideOpen(false);
  };

  const openBooking = (prefill) => navigate("book", prefill || null);

  const pendingCount = useMemo(
    () => bookings.filter(b => b.status === "pending").length + eqRequests.filter(r => r.status === "pending").length,
    [bookings, eqRequests]
  );

  const pageProps = {
    role, navigate, openBooking, toast, currentUser,
    selectedBookingId, setSelectedBookingId,
    prefill: bookingPrefill,
    onDone: () => navigate("history"),
  };

  const renderPage = () => {
    switch (page) {
      case "dashboard":       return <DashboardPage      {...pageProps} />;
      case "calendar":        return <CalendarPage       {...pageProps} />;
      case "book":            return <BookingPage        {...pageProps} />;
      case "equipment":       return <EquipmentPage      {...pageProps} />;
      case "history":         return <HistoryPage        {...pageProps} />;
      case "approvals":       return <ApprovalsPage      {...pageProps} />;
      case "admin_rooms":     return <AdminRoomsPage     {...pageProps} />;
      case "admin_equipment": return <AdminEquipmentPage {...pageProps} />;
      case "settings":        return <SettingsPage       {...pageProps} onReload={reload} />;
      default: return null;
    }
  };

  const [titleK, subK] = PAGE_TITLES[page] || ["", ""];

  return (
    <I18nContext.Provider value={{ t: tr, lang }}>
      <div className="app" data-screen-label={`${role} · ${page}`}>
        {/* Sidebar */}
        <aside className={`sidebar ${sideOpen ? "open" : ""}`}>
          <div className="brand">
            <div className="brand-mark">H</div>
            <div className="brand-text">
              <div className="brand-name">{tr("appName")}</div>
              <div className="brand-sub">{tr("appSub")}</div>
            </div>
          </div>

          {NAV_ITEMS[role].map((group, gi) => (
            <div key={gi} className="nav-section">
              <div className="nav-label">{tr("nav_" + group.group)}</div>
              {group.items.map(item => (
                <button key={item.id}
                  className={`nav-item ${page === item.id ? "active" : ""}`}
                  onClick={() => navigate(item.id)}>
                  <span className="nav-icon">{ico[item.icon]()}</span>
                  <span>{tr(item.label)}</span>
                  {item.badge && pendingCount > 0 && <span className="nav-badge">{pendingCount}</span>}
                </button>
              ))}
            </div>
          ))}

          <div className="sidebar-foot">
            <div className="sync-pill" title={tr("google_synced")}>
              {ico.gcal()}
              <span style={{ flex: 1 }}>{tr("google_synced")}</span>
              <span className="pulse"></span>
            </div>
            <div className="user-chip">
              <div className="avatar">Y</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="user-name">{currentUser.name}</div>
                <div className="user-role">{currentUser.email}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="main">
          <header className="topbar">
            <button className="icon-btn" onClick={() => setSideOpen(s => !s)} style={{ display: "none" }}
              data-mobile-only>{ico.menu()}</button>
            <div>
              <span className="page-title">{tr(titleK)}</span>
              {subK && <span className="page-sub">{tr(subK)}</span>}
            </div>
            <div className="topbar-spacer"></div>

            <div className="search-box">
              {ico.search()}
              <input placeholder={tr("search_ph")} />
              <span className="kbd">⌘K</span>
            </div>

            <div className="role-switch" role="tablist">
              <button className={role === "employee" ? "active" : ""} onClick={() => setRole("employee")}><span className="dot"></span><span>{tr("role_employee")}</span></button>
              <button className={role === "approver" ? "active" : ""} onClick={() => setRole("approver")}><span className="dot"></span><span>{tr("role_approver")}</span></button>
              <button className={role === "admin"    ? "active" : ""} onClick={() => setRole("admin")}   ><span className="dot"></span><span>{tr("role_admin")}</span></button>
            </div>

            <button className="icon-btn" title={lang === "th" ? "การแจ้งเตือน" : "Notifications"} style={{ position: "relative" }}>
              {ico.bell()}
              <span style={{ position: "absolute", top: 4, right: 4, width: 7, height: 7, borderRadius: 99, background: "var(--accent)" }} />
            </button>
          </header>

          {/* API error banner */}
          {apiError && (
            <div style={{ background: "var(--danger-soft)", border: "1px solid rgba(248,113,113,.25)", borderRadius: 6, padding: "10px 16px", margin: "0 0 12px", fontSize: 12.5, display: "flex", alignItems: "center", gap: 10 }}>
              {ico.x({ width: 14, height: 14 })}
              <span style={{ flex: 1, color: "var(--danger)" }}>{apiError} — {lang === "th" ? "กำลังใช้ข้อมูลตัวอย่าง" : "Using demo data"}</span>
              <button className="btn btn-sm" onClick={reload}>{lang === "th" ? "ลองใหม่" : "Retry"}</button>
              <button className="btn btn-sm" onClick={() => navigate("settings")}>{lang === "th" ? "ตั้งค่า" : "Settings"}</button>
            </div>
          )}

          <div className="content">
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, gap: 14, color: "var(--text-3)" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--accent)", animation: "spin 0.8s linear infinite" }} />
                <span style={{ fontSize: 13 }}>{lang === "th" ? "กำลังโหลดข้อมูล…" : "Loading data…"}</span>
              </div>
            ) : renderPage()}
          </div>
        </main>

        {/* Toasts */}
        <div className="toast-wrap">
          {toasts.map(x => (
            <div key={x.id} className={`toast ${x.kind === "err" ? "err" : ""}`}>
              <span className="toast-icon">{x.kind === "err" ? ico.x({ width: 16, height: 16 }) : ico.check({ width: 16, height: 16 })}</span>
              <span>{x.msg}</span>
            </div>
          ))}
        </div>

        {/* Tweaks panel */}
        <TweaksPanel title="Tweaks">
          <TweakSection title={lang === "th" ? "ธีม" : "Theme"}>
            <TweakRadio label={lang === "th" ? "โหมด" : "Mode"} value={t.theme} options={[
              { value: "dark",  label: lang === "th" ? "มืด" : "Dark" },
              { value: "light", label: lang === "th" ? "สว่าง" : "Light" },
            ]} onChange={v => setTweak("theme", v)} />
            <TweakColor label={lang === "th" ? "สีหลัก" : "Accent"} value={t.accent}
              options={["#fbbf24", "#3b82f6", "#7c956b", "#8b5cf6", "#c8553d"]}
              onChange={v => setTweak("accent", v)} />
          </TweakSection>
          <TweakSection title={lang === "th" ? "ภาษา" : "Language"}>
            <TweakRadio label={lang === "th" ? "ภาษา" : "Language"} value={t.lang} options={[
              { value: "th", label: "ไทย" },
              { value: "en", label: "English" },
            ]} onChange={v => setTweak("lang", v)} />
          </TweakSection>
        </TweaksPanel>
      </div>
    </I18nContext.Provider>
  );
}

function App() {
  return (
    <DataProvider>
      <AppShell />
    </DataProvider>
  );
}

// Spinner keyframe
const style = document.createElement("style");
style.textContent = "@keyframes spin { to { transform: rotate(360deg); } }";
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
