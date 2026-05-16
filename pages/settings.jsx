// pages/settings.jsx
const SettingsPage = () => {
  const { t, lang } = useI18n();
  const [gcal, setGcal] = React.useState(true);
  const [gmeet, setGmeet] = React.useState(true);
  const [email, setEmail] = React.useState(true);

  const Row = ({ icon, title, sub, on, onChange }) => (
    <div style={{ display: "flex", gap: 14, padding: 16, alignItems: "center", borderTop: "1px solid var(--border)" }}>
      <div style={{ width: 38, height: 38, borderRadius: 8, background: "var(--bg-2)", display: "grid", placeItems: "center", border: "1px solid var(--border)" }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500, fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
          {title}
          {on && <Badge status="approved">{t("set_connected")}</Badge>}
          {!on && <Badge status="draft">{t("set_disconnected")}</Badge>}
        </div>
        <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{sub}</div>
      </div>
      <SwitchToggle checked={on} onChange={onChange} />
    </div>
  );

  return (
    <div className="col" style={{ gap: 14, maxWidth: 720 }}>
      <div className="card">
        <div className="card-head">
          <div className="card-title">{t("set_integration")}</div>
        </div>
        <div>
          <Row icon={ico.gcal({ width: 22, height: 22 })} title={t("set_gcal")} sub={t("set_gcal_sub")} on={gcal} onChange={setGcal} />
          <Row icon={ico.meet({ width: 22, height: 22 })} title={t("set_gmeet")} sub={t("set_gmeet_sub")} on={gmeet} onChange={setGmeet} />
          <Row icon={ico.bell({ width: 18, height: 18 })} title={t("set_email")} sub={t("set_email_sub")} on={email} onChange={setEmail} />
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">{t("set_account")}</div>
        </div>
        <div style={{ padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
          <div className="avatar" style={{ width: 44, height: 44, fontSize: 15 }}>Y</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500 }}>{lang === "th" ? "คุณ (You)" : "You"}</div>
            <div className="muted mono" style={{ fontSize: 12 }}>you@hfc.co.th</div>
          </div>
          <button className="btn">{lang === "th" ? "ออกจากระบบ" : "Sign out"}</button>
        </div>
      </div>
    </div>
  );
};

window.SettingsPage = SettingsPage;
