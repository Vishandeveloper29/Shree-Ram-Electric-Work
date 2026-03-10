import React from 'react'

function Home() {
  return (
    <> <header>
        <div className="header-top">
            <div className="header-logo">⚡ Shree Ram <span>Electric Works</span></div>
            <a href="admin.html" className="admin-link">⚙️ Admin Panel</a>
        </div>
    </header>

    <div className="hero">
        <div className="hero-badge">⚡ Motor Data & Winding System</div>
        <h1>Complete Motor <span>Catalogue</span></h1>
        <p>Search, filter and view full technical specifications of all registered motors</p>
        <div className="hero-search-wrap">
            <div className="hero-search">
                <input type="text" id="heroSearch" placeholder="Search by brand, HP, RPM, voltage, frame size..."
                    oninput="applyFilters()" />
                <button onClick="applyFilters()">🔍 Search</button>
            </div>
            <div className="hero-chips">
                <span className="hero-chip active" onClick="setQuickFilter('all',this)">All Motors</span>
                <span className="hero-chip" onClick="setQuickFilter('ac',this)">AC Motors</span>
                <span className="hero-chip" onClick="setQuickFilter('dc',this)">DC Motors</span>
                <span className="hero-chip" onClick="setQuickFilter('single',this)">Single Phase</span>
                <span className="hero-chip" onClick="setQuickFilter('three',this)">Three Phase</span>
                <span className="hero-chip" onClick="setQuickFilter('rewound',this)">Rewound</span>
                <span className="hero-chip" onClick="setQuickFilter('highRPM',this)">High RPM (3000+)</span>
                <span className="hero-chip" onClick="setQuickFilter('highHP',this)">High HP (5+)</span>
            </div>
        </div>
    </div>

    <div className="stats-bar" id="statsBar"></div>

    <div className="main-wrap">
        <div className="sidebar-overlay" id="sbOverlay" onClick="closeSidebar()"></div>

        <div className="sidebar" id="sidebar">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
                <strong style="font-size:.92rem;color:var(--navy)">⚙️ Filters</strong>
                <button className="clear-btn" style="width:auto;padding:5px 12px" onClick="clearAllFilters()">Clear
                    All</button>
            </div>
            <div className="sb-section">
                <div className="sb-title">Motor Type</div>
                <div id="typeFilterBtns"></div>
            </div>
            <div className="sb-section">
                <div className="sb-title">Phase</div>
                <div id="phaseFilterBtns"></div>
            </div>
            <div className="sb-section">
                <div className="sb-title">Brand</div>
                <div id="brandFilterBtns"></div>
            </div>
            <div className="sb-section">
                <div className="sb-title">HP Range</div>
                <div className="sb-range">
                    <div className="sb-range-row">
                        <input type="number" id="hpMin" placeholder="Min" oninput="applyFilters()" />
                        <span>—</span>
                        <input type="number" id="hpMax" placeholder="Max" oninput="applyFilters()" />
                    </div>
                </div>
            </div>
            <div className="sb-section">
                <div className="sb-title">RPM Range</div>
                <div className="sb-range">
                    <div className="sb-range-row">
                        <input type="number" id="rpmMin" placeholder="Min" oninput="applyFilters()" />
                        <span>—</span>
                        <input type="number" id="rpmMax" placeholder="Max" oninput="applyFilters()" />
                    </div>
                </div>
            </div>
            <div className="sb-section">
                <div className="sb-title">IP Rating</div>
                <select className="sb-select" id="ipFilter" onchange="applyFilters()">
                    <option value="">All</option>
                    <option>IP44</option>
                    <option>IP54</option>
                    <option>IP55</option>
                    <option>IP65</option>
                    <option>IP66</option>
                </select>
            </div>
            <div className="sb-section">
                <div className="sb-title">Insulation className</div>
                <select className="sb-select" id="insulFilter" onchange="applyFilters()">
                    <option value="">All</option>
                    <option>A</option>
                    <option>B</option>
                    <option>F</option>
                    <option>H</option>
                </select>
            </div>
        </div>

        <div className="content">
            <div className="content-header">
                <div className="result-info" id="resultInfo">All Motors <small></small></div>
                <select className="sort-select" id="sortSel" onchange="applyFilters()">
                    <option value="brand">Sort: Brand</option>
                    <option value="ratedPowerHP">Sort: HP</option>
                    <option value="ratedRPM">Sort: RPM</option>
                    <option value="frameSize">Sort: Frame</option>
                    <option value="added">Sort: Newest</option>
                </select>
            </div>
            <div className="motor-grid" id="motorGrid"></div>
            <div className="pagination" id="pagination"></div>
        </div>
    </div>

    <button className="fab" onClick="openSidebar()">⚙️ Filters</button>

    <div className="modal-bg" id="detailModal" style="display:none" onClick="closeMOutside(event)">
        <div className="modal">
            <div className="modal-header">
                <h2 id="dTitle">Motor Details</h2>
                <button className="modal-close" onClick="closeModal()">✕</button>
            </div>
            <div className="modal-body" id="dBody"></div>
            <div className="modal-footer">
                <button onClick="closeModal()"
                    style="padding:9px 22px;border:2px solid var(--border);border-radius:10px;background:var(--card);font-family:'DM Sans',sans-serif;font-size:.88rem;font-weight:600;cursor:pointer">Close</button>
            </div>
        </div>
    </div></>
  )
}

export default Home