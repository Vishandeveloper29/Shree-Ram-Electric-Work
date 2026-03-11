import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getMotors, getStats, getBrands, getMotorById } from '../api';
import '../style.css';

const LIMIT = 12;

function Home() {
  const [motors, setMotors] = useState([]);
  const [stats, setStats] = useState(null);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [motorType, setMotorType] = useState('');
  const [phase, setPhase] = useState('');
  const [brand, setBrand] = useState('');
  const [hpMin, setHpMin] = useState('');
  const [hpMax, setHpMax] = useState('');
  const [rpmMin, setRpmMin] = useState('');
  const [rpmMax, setRpmMax] = useState('');
  const [insulationClass, setInsulationClass] = useState('');
  const [sort, setSort] = useState('brand');
  const [page, setPage] = useState(1);

  // Detail modal
  const [selectedMotor, setSelectedMotor] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Sidebar mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const searchTimer = useRef(null);

  const fetchMotors = useCallback(async (params) => {
    setLoading(true);
    try {
      const data = await getMotors(params);
      setMotors(data.motors);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch stats & brands once
  useEffect(() => {
    getStats().then(d => setStats(d.stats)).catch(() => {});
    getBrands().then(d => setBrands(d.brands)).catch(() => {});
  }, []);

  // Fetch motors when filters change
  useEffect(() => {
    const params = { search, motorType, phase, brand, hpMin, hpMax, rpmMin, rpmMax, insulationClass, sort, page, limit: LIMIT };
    fetchMotors(params);
  }, [motorType, phase, brand, hpMin, hpMax, rpmMin, rpmMax, insulationClass, sort, page]);

  // Debounce search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      fetchMotors({ search, motorType, phase, brand, hpMin, hpMax, rpmMin, rpmMax, insulationClass, sort, page: 1, limit: LIMIT });
    }, 400);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  const openDetail = async (id) => {
    try {
      const data = await getMotorById(id);
      setSelectedMotor(data.motor);
      setModalOpen(true);
    } catch (e) { console.error(e); }
  };

  const clearFilters = () => {
    setSearch(''); setMotorType(''); setPhase(''); setBrand('');
    setHpMin(''); setHpMax(''); setRpmMin(''); setRpmMax('');
    setInsulationClass(''); setSort('brand'); setPage(1);
  };

  const renderMotorCard = (m) => (
    <div key={m._id} className="motor-card" onClick={() => openDetail(m._id)}>
      <div className="mc-top">
        <div className="mc-brand-tag">{m.brand}</div>
        <h3>{m.brand} {m.frameSize || ''}</h3>
        <div className="mc-model">{m.manufacturer || ''}</div>
        <div className="mc-badges">
          <span className={`badge badge-${m.motorType?.toLowerCase()}`}>{m.motorType}</span>
          <span className={`badge badge-${m.phase === 'Single' ? '1ph' : '3ph'}`}>{m.phase === 'Single' ? '1 Ph' : '3 Ph'}</span>
        </div>
      </div>
      <div className="mc-specs">
        <div className="spec-row"><span>HP</span><strong className="spec-highlight">{m.ratedPowerHP || '—'} HP</strong></div>
        <div className="spec-row"><span>RPM</span><strong>{m.ratedRPM || '—'}</strong></div>
        <div className="spec-row"><span>Voltage</span><strong>{m.ratedVoltage || '—'}</strong></div>
        <div className="spec-row"><span>Frame</span><strong>{m.frameSize || '—'}</strong></div>
      </div>
      {(m.wireGauge || m.turnsPerCoil || m.coilWeight) && (
        <div className="mc-winding">
          {m.wireGauge && <div className="mw-item"><div className="mw-val">{m.wireGauge}</div><div className="mw-lbl">Wire Gauge</div></div>}
          {m.turnsPerCoil && <div className="mw-item"><div className="mw-val">{m.turnsPerCoil}</div><div className="mw-lbl">Turns/Coil</div></div>}
          {m.coilWeight && <div className="mw-item"><div className="mw-val">{m.coilWeight}kg</div><div className="mw-lbl">Coil Wt</div></div>}
        </div>
      )}
      <div className="mc-footer">
        <span className="mc-cat">{m.bodyMaterial || 'Motor'}</span>
        <button className="view-btn" onClick={e => { e.stopPropagation(); openDetail(m._id); }}>View Details →</button>
      </div>
    </div>
  );

  const renderDetail = (m) => {
    if (!m) return null;
    const field = (label, val) => val ? (
      <div className="di" key={label}>
        <div className="di-l">{label}</div>
        <div className="di-v">{val}</div>
      </div>
    ) : null;

    return (
      <div>
        <div className="detail-hero">
          <div className="dh-left">
            <h2>{m.brand} {m.frameSize || ''}</h2>
            <p>{m.manufacturer || ''}</p>
            <div className="dh-badges">
              <span className={`badge badge-${m.motorType?.toLowerCase()}`}>{m.motorType}</span>
              <span className={`badge badge-${m.phase === 'Single' ? '1ph' : '3ph'}`}>{m.phase === 'Single' ? '1 Phase' : '3 Phase'}</span>
            </div>
          </div>
          <div className="dh-stats">
            {m.ratedPowerHP && <div className="dhs-item"><div className="dhs-val">{m.ratedPowerHP} HP</div><div className="dhs-lbl">Power</div></div>}
            {m.ratedRPM && <div className="dhs-item"><div className="dhs-val">{m.ratedRPM}</div><div className="dhs-lbl">RPM</div></div>}
            {m.ratedVoltage && <div className="dhs-item"><div className="dhs-val">{m.ratedVoltage}</div><div className="dhs-lbl">Voltage</div></div>}
          </div>
        </div>

        <div className="detail-section">
          <div className="ds-title">🏷️ Nameplate Details</div>
          <div className="detail-grid">
            {[field('Brand', m.brand), field('Manufacturer', m.manufacturer), field('Motor Type', m.motorType), field('Phase', m.phase), field('Voltage', m.ratedVoltage), field('Current', m.ratedCurrent), field('Frequency', m.ratedFrequency), field('RPM', m.ratedRPM), field('Power (HP)', m.ratedPowerHP), field('Power (kW)', m.ratedPowerKW), field('Insulation', m.insulationClass), field('Efficiency', m.efficiency), field('Frame Size', m.frameSize)]}
          </div>
        </div>

        <div className="detail-section">
          <div className="ds-title">🔩 Winding Details</div>
          <div className="detail-grid">
            {[field('Wire Gauge', m.wireGauge), field('Coil Weight', m.coilWeight ? m.coilWeight + ' kg' : null), field('Turns/Coil', m.turnsPerCoil), field('Total Turns', m.totalCoilTurns), field('Coil Pitch', m.coilPitch), field('Wire Type', m.coilWireType), field('Winding Conn.', m.windingConnection), field('Stator Slots', m.statorSlots), field('Slot Length', m.slotLength)]}
          </div>
        </div>

        {m.phase === 'Single' && (m.startingCoilTurns || m.capacitorValue) && (
          <div className="detail-section">
            <div className="ds-title">🔌 Single Phase Data</div>
            <div className="detail-grid">
              {[field('Starting Coil Turns', m.startingCoilTurns), field('Running Coil Turns', m.runningCoilTurns), field('Starting Coil Wt.', m.startingCoilWeight ? m.startingCoilWeight + ' kg' : null), field('Running Coil Wt.', m.runningCoilWeight ? m.runningCoilWeight + ' kg' : null), field('Capacitor', m.capacitorValue)]}
            </div>
          </div>
        )}

        {m.phase === 'Three' && (m.lineVoltage || m.starDeltaConn) && (
          <div className="detail-section">
            <div className="ds-title">⚡ Three Phase Data</div>
            <div className="detail-grid">
              {[field('Line Voltage', m.lineVoltage), field('Phase Voltage', m.phaseVoltage), field('Line Current', m.lineCurrent), field('Phase Current', m.phaseCurrent), field('Connection', m.starDeltaConn)]}
            </div>
          </div>
        )}

        <div className="detail-section">
          <div className="ds-title">⚙️ Mechanical Details</div>
          <div className="detail-grid">
            {[field('Shaft Dia.', m.shaftDiameter), field('Shaft Length', m.shaftLength), field('Bearing (Front)', m.bearingFront), field('Bearing (Rear)', m.bearingRear), field('Fan Size', m.fanSize), field('Fan Cover', m.fanCoverSize), field('Motor Weight', m.motorWeight ? m.motorWeight + ' kg' : null), field('Body Material', m.bodyMaterial)]}
          </div>
        </div>

        {m.notes && (
          <div className="detail-section">
            <div className="ds-title">🔧 Notes</div>
            <div style={{ background: '#f8fafd', borderRadius: '10px', padding: '14px', border: '1px solid var(--border)', fontSize: '.9rem', color: 'var(--text)', lineHeight: 1.7 }}>{m.notes}</div>
          </div>
        )}
      </div>
    );
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= pagination.totalPages; i++) {
      pages.push(
        <button key={i} className={`pg-btn ${i === page ? 'active' : ''}`} onClick={() => setPage(i)}>{i}</button>
      );
    }
    return (
      <div className="pagination">
        <button className="pg-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
        {pages}
        <button className="pg-btn" onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}>›</button>
      </div>
    );
  };

  return (
    <>
      <header>
        <div className="header-top">
          <div className="header-logo">⚡ Shree Ram <span>Electric Works</span></div>
          <a href="/admin" className="admin-link">⚙️ Admin Panel</a>
        </div>
      </header>

      <div className="hero">
        <div className="hero-badge">⚡ Motor Data & Winding System</div>
        <h1>Complete Motor <span>Catalogue</span></h1>
        <p>Search, filter and view full technical specifications of all registered motors</p>
        <div className="hero-search-wrap">
          <div className="hero-search">
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by brand, HP, RPM, voltage, frame size..."
            />
            <button onClick={() => fetchMotors({ search, motorType, phase, brand, hpMin, hpMax, rpmMin, rpmMax, insulationClass, sort, page, limit: LIMIT })}>🔍 Search</button>
          </div>
          <div className="hero-chips">
            {[
              { label: 'All Motors', type: '', ph: '' },
              { label: 'AC Motors', type: 'AC', ph: '' },
              { label: 'DC Motors', type: 'DC', ph: '' },
              { label: 'Single Phase', type: '', ph: 'Single' },
              { label: 'Three Phase', type: '', ph: 'Three' },
            ].map(chip => (
              <span key={chip.label}
                className={`hero-chip ${motorType === chip.type && phase === chip.ph ? 'active' : ''}`}
                onClick={() => { setMotorType(chip.type); setPhase(chip.ph); setPage(1); }}>
                {chip.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {stats && (
        <div className="stats-bar">
          {[
            { n: stats.total, l: 'Total Motors' },
            { n: stats.acCount, l: 'AC Motors' },
            { n: stats.dcCount, l: 'DC Motors' },
            { n: stats.singleCount, l: 'Single Phase' },
            { n: stats.threeCount, l: 'Three Phase' },
            { n: stats.brandCount, l: 'Brands' },
          ].map(s => (
            <div key={s.l} className="stat-item">
              <div className="sn">{s.n}</div>
              <div className="sl">{s.l}</div>
            </div>
          ))}
        </div>
      )}

      <div className="main-wrap">
        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} style={{ display: 'block' }} />}

        <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <strong style={{ fontSize: '.92rem', color: 'var(--navy)' }}>⚙️ Filters</strong>
            <button className="clear-btn" style={{ width: 'auto', padding: '5px 12px' }} onClick={clearFilters}>Clear All</button>
          </div>

          <div className="sb-section">
            <div className="sb-title">Motor Type</div>
            {['', 'AC', 'DC'].map(t => (
              <button key={t} className={`sb-btn ${motorType === t ? 'active' : ''}`} onClick={() => { setMotorType(t); setPage(1); }}>
                {t || 'All Types'}
              </button>
            ))}
          </div>

          <div className="sb-section">
            <div className="sb-title">Phase</div>
            {[{ v: '', l: 'All Phases' }, { v: 'Single', l: 'Single Phase' }, { v: 'Three', l: 'Three Phase' }].map(p => (
              <button key={p.v} className={`sb-btn ${phase === p.v ? 'active' : ''}`} onClick={() => { setPhase(p.v); setPage(1); }}>{p.l}</button>
            ))}
          </div>

          <div className="sb-section">
            <div className="sb-title">Brand</div>
            <button className={`sb-btn ${brand === '' ? 'active' : ''}`} onClick={() => { setBrand(''); setPage(1); }}>All Brands</button>
            {brands.map(b => (
              <button key={b} className={`sb-btn ${brand === b ? 'active' : ''}`} onClick={() => { setBrand(b); setPage(1); }}>{b}</button>
            ))}
          </div>

          <div className="sb-section">
            <div className="sb-title">HP Range</div>
            <div className="sb-range">
              <div className="sb-range-row">
                <input type="number" value={hpMin} onChange={e => { setHpMin(e.target.value); setPage(1); }} placeholder="Min" />
                <span>—</span>
                <input type="number" value={hpMax} onChange={e => { setHpMax(e.target.value); setPage(1); }} placeholder="Max" />
              </div>
            </div>
          </div>

          <div className="sb-section">
            <div className="sb-title">RPM Range</div>
            <div className="sb-range">
              <div className="sb-range-row">
                <input type="number" value={rpmMin} onChange={e => { setRpmMin(e.target.value); setPage(1); }} placeholder="Min" />
                <span>—</span>
                <input type="number" value={rpmMax} onChange={e => { setRpmMax(e.target.value); setPage(1); }} placeholder="Max" />
              </div>
            </div>
          </div>

          <div className="sb-section">
            <div className="sb-title">Insulation Class</div>
            <select className="sb-select" value={insulationClass} onChange={e => { setInsulationClass(e.target.value); setPage(1); }}>
              <option value="">All</option>
              {['A', 'B', 'F', 'H'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="content">
          <div className="content-header">
            <div className="result-info">
              {motorType || phase ? `${motorType} ${phase ? phase + ' Phase' : ''} Motors` : 'All Motors'}
              <small>({pagination.total} results)</small>
            </div>
            <select className="sort-select" value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}>
              <option value="brand">Sort: Brand</option>
              <option value="ratedPowerHP">Sort: HP</option>
              <option value="ratedRPM">Sort: RPM</option>
              <option value="frameSize">Sort: Frame</option>
              <option value="added">Sort: Newest</option>
            </select>
          </div>

          <div className="motor-grid">
            {loading ? (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <div className="ei">⏳</div>
                <h3>Loading motors...</h3>
              </div>
            ) : motors.length === 0 ? (
              <div className="empty-state">
                <div className="ei">🔍</div>
                <h3>No motors found</h3>
                <p>Try adjusting your search or filters</p>
              </div>
            ) : motors.map(renderMotorCard)}
          </div>

          {pagination.totalPages > 1 && renderPagination()}
        </div>
      </div>

      <button className="fab" onClick={() => setSidebarOpen(true)}>⚙️ Filters</button>

      {modalOpen && (
        <div className="modal-bg" onClick={e => { if (e.target.classList.contains('modal-bg')) setModalOpen(false); }}>
          <div className="modal">
            <div className="modal-header">
              <h2 id="dTitle">{selectedMotor?.brand} — Motor Details</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">{renderDetail(selectedMotor)}</div>
            <div className="modal-footer">
              <button style={{ padding: '9px 22px', border: '2px solid var(--border)', borderRadius: '10px', background: 'var(--card)', fontSize: '.88rem', fontWeight: 600, cursor: 'pointer' }} onClick={() => setModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Home;
