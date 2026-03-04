
        const LS_MOTORS = 'srew_motors';

        function getMotors() {
            const r = localStorage.getItem(LS_MOTORS);
            if (r) return JSON.parse(r);
            // Sample data if nothing in storage
            const sample = [
                { id: 1, brand: 'Crompton', manufacturer: 'Crompton Greaves Ltd', modelNumber: 'GF2054', serialNumber: 'CG-2023-001', motorType: 'AC', phase: 'Single', ratedVoltage: '230V', ratedCurrent: '8.5A', ratedFrequency: '50Hz', ratedRPM: 1440, ratedPowerHP: 1.5, ratedPowerKW: '1.12', dutyType: 'S1', insulationClass: 'B', ipRating: 'IP55', powerFactor: '0.88', efficiency: '82%', ambientTemp: '40°C', serviceFactor: '1.15', frameSize: 'D90S', mountingType: 'B3', countryOrigin: 'India', mfgDate: 'Jan 2020', startingCurrent: '52A', runningCurrent: '8.2A', lockedRotorCurrent: '58A', breakdownTorque: '18 N·m', fullLoadTorque: '7.4 N·m', windingResR: '12.4Ω', windingResY: '12.3Ω', windingResB: '12.5Ω', meggerTest: '>100 MΩ', continuityTest: 'Pass', statorSlots: 36, rotorSlots: 28, slotLength: '42mm', rotorBore: '68mm', coreLength: '75mm', stackHeight: '90mm', airGap: '0.3mm', totalCoilTurns: 720, turnsPerCoil: 90, coilPitch: '1-8', windingType: 'Concentric', windingConnection: '', coilWireType: 'Copper', wireGauge: '22 SWG', wireDiameter: '0.71mm', coilWeight: '1.15', totalCopperWeight: '1.05', insulationPaper: 'Nomex 410', slotInsulThick: '0.25mm', varnishType: 'Class B Epoxy', bakingTemp: '120°C', bakingTime: '5 hrs', startingCoilTurns: 480, runningCoilTurns: 240, startingCoilResistance: '28Ω', runningCoilResistance: '12.4Ω', startingCoilWeight: '0.42', runningCoilWeight: '0.73', capacitorType: 'Start + Run', capacitorValue: '25µF / 4µF', capacitorVoltage: '250V / 400V', centrifugalSwitch: 'Yes', lineVoltage: '', phaseVoltage: '', lineCurrent: '', phaseCurrent: '', starDeltaConn: '', terminalMarkings: '', shaftDiameter: '24mm', shaftLength: '55mm', bearingFront: '6305', bearingRear: '6203', coolingType: 'IC211', fanType: 'External', fanCoverType: 'End Cover', motorWeight: '11.5', bodyMaterial: 'Cast Iron', lastRewindDate: '2023-06-10', rewindingBy: 'Shree Ram Electric Works', oldCoilWeight: '1.0', newCoilWeight: '1.15', bearingChanged: 'Yes', capacitorChanged: 'Yes', testReport: 'Pass', notes: 'Motor rewound after burnout. Running perfectly.', added: Date.now() - 86400000 * 10 },
                { id: 2, brand: 'Kirloskar', manufacturer: 'Kirloskar Electric Co.', modelNumber: 'KE3-4544', serialNumber: 'KE-2022-045', motorType: 'AC', phase: 'Three', ratedVoltage: '415V', ratedCurrent: '7.8A', ratedFrequency: '50Hz', ratedRPM: 1450, ratedPowerHP: 3, ratedPowerKW: '2.24', dutyType: 'S1', insulationClass: 'F', ipRating: 'IP55', powerFactor: '0.86', efficiency: '87%', ambientTemp: '50°C', serviceFactor: '1.0', frameSize: 'D100L', mountingType: 'B3', countryOrigin: 'India', mfgDate: 'Mar 2022', startingCurrent: '47A', runningCurrent: '7.5A', lockedRotorCurrent: '52A', breakdownTorque: '28 N·m', fullLoadTorque: '14.8 N·m', windingResR: '4.2Ω', windingResY: '4.1Ω', windingResB: '4.2Ω', meggerTest: '>500 MΩ', continuityTest: 'Pass', statorSlots: 36, rotorSlots: 28, slotLength: '55mm', rotorBore: '72mm', coreLength: '85mm', stackHeight: '100mm', airGap: '0.35mm', totalCoilTurns: 576, turnsPerCoil: 72, coilPitch: '1-9', windingType: 'Lap', windingConnection: 'Star', coilWireType: 'Copper', wireGauge: '20 SWG', wireDiameter: '0.91mm', coilWeight: '2.8', totalCopperWeight: '2.6', insulationPaper: 'Leatheroid 0.2mm', slotInsulThick: '0.30mm', varnishType: 'Class F Alkyd', bakingTemp: '155°C', bakingTime: '8 hrs', startingCoilTurns: 0, runningCoilTurns: 0, startingCoilResistance: '', runningCoilResistance: '', startingCoilWeight: '', runningCoilWeight: '', capacitorType: '', capacitorValue: '', capacitorVoltage: '', centrifugalSwitch: '', lineVoltage: '415V', phaseVoltage: '240V', lineCurrent: '7.8A', phaseCurrent: '4.5A', starDeltaConn: 'Star', terminalMarkings: 'U1,U2,V1,V2,W1,W2', shaftDiameter: '28mm', shaftLength: '60mm', bearingFront: '6206', bearingRear: '6204', coolingType: 'IC411', fanType: 'External', fanCoverType: 'End Cover', motorWeight: '18.5', bodyMaterial: 'Cast Iron', lastRewindDate: '2024-01-15', rewindingBy: 'Shree Ram Electric Works', oldCoilWeight: '2.5', newCoilWeight: '2.8', bearingChanged: 'Yes', capacitorChanged: 'No', testReport: 'Pass', notes: 'Rewound after flood damage. Star connected.', added: Date.now() - 86400000 * 5 },
            ];
            return sample;
        }

        // ============================
        // STATE
        // ============================
        let quickFilter = 'all';
        let activeBrand = '';
        let activeType = '';
        let activePhase = '';
        let page = 1;
        const PER = 12;

        function setQuickFilter(f, el) {
            quickFilter = f;
            document.querySelectorAll('.hero-chip').forEach(c => c.classList.remove('active'));
            el.classList.add('active');
            applyFilters();
        }
        function setBrand(b) { activeBrand = activeBrand === b ? '' : b; applyFilters() }
        function setType(t) { activeType = activeType === t ? '' : t; applyFilters() }
        function setPhase(p) { activePhase = activePhase === p ? '' : p; applyFilters() }
        function clearAllFilters() {
            quickFilter = 'all'; activeBrand = ''; activeType = ''; activePhase = '';
            document.getElementById('heroSearch').value = '';
            document.getElementById('hpMin').value = ''; document.getElementById('hpMax').value = '';
            document.getElementById('rpmMin').value = ''; document.getElementById('rpmMax').value = '';
            document.getElementById('ipFilter').value = ''; document.getElementById('insulFilter').value = '';
            document.querySelectorAll('.hero-chip').forEach((c, i) => c.classList.toggle('active', i === 0));
            applyFilters();
        }

        function applyFilters() {
            const motors = getMotors();
            const q = (document.getElementById('heroSearch')?.value || '').toLowerCase();
            const hpMin = parseFloat(document.getElementById('hpMin')?.value) || 0;
            const hpMax = parseFloat(document.getElementById('hpMax')?.value) || Infinity;
            const rpmMin = parseFloat(document.getElementById('rpmMin')?.value) || 0;
            const rpmMax = parseFloat(document.getElementById('rpmMax')?.value) || Infinity;
            const ipF = document.getElementById('ipFilter')?.value || '';
            const insulF = document.getElementById('insulFilter')?.value || '';
            const sort = document.getElementById('sortSel')?.value || 'brand';

            // Stats bar
            const total = motors.length;
            const ac = motors.filter(m => m.motorType === 'AC').length;
            const dc = motors.filter(m => m.motorType === 'DC').length;
            const single = motors.filter(m => m.phase === 'Single').length;
            const three = motors.filter(m => m.phase === 'Three').length;
            const rewound = motors.filter(m => m.lastRewindDate).length;
            document.getElementById('statsBar').innerHTML = `
    <div class="stat-item"><div class="sn">${total}</div><div class="sl">Total</div></div>
    <div class="stat-item"><div class="sn" style="color:var(--teal)">${ac}</div><div class="sl">AC</div></div>
    <div class="stat-item"><div class="sn" style="color:var(--red)">${dc}</div><div class="sl">DC</div></div>
    <div class="stat-item"><div class="sn" style="color:#6b21a8">${single}</div><div class="sl">1-Phase</div></div>
    <div class="stat-item"><div class="sn" style="color:var(--green)">${three}</div><div class="sl">3-Phase</div></div>
    <div class="stat-item"><div class="sn" style="color:var(--orange)">${rewound}</div><div class="sl">Rewound</div></div>
  `;

            // Sidebar filters
            const brands = [...new Set(motors.map(m => m.brand))].sort();
            document.getElementById('typeFilterBtns').innerHTML = ['AC', 'DC'].map(t => `
    <button class="sb-btn${activeType === t ? ' active' : ''}" onclick="setType('${t}')">${t} Motors<span class="sb-count">${motors.filter(m => m.motorType === t).length}</span></button>`).join('');
            document.getElementById('phaseFilterBtns').innerHTML = ['Single', 'Three'].map(p => `
    <button class="sb-btn${activePhase === p ? ' active' : ''}" onclick="setPhase('${p}')">${p} Phase<span class="sb-count">${motors.filter(m => m.phase === p).length}</span></button>`).join('');
            document.getElementById('brandFilterBtns').innerHTML = brands.map(b => `
    <button class="sb-btn${activeBrand === b ? ' active' : ''}" onclick="setBrand('${b}')">${b}<span class="sb-count">${motors.filter(m => m.brand === b).length}</span></button>`).join('');

            // Filter
            let filtered = motors.filter(m => {
                const txt = [m.brand, m.manufacturer, m.modelNumber, m.serialNumber, m.ratedVoltage, m.ratedPowerHP, m.ratedRPM, m.wireGauge, m.frameSize, m.phase, m.motorType].join(' ').toLowerCase();
                const hp = parseFloat(m.ratedPowerHP) || 0;
                const rpm = parseFloat(m.ratedRPM) || 0;

                if (q && !txt.includes(q)) return false;
                if (activeType && m.motorType !== activeType) return false;
                if (activePhase && m.phase !== activePhase) return false;
                if (activeBrand && m.brand !== activeBrand) return false;
                if (ipF && m.ipRating !== ipF) return false;
                if (insulF && m.insulationClass !== insulF) return false;
                if (hp < hpMin || hp > hpMax) return false;
                if (rpm < rpmMin || rpm > rpmMax) return false;

                if (quickFilter === 'ac' && m.motorType !== 'AC') return false;
                if (quickFilter === 'dc' && m.motorType !== 'DC') return false;
                if (quickFilter === 'single' && m.phase !== 'Single') return false;
                if (quickFilter === 'three' && m.phase !== 'Three') return false;
                if (quickFilter === 'rewound' && !m.lastRewindDate) return false;
                if (quickFilter === 'highRPM' && rpm < 3000) return false;
                if (quickFilter === 'highHP' && hp < 5) return false;
                return true;
            });

            // Sort
            filtered.sort((a, b) => {
                if (sort === 'added') return (b.added || 0) - (a.added || 0);
                const av = isNaN(a[sort]) ? (a[sort] || '').toString().toLowerCase() : parseFloat(a[sort]) || 0;
                const bv = isNaN(b[sort]) ? (b[sort] || '').toString().toLowerCase() : parseFloat(b[sort]) || 0;
                return av < bv ? -1 : av > bv ? 1 : 0;
            });

            document.getElementById('resultInfo').innerHTML = `${filtered.length} Motor${filtered.length !== 1 ? 's' : ''} <small>found</small>`;
            page = 1;
            renderGrid(filtered);
        }

        function renderGrid(filtered) {
            const slice = filtered.slice((page - 1) * PER, page * PER);
            if (!slice.length) {
                document.getElementById('motorGrid').innerHTML = `<div class="empty-state"><div class="ei">🔍</div><h3>No Motors Found</h3><p>Try different search terms or filters</p></div>`;
                document.getElementById('pagination').innerHTML = '';
                return;
            }
            document.getElementById('motorGrid').innerHTML = slice.map(m => `
    <div class="motor-card" onclick="openDetail(${m.id})">
      <div class="mc-top">
        <div class="mc-badges">
          <span class="badge ${m.motorType === 'AC' ? 'badge-ac' : 'badge-dc'}">${m.motorType || '?'}</span>
          <span class="badge ${m.phase === 'Three' ? 'badge-3ph' : 'badge-1ph'}">${m.phase || '?'}</span>
        </div>
        <div class="mc-brand-tag">${m.brand || 'Unknown'}</div>
        <h3>${m.brand} ${m.modelNumber || ''}</h3>
        <div class="mc-model">S/N: ${m.serialNumber || 'N/A'} · ${m.frameSize || ''}</div>
      </div>
      <div class="mc-specs">
        <div class="spec-row"><span>Rated Power</span><strong class="spec-highlight">${m.ratedPowerHP || '-'} HP / ${m.ratedPowerKW || '-'} kW</strong></div>
        <div class="spec-row"><span>Rated Voltage</span><strong>${m.ratedVoltage || '-'}</strong></div>
        <div class="spec-row"><span>Rated Current</span><strong>${m.ratedCurrent || '-'}</strong></div>
        <div class="spec-row"><span>RPM</span><strong>${m.ratedRPM || '-'}</strong></div>
        ${m.phase === 'Single' ? `<div class="spec-row"><span>Start/Run Current</span><strong>${m.startingCurrent || '-'} / ${m.runningCurrent || '-'}</strong></div>` : ''}
        ${m.phase === 'Three' ? `<div class="spec-row"><span>Line / Phase Current</span><strong>${m.lineCurrent || '-'} / ${m.phaseCurrent || '-'}</strong></div>` : ''}
      </div>
      <div class="mc-winding">
        <div class="mw-item"><div class="mw-val">${m.wireGauge || '-'}</div><div class="mw-lbl">Wire Gauge</div></div>
        <div class="mw-item"><div class="mw-val">${m.totalCoilTurns || '-'}</div><div class="mw-lbl">Coil Turns</div></div>
        <div class="mw-item"><div class="mw-val">${m.coilWeight ? m.coilWeight + ' kg' : '-'}</div><div class="mw-lbl">Coil Weight</div></div>
      </div>
      <div class="mc-footer">
        <span class="mc-cat">⚡ ${m.motorType || '?'} · ${m.phase || '?'} Phase</span>
        <button class="view-btn" onclick="event.stopPropagation();openDetail(${m.id})">Full Details →</button>
      </div>
    </div>`).join('');

            // Pagination
            const tp = Math.ceil(filtered.length / PER) || 1;
            if (tp <= 1) { document.getElementById('pagination').innerHTML = ''; return; }
            let pg = '';
            if (page > 1) pg += `<button class="pg-btn" onclick="goPage(${page - 1},${JSON.stringify(filtered).replace(/"/g, '&quot;')})">‹ Prev</button>`;
            for (let i = 1; i <= tp; i++) {
                if (i === 1 || i === tp || Math.abs(i - page) <= 1) pg += `<button class="pg-btn${i === page ? ' active' : ''}" onclick="goPage(${i},${JSON.stringify(filtered).replace(/"/g, '&quot;')})">${i}</button>`;
                else if (Math.abs(i - page) === 2) pg += `<span style="padding:0 4px;color:var(--muted)">…</span>`;
            }
            if (page < tp) pg += `<button class="pg-btn" onclick="goPage(${page + 1},${JSON.stringify(filtered).replace(/"/g, '&quot;')})">Next ›</button>`;
            document.getElementById('pagination').innerHTML = pg;
        }

        function goPage(p, filtered) { page = p; renderGrid(filtered) }

        // ============================
        // DETAIL MODAL
        // ============================
        function openDetail(id) {
            const m = getMotors().find(x => x.id === id); if (!m) return;
            document.getElementById('dTitle').textContent = `${m.brand} ${m.modelNumber || ''}`;

            const sec = (title, icon, items) => {
                const valid = items.filter(([l, v]) => v !== undefined && v !== '' && v !== null && v !== 0);
                if (!valid.length) return '';
                return `<div class="detail-section"><div class="ds-title"><span>${icon}</span>${title}</div><div class="detail-grid">${valid.map(([l, v]) => `<div class="di"><div class="di-l">${l}</div><div class="di-v">${v}</div></div>`).join('')}</div></div>`;
            };

            document.getElementById('dBody').innerHTML = `
    <div class="detail-hero">
      <div class="dh-left">
        <h2>${m.brand} ${m.modelNumber || ''}</h2>
        <p>${m.manufacturer || ''} ${m.countryOrigin ? '· ' + m.countryOrigin : ''} ${m.mfgDate ? '· ' + m.mfgDate : ''}</p>
        <div class="dh-badges">
          <span class="badge ${m.motorType === 'AC' ? 'badge-ac' : 'badge-dc'}">${m.motorType || '?'}</span>
          <span class="badge ${m.phase === 'Three' ? 'badge-3ph' : 'badge-1ph'}">${m.phase || '?'} Phase</span>
          ${m.insulationClass ? `<span class="badge" style="background:#1e3a5f;color:#fff">Class ${m.insulationClass}</span>` : ''}
          ${m.ipRating ? `<span class="badge" style="background:#1c4532;color:#fff">${m.ipRating}</span>` : ''}
        </div>
      </div>
      <div class="dh-stats">
        ${m.ratedPowerHP ? `<div class="dhs-item"><div class="dhs-val">${m.ratedPowerHP} HP</div><div class="dhs-lbl">Rated Power</div></div>` : ''}
        ${m.ratedRPM ? `<div class="dhs-item"><div class="dhs-val">${m.ratedRPM}</div><div class="dhs-lbl">RPM</div></div>` : ''}
        ${m.ratedVoltage ? `<div class="dhs-item"><div class="dhs-val">${m.ratedVoltage}</div><div class="dhs-lbl">Voltage</div></div>` : ''}
        ${m.ratedCurrent ? `<div class="dhs-item"><div class="dhs-val">${m.ratedCurrent}</div><div class="dhs-lbl">Current</div></div>` : ''}
      </div>
    </div>

    ${sec('Nameplate Details', '🏷️', [
                ['Brand', m.brand], ['Manufacturer', m.manufacturer], ['Model Number', m.modelNumber], ['Serial Number', m.serialNumber],
                ['Motor Type', m.motorType], ['Phase', m.phase ? m.phase + ' Phase' : ''], ['Rated Voltage', m.ratedVoltage], ['Rated Current', m.ratedCurrent],
                ['Frequency', m.ratedFrequency], ['Rated RPM', m.ratedRPM],
                ['Rated Power', m.ratedPowerHP ? m.ratedPowerHP + ' HP / ' + m.ratedPowerKW + ' kW' : ''],
                ['Duty Type', m.dutyType], ['Insulation Class', m.insulationClass ? 'Class ' + m.insulationClass : ''], ['IP Rating', m.ipRating],
                ['Power Factor', m.powerFactor], ['Efficiency', m.efficiency], ['Ambient Temp', m.ambientTemp],
                ['Service Factor', m.serviceFactor], ['Frame Size', m.frameSize], ['Mounting', m.mountingType],
                ['Country', m.countryOrigin], ['Mfg. Date', m.mfgDate]
            ])}

    ${sec('Electrical Specifications', '⚡', [
                ['Starting Current', m.startingCurrent], ['Running Current', m.runningCurrent],
                ['Locked Rotor Current', m.lockedRotorCurrent], ['Breakdown Torque', m.breakdownTorque], ['Full Load Torque', m.fullLoadTorque],
                ['Winding Res R-Phase', m.windingResR], ['Winding Res Y-Phase', m.windingResY], ['Winding Res B-Phase', m.windingResB],
                ['Megger Test', m.meggerTest], ['Continuity Test', m.continuityTest]
            ])}

    ${sec('Winding / Coil Details', '🔩', [
                ['Stator Slots', m.statorSlots], ['Rotor Slots', m.rotorSlots], ['Slot Length', m.slotLength],
                ['Rotor Bore Diameter', m.rotorBore], ['Core Length', m.coreLength], ['Stack Height', m.stackHeight], ['Air Gap', m.airGap],
                ['Total Coil Turns', m.totalCoilTurns], ['Turns Per Coil', m.turnsPerCoil], ['Coil Pitch', m.coilPitch],
                ['Winding Type', m.windingType], ['Winding Connection', m.windingConnection], ['Wire Type', m.coilWireType],
                ['Wire Gauge (SWG)', m.wireGauge], ['Wire Diameter', m.wireDiameter],
                ['Coil Weight', m.coilWeight ? m.coilWeight + ' kg' : ''], ['Total Copper Weight', m.totalCopperWeight ? m.totalCopperWeight + ' kg' : ''],
                ['Insulation Paper', m.insulationPaper], ['Slot Insulation', m.slotInsulThick], ['Varnish Type', m.varnishType],
                ['Baking Temp', m.bakingTemp], ['Baking Time', m.bakingTime]
            ])}

    ${m.phase === 'Single' ? sec('Single Phase — Starting & Running Coil', '🔌', [
                ['Starting Coil Turns', m.startingCoilTurns], ['Running Coil Turns', m.runningCoilTurns],
                ['Starting Coil Resistance', m.startingCoilResistance], ['Running Coil Resistance', m.runningCoilResistance],
                ['Starting Coil Weight', m.startingCoilWeight ? m.startingCoilWeight + ' kg' : ''],
                ['Running Coil Weight', m.runningCoilWeight ? m.runningCoilWeight + ' kg' : ''],
                ['Capacitor Type', m.capacitorType], ['Capacitor Value', m.capacitorValue],
                ['Capacitor Voltage Rating', m.capacitorVoltage], ['Centrifugal Switch', m.centrifugalSwitch]
            ]) : ''}

    ${m.phase === 'Three' ? sec('Three Phase Electrical Details', '⚡', [
                ['Line Voltage', m.lineVoltage], ['Phase Voltage', m.phaseVoltage],
                ['Line Current', m.lineCurrent], ['Phase Current', m.phaseCurrent],
                ['Star/Delta Connection', m.starDeltaConn], ['Terminal Markings', m.terminalMarkings]
            ]) : ''}

    ${sec('Mechanical Details', '⚙️', [
                ['Shaft Diameter', m.shaftDiameter], ['Shaft Length', m.shaftLength],
                ['Bearing (Front)', m.bearingFront], ['Bearing (Rear)', m.bearingRear],
                ['Cooling Type', m.coolingType], ['Fan Type', m.fanType], ['Fan Cover', m.fanCoverType],
                ['Motor Weight', m.motorWeight ? m.motorWeight + ' kg' : ''], ['Body Material', m.bodyMaterial]
            ])}

    ${sec('Repair & Service History', '🔧', [
                ['Last Rewind Date', m.lastRewindDate], ['Rewinding Done By', m.rewindingBy],
                ['Old Coil Weight', m.oldCoilWeight ? m.oldCoilWeight + ' kg' : ''],
                ['New Coil Weight', m.newCoilWeight ? m.newCoilWeight + ' kg' : ''],
                ['Bearing Changed', m.bearingChanged], ['Capacitor Changed', m.capacitorChanged], ['Test Report', m.testReport]
            ])}

    ${m.notes ? `<div class="detail-section"><div class="ds-title"><span>📝</span>Notes & Observations</div><div style="background:#f8fafd;border-radius:10px;padding:14px;color:var(--text);font-size:.9rem;border:1px solid var(--border);line-height:1.6">${m.notes}</div></div>` : ''}
  `;
            document.getElementById('detailModal').style.display = 'flex';
        }
        function closeModal() { document.getElementById('detailModal').style.display = 'none' }
        function closeMOutside(e) { if (e.target === document.getElementById('detailModal')) closeModal() }

        // ============================
        // SIDEBAR MOBILE
        // ============================
        function openSidebar() { document.getElementById('sidebar').classList.add('open'); document.getElementById('sbOverlay').style.display = 'block' }
        function closeSidebar() { document.getElementById('sidebar').classList.remove('open'); document.getElementById('sbOverlay').style.display = 'none' }

        // INIT
        applyFilters();
   