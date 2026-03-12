import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMotors,
  getMotorById,
  createMotor,
  updateMotor,
  deleteMotor,
  getStats,
  changePassword as apiChangePassword,
} from "../api";
import "../admin.css";

const LIMIT = 15;

const emptyForm = () => ({
  brand: "",
  manufacturer: "",
  motorType: "",
  phase: "Single",
  ratedVoltage: "",
  ratedCurrent: "",
  ratedFrequency: "",
  ratedRPM: "",
  ratedPowerHP: "",
  insulationClass: "",
  efficiency: "",
  frameSize: "",
  runningCurrent: "",
  statorSlots: "",
  slotLength: "",
  totalCoilTurns: "",
  turnsPerCoil: "",
  coilPitch: "",
  windingConnection: "",
  coilWireType: "",
  wireGauge: "",
  coilWeight: "",
  pitchTurns: [],
  startingCoilTurns: "",
  runningCoilTurns: "",
  startingCoilWeight: "",
  runningCoilWeight: "",
  capacitorValue: "",
  lineVoltage: "",
  phaseVoltage: "",
  lineCurrent: "",
  phaseCurrent: "",
  starDeltaConn: "",
  shaftDiameter: "",
  shaftLength: "",
  bearingFront: "",
  bearingRear: "",
  fanSize: "",
  fanCoverSize: "",
  motorWeight: "",
  bodyMaterial: "",
  oldCoilWeight: "",
  newCoilWeight: "",
  notes: "",
});

function Toaster({ toasts }) {
  return (
    <div className="a-toaster">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`a-toast${t.type === "error" ? " error" : t.type === "warn" ? " warn" : ""}`}
        >
          {t.type === "error" ? "❌" : t.type === "warn" ? "⚠️" : "✅"} {t.msg}
        </div>
      ))}
    </div>
  );
}

export default function Admin() {
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [motors, setMotors] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("");
  const [page, setPage] = useState(1);

  const [motorModal, setMotorModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm());

  const [detailModal, setDetailModal] = useState(false);
  const [detailMotor, setDetailMotor] = useState(null);

  const [confirmModal, setConfirmModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [curPass, setCurPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [conPass, setConPass] = useState("");

  const toast = (msg, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  useEffect(() => {
    if (!localStorage.getItem("srew_token")) navigate("/login");
  }, [navigate]);

  const loadStats = useCallback(async () => {
    try {
      const d = await getStats();
      setStats(d.stats);
      setRecent(d.recent);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadMotors = useCallback(async () => {
    try {
      const d = await getMotors({
        search,
        motorType: typeFilter,
        phase: phaseFilter,
        page,
        limit: LIMIT,
      });
      setMotors(d.motors);
      setPagination(d.pagination);
    } catch (e) {
      console.error(e);
    }
  }, [search, typeFilter, phaseFilter, page]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);
  useEffect(() => {
    if (activePage === "motors") loadMotors();
  }, [activePage, loadMotors]);

  useEffect(() => {
    if (activePage !== "motors") return;
    const t = setTimeout(() => {
      setPage(1);
      loadMotors();
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [search]);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const openAddModal = () => {
    setEditId(null);
    setForm(emptyForm());
    setMotorModal(true);
  };

  const openEditModal = async (id) => {
    try {
      const d = await getMotorById(id);
      const m = d.motor;
      setEditId(id);
      setForm({
        ...emptyForm(),
        ...Object.fromEntries(Object.entries(m).map(([k, v]) => [k, v ?? ""])),
        pitchTurns: m.pitchTurns || [],
      });
      setMotorModal(true);
    } catch (e) {
      toast("Failed to load motor", "error");
    }
  };

  const openDetail = async (id) => {
    try {
      const d = await getMotorById(id);
      setDetailMotor(d.motor);
      setDetailModal(true);
    } catch (e) {
      toast("Failed to load motor", "error");
    }
  };

  const saveMotor = async () => {
    if (!form.brand || !form.motorType) {
      toast("Brand and Motor Type are required.", "error");
      return;
    }
    try {
      const payload = { ...form };
      [
        "ratedRPM",
        "ratedPowerHP",
        "statorSlots",
        "totalCoilTurns",
        "turnsPerCoil",
        "coilWeight",
        "startingCoilTurns",
        "runningCoilTurns",
        "startingCoilWeight",
        "runningCoilWeight",
        "motorWeight",
        "oldCoilWeight",
        "newCoilWeight",
        "lineCurrent",
        "phaseCurrent",
      ].forEach((k) => {
        if (payload[k] !== "") payload[k] = Number(payload[k]);
        else delete payload[k];
      });
      Object.keys(payload).forEach((k) => {
        if (payload[k] === "") delete payload[k];
      });
      if (editId) {
        await updateMotor(editId, payload);
        toast("Motor updated!");
      } else {
        await createMotor(payload);
        toast("Motor added!");
      }
      setMotorModal(false);
      loadMotors();
      loadStats();
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setConfirmModal(true);
  };
  const doDelete = async () => {
    try {
      await deleteMotor(deleteId);
      toast("Motor deleted.", "warn");
      setConfirmModal(false);
      loadMotors();
      loadStats();
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const handleChangePassword = async () => {
    if (!curPass || !newPass || !conPass) {
      toast("All fields required.", "error");
      return;
    }
    if (newPass !== conPass) {
      toast("Passwords do not match.", "error");
      return;
    }
    try {
      await apiChangePassword(curPass, newPass);
      toast("Password changed!");
      setCurPass("");
      setNewPass("");
      setConPass("");
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const logout = () => {
    localStorage.removeItem("srew_token");
    navigate("/login");
  };
  const navTo = (id) => {
    setActivePage(id);
    setSidebarOpen(false);
  };

  const addPitchRow = () =>
    setForm((f) => ({
      ...f,
      pitchTurns: [...f.pitchTurns, { pitch: "", turns: "" }],
    }));
  const removePitchRow = (i) =>
    setForm((f) => ({
      ...f,
      pitchTurns: f.pitchTurns.filter((_, idx) => idx !== i),
    }));
  const setPitchField = (i, key, val) =>
    setForm((f) => {
      const arr = [...f.pitchTurns];
      arr[i] = { ...arr[i], [key]: val };
      return { ...f, pitchTurns: arr };
    });

  /* ---- helpers ---- */
  const bdgType = (t) =>
    t?.toLowerCase() === "ac" ? "a-badge-ac" : "a-badge-dc";
  const bdgPhase = (p) => (p === "Single" ? "a-badge-1ph" : "a-badge-3ph");

  const af = (label, children) => (
    <div className="a-field">
      <label>{label}</label>
      {children}
    </div>
  );

  const aDi = (l, v) =>
    v ? (
      <div key={l} className="a-detail-item">
        <div className="a-di-label">{l}</div>
        <div className="a-di-value">{v}</div>
      </div>
    ) : null;

  const renderDetailBody = (m) => {
    if (!m) return null;
    return (
      <>
        <div className="a-detail-section">
          <div className="a-detail-section-title">🏷️ Nameplate</div>
          <div className="a-detail-grid">
            {[
              aDi("Brand", m.brand),
              aDi("Manufacturer", m.manufacturer),
              aDi("Type", m.motorType),
              aDi("Phase", m.phase),
              aDi("Voltage", m.ratedVoltage),
              aDi("Current", m.ratedCurrent),
              aDi("RPM", m.ratedRPM),
              aDi("HP", m.ratedPowerHP),
              aDi("kW", m.ratedPowerKW),
              aDi("Frame", m.frameSize),
              aDi("Insulation", m.insulationClass),
              aDi("Efficiency", m.efficiency),
            ]}
          </div>
        </div>
        <div className="a-detail-section">
          <div className="a-detail-section-title">🔩 Winding</div>
          <div className="a-detail-grid">
            {[
              aDi("Wire Type", m.coilWireType),
              aDi("Wire Gauge", m.wireGauge),
              aDi("Turns/Coil", m.turnsPerCoil),
              aDi("Total Turns", m.totalCoilTurns),
              aDi("Coil Pitch", m.coilPitch),
              aDi("Coil Weight", m.coilWeight ? m.coilWeight + " kg" : null),
              aDi("Connection", m.windingConnection),
              aDi("Slots", m.statorSlots),
              aDi("Slot Length", m.slotLength),
            ]}
          </div>
        </div>
        {m.phase === "Single" && (
          <div className="a-detail-section">
            <div className="a-detail-section-title">🔌 Single Phase</div>
            <div className="a-detail-grid">
              {[
                aDi("Start Turns", m.startingCoilTurns),
                aDi("Run Turns", m.runningCoilTurns),
                aDi(
                  "Start Wt.",
                  m.startingCoilWeight ? m.startingCoilWeight + " kg" : null,
                ),
                aDi(
                  "Run Wt.",
                  m.runningCoilWeight ? m.runningCoilWeight + " kg" : null,
                ),
                aDi("Capacitor", m.capacitorValue),
              ]}
            </div>
          </div>
        )}
        {m.phase === "Three" && (
          <div className="a-detail-section">
            <div className="a-detail-section-title">⚡ Three Phase</div>
            <div className="a-detail-grid">
              {[
                aDi("Line Voltage", m.lineVoltage),
                aDi("Phase Voltage", m.phaseVoltage),
                aDi("Line Current", m.lineCurrent),
                aDi("Phase Current", m.phaseCurrent),
                aDi("Connection", m.starDeltaConn),
              ]}
            </div>
          </div>
        )}
        <div className="a-detail-section">
          <div className="a-detail-section-title">⚙️ Mechanical</div>
          <div className="a-detail-grid">
            {[
              aDi("Shaft Dia.", m.shaftDiameter),
              aDi("Shaft Len.", m.shaftLength),
              aDi("Bearing F.", m.bearingFront),
              aDi("Bearing R.", m.bearingRear),
              aDi("Fan Size", m.fanSize),
              aDi("Body", m.bodyMaterial),
              aDi("Weight", m.motorWeight ? m.motorWeight + " kg" : null),
            ]}
          </div>
        </div>
        {m.notes && (
          <div className="a-detail-section">
            <div className="a-detail-section-title">🔧 Notes</div>
            <div
              style={{
                padding: "12px",
                background: "#f7f9fc",
                borderRadius: "8px",
                fontSize: ".85rem",
                lineHeight: 1.75,
                border: "1px solid #e2e8f0",
              }}
            >
              {m.notes}
            </div>
          </div>
        )}
      </>
    );
  };

  /* ---- RENDER ---- */
  return (
    <div className="srew-admin">
      <div className="a-layout">
        {/* VEIL */}
        {sidebarOpen && (
          <div className="a-veil on" onClick={() => setSidebarOpen(false)} />
        )}

        {/* SIDEBAR */}
        <nav className={`a-sidebar${sidebarOpen ? " open" : ""}`}>
          <div className="a-sb-head">
            <div className="a-sb-brand">
              <div className="a-sb-icon">⚡</div>
              <div className="a-sb-name">
                SREW Admin
                <em>Motor Data System</em>
              </div>
            </div>
            <button className="a-sb-x" onClick={() => setSidebarOpen(false)}>
              ✕
            </button>
          </div>

          <div className="a-sb-nav">
            <div className="a-nav-group">Main</div>
            {[
              { id: "dashboard", icon: "📊", label: "Dashboard" },
              { id: "motors", icon: "⚡", label: "Motors" },
            ].map((n) => (
              <div
                key={n.id}
                className={`a-nav-item${activePage === n.id ? " active" : ""}`}
                onClick={() => navTo(n.id)}
              >
                <span className="a-nav-icon">{n.icon}</span> {n.label}
              </div>
            ))}
            <div className="a-nav-group">Config</div>
            {[
              { id: "settings", icon: "⚙️", label: "Settings" },
              { id: "help", icon: "❓", label: "Help & Guide" },
            ].map((n) => (
              <div
                key={n.id}
                className={`a-nav-item${activePage === n.id ? " active" : ""}`}
                onClick={() => navTo(n.id)}
              >
                <span className="a-nav-icon">{n.icon}</span> {n.label}
              </div>
            ))}
          </div>

          <div className="a-sb-footer">
            <div className="a-sb-user">
              <div className="a-avatar">A</div>
              <div className="a-user-info">
                <div className="a-user-name">Administrator</div>
                <div className="a-user-role">Motor Data System</div>
              </div>
            </div>
            <button className="a-logout-btn" onClick={logout}>
              🚪 Logout
            </button>
          </div>
        </nav>

        {/* MAIN */}
        <div className="a-main">
          {/* TOPBAR */}
          <div className="a-topbar">
            <button
              className="a-hamburger"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
            <div className="a-topbar-title">
              ⚡ SREW <em>Admin Panel</em>
            </div>
            <div className="a-topbar-right">
              <a href="/" className="a-catalogue-link">
                🌐 Catalogue
              </a>
            </div>
          </div>

          {/* DASHBOARD */}
          <div className={`a-page${activePage === "dashboard" ? " show" : ""}`}>
            <div className="a-page-title">
              Dashboard
              <span>Overview of your motor data system</span>
            </div>

            {stats && (
              <div className="a-kpi-grid">
                {[
                  { icon: "⚡", n: stats.total, l: "Total Motors", cls: "k1" },
                  { icon: "🔵", n: stats.acCount, l: "AC Motors", cls: "k2" },
                  { icon: "🔴", n: stats.dcCount, l: "DC Motors", cls: "k3" },
                  {
                    icon: "1️⃣",
                    n: stats.singleCount,
                    l: "Single Phase",
                    cls: "k4",
                  },
                  {
                    icon: "3️⃣",
                    n: stats.threeCount,
                    l: "Three Phase",
                    cls: "k5",
                  },
                  { icon: "🏷️", n: stats.brandCount, l: "Brands", cls: "k6" },
                ].map((k) => (
                  <div key={k.l} className={`a-kpi ${k.cls}`}>
                    <div className="a-kpi-icon">{k.icon}</div>
                    <div className="a-kpi-num">{k.n}</div>
                    <div className="a-kpi-label">{k.l}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="a-table-card">
              <div className="a-tc-header">
                <h3>🕐 Recently Added Motors</h3>
              </div>
              <div className="a-table-wrap">
                <table className="a-table">
                  <thead>
                    <tr>
                      <th>Brand</th>
                      <th>Frame</th>
                      <th>HP</th>
                      <th>RPM</th>
                      <th>Type</th>
                      <th>Phase</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          style={{
                            textAlign: "center",
                            color: "#64748b",
                            padding: "24px",
                          }}
                        >
                          No motors yet
                        </td>
                      </tr>
                    ) : (
                      recent.map((m) => (
                        <tr key={m._id}>
                          <td style={{ fontWeight: 700 }}>{m.brand}</td>
                          <td>{m.frameSize || "—"}</td>
                          <td>
                            {m.ratedPowerHP ? `${m.ratedPowerHP} HP` : "—"}
                          </td>
                          <td>{m.ratedRPM || "—"}</td>
                          <td>
                            <span className={`a-badge ${bdgType(m.motorType)}`}>
                              {m.motorType}
                            </span>
                          </td>
                          <td>
                            <span className={`a-badge ${bdgPhase(m.phase)}`}>
                              {m.phase === "Single" ? "1Ph" : "3Ph"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* MOTORS */}
          <div className={`a-page${activePage === "motors" ? " show" : ""}`}>
            <div className="a-page-title">
              Motors
              <span>Manage all motor records</span>
            </div>

            <div className="a-table-card">
              <div className="a-tc-header">
                <h3>Motor List</h3>
                <input
                  type="text"
                  className="a-tc-search"
                  placeholder="Search motors..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  className="a-tc-filter"
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All Types</option>
                  <option>AC</option>
                  <option>DC</option>
                </select>
                <select
                  className="a-tc-filter"
                  value={phaseFilter}
                  onChange={(e) => {
                    setPhaseFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All Phases</option>
                  <option value="Single">Single</option>
                  <option value="Three">Three</option>
                </select>
                <button className="a-btn a-btn-primary" onClick={openAddModal}>
                  ➕ Add Motor
                </button>
              </div>

              <div className="a-table-wrap">
                <table className="a-table">
                  <thead>
                    <tr>
                      <th>Brand</th>
                      <th>Frame</th>
                      <th>HP</th>
                      <th>RPM</th>
                      <th>Voltage</th>
                      <th>Type</th>
                      <th>Phase</th>
                      <th>Gauge</th>
                      <th>Turns</th>
                      <th>Coil Wt</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {motors.length === 0 ? (
                      <tr>
                        <td
                          colSpan={11}
                          style={{
                            textAlign: "center",
                            color: "#64748b",
                            padding: "32px",
                          }}
                        >
                          No motors found
                        </td>
                      </tr>
                    ) : (
                      motors.map((m) => (
                        <tr key={m._id}>
                          <td style={{ fontWeight: 700 }}>{m.brand}</td>
                          <td>{m.frameSize || "—"}</td>
                          <td>
                            {m.ratedPowerHP ? `${m.ratedPowerHP} HP` : "—"}
                          </td>
                          <td>{m.ratedRPM || "—"}</td>
                          <td>{m.ratedVoltage || "—"}</td>
                          <td>
                            <span className={`a-badge ${bdgType(m.motorType)}`}>
                              {m.motorType}
                            </span>
                          </td>
                          <td>
                            <span className={`a-badge ${bdgPhase(m.phase)}`}>
                              {m.phase === "Single" ? "1Ph" : "3Ph"}
                            </span>
                          </td>
                          <td>{m.wireGauge || "—"}</td>
                          <td>{m.turnsPerCoil || "—"}</td>
                          <td>{m.coilWeight ? `${m.coilWeight}kg` : "—"}</td>
                          <td>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                className="a-btn a-btn-ghost a-btn-sm a-btn-icon"
                                onClick={() => openDetail(m._id)}
                                title="View"
                              >
                                👁
                              </button>
                              <button
                                className="a-btn a-btn-ghost a-btn-sm a-btn-icon"
                                onClick={() => openEditModal(m._id)}
                                title="Edit"
                              >
                                ✏️
                              </button>
                              <button
                                className="a-btn a-btn-danger a-btn-sm a-btn-icon"
                                onClick={() => confirmDelete(m._id)}
                                title="Delete"
                              >
                                🗑
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {pagination.totalPages > 1 && (
                <div className="a-pager">
                  <span className="a-pager-info">
                    {pagination.total} total motors
                  </span>
                  <button
                    className="a-pager-btn"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    ‹
                  </button>
                  {Array.from({ length: pagination.totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      className={`a-pager-btn${page === i + 1 ? " current" : ""}`}
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="a-pager-btn"
                    onClick={() =>
                      setPage((p) => Math.min(pagination.totalPages, p + 1))
                    }
                    disabled={page === pagination.totalPages}
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SETTINGS */}
          <div className={`a-page${activePage === "settings" ? " show" : ""}`}>
            <div className="a-page-title">
              Settings
              <span>Manage your account</span>
            </div>
            <div className="a-settings-card">
              <h3>🔐 Change Password</h3>
              {[
                {
                  label: "Current Password",
                  val: curPass,
                  set: setCurPass,
                  ph: "Current password",
                },
                {
                  label: "New Password",
                  val: newPass,
                  set: setNewPass,
                  ph: "Min 6 characters",
                },
                {
                  label: "Confirm Password",
                  val: conPass,
                  set: setConPass,
                  ph: "Repeat new password",
                },
              ].map((f) => (
                <div key={f.label} className="a-set-field">
                  <label>{f.label}</label>
                  <input
                    type="password"
                    value={f.val}
                    onChange={(e) => f.set(e.target.value)}
                    placeholder={f.ph}
                  />
                </div>
              ))}
              <button
                className="a-btn a-btn-primary"
                onClick={handleChangePassword}
                style={{ marginTop: "4px" }}
              >
                🔐 Change Password
              </button>
            </div>
          </div>

          {/* HELP */}
          <div className={`a-page${activePage === "help" ? " show" : ""}`}>
            <div className="a-help-hero">
              <div className="a-help-hero-icon">📖</div>
              <h2>Help &amp; User Guide</h2>
              <p>Everything you need to manage your motor data</p>
            </div>
            <div className="a-help-grid">
              {[
                {
                  n: 1,
                  t: "➕ Adding a Motor",
                  p: 'Go to Motors → click "Add Motor". Fill nameplate, winding, phase and mechanical details. Click Save.',
                },
                {
                  n: 2,
                  t: "✏️ Editing a Motor",
                  p: "Click ✏️ on any motor row. The form opens pre-filled. Make changes and click Save Motor.",
                },
                {
                  n: 3,
                  t: "🗑️ Deleting a Motor",
                  p: "Click 🗑 next to any motor. A confirmation dialog appears before permanent deletion.",
                },
                {
                  n: 4,
                  t: "🔍 Search & Filter",
                  p: "Use the search box and dropdowns in Motors to filter by brand, type or phase in real time.",
                },
                {
                  n: 5,
                  t: "🔐 Change Password",
                  p: "Go to Settings. Enter current password and a new password (min 6 characters).",
                },
                {
                  n: 6,
                  t: "🌐 View Public Catalogue",
                  p: 'Click "Catalogue" in the topbar to see what customers see on the public motor listing.',
                },
              ].map((h) => (
                <div key={h.n} className="a-help-card">
                  <div className="a-help-num">{h.n}</div>
                  <h3>{h.t}</h3>
                  <p>{h.p}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* /a-main */}
      </div>
      {/* /a-layout */}

      {/* ADD/EDIT MOTOR MODAL */}
      {motorModal && (
        <div
          className="a-modal-overlay"
          onClick={(e) => {
            if (e.target.classList.contains("a-modal-overlay"))
              setMotorModal(false);
          }}
        >
          <div className="a-modal">
            <div className="a-modal-head">
              <h2>{editId ? "✏️ Edit Motor" : "➕ Add New Motor"}</h2>
              <button
                className="a-modal-x"
                onClick={() => setMotorModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="a-modal-body">
              {/* Nameplate */}
              <div className="a-form-section">
                <div className="a-form-section-title">🏷️ Nameplate Details</div>
                <div className="a-form-grid">
                  {af(
                    "Brand *",
                    <input
                      type="text"
                      value={form.brand}
                      onChange={(e) => setField("brand", e.target.value)}
                      placeholder="e.g. Crompton"
                    />,
                  )}
                  {af(
                    "Manufacturer",
                    <input
                      type="text"
                      value={form.manufacturer}
                      onChange={(e) => setField("manufacturer", e.target.value)}
                      placeholder="Full company name"
                    />,
                  )}
                  {af(
                    "Motor Type *",
                    <select
                      value={form.motorType}
                      onChange={(e) => setField("motorType", e.target.value)}
                    >
                      <option value="">Select type</option>
                      <option>AC</option>
                      <option>DC</option>
                    </select>,
                  )}
                  {af(
                    "Phase *",
                    <select
                      value={form.phase}
                      onChange={(e) => setField("phase", e.target.value)}
                    >
                      <option value="Single">Single Phase</option>
                      <option value="Three">Three Phase</option>
                    </select>,
                  )}
                  {af(
                    "Rated Voltage",
                    <input
                      type="text"
                      value={form.ratedVoltage}
                      onChange={(e) => setField("ratedVoltage", e.target.value)}
                      placeholder="e.g. 230V"
                    />,
                  )}
                  {af(
                    "Rated Current",
                    <input
                      type="text"
                      value={form.ratedCurrent}
                      onChange={(e) => setField("ratedCurrent", e.target.value)}
                      placeholder="e.g. 8.5A"
                    />,
                  )}
                  {af(
                    "Frequency",
                    <input
                      type="text"
                      value={form.ratedFrequency}
                      onChange={(e) =>
                        setField("ratedFrequency", e.target.value)
                      }
                      placeholder="50Hz"
                    />,
                  )}
                  {af(
                    "Rated RPM",
                    <input
                      type="number"
                      value={form.ratedRPM}
                      onChange={(e) => setField("ratedRPM", e.target.value)}
                      placeholder="1440"
                    />,
                  )}
                  {af(
                    "Power (HP)",
                    <input
                      type="number"
                      value={form.ratedPowerHP}
                      onChange={(e) => setField("ratedPowerHP", e.target.value)}
                      step="0.01"
                      placeholder="e.g. 1.5"
                    />,
                  )}
                  {af(
                    "Insulation Class",
                    <select
                      value={form.insulationClass}
                      onChange={(e) =>
                        setField("insulationClass", e.target.value)
                      }
                    >
                      <option value="">—</option>
                      <option>A</option>
                      <option>B</option>
                      <option>F</option>
                      <option>H</option>
                    </select>,
                  )}
                  {af(
                    "Efficiency",
                    <input
                      type="text"
                      value={form.efficiency}
                      onChange={(e) => setField("efficiency", e.target.value)}
                      placeholder="e.g. 82%"
                    />,
                  )}
                  {af(
                    "Frame Size",
                    <input
                      type="text"
                      value={form.frameSize}
                      onChange={(e) => setField("frameSize", e.target.value)}
                      placeholder="e.g. D90S"
                    />,
                  )}
                </div>
              </div>

              {/* Winding */}
              <div className="a-form-section">
                <div className="a-form-section-title">
                  🔩 Winding / Coil Details
                </div>
                <div className="a-form-grid">
                  {af(
                    "Stator Slots",
                    <input
                      type="number"
                      value={form.statorSlots}
                      onChange={(e) => setField("statorSlots", e.target.value)}
                      placeholder="e.g. 36"
                    />,
                  )}
                  {af(
                    "Slot Length",
                    <input
                      type="text"
                      value={form.slotLength}
                      onChange={(e) => setField("slotLength", e.target.value)}
                      placeholder="e.g. 42mm"
                    />,
                  )}
                  {af(
                    "Total Coil Turns",
                    <input
                      type="number"
                      value={form.totalCoilTurns}
                      onChange={(e) =>
                        setField("totalCoilTurns", e.target.value)
                      }
                      placeholder="e.g. 720"
                    />,
                  )}
                  {af(
                    "Turns Per Coil",
                    <input
                      type="number"
                      value={form.turnsPerCoil}
                      onChange={(e) => setField("turnsPerCoil", e.target.value)}
                      placeholder="e.g. 90"
                    />,
                  )}
                  {af(
                    "Coil Pitch",
                    <input
                      type="text"
                      value={form.coilPitch}
                      onChange={(e) => setField("coilPitch", e.target.value)}
                      placeholder="e.g. 1-8"
                    />,
                  )}
                  {af(
                    "Winding Connection",
                    <input
                    type="text"
                    placeholder="e.g. lap"
                      value={form.windingConnection}
                      onChange={(e) =>
                        setField("windingConnection", e.target.value)
                      }
                    />
                  )}
                  {af(
                    "Wire Type",
                    <select
                      value={form.coilWireType}
                      onChange={(e) => setField("coilWireType", e.target.value)}
                    >
                      <option value="">—</option>
                      <option>Copper</option>
                      <option>Aluminium</option>
                    </select>,
                  )}
                  {af(
                    "Wire Gauge (SWG)",
                    <input
                      type="text"
                      value={form.wireGauge}
                      onChange={(e) => setField("wireGauge", e.target.value)}
                      placeholder="e.g. 22 SWG"
                    />,
                  )}
                  {af(
                    "Coil Weight (kg)",
                    <input
                      type="number"
                      value={form.coilWeight}
                      onChange={(e) => setField("coilWeight", e.target.value)}
                      step="0.01"
                      placeholder="e.g. 1.15"
                    />,
                  )}
                </div>
                <div style={{ marginTop: "14px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "9px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: ".67rem",
                        fontWeight: 700,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: ".6px",
                      }}
                    >
                      🔢 Turns per Pitch
                    </span>
                    <button
                      type="button"
                      className="a-btn a-btn-ghost a-btn-sm"
                      onClick={addPitchRow}
                    >
                      ➕ Add Pitch
                    </button>
                  </div>
                  {form.pitchTurns.map((pt, i) => (
                    <div key={i} className="a-pitch-row">
                      <input
                        className="a-pitch-input"
                        type="text"
                        value={pt.pitch}
                        onChange={(e) =>
                          setPitchField(i, "pitch", e.target.value)
                        }
                        placeholder="Pitch (e.g. 1-8)"
                      />
                      <input
                        className="a-pitch-turns"
                        type="number"
                        value={pt.turns}
                        onChange={(e) =>
                          setPitchField(i, "turns", e.target.value)
                        }
                        placeholder="Turns"
                      />
                      <button
                        type="button"
                        className="a-btn a-btn-danger a-btn-sm"
                        onClick={() => removePitchRow(i)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phase-specific */}
              <div className="a-form-section">
                <div className="a-form-section-title">
                  🔌 Phase-Specific Data
                </div>
                <div className="a-phase-toggle">
                  <button
                    type="button"
                    className={`a-phase-btn${form.phase === "Single" ? " active" : ""}`}
                    onClick={() => setField("phase", "Single")}
                  >
                    🔌 Single Phase
                  </button>
                  <button
                    type="button"
                    className={`a-phase-btn${form.phase === "Three" ? " active" : ""}`}
                    onClick={() => setField("phase", "Three")}
                  >
                    ⚡ Three Phase
                  </button>
                </div>
                {form.phase === "Single" && (
                  <div className="a-form-grid">
                    {af(
                      "Starting Coil Turns",
                      <input
                        type="number"
                        value={form.startingCoilTurns}
                        onChange={(e) =>
                          setField("startingCoilTurns", e.target.value)
                        }
                        placeholder="e.g. 480"
                      />,
                    )}
                    {af(
                      "Running Coil Turns",
                      <input
                        type="number"
                        value={form.runningCoilTurns}
                        onChange={(e) =>
                          setField("runningCoilTurns", e.target.value)
                        }
                        placeholder="e.g. 240"
                      />,
                    )}
                    {af(
                      "Starting Coil Weight (kg)",
                      <input
                        type="number"
                        value={form.startingCoilWeight}
                        onChange={(e) =>
                          setField("startingCoilWeight", e.target.value)
                        }
                        step="0.01"
                        placeholder="e.g. 0.42"
                      />,
                    )}
                    {af(
                      "Running Coil Weight (kg)",
                      <input
                        type="number"
                        value={form.runningCoilWeight}
                        onChange={(e) =>
                          setField("runningCoilWeight", e.target.value)
                        }
                        step="0.01"
                        placeholder="e.g. 0.73"
                      />,
                    )}
                    {af(
                      "Capacitor Value",
                      <input
                        type="text"
                        value={form.capacitorValue}
                        onChange={(e) =>
                          setField("capacitorValue", e.target.value)
                        }
                        placeholder="e.g. 25µF / 4µF"
                      />,
                    )}
                  </div>
                )}
                {form.phase === "Three" && (
                  <div className="a-form-grid">
                    {af(
                      "Line Voltage",
                      <input
                        type="text"
                        value={form.lineVoltage}
                        onChange={(e) =>
                          setField("lineVoltage", e.target.value)
                        }
                        placeholder="e.g. 415V"
                      />,
                    )}
                    {af(
                      "Phase Voltage",
                      <input
                        type="text"
                        value={form.phaseVoltage}
                        onChange={(e) =>
                          setField("phaseVoltage", e.target.value)
                        }
                        placeholder="e.g. 240V"
                      />,
                    )}
                    {af(
                      "Line Current",
                      <input
                        type="number"
                        value={form.lineCurrent}
                        onChange={(e) =>
                          setField("lineCurrent", e.target.value)
                        }
                        step="0.01"
                        placeholder="e.g. 7.8A"
                      />,
                    )}
                    {af(
                      "Phase Current",
                      <input
                        type="number"
                        value={form.phaseCurrent}
                        onChange={(e) =>
                          setField("phaseCurrent", e.target.value)
                        }
                        step="0.01"
                        placeholder="e.g. 4.5A"
                      />,
                    )}
                    {af(
                      "Star/Delta Connection",
                      <select
                        value={form.starDeltaConn}
                        onChange={(e) =>
                          setField("starDeltaConn", e.target.value)
                        }
                      >
                        <option value="">—</option>
                        <option>Star</option>
                        <option>Delta</option>
                        <option>Star-Delta</option>
                      </select>,
                    )}
                  </div>
                )}
              </div>

              {/* Mechanical */}
              <div className="a-form-section">
                <div className="a-form-section-title">
                  ⚙️ Mechanical Details
                </div>
                <div className="a-form-grid">
                  {af(
                    "Shaft Diameter",
                    <input
                      type="text"
                      value={form.shaftDiameter}
                      onChange={(e) =>
                        setField("shaftDiameter", e.target.value)
                      }
                      placeholder="e.g. 28mm"
                    />,
                  )}
                  {af(
                    "Shaft Length",
                    <input
                      type="text"
                      value={form.shaftLength}
                      onChange={(e) => setField("shaftLength", e.target.value)}
                      placeholder="e.g. 60mm"
                    />,
                  )}
                  {af(
                    "Bearing (Front)",
                    <input
                      type="text"
                      value={form.bearingFront}
                      onChange={(e) => setField("bearingFront", e.target.value)}
                      placeholder="e.g. 6205ZZ"
                    />,
                  )}
                  {af(
                    "Bearing (Rear)",
                    <input
                      type="text"
                      value={form.bearingRear}
                      onChange={(e) => setField("bearingRear", e.target.value)}
                      placeholder="e.g. 6204ZZ"
                    />,
                  )}
                  {af(
                    "Fan Size",
                    <input
                      type="text"
                      value={form.fanSize}
                      onChange={(e) => setField("fanSize", e.target.value)}
                      placeholder="e.g. 180mm"
                    />,
                  )}
                  {af(
                    "Fan Cover Size",
                    <input
                      type="text"
                      value={form.fanCoverSize}
                      onChange={(e) => setField("fanCoverSize", e.target.value)}
                      placeholder="e.g. 195mm"
                    />,
                  )}
                  {af(
                    "Motor Weight (kg)",
                    <input
                      type="number"
                      value={form.motorWeight}
                      onChange={(e) => setField("motorWeight", e.target.value)}
                      step="0.1"
                      placeholder="e.g. 12.5"
                    />,
                  )}
                  {af(
                    "Body Material",
                    <input
                      type="text"
                      value={form.bodyMaterial}
                      onChange={(e) => setField("bodyMaterial", e.target.value)}
                      placeholder="e.g. Cast Iron"
                    />,
                  )}
                </div>
              </div>

              {/* Repair History */}
              <div className="a-form-section">
                <div className="a-form-section-title">🔧 Repair History</div>
                <div className="a-form-grid">
                  {af(
                    "Old Coil Weight (kg)",
                    <input
                      type="number"
                      value={form.oldCoilWeight}
                      onChange={(e) =>
                        setField("oldCoilWeight", e.target.value)
                      }
                      step="0.01"
                      placeholder="Before rewinding"
                    />,
                  )}
                  {af(
                    "New Coil Weight (kg)",
                    <input
                      type="number"
                      value={form.newCoilWeight}
                      onChange={(e) =>
                        setField("newCoilWeight", e.target.value)
                      }
                      step="0.01"
                      placeholder="After rewinding"
                    />,
                  )}
                  <div className="a-field full">
                    <label>Notes</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setField("notes", e.target.value)}
                      placeholder="Any additional notes about this motor..."
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="a-modal-foot">
              <button
                className="a-btn a-btn-ghost"
                onClick={() => setMotorModal(false)}
              >
                Cancel
              </button>
              <button className="a-btn a-btn-primary" onClick={saveMotor}>
                💾 Save Motor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {detailModal && detailMotor && (
        <div
          className="a-modal-overlay"
          onClick={(e) => {
            if (e.target.classList.contains("a-modal-overlay"))
              setDetailModal(false);
          }}
        >
          <div className="a-modal">
            <div className="a-modal-head">
              <h2>{detailMotor.brand} — Motor Details</h2>
              <button
                className="a-modal-x"
                onClick={() => setDetailModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="a-modal-body">{renderDetailBody(detailMotor)}</div>
            <div className="a-modal-foot">
              <button
                className="a-btn a-btn-primary"
                onClick={() => {
                  setDetailModal(false);
                  openEditModal(detailMotor._id);
                }}
              >
                ✏️ Edit
              </button>
              <button
                className="a-btn a-btn-ghost"
                onClick={() => setDetailModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE */}
      {confirmModal && (
        <div className="a-modal-overlay">
          <div className="a-confirm-box">
            <div className="a-confirm-icon">🗑️</div>
            <h3>Delete Motor?</h3>
            <p>
              This motor record will be permanently deleted. This action cannot
              be undone.
            </p>
            <div className="a-confirm-btns">
              <button
                className="a-btn a-btn-ghost"
                onClick={() => setConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                className="a-btn a-btn-primary"
                style={{ background: "#ef4444", borderColor: "#ef4444" }}
                onClick={doDelete}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster toasts={toasts} />
    </div>
  );
}
