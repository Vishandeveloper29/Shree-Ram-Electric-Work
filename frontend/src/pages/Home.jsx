import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getMotors, getStats, getBrands, getMotorById } from '../api';
import '../style.css';

const LIMIT = 12;

export default function Home() {
  const [motors, setMotors]         = useState([]);
  const [stats, setStats]           = useState(null);
  const [brands, setBrands]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [search, setSearch]         = useState('');
  const [motorType, setMotorType]   = useState('');
  const [phase, setPhase]           = useState('');
  const [brand, setBrand]           = useState('');
  const [hpMin, setHpMin]           = useState('');
  const [hpMax, setHpMax]           = useState('');
  const [rpmMin, setRpmMin]         = useState('');
  const [rpmMax, setRpmMax]         = useState('');
  const [insulationClass, setInsulationClass] = useState('');
  const [sort, setSort]             = useState('brand');
  const [page, setPage]             = useState(1);
  const [selectedMotor, setSelectedMotor] = useState(null);
  const [modalOpen, setModalOpen]   = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchTimer = useRef(null);

  const buildParams = (overrides = {}) => ({
    search, motorType, phase, brand, hpMin, hpMax,
    rpmMin, rpmMax, insulationClass, sort, page, limit: LIMIT,
    ...overrides,
  });

  const fetchMotors = useCallback(async (params) => {
    setLoading(true);
    try {
      const data = await getMotors(params);
      setMotors(data.motors);
      setPagination(data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    getStats().then(d => setStats(d.stats)).catch(() => {});
    getBrands().then(d => setBrands(d.brands)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchMotors(buildParams());
  // eslint-disable-next-line
  }, [motorType, phase, brand, hpMin, hpMax, rpmMin, rpmMax, insulationClass, sort, page]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      fetchMotors(buildParams({ page: 1 }));
    }, 400);
    return () => clearTimeout(searchTimer.current);
  // eslint-disable-next-line
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

  const typeBadge = (t) => t?.toLowerCase() === 'ac' ? 'h-badge-ac' : 'h-badge-dc';
  const phaseBadge = (p) => p === 'Single' ? 'h-badge-1ph' : 'h-badge-3ph';

  /* ---- MOTOR CARD ---- */
  const renderCard = (m) => (
    <div key={m._id} className="h-card" onClick={() => openDetail(m._id)}>
      <div className="h-card-head">
        <div className="h-card-brand-tag">{m.brand}</div>
        <h3>{m.brand} {m.frameSize || ''}</h3>
        <div className="h-card-mfg">{m.manufacturer || '\u00a0'}</div>
        <div className="h-card-badges">
          <span className={`h-badge ${typeBadge(m.motorType)}`}>{m.motorType}</span>
          <span className={`h-badge ${phaseBadge(m.phase)}`}>{m.phase === 'Single' ? '1 Ph' : '3 Ph'}</span>
        </div>
      </div>

      <div className="h-card-specs">
        <div className="h-spec-item">
          <span className="h-spec-key">Power</span>
          <span className={`h-spec-val${m.ratedPowerHP ? ' highlight' : ''}`}>{m.ratedPowerHP ? `${m.ratedPowerHP} HP` : '—'}</span>
        </div>
        <div className="h-spec-item">
          <span className="h-spec-key">RPM</span>
          <span className="h-spec-val">{m.ratedRPM || '—'}</span>
        </div>
        <div className="h-spec-item">
          <span className="h-spec-key">Voltage</span>
          <span className="h-spec-val">{m.ratedVoltage || '—'}</span>
        </div>
        <div className="h-spec-item">
          <span className="h-spec-key">Frame</span>
          <span className="h-spec-val">{m.frameSize || '—'}</span>
        </div>
      </div>

      {(m.wireGauge || m.turnsPerCoil || m.coilWeight) && (
        <div className="h-card-winding">
          {m.wireGauge    && <div className="h-winding-item"><div className="h-wi-val">{m.wireGauge}</div><div className="h-wi-key">Gauge</div></div>}
          {m.turnsPerCoil && <div className="h-winding-item"><div className="h-wi-val">{m.turnsPerCoil}</div><div className="h-wi-key">Turns</div></div>}
          {m.coilWeight   && <div className="h-winding-item"><div className="h-wi-val">{m.coilWeight}kg</div><div className="h-wi-key">Coil Wt</div></div>}
        </div>
      )}

      <div className="h-card-foot">
        <span className="h-card-tag">{m.bodyMaterial || m.motorType || 'Motor'}</span>
        <button className="h-view-btn" onClick={e => { e.stopPropagation(); openDetail(m._id); }}>
          Details →
        </button>
      </div>
    </div>
  );

  /* ---- DETAIL ITEM ---- */
  const di = (label, val) => val != null && val !== '' ? (
    <div key={label} className="h-detail-item">
      <div className="h-di-key">{label}</div>
      <div className="h-di-val">{val}</div>
    </div>
  ) : null;

  const renderDetail = (m) => {
    if (!m) return null;
    return (
      <>
        <div className="h-detail-banner">
          <div>
            <h2>{m.brand} {m.frameSize || ''}</h2>
            <p>{m.manufacturer || '\u00a0'}</p>
            <div className="h-detail-chips">
              <span className={`h-badge ${typeBadge(m.motorType)}`}>{m.motorType}</span>
              <span className={`h-badge ${phaseBadge(m.phase)}`}>{m.phase === 'Single' ? '1 Phase' : '3 Phase'}</span>
            </div>
          </div>
          <div className="h-detail-stats">
            {m.ratedPowerHP && <div><div className="h-ds-val">{m.ratedPowerHP} HP</div><div className="h-ds-key">Power</div></div>}
            {m.ratedRPM     && <div><div className="h-ds-val">{m.ratedRPM}</div><div className="h-ds-key">RPM</div></div>}
            {m.ratedVoltage && <div><div className="h-ds-val">{m.ratedVoltage}</div><div className="h-ds-key">Voltage</div></div>}
          </div>
        </div>

        <div className="h-detail-section">
          <div className="h-ds-title">🏷️ Nameplate Details</div>
          <div className="h-detail-grid">
            {[di('Brand', m.brand), di('Manufacturer', m.manufacturer), di('Motor Type', m.motorType), di('Phase', m.phase), di('Voltage', m.ratedVoltage), di('Current', m.ratedCurrent), di('Frequency', m.ratedFrequency), di('RPM', m.ratedRPM), di('Power (HP)', m.ratedPowerHP), di('Power (kW)', m.ratedPowerKW), di('Insulation', m.insulationClass), di('Efficiency', m.efficiency), di('Frame Size', m.frameSize)]}
          </div>
        </div>

        <div className="h-detail-section">
          <div className="h-ds-title">🔩 Winding Details</div>
          <div className="h-detail-grid">
            {[di('Wire Gauge', m.wireGauge), di('Coil Weight', m.coilWeight ? m.coilWeight + ' kg' : null), di('Turns/Coil', m.turnsPerCoil), di('Total Turns', m.totalCoilTurns), di('Coil Pitch', m.coilPitch), di('Wire Type', m.coilWireType), di('Winding Conn.', m.windingConnection), di('Stator Slots', m.statorSlots), di('Slot Length', m.slotLength)]}
          </div>
        </div>

        {m.phase === 'Single' && (m.startingCoilTurns || m.capacitorValue) && (
          <div className="h-detail-section">
            <div className="h-ds-title">🔌 Single Phase Data</div>
            <div className="h-detail-grid">
              {[di('Start Turns', m.startingCoilTurns), di('Run Turns', m.runningCoilTurns), di('Start Wt.', m.startingCoilWeight ? m.startingCoilWeight + ' kg' : null), di('Run Wt.', m.runningCoilWeight ? m.runningCoilWeight + ' kg' : null), di('Capacitor', m.capacitorValue)]}
            </div>
          </div>
        )}

        {m.phase === 'Three' && (m.lineVoltage || m.starDeltaConn) && (
          <div className="h-detail-section">
            <div className="h-ds-title">⚡ Three Phase Data</div>
            <div className="h-detail-grid">
              {[di('Line Voltage', m.lineVoltage), di('Phase Voltage', m.phaseVoltage), di('Line Current', m.lineCurrent), di('Phase Current', m.phaseCurrent), di('Connection', m.starDeltaConn)]}
            </div>
          </div>
        )}

        {(m.bearingFront || m.shaftDiameter || m.bodyMaterial) && (
          <div className="h-detail-section">
            <div className="h-ds-title">⚙️ Mechanical Details</div>
            <div className="h-detail-grid">
              {[di('Shaft Dia.', m.shaftDiameter), di('Shaft Len.', m.shaftLength), di('Bearing F.', m.bearingFront), di('Bearing R.', m.bearingRear), di('Fan Size', m.fanSize), di('Fan Cover', m.fanCoverSize), di('Weight', m.motorWeight ? m.motorWeight + ' kg' : null), di('Body', m.bodyMaterial)]}
            </div>
          </div>
        )}

        {(m.oldCoilWeight || m.newCoilWeight) && (
          <div className="h-detail-section">
            <div className="h-ds-title">🔧 Repair History</div>
            <div className="h-detail-grid">
              {[di('Old Coil Wt.', m.oldCoilWeight ? m.oldCoilWeight + ' kg' : null), di('New Coil Wt.', m.newCoilWeight ? m.newCoilWeight + ' kg' : null)]}
            </div>
          </div>
        )}

        {m.notes && (
          <div className="h-detail-section">
            <div className="h-ds-title">📝 Notes</div>
            <div className="h-notes-box">{m.notes}</div>
          </div>
        )}
      </>
    );
  };

  const chips = [
    { label: 'All Motors',    type: '',   ph: ''      },
    { label: 'AC Motors',     type: 'AC', ph: ''      },
    { label: 'DC Motors',     type: 'DC', ph: ''      },
    { label: 'Single Phase',  type: '',   ph: 'Single'},
    { label: 'Three Phase',   type: '',   ph: 'Three' },
  ];

  return (
    <div className="srew-home">

      {/* HEADER */}
      <header className="h-header">
        <div className="h-header-inner">
          <a href="/" className="h-logo">
            <div className="h-logo-icon">⚡</div>
            <div className="h-logo-text">
              <span className="h-logo-name">Shree Ram Electric Works</span>
              <span className="h-logo-sub">Motor Data System</span>
            </div>
          </a>
          <div className="h-header-right">
            <a href="/admin" className="h-admin-btn">⚙️ Admin Panel</a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <div className="h-hero">
        <div className="h-hero-pill">⚡ Motor Data &amp; Winding System</div>
        <h1>Complete Motor <span className="accent">Catalogue</span></h1>
        <p className="h-hero-sub">Search and view full technical specifications for all registered motors</p>
        <div className="h-search-wrap">
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search brand, HP, RPM, voltage, frame size..."
          />
          <button className="h-search-btn" onClick={() => fetchMotors(buildParams({ page: 1 }))}>
            🔍 Search
          </button>
        </div>
        <div className="h-quick-filters">
          {chips.map(c => (
            <button
              key={c.label}
              className={`h-qf-btn${motorType === c.type && phase === c.ph ? ' active' : ''}`}
              onClick={() => { setMotorType(c.type); setPhase(c.ph); setPage(1); }}
            >{c.label}</button>
          ))}
        </div>
      </div>

      {/* STATS BAR */}
      {stats && (
        <div className="h-stats">
          {[
            { n: stats.total,       l: 'Total Motors'  },
            { n: stats.acCount,     l: 'AC Motors'     },
            { n: stats.dcCount,     l: 'DC Motors'     },
            { n: stats.singleCount, l: 'Single Phase'  },
            { n: stats.threeCount,  l: 'Three Phase'   },
            { n: stats.brandCount,  l: 'Brands'        },
          ].map(s => (
            <div key={s.l} className="h-stat-item">
              <div className="h-stat-num">{s.n}</div>
              <div className="h-stat-label">{s.l}</div>
            </div>
          ))}
        </div>
      )}

      {/* BODY */}
      <div className="h-body">
        {sidebarOpen && <div className="h-sb-veil" onClick={() => setSidebarOpen(false)} />}

        {/* SIDEBAR */}
        <aside className={`h-sidebar${sidebarOpen ? ' open' : ''}`}>
          <div className="h-sb-head">
            <span className="h-sb-title">⚙️ Filters</span>
            <button className="h-sb-clear" onClick={clearFilters}>Clear All</button>
          </div>

          <div className="h-sb-section">
            <div className="h-sb-sec-label">Motor Type</div>
            {['', 'AC', 'DC'].map(t => (
              <button key={t} className={`h-sb-option${motorType === t ? ' on' : ''}`}
                onClick={() => { setMotorType(t); setPage(1); }}>
                {t || 'All Types'}
              </button>
            ))}
          </div>

          <div className="h-sb-section">
            <div className="h-sb-sec-label">Phase</div>
            {[{ v: '', l: 'All Phases' }, { v: 'Single', l: 'Single Phase' }, { v: 'Three', l: 'Three Phase' }].map(p => (
              <button key={p.v} className={`h-sb-option${phase === p.v ? ' on' : ''}`}
                onClick={() => { setPhase(p.v); setPage(1); }}>
                {p.l}
              </button>
            ))}
          </div>

          <div className="h-sb-section">
            <div className="h-sb-sec-label">Brand</div>
            <button className={`h-sb-option${brand === '' ? ' on' : ''}`}
              onClick={() => { setBrand(''); setPage(1); }}>All Brands</button>
            {brands.map(b => (
              <button key={b} className={`h-sb-option${brand === b ? ' on' : ''}`}
                onClick={() => { setBrand(b); setPage(1); }}>{b}</button>
            ))}
          </div>

          <div className="h-sb-section">
            <div className="h-sb-sec-label">HP Range</div>
            <div className="h-range-row">
              <input className="h-range-input" type="number" value={hpMin} onChange={e => { setHpMin(e.target.value); setPage(1); }} placeholder="Min" />
              <span className="h-range-sep">—</span>
              <input className="h-range-input" type="number" value={hpMax} onChange={e => { setHpMax(e.target.value); setPage(1); }} placeholder="Max" />
            </div>
          </div>

          <div className="h-sb-section">
            <div className="h-sb-sec-label">RPM Range</div>
            <div className="h-range-row">
              <input className="h-range-input" type="number" value={rpmMin} onChange={e => { setRpmMin(e.target.value); setPage(1); }} placeholder="Min" />
              <span className="h-range-sep">—</span>
              <input className="h-range-input" type="number" value={rpmMax} onChange={e => { setRpmMax(e.target.value); setPage(1); }} placeholder="Max" />
            </div>
          </div>

          <div className="h-sb-section">
            <div className="h-sb-sec-label">Insulation Class</div>
            <select className="h-sb-select" value={insulationClass} onChange={e => { setInsulationClass(e.target.value); setPage(1); }}>
              <option value="">All Classes</option>
              {['A', 'B', 'F', 'H'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </aside>

        {/* CONTENT */}
        <main className="h-content">
          <div className="h-content-header">
            <div className="h-results-label">
              {motorType || phase ? `${motorType} ${phase ? phase + ' Phase' : ''} Motors`.trim() : 'All Motors'}
              <small>({pagination.total} results)</small>
            </div>
            <select className="h-sort-select" value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}>
              <option value="brand">Sort: Brand</option>
              <option value="ratedPowerHP">Sort: HP</option>
              <option value="ratedRPM">Sort: RPM</option>
              <option value="frameSize">Sort: Frame</option>
              <option value="added">Sort: Newest</option>
            </select>
          </div>

          <div className="h-grid">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-skeleton" />)
            ) : motors.length === 0 ? (
              <div className="h-empty">
                <div className="h-empty-icon">🔍</div>
                <h3>No motors found</h3>
                <p>Try adjusting your search or filters</p>
              </div>
            ) : motors.map(renderCard)}
          </div>

          {pagination.totalPages > 1 && (
            <div className="h-pagination">
              <button className="h-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button key={i + 1} className={`h-page-btn${page === i + 1 ? ' current' : ''}`} onClick={() => setPage(i + 1)}>
                  {i + 1}
                </button>
              ))}
              <button className="h-page-btn" disabled={page === pagination.totalPages} onClick={() => setPage(p => p + 1)}>›</button>
            </div>
          )}
        </main>
      </div>

      {/* FAB (mobile) */}
      <button className="h-fab" onClick={() => setSidebarOpen(true)}>
        ⚙️ Filters
      </button>

      {/* DETAIL MODAL */}
      {modalOpen && (
        <div className="h-modal-overlay" onClick={e => { if (e.target.classList.contains('h-modal-overlay')) setModalOpen(false); }}>
          <div className="h-modal">
            <div className="h-modal-head">
              <span className="h-modal-title">{selectedMotor?.brand} — Motor Details</span>
              <button className="h-modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <div className="h-modal-body">{renderDetail(selectedMotor)}</div>
            <div className="h-modal-foot">
              <button className="h-close-btn" onClick={() => setModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
