// store.jsx — Global data store: Google Sheets ↔ React state

const DataContext = React.createContext(null);

const DataProvider = ({ children }) => {
  const [rooms,      setRooms]      = React.useState([]);
  const [equipment,  setEquipment]  = React.useState([]);
  const [bookings,   setBookings]   = React.useState([]);
  const [eqRequests, setEqRequests] = React.useState([]);
  const [loading,    setLoading]    = React.useState(true);
  const [apiError,   setApiError]   = React.useState(null);

  // ── Load / seed ────────────────────────────────────────────────────────────
  const reload = React.useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      if (!gasApi.isConfigured()) {
        // Not configured → use initial data (read-only demo)
        setRooms(INITIAL_ROOMS);
        setEquipment(INITIAL_EQUIPMENT);
        setBookings(INITIAL_BOOKINGS);
        setEqRequests(INITIAL_EQ_REQUESTS);
        return;
      }

      const [r, e, b, eq] = await Promise.all([
        gasApi.get("rooms"),
        gasApi.get("equipment"),
        gasApi.get("bookings"),
        gasApi.get("eq_requests"),
      ]);

      // Auto-seed empty sheets with initial data
      const seeds = [];
      if (r.length  === 0) seeds.push(gasApi.seed("rooms",       INITIAL_ROOMS.map(serRoom)));
      if (e.length  === 0) seeds.push(gasApi.seed("equipment",   INITIAL_EQUIPMENT.map(serEquipment)));
      if (b.length  === 0) seeds.push(gasApi.seed("bookings",    INITIAL_BOOKINGS.map(serBooking)));
      if (eq.length === 0) seeds.push(gasApi.seed("eq_requests", INITIAL_EQ_REQUESTS.map(serEqRequest)));

      if (seeds.length > 0) {
        await Promise.all(seeds);
        const [r2, e2, b2, eq2] = await Promise.all([
          gasApi.get("rooms"), gasApi.get("equipment"),
          gasApi.get("bookings"), gasApi.get("eq_requests"),
        ]);
        setRooms(r2.map(desRoom));
        setEquipment(e2.map(desEquipment));
        setBookings(b2.map(desBooking));
        setEqRequests(eq2.map(desEqRequest));
      } else {
        setRooms(r.map(desRoom));
        setEquipment(e.map(desEquipment));
        setBookings(b.map(desBooking));
        setEqRequests(eq.map(desEqRequest));
      }
    } catch (err) {
      setApiError(err.message);
      setRooms(INITIAL_ROOMS);
      setEquipment(INITIAL_EQUIPMENT);
      setBookings(INITIAL_BOOKINGS);
      setEqRequests(INITIAL_EQ_REQUESTS);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { reload(); }, []);

  // ── Optimistic helper ──────────────────────────────────────────────────────
  const optimistic = async (optimisticFn, apiFn, rollbackFn) => {
    optimisticFn();
    try { await apiFn(); }
    catch (err) { rollbackFn(); throw err; }
  };

  // ── Rooms CRUD ─────────────────────────────────────────────────────────────
  const addRoom = async (room) => {
    const id = "r" + Date.now();
    const newRoom = { ...room, id };
    await optimistic(
      () => setRooms(p => [...p, newRoom]),
      () => gasApi.create("rooms", serRoom(newRoom)),
      () => setRooms(p => p.filter(r => r.id !== id)),
    );
    return newRoom;
  };

  const editRoom = async (room) => {
    const prev = rooms.find(r => r.id === room.id);
    await optimistic(
      () => setRooms(p => p.map(r => r.id === room.id ? room : r)),
      () => gasApi.update("rooms", room.id, serRoom(room)),
      () => setRooms(p => p.map(r => r.id === room.id ? prev : r)),
    );
  };

  const removeRoom = async (id) => {
    const prev = rooms.find(r => r.id === id);
    await optimistic(
      () => setRooms(p => p.filter(r => r.id !== id)),
      () => gasApi.delete("rooms", id),
      () => setRooms(p => [...p, prev]),
    );
  };

  // ── Equipment CRUD ─────────────────────────────────────────────────────────
  const addEquipment = async (item) => {
    const id = "e" + Date.now();
    const newItem = { ...item, id, available: item.total };
    await optimistic(
      () => setEquipment(p => [...p, newItem]),
      () => gasApi.create("equipment", serEquipment(newItem)),
      () => setEquipment(p => p.filter(e => e.id !== id)),
    );
    return newItem;
  };

  const editEquipment = async (item) => {
    const prev = equipment.find(e => e.id === item.id);
    await optimistic(
      () => setEquipment(p => p.map(e => e.id === item.id ? item : e)),
      () => gasApi.update("equipment", item.id, serEquipment(item)),
      () => setEquipment(p => p.map(e => e.id === item.id ? prev : e)),
    );
  };

  const removeEquipment = async (id) => {
    const prev = equipment.find(e => e.id === id);
    await optimistic(
      () => setEquipment(p => p.filter(e => e.id !== id)),
      () => gasApi.delete("equipment", id),
      () => setEquipment(p => [...p, prev]),
    );
  };

  // ── Bookings ───────────────────────────────────────────────────────────────
  const addBooking = async (form, currentUser) => {
    const id = "bk" + Date.now();
    const booking = {
      id,
      topic:           form.topic,
      roomId:          form.roomId,
      start:           new Date(`${form.date}T${form.timeStart}`),
      end:             new Date(`${form.date}T${form.timeEnd}`),
      attendees:       form.attendees,
      meet:            form.meet,
      status:          "pending",
      requester:       currentUser.name,
      email:           currentUser.email,
      submitted:       new Date(),
      purpose:         form.purpose || "",
      rejectionReason: "",
    };
    await optimistic(
      () => setBookings(p => [...p, booking]),
      () => gasApi.create("bookings", serBooking(booking)),
      () => setBookings(p => p.filter(b => b.id !== id)),
    );
    return booking;
  };

  const updateBookingStatus = async (id, status, rejectionReason = "") => {
    const prev = bookings.find(b => b.id === id);
    await optimistic(
      () => setBookings(p => p.map(b => b.id === id ? { ...b, status, rejectionReason } : b)),
      () => gasApi.update("bookings", id, { status, rejectionReason }),
      () => setBookings(p => p.map(b => b.id === id ? prev : b)),
    );
  };

  // ── Equipment Requests ─────────────────────────────────────────────────────
  const addEqRequest = async (form, currentUser) => {
    const id = "eq" + Date.now();
    const request = {
      id,
      equipmentId:   form.equipmentId,
      equipmentName: form.equipmentName,
      qty:           form.qty,
      start:         new Date(form.from),
      end:           new Date(form.to),
      requester:     currentUser.name,
      email:         currentUser.email,
      status:        "pending",
      submitted:     new Date(),
      purpose:       form.purpose || "",
    };
    // Decrement available immediately (reserve)
    const eq = equipment.find(e => e.id === form.equipmentId);
    const updatedEq = eq ? { ...eq, available: eq.available - form.qty } : null;

    await optimistic(
      () => {
        setEqRequests(p => [...p, request]);
        if (updatedEq) setEquipment(p => p.map(e => e.id === updatedEq.id ? updatedEq : e));
      },
      async () => {
        await gasApi.create("eq_requests", serEqRequest(request));
        if (updatedEq) await gasApi.update("equipment", updatedEq.id, serEquipment(updatedEq));
      },
      () => {
        setEqRequests(p => p.filter(r => r.id !== id));
        if (eq) setEquipment(p => p.map(e => e.id === eq.id ? eq : e));
      },
    );
    return request;
  };

  const updateEqRequestStatus = async (id, status, note = "") => {
    const req = eqRequests.find(r => r.id === id);
    const prev = req;
    // If rejected: restore available count
    const eq = req && equipment.find(e => e.id === req.equipmentId);
    const restoredEq = (status === "rejected" && eq)
      ? { ...eq, available: eq.available + req.qty }
      : null;

    await optimistic(
      () => {
        setEqRequests(p => p.map(r => r.id === id ? { ...r, status } : r));
        if (restoredEq) setEquipment(p => p.map(e => e.id === restoredEq.id ? restoredEq : e));
      },
      async () => {
        await gasApi.update("eq_requests", id, { status });
        if (restoredEq) await gasApi.update("equipment", restoredEq.id, serEquipment(restoredEq));
      },
      () => {
        if (prev) setEqRequests(p => p.map(r => r.id === id ? prev : r));
        if (eq && restoredEq) setEquipment(p => p.map(e => e.id === eq.id ? eq : e));
      },
    );
  };

  // ── Reset to seed data ─────────────────────────────────────────────────────
  const resetData = async () => {
    await Promise.all([
      gasApi.seed("rooms",       INITIAL_ROOMS.map(serRoom)),
      gasApi.seed("equipment",   INITIAL_EQUIPMENT.map(serEquipment)),
      gasApi.seed("bookings",    INITIAL_BOOKINGS.map(serBooking)),
      gasApi.seed("eq_requests", INITIAL_EQ_REQUESTS.map(serEqRequest)),
    ]);
    await reload();
  };

  return (
    <DataContext.Provider value={{
      rooms, equipment, bookings, eqRequests,
      loading, apiError, reload,
      addRoom, editRoom, removeRoom,
      addEquipment, editEquipment, removeEquipment,
      addBooking, updateBookingStatus,
      addEqRequest, updateEqRequestStatus,
      resetData,
    }}>
      {children}
    </DataContext.Provider>
  );
};

const useData = () => {
  const ctx = React.useContext(DataContext);
  if (!ctx) throw new Error("useData must be inside DataProvider");
  return ctx;
};

window.DataContext  = DataContext;
window.DataProvider = DataProvider;
window.useData      = useData;
