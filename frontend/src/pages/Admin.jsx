import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getMotors, getMotorById, createMotor, updateMotor, deleteMotor,
  getStats, changePassword as apiChangePassword
} from '../api';
import '../admin.css';

const LIMIT = 15;

const emptyForm = () => ({
  brand: '', manufacturer: '', motorType: '', phase: 'Single',
  ratedVoltage: '', ratedCurrent: '', ratedFrequency: '', ratedRPM: '',
  ratedPowerHP: '', insulationClass: '', efficiency: '', frameSize: '',
  runningCurrent: '', statorSlots: '', slotLength: '', totalCoilTurns: '',
  turnsPerCoil: '', coilPitch: '', windingConnection: '', coilWireType: '',
  wireGauge: '', coilWeight: '', pitchTurns: [],
  startingCoilTurns: '', runningCoilTurns: '', startingCoilWeight: '',
  runningCoilWeight: '', capacitorValue: '',
  lineVoltage: '', phaseVoltage: '', lineCurrent: '', phaseCurrent: '', starDeltaConn: '',
  shaftDiameter: '', shaftLength: '', bearingFront: '', bearingRear: '',
  fanSize: '', fanCoverSize: '', motorWeight: '', bodyMaterial: '',
  oldCoilWeight: '', newCoilWeight: '', notes: '',
});

function Toast({ toasts }) {
  return (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type === 'error' ? 'err' : t.type === 'warn' ? 'warn' : ''}`}>
          {t.type === 'error' ? '❌' : t.type === 'warn' ? '⚠️' : '✅'} {t.msg}
        </div>
      ))}
    </div>
  );
}

function Admin() {
  const navigate = useNavigate();

  // UI state
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Data
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [motors, setMotors] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modals
  const [motorModal, setMotorModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm());

  const [detailModal, setDetailModal] = useState(false);
  const [detailMotor, setDetailMotor] = useState(null);

  const [confirmModal, setConfirmModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Settings
  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [conPass, setConPass] = useState('');

  const toast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };

  // Auth guard
  useEffect(() => {
    if (!localStorage.getItem('srew_token')) navigate('/login');
  }, [navigate]);

  const loadStats = useCallback(async () => {
    try {
      const d = await getStats();
      setStats(d.stats);
      setRecent(d.recent);
    } catch (e) { console.error(e); }
  }, []);

  const loadMotors = useCallback(async () => {
    try {
      const d = await getMotors({ search, motorType: typeFilter, phase: phaseFilter, page, limit: LIMIT });
      setMotors(d.motors);
      setPagination(d.pagination);
    } catch (e) { console.error(e); }
  }, [search, typeFilter, phaseFilter, page]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { if (activePage === 'motors') loadMotors(); }, [activePage, loadMotors]);

  // Search debounce
  useEffect(() => {
    if (activePage !== 'motors') return;
    const t = setTimeout(() => { setPage(1); loadMotors(); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

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
        ...Object.fromEntries(Object.entries(m).map(([k, v]) => [k, v ?? ''])),
        pitchTurns: m.pitchTurns || [],
      });
      setMotorModal(true);
    } catch (e) { toast('Failed to load motor', 'error'); }
  };

  const openDetail = async (id) => {
    try {
      const d = await getMotorById(id);
      setDetailMotor(d.motor);
      setDetailModal(true);
    } catch (e) { toast('Failed to load motor', 'error'); }
  };

  const saveMotor = async () => {
    if (!form.brand || !form.motorType) { toast('Brand and Motor Type are required.', 'error'); return; }
    try {
      const payload = { ...form };
      // Convert numeric fields
      ['ratedRPM', 'ratedPowerHP', 'statorSlots', 'totalCoilTurns', 'turnsPerCoil', 'coilWeight',
        'startingCoilTurns', 'runningCoilTurns', 'startingCoilWeight', 'runningCoilWeight',
        'motorWeight', 'oldCoilWeight', 'newCoilWeight', 'lineCurrent', 'phaseCurrent'
      ].forEach(k => { if (payload[k] !== '') payload[k] = Number(payload[k]); else delete payload[k]; });
      // Clean empty strings
      Object.keys(payload).forEach(k => { if (payload[k] === '') delete payload[k]; });

      if (editId) {
        await updateMotor(editId, payload);
        toast('Motor updated successfully!');
      } else {
        await createMotor(payload);
        toast('Motor added successfully!');
      }
      setMotorModal(false);
      loadMotors();
      loadStats();
    } catch (e) { toast(e.message, 'error'); }
  };

  const confirmDelete = (id) => { setDeleteId(id); setConfirmModal(true); };
  const doDelete = async () => {
    try {
      await deleteMotor(deleteId);
      toast('Motor deleted.', 'warn');
      setConfirmModal(false);
      loadMotors();
      loadStats();
    } catch (e) { toast(e.message, 'error'); }
  };

  const handleChangePassword = async () => {
    if (!curPass || !newPass || !conPass) { toast('All fields required.', 'error'); return; }
    if (newPass !== conPass) { toast('New passwords do not match.', 'error'); return; }
    try {
      await apiChangePassword(curPass, newPass);
      toast('Password changed!');
      setCurPass(''); setNewPass(''); setConPass('');
    } catch (e) { toast(e.message, 'error'); }
  };

  const logout = () => {
    localStorage.removeItem('srew_token');
    navigate('/login');
  };

  const navItem = (id, icon, label) => (
    <div className={`nav-item ${activePage === id ? 'active' : ''}`}
      onClick={() => { setActivePage(id); setSidebarOpen(false); }}>
      <span className="ni-icon">{icon}</span> {label}
    </div>
  );

  const renderStats = () => {
    if (!stats) return null;
    const items = [
      { icon: '⚡', num: stats.total, label: 'Total Motors', c: 'c1' },
      { icon: '🔵', num: stats.acCount, label: 'AC Motors', c: 'c2' },
      { icon: '🔴', num: stats.dcCount, label: 'DC Motors', c: 'c3' },
      { icon: '🔌', num: stats.singleCount, label: 'Single Phase', c: 'c4' },
      { icon: '⚙️', num: stats.threeCount, label: 'Three Phase', c: 'c5' },
      { icon: '🏷️', num: stats.brandCount, label: 'Brands', c: 'c6' },
    ];
    return items.map(s => (
      <div key={s.label} className={`stat-card ${s.c}`}>
        <div className="sc-icon">{s.icon}</div>
        <div className="sc-num">{s.num}</div>
        <div className="sc-label">{s.label}</div>
      </div>
    ));
  };

  const renderMotorRow = (m) => (
    <tr key={m._id}>
      <td><div className="motor-name-cell"><strong>{m.brand}</strong><small>{m.manufacturer}</small></div></td>
      <td>{m.frameSize || '—'}</td>
      <td><strong>{m.ratedPowerHP || '—'}</strong></td>
      <td>{m.ratedRPM || '—'}</td>
      <td>{m.ratedVoltage || '—'}</td>
      <td><span className={`badge badge-${m.motorType?.toLowerCase()}`}>{m.motorType}</span></td>
      <td><span className={`badge badge-${m.phase === 'Single' ? '1ph' : '3ph'}`}>{m.phase === 'Single' ? '1Ph' : '3Ph'}</span></td>
      <td>{m.wireGauge || '—'}</td>
      <td>{m.turnsPerCoil || '—'}</td>
      <td>{m.coilWeight ? m.coilWeight + 'kg' : '—'}</td>
      <td>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button className="btn btn-light btn-sm" onClick={() => openDetail(m._id)}>👁</button>
          <button className="btn btn-orange btn-sm" onClick={() => openEditModal(m._id)}>✏️</button>
          <button className="btn btn-red btn-sm" onClick={() => confirmDelete(m._id)}>🗑</button>
        </div>
      </td>
    </tr>
  );

  const renderDetailBody = (m) => {
    if (!m) return null;
    const di = (l, v) => v ? <div key={l} className="detail-item"><div className="di-label">{l}</div><div className="di-val">{v}</div></div> : null;
    return (
      <div>
        <div className="detail-section">
          <div className="detail-section-title">🏷️ Nameplate</div>
          <div className="detail-grid">
            {[di('Brand', m.brand), di('Manufacturer', m.manufacturer), di('Type', m.motorType), di('Phase', m.phase), di('Voltage', m.ratedVoltage), di('Current', m.ratedCurrent), di('RPM', m.ratedRPM), di('HP', m.ratedPowerHP), di('kW', m.ratedPowerKW), di('Frame', m.frameSize), di('Insulation', m.insulationClass), di('Efficiency', m.efficiency)]}
          </div>
        </div>
        <div className="detail-section">
          <div className="detail-section-title">🔩 Winding</div>
          <div className="detail-grid">
            {[di('Wire Gauge', m.wireGauge), di('Turns/Coil', m.turnsPerCoil), di('Total Turns', m.totalCoilTurns), di('Coil Wt.', m.coilWeight ? m.coilWeight + ' kg' : null), di('Wire Type', m.coilWireType), di('Connection', m.windingConnection), di('Coil Pitch', m.coilPitch), di('Stator Slots', m.statorSlots)]}
          </div>
        </div>
        {m.phase === 'Single' && (
          <div className="detail-section">
            <div className="detail-section-title">🔌 Single Phase</div>
            <div className="detail-grid">
              {[di('Start Turns', m.startingCoilTurns), di('Run Turns', m.runningCoilTurns), di('Start Wt.', m.startingCoilWeight ? m.startingCoilWeight + ' kg' : null), di('Run Wt.', m.runningCoilWeight ? m.runningCoilWeight + ' kg' : null), di('Capacitor', m.capacitorValue)]}
            </div>
          </div>
        )}
        {m.phase === 'Three' && (
          <div className="detail-section">
            <div className="detail-section-title">⚡ Three Phase</div>
            <div className="detail-grid">
              {[di('Line Voltage', m.lineVoltage), di('Phase Voltage', m.phaseVoltage), di('Line Current', m.lineCurrent), di('Phase Current', m.phaseCurrent), di('Connection', m.starDeltaConn)]}
            </div>
          </div>
        )}
        <div className="detail-section">
          <div className="detail-section-title">⚙️ Mechanical</div>
          <div className="detail-grid">
            {[di('Shaft Dia.', m.shaftDiameter), di('Shaft Len.', m.shaftLength), di('Bearing F.', m.bearingFront), di('Bearing R.', m.bearingRear), di('Fan Size', m.fanSize), di('Body', m.bodyMaterial), di('Weight', m.motorWeight ? m.motorWeight + ' kg' : null)]}
          </div>
        </div>
        {m.notes && (
          <div className="detail-section">
            <div className="detail-section-title">🔧 Notes</div>
            <div style={{ padding: '12px', background: '#f8fafd', borderRadius: '10px', fontSize: '.88rem', lineHeight: 1.7 }}>{m.notes}</div>
          </div>
        )}
      </div>
    );
  };

  const addPitchRow = () => setForm(f => ({ ...f, pitchTurns: [...f.pitchTurns, { pitch: '', turns: '' }] }));
  const removePitchRow = (i) => setForm(f => ({ ...f, pitchTurns: f.pitchTurns.filter((_, idx) => idx !== i) }));
  const setPitchField = (i, key, val) => setForm(f => {
    const arr = [...f.pitchTurns];
    arr[i] = { ...arr[i], [key]: val };
    return { ...f, pitchTurns: arr };
  });

  const inp = (id, placeholder, type = 'text') => (
    <div className="fg">
      <input type={type} value={form[id] ?? ''} onChange={e => setField(id, e.target.value)} placeholder={placeholder} />
    </div>
  );

  const fg = (label, children) => (
    <div className="fg">
      <label>{label}</label>
      {children}
    </div>
  );

  return (
    <>
      <div className="app-wrap">
        {sidebarOpen && <div className="sidebar-overlay open" onClick={() => setSidebarOpen(false)} />}

        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`} id="adminSidebar">
          <div className="sidebar-header">
            <div className="sidebar-logo">⚡ SREW Admin<span>Motor Data System</span></div>
            <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>✕</button>
          </div>
          <div className="sidebar-nav">
            <div className="nav-section">Main</div>
            {navItem('dashboard', '📊', 'Dashboard')}
            {navItem('motors', '⚡', 'Motors')}
            <div className="nav-section">Data</div>
            {navItem('settings', '⚙️', 'Settings')}
            {navItem('help', '❓', 'Help & Guide')}
          </div>
          <div className="sidebar-footer">
            <div className="sidebar-user">
              <div className="su-avatar">SR</div>
              <div className="su-info">
                <div className="su-name">Shree Ram Electric Works</div>
                <div className="su-role">Administrator</div>
              </div>
            </div>
            <button className="btn-logout" onClick={logout}>🚪 Logout</button>
          </div>
        </nav>

        <div className="main">
          <div className="topbar">
            <button className="topbar-hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
            <div className="topbar-title">⚡ <span>Shree Ram</span> Electric Works</div>
            <div className="topbar-right">
              <a href="/" className="view-site-btn">🌐 Catalogue</a>
            </div>
          </div>

          {/* DASHBOARD */}
          <div className={`page-content ${activePage === 'dashboard' ? 'active' : ''}`}>
            <div className="stats-grid">{renderStats()}</div>
            <div className="table-card">
              <div className="table-toolbar"><h3>🕐 Recently Added Motors</h3></div>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr><th>Motor</th><th>Brand</th><th>HP</th><th>RPM</th><th>Phase</th><th>Type</th></tr>
                  </thead>
                  <tbody>
                    {recent.map(m => (
                      <tr key={m._id}>
                        <td>{m.frameSize || '—'}</td>
                        <td>{m.brand}</td>
                        <td>{m.ratedPowerHP || '—'}</td>
                        <td>{m.ratedRPM || '—'}</td>
                        <td><span className={`badge badge-${m.phase === 'Single' ? '1ph' : '3ph'}`}>{m.phase === 'Single' ? '1Ph' : '3Ph'}</span></td>
                        <td><span className={`badge badge-${m.motorType?.toLowerCase()}`}>{m.motorType}</span></td>
                      </tr>
                    ))}
                    {recent.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px' }}>No motors yet. Add your first motor!</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* MOTORS */}
          <div className={`page-content ${activePage === 'motors' ? 'active' : ''}`}>
            <div className="table-card">
              <div className="table-toolbar">
                <h3>⚡ All Motors</h3>
                <input type="text" className="search-input" placeholder="Search motors..." value={search} onChange={e => setSearch(e.target.value)} />
                <select className="sel-filter" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
                  <option value="">All Types</option><option value="AC">AC</option><option value="DC">DC</option>
                </select>
                <select className="sel-filter" value={phaseFilter} onChange={e => { setPhaseFilter(e.target.value); setPage(1); }}>
                  <option value="">All Phases</option><option value="Single">Single Phase</option><option value="Three">Three Phase</option>
                </select>
                <button className="btn btn-orange" onClick={openAddModal}>➕ Add Motor</button>
              </div>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr><th>Brand</th><th>Frame</th><th>HP</th><th>RPM</th><th>Voltage</th><th>Type</th><th>Phase</th><th>Gauge</th><th>Turns</th><th>Coil Wt</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {motors.map(renderMotorRow)}
                    {motors.length === 0 && <tr><td colSpan={11} style={{ textAlign: 'center', color: 'var(--muted)', padding: '32px' }}>No motors found.</td></tr>}
                  </tbody>
                </table>
              </div>
              {pagination.totalPages > 1 && (
                <div className="pagination">
                  <span className="pg-info">{pagination.total} total</span>
                  <button className="pg-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
                  {Array.from({ length: pagination.totalPages }, (_, i) => (
                    <button key={i + 1} className={`pg-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
                  ))}
                  <button className="pg-btn" onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}>›</button>
                </div>
              )}
            </div>
          </div>

          {/* SETTINGS */}
          <div className={`page-content ${activePage === 'settings' ? 'active' : ''}`}>
            <div className="settings-card">
              <h3>🔐 Change Password</h3>
              <div className="fg" style={{ marginBottom: '12px' }}>
                <label>Current Password</label>
                <input type="password" value={curPass} onChange={e => setCurPass(e.target.value)} placeholder="Current password" />
              </div>
              <div className="fg" style={{ marginBottom: '12px' }}>
                <label>New Password</label>
                <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Min 6 characters" />
              </div>
              <div className="fg" style={{ marginBottom: '12px' }}>
                <label>Confirm New Password</label>
                <input type="password" value={conPass} onChange={e => setConPass(e.target.value)} placeholder="Repeat new password" />
              </div>
              <button className="btn btn-orange" onClick={handleChangePassword}>🔐 Change Password</button>
            </div>
          </div>

          {/* HELP */}
          <div className={`page-content ${activePage === 'help' ? 'active' : ''}`}>
            <div className="help-hero">
              <div className="help-hero-icon">📖</div>
              <h2>Help & User Guide</h2>
              <p>Everything you need to know about managing your motor data</p>
            </div>
            <div className="help-grid">
              {[
                { n: 1, t: '➕ Adding a Motor', p: 'Go to Motors page → click "Add Motor". Fill in the nameplate details, select phase (Single/Three), enter winding data and mechanical details. Click Save.' },
                { n: 2, t: '✏️ Editing a Motor', p: 'In the Motors table, click the ✏️ button on any row to open the edit form pre-filled with existing data. Make changes and click Save Motor.' },
                { n: 3, t: '🗑️ Deleting a Motor', p: 'Click the 🗑 button next to any motor. A confirmation dialog will appear. Confirm to permanently delete the record.' },
                { n: 4, t: '🔍 Searching & Filtering', p: 'Use the search box and dropdowns in the Motors table to filter by brand, type, or phase. Results update in real time.' },
                { n: 5, t: '🔐 Change Password', p: 'Go to Settings to change your admin password. Enter current password and new password (min 6 chars).' },
                { n: 6, t: '🌐 View Catalogue', p: 'Click "Catalogue" in the topbar to see the public-facing motor catalogue that customers see.' },
              ].map(h => (
                <div key={h.n} className="help-card">
                  <div className="hc-num">{h.n}</div>
                  <h3>{h.t}</h3>
                  <p>{h.p}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ADD/EDIT MOTOR MODAL */}
      {motorModal && (
        <div className="modal-bg" onClick={e => { if (e.target.classList.contains('modal-bg')) setMotorModal(false); }}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editId ? '✏️ Edit Motor' : '➕ Add New Motor'}</h2>
              <button className="modal-close" onClick={() => setMotorModal(false)}>✕</button>
            </div>
            <div className="modal-body">

              {/* Nameplate */}
              <div className="form-section">
                <div className="form-section-title">🏷️ Nameplate Details</div>
                <div className="form-grid">
                  {fg('Brand *', <input type="text" value={form.brand} onChange={e => setField('brand', e.target.value)} placeholder="e.g. Crompton" />)}
                  {fg('Manufacturer', <input type="text" value={form.manufacturer} onChange={e => setField('manufacturer', e.target.value)} placeholder="Full company name" />)}
                  {fg('Motor Type *', <select value={form.motorType} onChange={e => setField('motorType', e.target.value)}><option value="">Select type</option><option value="AC">AC</option><option value="DC">DC</option></select>)}
                  {fg('Phase *', <select value={form.phase} onChange={e => setField('phase', e.target.value)}><option value="Single">Single Phase</option><option value="Three">Three Phase</option></select>)}
                  {fg('Rated Voltage', <input type="text" value={form.ratedVoltage} onChange={e => setField('ratedVoltage', e.target.value)} placeholder="e.g. 230V" />)}
                  {fg('Rated Current', <input type="text" value={form.ratedCurrent} onChange={e => setField('ratedCurrent', e.target.value)} placeholder="e.g. 8.5A" />)}
                  {fg('Frequency', <input type="text" value={form.ratedFrequency} onChange={e => setField('ratedFrequency', e.target.value)} placeholder="50Hz" />)}
                  {fg('Rated RPM', <input type="number" value={form.ratedRPM} onChange={e => setField('ratedRPM', e.target.value)} placeholder="1440" />)}
                  {fg('Power (HP)', <input type="number" value={form.ratedPowerHP} onChange={e => setField('ratedPowerHP', e.target.value)} step="0.01" placeholder="e.g. 1.5" />)}
                  {fg('Insulation Class', <select value={form.insulationClass} onChange={e => setField('insulationClass', e.target.value)}><option value="">—</option><option>A</option><option>B</option><option>F</option><option>H</option></select>)}
                  {fg('Efficiency', <input type="text" value={form.efficiency} onChange={e => setField('efficiency', e.target.value)} placeholder="e.g. 82%" />)}
                  {fg('Frame Size', <input type="text" value={form.frameSize} onChange={e => setField('frameSize', e.target.value)} placeholder="e.g. D90S" />)}
                </div>
              </div>

              {/* Winding */}
              <div className="form-section">
                <div className="form-section-title">🔩 Winding / Coil Details</div>
                <div className="form-grid">
                  {fg('Stator Slots', <input type="number" value={form.statorSlots} onChange={e => setField('statorSlots', e.target.value)} placeholder="e.g. 36" />)}
                  {fg('Slot Length', <input type="text" value={form.slotLength} onChange={e => setField('slotLength', e.target.value)} placeholder="e.g. 42mm" />)}
                  {fg('Total Coil Turns', <input type="number" value={form.totalCoilTurns} onChange={e => setField('totalCoilTurns', e.target.value)} placeholder="e.g. 720" />)}
                  {fg('Turns Per Coil', <input type="number" value={form.turnsPerCoil} onChange={e => setField('turnsPerCoil', e.target.value)} placeholder="e.g. 90" />)}
                  {fg('Coil Pitch', <input type="text" value={form.coilPitch} onChange={e => setField('coilPitch', e.target.value)} placeholder="e.g. 1-8" />)}
                  {fg('Winding Connection', <select value={form.windingConnection} onChange={e => setField('windingConnection', e.target.value)}><option value="">—</option><option>Star</option><option>Delta</option><option>Concentric</option><option>Lap</option></select>)}
                  {fg('Wire Type', <select value={form.coilWireType} onChange={e => setField('coilWireType', e.target.value)}><option value="">—</option><option>Copper</option><option>Aluminium</option></select>)}
                  {fg('Wire Gauge (SWG)', <input type="text" value={form.wireGauge} onChange={e => setField('wireGauge', e.target.value)} placeholder="e.g. 22 SWG" />)}
                  {fg('Coil Weight (kg)', <input type="number" value={form.coilWeight} onChange={e => setField('coilWeight', e.target.value)} step="0.01" placeholder="e.g. 1.15" />)}
                </div>
                {/* Pitch Turns */}
                <div style={{ marginTop: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <label style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.6px' }}>🔢 Turns per Pitch</label>
                    <button type="button" className="btn btn-light btn-sm" onClick={addPitchRow}>➕ Add Pitch</button>
                  </div>
                  {form.pitchTurns.map((pt, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                      <input type="text" value={pt.pitch} onChange={e => setPitchField(i, 'pitch', e.target.value)} placeholder="Pitch (e.g. 1-8)" style={{ flex: 1, padding: '8px 10px', border: '2px solid var(--border)', borderRadius: '8px', fontFamily: 'DM Sans, sans-serif', fontSize: '.86rem', outline: 'none' }} />
                      <input type="number" value={pt.turns} onChange={e => setPitchField(i, 'turns', e.target.value)} placeholder="Turns" style={{ width: '90px', padding: '8px 10px', border: '2px solid var(--border)', borderRadius: '8px', fontFamily: 'DM Sans, sans-serif', fontSize: '.86rem', outline: 'none' }} />
                      <button type="button" className="btn btn-red btn-sm" onClick={() => removePitchRow(i)}>✕</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phase-specific */}
              <div className="form-section">
                <div className="form-section-title">🔌 Phase-Specific Data</div>
                <div className="phase-toggle" style={{ marginBottom: '16px' }}>
                  <button type="button" className={`phase-btn ${form.phase === 'Single' ? 'active' : ''}`} onClick={() => setField('phase', 'Single')}>🔌 Single Phase</button>
                  <button type="button" className={`phase-btn ${form.phase === 'Three' ? 'active' : ''}`} onClick={() => setField('phase', 'Three')}>⚡ Three Phase</button>
                </div>
                {form.phase === 'Single' && (
                  <div className="form-grid">
                    {fg('Starting Coil Turns', <input type="number" value={form.startingCoilTurns} onChange={e => setField('startingCoilTurns', e.target.value)} placeholder="e.g. 480" />)}
                    {fg('Running Coil Turns', <input type="number" value={form.runningCoilTurns} onChange={e => setField('runningCoilTurns', e.target.value)} placeholder="e.g. 240" />)}
                    {fg('Starting Coil Weight (kg)', <input type="number" value={form.startingCoilWeight} onChange={e => setField('startingCoilWeight', e.target.value)} step="0.01" placeholder="e.g. 0.42" />)}
                    {fg('Running Coil Weight (kg)', <input type="number" value={form.runningCoilWeight} onChange={e => setField('runningCoilWeight', e.target.value)} step="0.01" placeholder="e.g. 0.73" />)}
                    {fg('Capacitor Value', <input type="text" value={form.capacitorValue} onChange={e => setField('capacitorValue', e.target.value)} placeholder="e.g. 25µF / 4µF" />)}
                  </div>
                )}
                {form.phase === 'Three' && (
                  <div className="form-grid">
                    {fg('Line Voltage', <input type="text" value={form.lineVoltage} onChange={e => setField('lineVoltage', e.target.value)} placeholder="e.g. 415V" />)}
                    {fg('Phase Voltage', <input type="text" value={form.phaseVoltage} onChange={e => setField('phaseVoltage', e.target.value)} placeholder="e.g. 240V" />)}
                    {fg('Line Current', <input type="text" value={form.lineCurrent} onChange={e => setField('lineCurrent', e.target.value)} placeholder="e.g. 7.8A" />)}
                    {fg('Phase Current', <input type="text" value={form.phaseCurrent} onChange={e => setField('phaseCurrent', e.target.value)} placeholder="e.g. 4.5A" />)}
                    {fg('Star/Delta Connection', <select value={form.starDeltaConn} onChange={e => setField('starDeltaConn', e.target.value)}><option value="">—</option><option>Star</option><option>Delta</option></select>)}
                  </div>
                )}
              </div>

              {/* Mechanical */}
              <div className="form-section">
                <div className="form-section-title">⚙️ Mechanical Details</div>
                <div className="form-grid">
                  {fg('Shaft Diameter', <input type="text" value={form.shaftDiameter} onChange={e => setField('shaftDiameter', e.target.value)} placeholder="e.g. 24mm" />)}
                  {fg('Shaft Length', <input type="text" value={form.shaftLength} onChange={e => setField('shaftLength', e.target.value)} placeholder="e.g. 55mm" />)}
                  {fg('Bearing (Front)', <input type="text" value={form.bearingFront} onChange={e => setField('bearingFront', e.target.value)} placeholder="e.g. 6305" />)}
                  {fg('Bearing (Rear)', <input type="text" value={form.bearingRear} onChange={e => setField('bearingRear', e.target.value)} placeholder="e.g. 6203" />)}
                  {fg('Fan Size', <input type="text" value={form.fanSize} onChange={e => setField('fanSize', e.target.value)} placeholder="e.g. 160mm" />)}
                  {fg('Fan Cover Size', <input type="text" value={form.fanCoverSize} onChange={e => setField('fanCoverSize', e.target.value)} placeholder="e.g. 180mm" />)}
                  {fg('Motor Weight (kg)', <input type="number" value={form.motorWeight} onChange={e => setField('motorWeight', e.target.value)} step="0.1" placeholder="e.g. 11.5" />)}
                  {fg('Body Material', <select value={form.bodyMaterial} onChange={e => setField('bodyMaterial', e.target.value)}><option value="">—</option><option>Cast Iron</option><option>Aluminium</option><option>Steel</option></select>)}
                </div>
              </div>

              {/* Repair */}
              <div className="form-section">
                <div className="form-section-title">🔧 Repair History</div>
                <div className="form-grid">
                  {fg('Old Coil Weight (kg)', <input type="number" value={form.oldCoilWeight} onChange={e => setField('oldCoilWeight', e.target.value)} step="0.01" placeholder="e.g. 1.0" />)}
                  {fg('New Coil Weight (kg)', <input type="number" value={form.newCoilWeight} onChange={e => setField('newCoilWeight', e.target.value)} step="0.01" placeholder="e.g. 1.15" />)}
                </div>
                <div className="fg full" style={{ marginTop: '10px' }}>
                  <label>Notes / Observations</label>
                  <textarea value={form.notes} onChange={e => setField('notes', e.target.value)} placeholder="Any observations, issues found, work done..." />
                </div>
              </div>

            </div>
            <div className="modal-footer">
              <button className="btn btn-light" onClick={() => setMotorModal(false)}>Cancel</button>
              <button className="btn btn-orange" onClick={saveMotor}>💾 Save Motor</button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {detailModal && detailMotor && (
        <div className="modal-bg" onClick={e => { if (e.target.classList.contains('modal-bg')) setDetailModal(false); }}>
          <div className="modal">
            <div className="modal-header">
              <h2>{detailMotor.brand} — Motor Details</h2>
              <button className="modal-close" onClick={() => setDetailModal(false)}>✕</button>
            </div>
            <div className="modal-body">{renderDetailBody(detailMotor)}</div>
            <div className="modal-footer">
              <button className="btn btn-orange" onClick={() => { setDetailModal(false); openEditModal(detailMotor._id); }}>✏️ Edit</button>
              <button className="btn btn-light" onClick={() => setDetailModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE */}
      {confirmModal && (
        <div className="modal-bg">
          <div className="confirm-box">
            <div className="cb-icon">🗑️</div>
            <h3>Delete Motor?</h3>
            <p>This motor will be permanently deleted. This action cannot be undone.</p>
            <div className="confirm-btns">
              <button className="btn btn-light" onClick={() => setConfirmModal(false)}>Cancel</button>
              <button className="btn btn-red" onClick={doDelete}>🗑️ Delete</button>
            </div>
          </div>
        </div>
      )}

      <Toast toasts={toasts} />
    </>
  );
}

export default Admin;
