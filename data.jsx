// data.jsx — initial/seed data + helper functions

const todayAt = (h, m = 0) => {
  const d = new Date(); d.setHours(h, m, 0, 0); return d;
};
const offsetDay = (n, h, m = 0) => {
  const d = new Date(); d.setDate(d.getDate() + n); d.setHours(h, m, 0, 0); return d;
};

const INITIAL_ROOMS = [
  { id: "r1", name: "Boardroom · Sukhumvit", short: "Boardroom",   capacity: 14, floor: 12, amenities: ["TV 75″", "Whiteboard", "Conference Phone", "Air Con"], color: "#4ade80" },
  { id: "r2", name: "Phra Athit",            short: "Phra Athit",  capacity: 8,  floor: 11, amenities: ["TV 55″", "Whiteboard", "Air Con"], color: "#60a5fa" },
  { id: "r3", name: "Silom",                 short: "Silom",       capacity: 6,  floor: 11, amenities: ["TV 55″", "Whiteboard"], color: "#a78bfa" },
  { id: "r4", name: "Asoke Huddle",          short: "Asoke",       capacity: 4,  floor: 10, amenities: ["Monitor", "Whiteboard"], color: "#fb923c" },
  { id: "r5", name: "Chao Phraya",           short: "Chao Phraya", capacity: 20, floor: 12, amenities: ["TV 75″", "Whiteboard", "Conference Phone", "Projector", "Air Con"], color: "#f87171" },
];

const INITIAL_EQUIPMENT = [
  { id: "e1",  name: "Notebook Lenovo ThinkPad X1",   category: "Notebook",   total: 8,  available: 5, serial: "NB-001 ~ 008",   icon: "laptop",   note: "เครื่องสำหรับ Loan ทั่วไป" },
  { id: "e2",  name: "MacBook Pro 14″ M3",             category: "Notebook",   total: 4,  available: 2, serial: "NB-101 ~ 104",   icon: "laptop",   note: "เครื่องสำหรับงาน Design/Video" },
  { id: "e3",  name: "ไมโครโฟนไร้สาย Shure BLX",       category: "Microphone", total: 6,  available: 4, serial: "MIC-001 ~ 006",  icon: "mic",      note: "" },
  { id: "e4",  name: "ไมโครโฟน Lavalier Rode",          category: "Microphone", total: 3,  available: 3, serial: "MIC-101 ~ 103",  icon: "mic",      note: "" },
  { id: "e5",  name: "Projector Epson EB-X51",          category: "Projector",  total: 2,  available: 1, serial: "PRJ-001, 002",   icon: "projector", note: "" },
  { id: "e6",  name: "กล้องวิดีโอ Sony A7 IV",           category: "Camera",     total: 2,  available: 2, serial: "CAM-001, 002",   icon: "camera",   note: "" },
  { id: "e7",  name: "ขาตั้งกล้อง Manfrotto",            category: "Camera",     total: 3,  available: 3, serial: "TRP-001 ~ 003",  icon: "tripod",   note: "" },
  { id: "e8",  name: "ลำโพง Bose S1 Pro",               category: "Speaker",    total: 2,  available: 0, serial: "SPK-001, 002",   icon: "speaker",  note: "" },
  { id: "e9",  name: "Clicker Logitech R500",            category: "Accessory",  total: 5,  available: 4, serial: "CLK-001 ~ 005",  icon: "clicker",  note: "" },
  { id: "e10", name: "HDMI Adapter (USB-C)",             category: "Accessory",  total: 10, available: 7, serial: "ADP-001 ~ 010",  icon: "adapter",  note: "" },
];

const INITIAL_BOOKINGS = [
  { id: "b1001", topic: "ประชุมแผนการขาย Q3",         roomId: "r1", start: todayAt(9, 0),       end: todayAt(10, 30),      requester: "สมชาย ใจดี",   email: "somchai@hfc.co.th",   attendees: 8,  status: "approved", meet: true,  purpose: "", rejectionReason: "", submitted: offsetDay(-2, 14) },
  { id: "b1002", topic: "Interview Frontend Dev",      roomId: "r3", start: todayAt(10, 0),      end: todayAt(11, 0),       requester: "ปิยะ HR",       email: "piya@hfc.co.th",      attendees: 3,  status: "approved", meet: true,  purpose: "", rejectionReason: "", submitted: offsetDay(-1, 9) },
  { id: "b1003", topic: "1:1 Manager",                 roomId: "r4", start: todayAt(11, 0),      end: todayAt(11, 30),      requester: "นภัสสร",        email: "napatsorn@hfc.co.th", attendees: 2,  status: "approved", meet: false, purpose: "", rejectionReason: "", submitted: offsetDay(-1, 16) },
  { id: "b1004", topic: "Marketing Sync",              roomId: "r2", start: todayAt(13, 0),      end: todayAt(14, 0),       requester: "ธีรพงษ์",       email: "teerapong@hfc.co.th", attendees: 6,  status: "approved", meet: true,  purpose: "", rejectionReason: "", submitted: offsetDay(-3, 11) },
  { id: "b1005", topic: "All-Hands Town Hall",         roomId: "r5", start: todayAt(15, 0),      end: todayAt(16, 30),      requester: "ฝ่ายบริหาร",    email: "exec@hfc.co.th",      attendees: 18, status: "approved", meet: true,  purpose: "", rejectionReason: "", submitted: offsetDay(-5, 10) },
  { id: "b1006", topic: "Design Review สินค้าใหม่",   roomId: "r2", start: offsetDay(1, 10),    end: offsetDay(1, 11, 30), requester: "ก้องภพ ดีไซน์", email: "kongphop@hfc.co.th",  attendees: 5,  status: "pending",  meet: true,  purpose: "", rejectionReason: "", submitted: todayAt(8, 30) },
  { id: "b1007", topic: "Client Demo - PTT",           roomId: "r1", start: offsetDay(1, 14),    end: offsetDay(1, 16),     requester: "วาสนา เซลส์",   email: "wassana@hfc.co.th",   attendees: 10, status: "pending",  meet: true,  purpose: "", rejectionReason: "", submitted: todayAt(9, 12) },
  { id: "b1008", topic: "Sprint Planning",             roomId: "r3", start: offsetDay(2, 9, 30), end: offsetDay(2, 11),     requester: "ภาคิน Dev",     email: "phakhin@hfc.co.th",   attendees: 6,  status: "pending",  meet: false, purpose: "", rejectionReason: "", submitted: todayAt(10, 5) },
  { id: "b1009", topic: "Workshop ทีมการตลาด",        roomId: "r5", start: offsetDay(2, 13),    end: offsetDay(2, 17),     requester: "คุณ (You)",     email: "you@hfc.co.th",       attendees: 12, status: "approved", meet: true,  purpose: "", rejectionReason: "", submitted: offsetDay(-1, 13) },
  { id: "b1010", topic: "ประชุมงบประมาณปี 2027",       roomId: "r1", start: offsetDay(3, 10),    end: offsetDay(3, 12),     requester: "คุณ (You)",     email: "you@hfc.co.th",       attendees: 8,  status: "pending",  meet: true,  purpose: "", rejectionReason: "", submitted: todayAt(7, 50) },
  { id: "b1011", topic: "Onboarding พนักงานใหม่",     roomId: "r2", start: offsetDay(-7, 9),    end: offsetDay(-7, 12),    requester: "คุณ (You)",     email: "you@hfc.co.th",       attendees: 4,  status: "approved", meet: false, purpose: "", rejectionReason: "", submitted: offsetDay(-10, 14) },
  { id: "b1012", topic: "Brainstorming Q4 Campaign",   roomId: "r3", start: offsetDay(-14, 14),  end: offsetDay(-14, 16),   requester: "คุณ (You)",     email: "you@hfc.co.th",       attendees: 5,  status: "rejected", meet: true,  purpose: "", rejectionReason: "ห้องไม่ว่าง ลองเลือกห้องอื่น", submitted: offsetDay(-16, 9) },
];

const INITIAL_EQ_REQUESTS = [
  { id: "eq1", equipmentId: "e1",  equipmentName: "Notebook ThinkPad X1",     qty: 1, requester: "คุณ (You)",   email: "you@hfc.co.th",        start: offsetDay(1, 9),  end: offsetDay(2, 17),  status: "approved", purpose: "", submitted: offsetDay(-1, 10) },
  { id: "eq2", equipmentId: "e3",  equipmentName: "ไมโครโฟนไร้สาย Shure BLX", qty: 2, requester: "ภาคิน Dev", email: "phakhin@hfc.co.th",    start: offsetDay(1, 14), end: offsetDay(1, 16),  status: "pending",  purpose: "", submitted: todayAt(9, 22) },
  { id: "eq3", equipmentId: "e5",  equipmentName: "Projector Epson EB-X51",   qty: 1, requester: "วาสนา เซลส์", email: "wassana@hfc.co.th",  start: offsetDay(2, 13), end: offsetDay(2, 17),  status: "pending",  purpose: "", submitted: todayAt(11, 0) },
  { id: "eq4", equipmentId: "e9",  equipmentName: "Clicker Logitech R500",    qty: 1, requester: "คุณ (You)",   email: "you@hfc.co.th",        start: offsetDay(-7, 9), end: offsetDay(-7, 12), status: "approved", purpose: "", submitted: offsetDay(-10, 14) },
];

// ── Serializers (JS → sheet string) ──────────────────────────────────────────
const serRoom = (r) => ({ ...r, amenities: JSON.stringify(r.amenities || []) });

const serEquipment = (e) => ({
  ...e,
  total:     Number(e.total),
  available: Number(e.available),
  note:      e.note || "",
});

const _isoOrEmpty = (v) => {
  if (!v) return "";
  if (v instanceof Date) return v.toISOString();
  return String(v);
};

const serBooking = (b) => ({
  ...b,
  start:           _isoOrEmpty(b.start),
  end:             _isoOrEmpty(b.end),
  submitted:       _isoOrEmpty(b.submitted),
  meet:            b.meet ? "true" : "false",
  attendees:       Number(b.attendees),
  rejectionReason: b.rejectionReason || "",
  purpose:         b.purpose || "",
});

const serEqRequest = (r) => ({
  ...r,
  start:     _isoOrEmpty(r.start),
  end:       _isoOrEmpty(r.end),
  submitted: _isoOrEmpty(r.submitted),
  qty:       Number(r.qty),
  purpose:   r.purpose || "",
});

// ── Deserializers (sheet row → JS object) ────────────────────────────────────
const tryParse = (v, fallback) => { try { return JSON.parse(v); } catch { return fallback; } };

const desRoom = (r) => ({
  ...r,
  capacity: Number(r.capacity),
  floor:    Number(r.floor),
  amenities: tryParse(r.amenities, []),
});

const desEquipment = (e) => ({
  ...e,
  total:     Number(e.total),
  available: Number(e.available),
});

const desBooking = (b) => ({
  ...b,
  start:     new Date(b.start),
  end:       new Date(b.end),
  submitted: b.submitted ? new Date(b.submitted) : new Date(),
  meet:      b.meet === "true" || b.meet === true,
  attendees: Number(b.attendees),
  rejectionReason: b.rejectionReason || "",
});

const desEqRequest = (r) => ({
  ...r,
  start:     new Date(r.start),
  end:       new Date(r.end),
  submitted: r.submitted ? new Date(r.submitted) : new Date(),
  qty:       Number(r.qty),
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtTime = (d) =>
  new Intl.DateTimeFormat("th-TH-u-ca-gregory", { hour: "2-digit", minute: "2-digit", hour12: false }).format(d);

const fmtDate = (d, lang = "th") =>
  lang === "en"
    ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(d)
    : new Intl.DateTimeFormat("th-TH-u-ca-gregory", { day: "numeric", month: "short", year: "numeric" }).format(d);

const fmtDay = (d, lang = "th") =>
  lang === "en"
    ? new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }).format(d)
    : new Intl.DateTimeFormat("th-TH-u-ca-gregory", { weekday: "short", day: "numeric", month: "short" }).format(d);

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const startOfWeek = (d) => {
  const x = new Date(d); x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - (x.getDay() + 6) % 7);
  return x;
};

window.INITIAL_ROOMS       = INITIAL_ROOMS;
window.INITIAL_EQUIPMENT   = INITIAL_EQUIPMENT;
window.INITIAL_BOOKINGS    = INITIAL_BOOKINGS;
window.INITIAL_EQ_REQUESTS = INITIAL_EQ_REQUESTS;
window.serRoom       = serRoom;
window.serEquipment  = serEquipment;
window.serBooking    = serBooking;
window.serEqRequest  = serEqRequest;
window.desRoom       = desRoom;
window.desEquipment  = desEquipment;
window.desBooking    = desBooking;
window.desEqRequest  = desEqRequest;
window.fmtTime       = fmtTime;
window.fmtDate       = fmtDate;
window.fmtDay        = fmtDay;
window.sameDay       = sameDay;
window.startOfWeek   = startOfWeek;
window.todayAt       = todayAt;
window.offsetDay     = offsetDay;
