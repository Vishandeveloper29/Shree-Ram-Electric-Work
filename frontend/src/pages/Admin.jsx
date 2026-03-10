import React from 'react'

function Admin() {
  return (
   <>
    {/* <!-- INSTALL BANNER --> */}
    <div id="installBanner"
        style="display:none;background:linear-gradient(135deg,var(--orange),var(--orange2));padding:10px 20px;color:#fff;font-size:.86rem;font-weight:600;align-items:center;flex-wrap:wrap;gap:10px;z-index:9998;position:fixed;bottom:0;left:0;right:0">
        📲 Install this app on your device for faster access & offline use!
        <button onClick="installPWA()"
            style="background:rgba(255,255,255,.25);border:1px solid rgba(255,255,255,.5);color:#fff;padding:6px 14px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:.84rem;font-weight:700;cursor:pointer">Install
            App</button>
        <button onClick="dismissInstall()"
            style="background:none;border:none;color:rgba(255,255,255,.8);cursor:pointer;font-size:1.2rem;margin-left:auto">✕</button>
    </div>

    {/* <!-- BACKUP BANNER --> */}
    <div id="backupBanner" style="display:none" className="backup-banner">
        ⚠️ <strong>Backup Reminder:</strong> You haven't backed up your data in over 24 hours.
        <button onClick="exportJSON()"
            style="background:var(--yellow);border:none;padding:5px 14px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:.82rem;font-weight:700;cursor:pointer;color:#7a5f00">Download
            Backup</button>
        <button onClick="dismissBackup()"
            style="background:none;border:none;color:#7a5f00;cursor:pointer;font-weight:700;font-size:1.1rem;margin-left:auto">✕</button>
    </div>

    {/* <!-- APP --> */}
    <div id="appWrap" className="app-wrap" style="display:none">

        {/* <!-- SIDEBAR OVERLAY --> */}
        <div id="sidebarOverlay" className="sidebar-overlay" onClick="closeAdminSidebar()" style="display:none"></div>

        {/* <!-- SIDEBAR --> */}
        <nav className="sidebar" id="adminSidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    ⚡ SREW Admin
                    <span>Motor Data System</span>
                </div>
                <button className="sidebar-close-btn" onClick="closeAdminSidebar()" title="Close menu">✕</button>
            </div>

            <div className="sidebar-nav">
                <div className="nav-section">Main</div>
                <div className="nav-item active" id="nav-dashboard"
                    onClick="showPage('dashboard',this);closeAdminSidebar()">
                    <span className="ni-icon">📊</span> Dashboard
                </div>
                <div className="nav-item" id="nav-motors" onClick="showPage('motors',this);closeAdminSidebar()">
                    <span className="ni-icon">⚡</span> Motors
                </div>

                <div className="nav-section">Data</div>
                <div className="nav-item" id="nav-export" onClick="showPage('export',this);closeAdminSidebar()">
                    <span className="ni-icon">💾</span> Backup & Export
                </div>
                <div className="nav-item" id="nav-import" onClick="showPage('import',this);closeAdminSidebar()">
                    <span className="ni-icon">📥</span> Import Data
                </div>

                <div className="nav-section">System</div>
                <div className="nav-item" id="nav-settings" onClick="showPage('settings',this);closeAdminSidebar()">
                    <span className="ni-icon">⚙️</span> Settings
                </div>
                <div className="nav-item" id="nav-help" onClick="showPage('help',this);closeAdminSidebar()">
                    <span className="ni-icon">❓</span> Help & Guide
                </div>
            </div>

            <div className="sidebar-footer">
                <button id="sidebarInstallBtn" onClick="installPWA()" className="btn-install-side" style="display:none">
                    📲 Install App
                </button>
                <div id="pwaInstalledMsg"
                    style="display:none;text-align:center;font-size:.78rem;color:rgba(255,255,255,.5);padding:6px">✅ App
                    Installed</div>
                <div className="sidebar-user">
                    <div className="su-avatar">SR</div>
                    <div className="su-info">
                        <div className="su-name">Shree Ram Electric Works</div>
                        <div className="su-role">Administrator</div>
                    </div>
                </div>
                <button className="btn-logout" onClick="logout()">🚪 Logout</button>
            </div>
        </nav>

        {/* <!-- MAIN --> */}
        <div className="main">

            {/* <!-- TOPBAR --> */}
            <div className="topbar">
                <button className="topbar-hamburger" onClick="openAdminSidebar()" title="Menu">☰</button>
                <div className="topbar-title">⚡ <span>Shree Ram</span> Electric Works</div>
                <div className="topbar-right">
                    <button id="topInstallBtn" onClick="installPWA()" className="btn btn-orange btn-sm"
                        style="display:none">📲 Install</button>
                    <a href="/" className="view-site-btn">🌐 Catalogue</a>
                </div>
            </div>

            {/* <!-- ===== DASHBOARD ===== --> */}
            <div className="page-content active" id="page-dashboard">
                <div id="statsGrid" className="stats-grid"></div>
                <div className="charts-row">
                    <div className="chart-card">
                        <h3>📊 Motor Type Distribution</h3>
                        <div id="typeChart"></div>
                    </div>
                    <div className="chart-card">
                        <h3>🏷️ Top Brands</h3>
                        <div id="brandChart"></div>
                    </div>
                </div>
                <div className="table-card">
                    <div className="table-toolbar">
                        <h3>🕐 Recently Added Motors</h3>
                    </div>
                    <div className="table-scroll">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Motor</th>
                                    <th>Brand</th>
                                    <th>HP</th>
                                    <th>RPM</th>
                                    <th>Phase</th>
                                    <th>Type</th>
                                </tr>
                            </thead>
                            <tbody id="recentBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* <!-- ===== MOTORS ===== --> */}
            <div className="page-content" id="page-motors">
                <div className="table-card">
                    <div className="table-toolbar">
                        <h3>⚡ All Motors</h3>
                        <input type="text" id="motorSearch" className="search-input" placeholder="Search motors..."
                            oninput="filterMotors()" />
                        <select id="typeFilter" className="sel-filter" onchange="filterMotors()">
                            <option value="">All Types</option>
                            <option value="AC">AC</option>
                            <option value="DC">DC</option>
                        </select>
                        <select id="phaseFilter" className="sel-filter" onchange="filterMotors()">
                            <option value="">All Phases</option>
                            <option value="Single">Single Phase</option>
                            <option value="Three">Three Phase</option>
                        </select>
                        <button className="btn btn-orange" onClick="openAddModal()">➕ Add Motor</button>
                    </div>
                    <div className="table-scroll">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th onClick="sortMotors('brand')">Brand ↕</th>
                                    <th onClick="sortMotors('frameSize')">Frame ↕</th>
                                    <th onClick="sortMotors('ratedPowerHP')">HP ↕</th>
                                    <th onClick="sortMotors('ratedRPM')">RPM ↕</th>
                                    <th>Voltage</th>
                                    <th>Type</th>
                                    <th>Phase</th>
                                    <th>Gauge</th>
                                    <th>Turns</th>
                                    <th>Coil Wt</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="motorBody"></tbody>
                        </table>
                    </div>
                    <div id="motorPagination" className="pagination"></div>
                </div>
            </div>

            {/* <!-- ===== EXPORT ===== --> */}
            <div className="page-content" id="page-export">
                <div className="safety-card">
                    <div className="safety-header">💾 Data Safety Summary</div>
                    <div className="safety-grid">
                        <div className="safety-item">
                            <div className="si-icon">📦</div>
                            <div>
                                <div className="si-title">Total Records</div>
                                <div className="si-val" id="totalRecordsLabel">0</div>
                            </div>
                        </div>
                        <div className="safety-item">
                            <div className="si-icon">🕐</div>
                            <div>
                                <div className="si-title">Last Backup</div>
                                <div className="si-val" id="lastBackupLabel" style="font-size:.8rem">Never</div>
                            </div>
                        </div>
                        <div className="safety-item">
                            <div className="si-icon">💚</div>
                            <div>
                                <div className="si-title">Storage</div>
                                <div className="si-val">Local</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="export-grid">
                    <div className="export-card">
                        <div className="ec-icon">📄</div>
                        <h3>PDF Report</h3>
                        <p>Export all motors as a printable PDF report</p>
                        <button className="btn btn-navy" onClick="exportAllPDF()">📄 Download PDF</button>
                    </div>
                    <div className="export-card">
                        <div className="ec-icon">📊</div>
                        <h3>CSV Export</h3>
                        <p>Spreadsheet-compatible format for Excel/Sheets</p>
                        <button className="btn btn-green" onClick="exportCSV()">📊 Download CSV</button>
                    </div>
                    <div className="export-card">
                        <div className="ec-icon">💾</div>
                        <h3>JSON Backup</h3>
                        <p>Full backup — restore your data anytime</p>
                        <button className="btn btn-orange" onClick="exportJSON()">💾 Download JSON</button>
                    </div>
                    <div className="export-card">
                        <div className="ec-icon">🖨️</div>
                        <h3>Print Report</h3>
                        <p>Send directly to printer</p>
                        <button className="btn btn-light" onClick="printReport()">🖨️ Print</button>
                    </div>
                    <div className="export-card">
                        <div className="ec-icon">📋</div>
                        <h3>Copy Table</h3>
                        <p>Copy as tab-separated text</p>
                        <button className="btn btn-light" onClick="copyTable()">📋 Copy</button>
                    </div>
                </div>
                <p style="font-size:.82rem;color:var(--muted);margin-top:4px">💡 <strong>Tip:</strong> Back up your JSON
                    regularly. Last backup: <strong id="lastBackupDate">Never</strong></p>
            </div>

            {/* <!-- ===== IMPORT ===== --> */}
            <div className="page-content" id="page-import">
                <div className="table-card" style="max-width:600px">
                    <div className="table-toolbar">
                        <h3>📥 Import Motor Data</h3>
                    </div>
                    <div style="padding:22px 22px 24px">
                        <div className="drop-zone" id="dropZone" ondragover="dzOver(event)" ondragleave="dzLeave()"
                            ondrop="dzDrop(event)" onClick="document.getElementById('importFile').click()">
                            <div className="dz-icon">📂</div>
                            <p style="font-weight:700;color:var(--navy);margin-bottom:5px">Drop JSON file here or click
                                to browse</p>
                            <p style="font-size:.82rem;color:var(--muted)">Only .json backup files exported from this
                                system</p>
                        </div>
                        <input type="file" id="importFile" accept=".json" style="display:none"
                            onchange="handleImport(this)" />
                        <div id="importPreview"></div>
                    </div>
                </div>
            </div>

            {/* <!-- ===== SETTINGS ===== --> */}
            <div className="page-content" id="page-settings">
                <div className="settings-card">
                    <h3>🔐 Change Password</h3>
                    <div className="fg" style="margin-bottom:12px">
                        <label>Current Password</label>
                        <input type="password" id="curPass" placeholder="Current password" />
                    </div>
                    <div className="fg" style="margin-bottom:12px">
                        <label>New Password</label>
                        <input type="password" id="newPass" placeholder="Min 6 characters" />
                    </div>
                    <div className="fg" style="margin-bottom:18px">
                        <label>Confirm New Password</label>
                        <input type="password" id="conPass" placeholder="Repeat new password" />
                    </div>
                    <button className="btn btn-orange" onClick="changePassword()">🔐 Change Password</button>
                </div>
                <div className="settings-card">
                    <h3>🗑️ Danger Zone</h3>
                    <p style="font-size:.86rem;color:var(--muted);margin-bottom:16px">Permanently delete all motor
                        records. A JSON backup will be downloaded first.</p>
                    <button className="btn btn-red" onClick="clearAllData()">🗑️ Clear All Data</button>
                </div>
                <div className="settings-card">
                    <h3>📲 App Install</h3>
                    <p style="font-size:.86rem;color:var(--muted);margin-bottom:16px">Install this admin panel as a PWA
                        app on your device for offline access.</p>
                    <button id="topInstallBtn2" onClick="installPWA()" className="btn-install">📲 Install App on
                        Device</button>
                </div>
            </div>

            {/* <!-- ===== HELP ===== --> */}
            <div className="page-content" id="page-help">
                <div className="help-hero">
                    <div className="help-hero-icon">📖</div>
                    <h2>Help & User Guide</h2>
                    <p>Everything you need to know about managing your motor data</p>
                </div>
                <div className="help-grid">
                    <div className="help-card">
                        <div className="hc-num">1</div>
                        <h3>➕ Adding a Motor</h3>
                        <p>Go to Motors page → click "Add Motor". Fill in the nameplate details, select phase
                            (Single/Three), enter winding data and mechanical details. Click Save.</p>
                    </div>
                    <div className="help-card">
                        <div className="hc-num">2</div>
                        <h3>🔢 Turns per Pitch</h3>
                        <p>In the winding section, click "Add Pitch" to record coil turns per pitch slot (e.g. Pitch 1-8
                            → 90 turns). Add as many pitch rows as needed.</p>
                    </div>
                    <div className="help-card">
                        <div className="hc-num">3</div>
                        <h3>📄 PDF Job Card</h3>
                        <p>Each motor has a "📄" button in the Actions column. Click it to download a professional PDF
                            job card with all motor specifications.</p>
                    </div>
                    <div className="help-card">
                        <div className="hc-num">4</div>
                        <h3>💾 Backups</h3>
                        <p>Go to Backup & Export page and download JSON regularly. Before any delete, a backup is
                            auto-downloaded. Keep JSON files safe — they can fully restore your data.</p>
                    </div>
                    <div className="help-card">
                        <div className="hc-num">5</div>
                        <h3>📥 Restore Data</h3>
                        <p>Go to Import Data, drop your backup JSON file, then choose Merge (to keep existing records)
                            or Replace All (to overwrite with the backup).</p>
                    </div>
                    <div className="help-card">
                        <div className="hc-num">6</div>
                        <h3>📲 Install as App</h3>
                        <p>Click the Install button in Settings or the topbar. This installs the panel as a PWA app on
                            your phone/tablet for quick access, even offline.</p>
                    </div>
                </div>
            </div>

        </div>
        {/* <!-- /main --> */}
    </div>
    {/* <!-- /appWrap --> */}

    {/* <!-- ===== ADD/EDIT MOTOR MODAL ===== --> */}
    <div className="modal-bg" id="motorModal" style="display:none" onClick="closeMModalOutside(event)">
        <div className="modal">
            <div className="modal-header">
                <h2 id="mModalTitle">➕ Add New Motor</h2>
                <button className="modal-close" onClick="closeMotorModal()">✕</button>
            </div>
            <div className="modal-body">

                {/* <!-- NAMEPLATE --> */}
                <div className="form-section">
                    <div className="form-section-title"><span className="fs-icon">🏷️</span> Nameplate Details</div>
                    <div className="form-grid">
                        <div className="fg"><label>Brand *</label><input type="text" id="f_brand"
                                placeholder="e.g. Crompton" /></div>
                        <div className="fg"><label>Manufacturer</label><input type="text" id="f_manufacturer"
                                placeholder="Full company name" /></div>
                        <div className="fg">
                            <label>Motor Type *</label>
                            <select id="f_motorType">
                                <option value="">Select type</option>
                                <option value="AC">AC</option>
                                <option value="DC">DC</option>
                            </select>
                        </div>
                        <div className="fg">
                            <label>Phase *</label>
                            <select id="f_phase" onchange="onPhaseChange()">
                                <option value="Single">Single Phase</option>
                                <option value="Three">Three Phase</option>
                            </select>
                        </div>
                        <div className="fg"><label>Rated Voltage</label><input type="text" id="f_ratedVoltage"
                                placeholder="e.g. 230V" /></div>
                        <div className="fg"><label>Rated Current</label><input type="text" id="f_ratedCurrent"
                                placeholder="e.g. 8.5A" /></div>
                        <div className="fg"><label>Rated Frequency</label><input type="text" id="f_ratedFrequency"
                                placeholder="50Hz" /></div>
                        <div className="fg"><label>Rated RPM</label><input type="number" id="f_ratedRPM"
                                placeholder="1440" /></div>
                        <div className="fg"><label>Rated Power (HP)</label><input type="number" id="f_ratedPowerHP"
                                step="0.01" placeholder="e.g. 1.5" oninput="autoKW()" /></div>
                        <div className="fg"><label>Rated Power (kW) <small
                                    style="font-weight:400">(auto)</small></label><input type="text" id="f_ratedPowerKW"
                                placeholder="Auto-calculated" readonly style="background:#f8fafd" /></div>
                        <div className="fg">
                            <label>Insulation className</label>
                            <select id="f_insulationclassName">
                                <option value="">—</option>
                                <option>A</option>
                                <option>B</option>
                                <option>F</option>
                                <option>H</option>
                            </select>
                        </div>
                        <div className="fg"><label>Efficiency</label><input type="text" id="f_efficiency"
                                placeholder="e.g. 82%" /></div>
                        <div className="fg"><label>Frame Size</label><input type="text" id="f_frameSize"
                                placeholder="e.g. D90S" /></div>
                    </div>
                </div>

                {/* <!-- ELECTRICAL --> */}
                <div className="form-section">
                    <div className="form-section-title"><span className="fs-icon">⚡</span> Electrical</div>
                    <div className="form-grid">
                        <div className="fg"><label>Running Current</label><input type="text" id="f_runningCurrent"
                                placeholder="e.g. 8.2A" /></div>
                    </div>
                </div>

                {/* <!-- WINDING --> */}
                <div className="form-section">
                    <div className="form-section-title"><span className="fs-icon">🔩</span> Winding / Coil Details</div>
                    <div className="form-grid">
                        <div className="fg"><label>Stator Slot Count</label><input type="number" id="f_statorSlots"
                                placeholder="e.g. 36" /></div>
                        <div className="fg"><label>Slot Length</label><input type="text" id="f_slotLength"
                                placeholder="e.g. 42mm" /></div>
                        <div className="fg"><label>Total Coil Turns</label><input type="number" id="f_totalCoilTurns"
                                placeholder="e.g. 720" /></div>
                        <div className="fg"><label>Turns Per Coil</label><input type="number" id="f_turnsPerCoil"
                                placeholder="e.g. 90" /></div>
                        <div className="fg"><label>Coil Pitch</label><input type="text" id="f_coilPitch"
                                placeholder="e.g. 1-8" /></div>
                        <div className="fg">
                            <label>Winding Connection</label>
                            <select id="f_windingConnection">
                                <option value="">—</option>
                                <option>Star</option>
                                <option>Delta</option>
                                <option>Concentric</option>
                                <option>Lap</option>
                            </select>
                        </div>
                        <div className="fg">
                            <label>Coil Wire Type</label>
                            <select id="f_coilWireType">
                                <option value="">—</option>
                                <option>Copper</option>
                                <option>Aluminium</option>
                            </select>
                        </div>
                        <div className="fg"><label>Wire Gauge (SWG)</label><input type="text" id="f_wireGauge"
                                placeholder="e.g. 22 SWG" /></div>
                        <div className="fg"><label>Coil Weight (kg)</label><input type="number" id="f_coilWeight"
                                step="0.01" placeholder="e.g. 1.15" /></div>
                    </div>

                    {/* <!-- Turns per Pitch --> */}
                    <div style="margin-top:16px">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
                            <label
                                style="font-size:.72rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.6px">🔢
                                Turns per Pitch</label>
                            <button type="button" className="btn btn-light btn-sm" onClick="addPitchRow()">➕ Add
                                Pitch</button>
                        </div>
                        <div id="pitchTurnsContainer" style="display:flex;flex-direction:column;gap:10px"></div>
                    </div>
                </div>

                {/* <!-- PHASE TOGGLE --> */}
                <div className="form-section">
                    <div className="form-section-title"><span className="fs-icon">🔌</span> Phase-Specific Data</div>
                    <div className="phase-toggle">
                        <button type="button" className="phase-btn active" id="phBtn1" onClick="setPhase('Single')">🔌
                            Single Phase</button>
                        <button type="button" className="phase-btn" id="phBtn3" onClick="setPhase('Three')">⚡ Three
                            Phase</button>
                    </div>

                    {/* <!-- Single Phase --> */}
                    <div id="singlePhaseSection">
                        <div className="form-grid">
                            <div className="fg"><label>Starting Coil Turns</label><input type="number"
                                    id="f_startingCoilTurns" placeholder="e.g. 480" /></div>
                            <div className="fg"><label>Running Coil Turns</label><input type="number"
                                    id="f_runningCoilTurns" placeholder="e.g. 240" /></div>
                            <div className="fg"><label>Starting Coil Weight (kg)</label><input type="number"
                                    id="f_startingCoilWeight" step="0.01" placeholder="e.g. 0.42" /></div>
                            <div className="fg"><label>Running Coil Weight (kg)</label><input type="number"
                                    id="f_runningCoilWeight" step="0.01" placeholder="e.g. 0.73" /></div>
                            <div className="fg"><label>Capacitor Value</label><input type="text" id="f_capacitorValue"
                                    placeholder="e.g. 25µF / 4µF" /></div>
                        </div>
                    </div>

                    {/* <!-- Three Phase --> */}
                    <div id="threePhaseSection" style="display:none">
                        <div className="form-grid">
                            <div className="fg"><label>Line Voltage</label><input type="text" id="f_lineVoltage"
                                    placeholder="e.g. 415V" /></div>
                            <div className="fg"><label>Phase Voltage</label><input type="text" id="f_phaseVoltage"
                                    placeholder="e.g. 240V" /></div>
                            <div className="fg"><label>Line Current</label><input type="text" id="f_lineCurrent"
                                    placeholder="e.g. 7.8A" /></div>
                            <div className="fg"><label>Phase Current</label><input type="text" id="f_phaseCurrent"
                                    placeholder="e.g. 4.5A" /></div>
                            <div className="fg">
                                <label>Star/Delta Connection</label>
                                <select id="f_starDeltaConn">
                                    <option value="">—</option>
                                    <option>Star</option>
                                    <option>Delta</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* <!-- MECHANICAL --> */}
                <div className="form-section">
                    <div className="form-section-title"><span className="fs-icon">⚙️</span> Mechanical Details</div>
                    <div className="form-grid">
                        <div className="fg"><label>Shaft Diameter</label><input type="text" id="f_shaftDiameter"
                                placeholder="e.g. 24mm" /></div>
                        <div className="fg"><label>Shaft Length</label><input type="text" id="f_shaftLength"
                                placeholder="e.g. 55mm" /></div>
                        <div className="fg"><label>Bearing Number (Front)</label><input type="text" id="f_bearingFront"
                                placeholder="e.g. 6305" /></div>
                        <div className="fg"><label>Bearing Number (Rear)</label><input type="text" id="f_bearingRear"
                                placeholder="e.g. 6203" /></div>
                        <div className="fg"><label>Cooling Fan Size</label><input type="text" id="f_fanSize"
                                placeholder="e.g. 160mm" /></div>
                        <div className="fg"><label>Fan Cover Size</label><input type="text" id="f_fanCoverSize"
                                placeholder="e.g. 180mm" /></div>
                        <div className="fg"><label>Total Motor Weight (kg)</label><input type="number" id="f_motorWeight"
                                step="0.1" placeholder="e.g. 11.5" /></div>
                        <div className="fg">
                            <label>Body Material</label>
                            <select id="f_bodyMaterial">
                                <option value="">—</option>
                                <option>Cast Iron</option>
                                <option>Aluminium</option>
                                <option>Steel</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* <!-- REPAIR --> */}
                <div className="form-section">
                    <div className="form-section-title"><span className="fs-icon">🔧</span> Repair History</div>
                    <div className="form-grid">
                        <div className="fg"><label>Old Coil Weight (kg)</label><input type="number" id="f_oldCoilWeight"
                                step="0.01" placeholder="e.g. 1.0" /></div>
                        <div className="fg"><label>New Coil Weight (kg)</label><input type="number" id="f_newCoilWeight"
                                step="0.01" placeholder="e.g. 1.15" /></div>
                        <div className="fg full"><label>Notes / Observations</label><textarea id="f_notes"
                                placeholder="Any observations, issues found, work done..."></textarea></div>
                    </div>
                </div>

            </div>
            {/* <!-- /modal-bo/dy --> */}
            <div className="modal-footer">
                <button className="btn btn-light" onClick="closeMotorModal()">Cancel</button>
                <button className="btn btn-orange" onClick="saveMotor()">💾 Save Motor</button>
            </div>
        </div>
    </div>

    {/* <!-- DETAIL MODAL --> */}
    <div className="modal-bg" id="detailModal" style="display:none" onClick="closeDetailOutside(event)">
        <div className="modal">
            <div className="modal-header">
                <h2 id="detailTitle">Motor Details</h2>
                <button className="modal-close" onClick="closeDetail()">✕</button>
            </div>
            <div className="modal-body" id="detailBody"></div>
            <div className="modal-footer">
                <button id="detailEditBtn" className="btn btn-orange">✏️ Edit</button>
                <button id="detailPdfBtn" className="btn btn-navy">📄 PDF</button>
                <button className="btn btn-light" onClick="closeDetail()">Close</button>
            </div>
        </div>
    </div>

    {/* <!-- CONFIRM DELETE MODAL --> */}
    <div className="modal-bg" id="confirmModal" style="display:none">
        <div className="confirm-box">
            <div className="cb-icon">🗑️</div>
            <h3>Delete Motor?</h3>
            <p id="confirmMsg">This motor will be permanently deleted.</p>
            <p style="font-size:.8rem;color:var(--muted);margin-top:-14px;margin-bottom:22px">A backup will be
                auto-downloaded before deletion.</p>
            <div className="confirm-btns">
                <button className="btn btn-light" onClick="closeConfirm()">Cancel</button>
                <button className="btn btn-red" onClick="confirmDelete()">🗑️ Delete</button>
            </div>
        </div>
    </div>

    {/* <!-- TOAST CONTAINER --> */}
    <div className="toast-wrap" id="toastWrap"></div></>
  )
}

export default Admin