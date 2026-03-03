import { collection, query, where, getDocs, getDoc, doc, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
// ============================================================================
// ⚙️ ATL INCHARGE: ONE-UI / IOS COMMAND CENTER (ULTIMATE EDITION)
// ============================================================================

export async function loadInchargeOverview(db, currentUID, contentArea) {
  contentArea.innerHTML = `
    <div style="display:flex; justify-content:center; align-items:center; height: 60vh; flex-direction:column; gap: 16px;">
      <div style="width: 44px; height: 44px; border: 4px solid #e5e5ea; border-top-color: #007aff; border-radius: 50%; animation: atlSpin 0.8s cubic-bezier(0.6, 0.2, 0.4, 0.8) infinite;"></div>
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #8e8e93; font-weight: 600; letter-spacing: 0.5px;">Syncing Academic Telemetry...</div>
      <style>@keyframes atlSpin { to { transform: rotate(360deg); } }</style>
    </div>`;
  
  try {
    // 1. Fetch School Credentials First
    const assignmentSnap = await getDocs(query(collection(db, "inchargeSchoolAssignments"), where("inchargeId", "==", currentUID)));

    if (assignmentSnap.empty) {
      contentArea.innerHTML = `<div style="padding:40px; text-align:center; color:#ff3b30; font-family:-apple-system, sans-serif; font-weight:600; background:#fff; border-radius:24px; box-shadow:0 10px 30px rgba(0,0,0,0.05); margin: 20px;">⚠️ No school assigned to your profile. Contact Platform Admin.</div>`;
      return;
    }

    const schoolId = assignmentSnap.docs[0].data().schoolId;

    // 2. 🔥 PARALLEL FETCH: Get everything at the exact same millisecond
    const [schoolSnap, studentsSnap, tasksSnap, taSnap] = await Promise.all([
      getDoc(doc(db, "schools", schoolId)),
      getDocs(query(collection(db, "users"), where("role", "==", "student"), where("schoolId", "==", schoolId))),
      getDocs(collection(db, "tasks")),
      getDocs(query(collection(db, "tinkering_activities"), where("schoolId", "==", schoolId))) // Fetching the Pulse Data
    ]);

    // 3. Map Data Instantly
    const schoolName = schoolSnap.exists() ? (schoolSnap.data().schoolName || schoolId) : "Unknown Institution";
    const totalStudents = studentsSnap.size;
    const totalTAs = taSnap.size; // Live count of Tinkering Activities
    
    let studentMap = {};
    studentsSnap.forEach(doc => { 
      studentMap[doc.id] = { name: doc.data().name || "Student", tasksCompleted: 0, tasksTotal: 0 }; 
    });

    let schoolTasks = [];
    let completedSchoolTasks = 0;

    tasksSnap.forEach(doc => {
      const task = { id: doc.id, ...doc.data() };
      if (task.studentId && studentMap[task.studentId]) {
        schoolTasks.push(task);
        studentMap[task.studentId].tasksTotal += 1;
        if ((task.status || '').toLowerCase() === 'completed') {
          completedSchoolTasks += 1;
          studentMap[task.studentId].tasksCompleted += 1;
        }
      }
    });

    // 4. Mathematical Calculations for the UI
    const totalSchoolTasks = schoolTasks.length;
    const globalProgress = totalSchoolTasks === 0 ? 0 : Math.round((completedSchoolTasks / totalSchoolTasks) * 100);
    
    // Determine Attention Matrix (Students struggling)
    let strugglingStudents = [];
    Object.keys(studentMap).forEach(sid => {
      const s = studentMap[sid];
      if (s.tasksTotal > 0 && s.tasksCompleted === 0) { strugglingStudents.push(s.name); }
    });

    // Generate Radar Timeline (Last 4 tasks)
    const recentTasks = schoolTasks.slice(-4).reverse();

    // 5. iOS / One UI Custom CSS
    const iosCss = `
      <style>
        .atl-dashboard { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, sans-serif; color: #1c1c1e; padding: 10px 10px 40px 10px; }
        .atl-header-title { font-size: 2.4rem; font-weight: 800; letter-spacing: -1px; margin: 0 0 4px 0; color: #000; }
        .atl-header-sub { font-size: 1.1rem; font-weight: 500; color: #8e8e93; margin: 0; display:flex; align-items:center; gap:8px; }
        
        .atl-grid-top { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-top: 28px; }
        .atl-grid-bottom { display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; margin-top: 24px; }
        @media (max-width: 900px) { .atl-grid-bottom { grid-template-columns: 1fr; } }

        .atl-card { 
          background: rgba(255, 255, 255, 0.85); backdrop-filter: saturate(180%) blur(24px); -webkit-backdrop-filter: saturate(180%) blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.8); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
          border-radius: 28px; padding: 28px; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          animation: atlSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .atl-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08); }
        
        .atl-card-title { font-size: 0.85rem; text-transform: uppercase; font-weight: 800; color: #8e8e93; letter-spacing: 1px; margin-bottom: 20px; display:flex; justify-content:space-between; align-items:center;}
        
        .atl-stat-val { font-size: 2.8rem; font-weight: 800; letter-spacing: -1.5px; color: #1c1c1e; line-height: 1; margin-bottom: 10px;}
        .atl-stat-lbl { font-size: 0.95rem; font-weight: 600; color: #8e8e93; }

        /* SVG Circular Progress Ring */
        .atl-ring-container { position: relative; width: 84px; height: 84px; }
        .atl-ring-svg { transform: rotate(-90deg); width: 100%; height: 100%; filter: drop-shadow(0 4px 8px rgba(0,122,255,0.2));}
        .atl-ring-bg { fill: none; stroke: #f2f2f7; stroke-width: 8; }
        .atl-ring-fill { fill: none; stroke: #007aff; stroke-width: 8; stroke-linecap: round; transition: stroke-dashoffset 1.5s cubic-bezier(0.25, 1, 0.5, 1); }
        .atl-ring-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 1.15rem; font-weight: 800; color: #007aff; }

        /* Radar Timeline */
        .atl-timeline { position: relative; padding-left: 20px; margin-top: 20px; }
        .atl-timeline::before { content: ''; position: absolute; left: 6px; top: 8px; bottom: 0; width: 2px; background: #e5e5ea; border-radius: 2px;}
        .atl-tl-item { position: relative; margin-bottom: 24px; }
        .atl-tl-dot { position: absolute; left: -20px; top: 4px; width: 14px; height: 14px; border-radius: 50%; background: #fff; border: 3px solid #007aff; z-index: 2;}
        .atl-tl-time { font-size: 0.75rem; font-weight: 800; color: #8e8e93; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px;}
        .atl-tl-desc { font-size: 1rem; font-weight: 500; color: #1c1c1e; line-height: 1.5; }
        .atl-tl-desc span { color: #007aff; font-weight: 700; }

        /* Matrix Alerts */
        .atl-alert { display: flex; align-items: flex-start; gap: 14px; padding: 18px; border-radius: 20px; margin-bottom: 14px; font-weight: 500; font-size: 0.95rem; line-height: 1.5; border: 1px solid transparent;}
        .atl-alert-red { background: #fff0f0; color: #d70015; border-color: rgba(215, 0, 21, 0.1);}
        .atl-alert-orange { background: #fff8e6; color: #d97706; border-color: rgba(217, 119, 6, 0.1);}
        .atl-alert-green { background: #e8f8f5; color: #059669; border-color: rgba(5, 150, 105, 0.1);}
        .atl-alert-icon { font-size: 1.4rem; }

        @keyframes atlSlideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      </style>
    `;

    // 6. Generate Dynamic Matrix Alerts
    let alertsHtml = '';
    if (strugglingStudents.length > 0) {
      alertsHtml += `
        <div class="atl-alert atl-alert-red">
          <div class="atl-alert-icon">⚠️</div>
          <div><strong>Attention Required:</strong> ${strugglingStudents.length} student(s) including ${strugglingStudents[0]} have 0% task completion. Intervention recommended.</div>
        </div>`;
    }
    if (globalProgress >= 80) {
      alertsHtml += `
        <div class="atl-alert atl-alert-green">
          <div class="atl-alert-icon">🏆</div>
          <div><strong>Milestone Reached:</strong> Your institution has surpassed 80% global task completion. Excellent engagement!</div>
        </div>`;
    }
    if (totalTAs === 0) {
        alertsHtml += `
        <div class="atl-alert atl-alert-orange">
          <div class="atl-alert-icon">💡</div>
          <div><strong>Lab Inactive:</strong> You have not deployed any Tinkering Activities yet. Use the Activity Architect to assign missions.</div>
        </div>`;
    }

    if (alertsHtml === '') {
        alertsHtml = `<div style="color: #8e8e93; font-style: italic; padding: 10px;">All systems nominal. Student engagement is balanced.</div>`;
    }

    // 7. Generate Live Radar
    let radarHtml = '';
    if (recentTasks.length === 0) {
      radarHtml = `<div style="color:#8e8e93; font-style:italic; font-size:0.95rem; margin-top:20px;">No recent lab activity recorded yet.</div>`;
    } else {
      recentTasks.forEach((t, index) => {
        const statusStr = (t.status || 'assigned').toLowerCase();
        let dotColor = statusStr === 'completed' ? '#34c759' : '#007aff';
        let action = statusStr === 'completed' ? 'completed task' : 'was assigned';
        
        radarHtml += `
          <div class="atl-tl-item" style="animation-delay: ${index * 0.1}s;">
            <div class="atl-tl-dot" style="border-color: ${dotColor};"></div>
            <div class="atl-tl-time">Recent Activity</div>
            <div class="atl-tl-desc">Student <span>${studentMap[t.studentId]?.name || 'Unknown'}</span> ${action}: <strong>${t.title || 'Untitled'}</strong></div>
          </div>`;
      });
    }

    // 8. Calculate SVG stroke offset for the animated ring
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (globalProgress / 100) * circumference;

    // 9. Render the Complete DOM
    contentArea.innerHTML = `
      ${iosCss}
      <div class="atl-dashboard">
        <header style="margin-bottom: 12px; animation: atlSlideUp 0.4s ease-out;">
          <h1 class="atl-header-title">Mission Control</h1>
          <p class="atl-header-sub">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            ${schoolName}
          </p>
        </header>

        <div class="atl-grid-top">
          <div class="atl-card" style="animation-delay: 0.1s;">
            <div class="atl-card-title"><span>Total Force</span> <span style="font-size:1.3rem;">🧑‍🎓</span></div>
            <div class="atl-stat-val">${totalStudents}</div>
            <div class="atl-stat-lbl">Active Innovators</div>
          </div>

          <div class="atl-card" style="display:flex; justify-content:space-between; align-items:center; animation-delay: 0.2s;">
            <div>
              <div class="atl-card-title">Global Completion</div>
              <div class="atl-stat-val">${completedSchoolTasks}<span style="font-size:1.4rem; color:#8e8e93; font-weight:600;"> / ${totalSchoolTasks}</span></div>
              <div class="atl-stat-lbl">Tasks Verified</div>
            </div>
            <div class="atl-ring-container">
              <svg class="atl-ring-svg" viewBox="0 0 84 84">
                <circle class="atl-ring-bg" cx="42" cy="42" r="${radius}"></circle>
                <circle class="atl-ring-fill" cx="42" cy="42" r="${radius}" stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}" id="atlDynamicRing"></circle>
              </svg>
              <div class="atl-ring-text">${globalProgress}%</div>
            </div>
          </div>

<div class="atl-card" onclick="window.loadSection('tinkering activity report')" style="animation-delay: 0.3s; background: linear-gradient(135deg, #007aff, #34c759); border: none; color: white; cursor: pointer; box-shadow: 0 16px 32px rgba(0, 122, 255, 0.25);" onmouseover="this.style.transform='translateY(-6px)'; this.style.boxShadow='0 20px 40px rgba(0, 122, 255, 0.35)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 16px 32px rgba(0, 122, 255, 0.25)';">
            <div class="atl-card-title" style="color: rgba(255,255,255,0.9);">
              <span>Tinkering Pulse</span> 
              <span style="font-size:1.2rem; background: rgba(255,255,255,0.25); border-radius: 50%; width: 34px; height: 34px; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(5px);">⚡</span>
            </div>
            <div class="atl-stat-val" style="color: white;">${totalTAs}</div>
            <div class="atl-stat-lbl" style="color: rgba(255,255,255,0.95); font-weight: 700; display: flex; align-items: center; justify-content: space-between;">
              <span>Active Lab Missions</span>
              <span style="background: rgba(255,255,255,0.25); padding: 6px 14px; border-radius: 14px; font-size: 0.85rem; backdrop-filter: blur(5px); transition: transform 0.2s;" onmouseover="this.style.transform='translateX(4px)'" onmouseout="this.style.transform='translateX(0)'">View Reports ↗</span>
            </div>
          </div>
        </div>

        <div class="atl-grid-bottom">
          <div class="atl-card" style="animation-delay: 0.4s;">
            <div class="atl-card-title"><span>Action Matrix</span> <span style="font-size:1.3rem;">🧠</span></div>
            <p style="font-size: 1rem; color: #8e8e93; margin-bottom: 24px; font-weight: 500;">Platform intelligence has generated the following insights based on your school's data.</p>
            <div>${alertsHtml}</div>
          </div>

          <div class="atl-card" style="animation-delay: 0.5s;">
            <div class="atl-card-title"><span>Activity Radar</span> <span style="font-size:1.3rem;">📡</span></div>
            <div class="atl-timeline">
              ${radarHtml}
            </div>
          </div>
        </div>
      </div>
    `;

    // 10. Trigger the SVG Ring Animation after DOM loads
    requestAnimationFrame(() => {
      setTimeout(() => {
        const ring = document.getElementById("atlDynamicRing");
        if (ring) { ring.style.strokeDashoffset = offset; }
      }, 100);
    });

  } catch (error) {
    console.error("Error loading incharge overview:", error);
    contentArea.innerHTML = `<div style="padding:40px; text-align:center; color:#ff3b30; font-family:-apple-system, sans-serif; font-weight:600;">Failed to establish connection to Academic Database. Please refresh.</div>`;
  }
}
export async function loadTAForm(db, currentUID, contentArea) {
  contentArea.innerHTML = `<div class="loader">Loading Activity Architect...</div>`;
  try {const assignmentSnap = await getDocs(query(collection(db, "inchargeSchoolAssignments"), where("inchargeId", "==", currentUID)));
    if (assignmentSnap.empty) {
      contentArea.innerHTML = `<div style="padding:40px; text-align:center; color:#ff3b30; font-weight:600;">⚠️ No school assigned. Cannot create activities.</div>`;
      return;}
    const schoolId = assignmentSnap.docs[0].data().schoolId;
    const studentsSnap = await getDocs(query(collection(db, "users"), where("role", "==", "student"), where("schoolId", "==", schoolId)));
    let studentOptions = `<option value="unassigned">-- Do not assign yet (Save to Library) --</option>`;
    studentsSnap.forEach(doc => {const s = doc.data();studentOptions += `<option value="${doc.id}">${s.name || 'Unknown Student'} (${s.email || ''})</option>`;});
    const generatedActivityId = `TA-${Date.now().toString().slice(-7)}`;
    const taCss = `
      <style>
        .ta-wrapper { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, sans-serif; max-width: 1040px; margin: 0 auto; padding: 20px 10px 60px 10px; animation: taFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .ta-title { font-size: 2.4rem; font-weight: 800; color: #1c1c1e; margin: 0; letter-spacing: -1.2px; line-height: 1.1; }
        .ta-subtitle { font-size: 1.05rem; color: #8e8e93; margin-top: 8px; font-weight: 500; letter-spacing: -0.2px; }
        .ta-section-title { font-size: 0.85rem; font-weight: 700; color: #8e8e93; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 20px; display: flex; align-items: center; }
        .ta-section-title::after { content: ''; flex: 1; height: 1px; background: rgba(60, 60, 67, 0.1); margin-left: 16px; border-radius: 1px; }
        .ta-label { display: flex; justify-content: space-between; align-items: center; font-size: 0.95rem; font-weight: 600; color: #1c1c1e; margin-bottom: 10px; letter-spacing: -0.2px; }
        .ta-card { background: rgba(255, 255, 255, 0.85); backdrop-filter: saturate(200%) blur(30px); -webkit-backdrop-filter: saturate(200%) blur(30px); border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 8px 40px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02); border-radius: 28px; padding: 36px; margin-bottom: 32px; transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .ta-card:hover { transform: translateY(-2px); box-shadow: 0 12px 50px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.03); }
        .ta-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .ta-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; }
        @media(max-width: 800px) { .ta-grid-2, .ta-grid-3 { grid-template-columns: 1fr; } }
        .ta-group { margin-bottom: 24px; }
        .ta-input, .ta-select, .ta-textarea { width: 100%; box-sizing: border-box; background: rgba(118, 118, 128, 0.08); border: 2px solid transparent; border-radius: 16px; padding: 16px 20px; font-size: 1.05rem; color: #1c1c1e; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); outline: none; font-family: inherit; font-weight: 500; }
        .ta-input::placeholder, .ta-textarea::placeholder { color: rgba(60, 60, 67, 0.4); font-weight: 400; }
        .ta-input:focus, .ta-select:focus, .ta-textarea:focus { background: #fff; border-color: #007aff; box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.15); transform: translateY(-1px); }
        .ta-textarea { resize: vertical; min-height: 120px; line-height: 1.5; }
        .ta-id-badge { background: #f2f2f7; color: #8e8e93; font-family: "SF Mono", ui-monospace, monospace; font-weight: 700; letter-spacing: 1px; user-select: all; cursor: copy; }
        .ta-dynamic-container { background: rgba(118, 118, 128, 0.04); border-radius: 20px; padding: 12px; border: 1px solid rgba(60, 60, 67, 0.05); }
        .ta-dynamic-row { display: flex; gap: 10px; margin-bottom: 8px; animation: taSpringIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); background: #fff; border-radius: 14px; padding: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .ta-dynamic-row:last-child { margin-bottom: 0; }
        .ta-dynamic-row .ta-input { background: transparent; border-radius: 10px; padding: 12px 16px; flex: 1; font-size: 1rem; }
        .ta-dynamic-row .ta-input:focus { background: rgba(118, 118, 128, 0.04); box-shadow: none; border-color: transparent; transform: none; }
        .ta-btn-add-sm { background: rgba(0, 122, 255, 0.1); color: #007aff; border: none; border-radius: 20px; padding: 6px 14px; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 4px; }
        .ta-btn-add-sm:hover { background: rgba(0, 122, 255, 0.2); }
        .ta-btn-add-sm:active { transform: scale(0.94); }
        .ta-btn-remove { background: #ffe5e5; color: #ff3b30; border: none; border-radius: 10px; width: 44px; font-size: 1.2rem; display: flex; justify-content: center; align-items: center; cursor: pointer; transition: all 0.2s; }
        .ta-btn-remove:hover { background: #ffcccc; }
        .ta-btn-remove:active { transform: scale(0.9); }
        .ta-actions { display: flex; gap: 16px; justify-content: flex-end; margin-top: 40px; }
        .ta-btn-primary { background: #007aff; color: #fff; border: none; border-radius: 20px; padding: 18px 40px; font-size: 1.1rem; font-weight: 700; cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 10px 20px rgba(0, 122, 255, 0.25); display: flex; align-items: center; gap: 8px; }
        .ta-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 14px 28px rgba(0, 122, 255, 0.35); filter: brightness(1.05); }
        .ta-btn-primary:active { transform: scale(0.96); box-shadow: 0 4px 10px rgba(0, 122, 255, 0.2); }
        .ta-btn-secondary { background: rgba(118, 118, 128, 0.12); color: #1c1c1e; border: none; border-radius: 20px; padding: 18px 32px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .ta-btn-secondary:hover { background: rgba(118, 118, 128, 0.18); }
        .ta-btn-secondary:active { transform: scale(0.96); }
        @keyframes taFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes taSpringIn { 0% { opacity: 0; transform: scale(0.95) translateY(-5px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
      </style>`;
    window.addTADynamicRow = function(containerId, placeholder) {
      const container = document.getElementById(containerId);
      const div = document.createElement('div');
      div.className = 'ta-dynamic-row';
      div.innerHTML = `
        <input type="text" class="ta-input" data-array="${containerId}" placeholder="${placeholder}">
        <button type="button" class="ta-btn-remove" onclick="this.parentElement.remove()" title="Remove item">✕</button>`;
      container.appendChild(div);};
    window.submitTAForm = async function() {
      const submitBtn = document.getElementById('taSubmitBtn');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = "Deploying... <span style='font-size:1.2rem; animation: taSpin 1s infinite linear;'>⏳</span>";
      submitBtn.disabled = true;
      try {const getArrayData = (arrayId) => {const inputs = document.querySelectorAll(`input[data-array="${arrayId}"]`);
          return Array.from(inputs).map(input => input.value.trim()).filter(val => val !== ""); };
        const payload = {
          schoolId: schoolId,
          createdBy: currentUID,
          createdAt: serverTimestamp(),
          status: "assigned",
          activityId: document.getElementById('ta-id').value,
          activityName: document.getElementById('ta-name').value.trim(),
          subject: document.getElementById('ta-subject').value,
          topic: document.getElementById('ta-topic').value,
          subTopic: document.getElementById('ta-subtopic').value,
          assignedTo: document.getElementById('ta-assign').value,
          introduction: document.getElementById('ta-intro').value.trim(),
          goals: getArrayData('ta-goals'),
          materials: getArrayData('ta-materials'),
          instructions: getArrayData('ta-instructions'),
          tips: getArrayData('ta-tips'),
          observations: getArrayData('ta-observations'),
          extensions: getArrayData('ta-extensions'),
          resources: getArrayData('ta-resources')};
        if (!payload.activityName || !payload.subject) {alert("Activity Name and Subject are required.");
          submitBtn.innerHTML = originalText;submitBtn.disabled = false; return;}
        await addDoc(collection(db, "tinkering_activities"), payload);
        submitBtn.innerHTML = "Deployed Successfully! ✅";
        submitBtn.style.background = "#34c759"; // iOS Green
        submitBtn.style.boxShadow = "0 10px 20px rgba(52, 199, 89, 0.3)";
        setTimeout(() => {
          document.getElementById('taForm').reset();
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = "#007aff";
          submitBtn.disabled = false;}, 2500);
} catch (err) {
        console.error("Error saving TA:", err);
        alert("Failed to save activity.");
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false; }};
    contentArea.innerHTML = `
      ${taCss}
      <style>@keyframes taSpin { 100% { transform: rotate(360deg); } }</style>
      
      <div class="ta-wrapper">
        <div style="margin-bottom: 32px;">
          <h2 class="ta-title">Activity Architect</h2>
          <p class="ta-subtitle">Design, blueprint, and deploy Tinkering Activities.</p>
        </div>

        <form id="taForm" onsubmit="event.preventDefault(); window.submitTAForm();">
          
          <div class="ta-card">
            <div class="ta-section-title">Core Specifications</div>
            
            <div class="ta-grid-3">
              <div class="ta-group">
                <label class="ta-label">Subject</label>
                <select id="ta-subject" class="ta-select" required>
                  <option value="">Select Domain...</option>
                  <option value="Electronics & IoT">Electronics & IoT</option>
                  <option value="Robotics">Robotics</option>
                  <option value="Coding & AI">Coding & AI</option>
                  <option value="3D Design & Printing">3D Design & Printing</option>
                  <option value="Science Experiment">Science Experiment</option>
                </select>
              </div>
              <div class="ta-group">
                <label class="ta-label">Topic</label>
                <input type="text" id="ta-topic" class="ta-input" placeholder="e.g. Microcontrollers">
              </div>
              <div class="ta-group">
                <label class="ta-label">Sub Topic</label>
                <input type="text" id="ta-subtopic" class="ta-input" placeholder="e.g. Arduino Basics">
              </div>
            </div>

            <div class="ta-grid-2">
              <div class="ta-group">
                <label class="ta-label">System ID <span style="font-weight:400; color:#8e8e93; font-size:0.8rem;">Auto-Generated</span></label>
                <input type="text" id="ta-id" class="ta-input ta-id-badge" value="${generatedActivityId}" readonly>
              </div>
              <div class="ta-group">
                <label class="ta-label">Activity Name</label>
                <input type="text" id="ta-name" class="ta-input" placeholder="Enter an inspiring title..." required>
              </div>
            </div>

            <div class="ta-group">
              <label class="ta-label">Target Innovator <span style="background:rgba(0,122,255,0.1); color:#007aff; padding:4px 10px; border-radius:10px; font-size:0.75rem;">Direct Dispatch</span></label>
              <select id="ta-assign" class="ta-select">
                ${studentOptions}
              </select>
            </div>

            <div class="ta-group" style="margin-bottom:0;">
              <label class="ta-label">Executive Summary</label>
              <textarea id="ta-intro" class="ta-textarea" placeholder="Briefly describe the core concept, objectives, and what the student will achieve..."></textarea>
            </div>
          </div>

          <div class="ta-card">
            <div class="ta-section-title">Execution Parameters</div>
            
            <div class="ta-grid-2">
              
              <div class="ta-group">
                <label class="ta-label">Goals & Outcomes <button type="button" class="ta-btn-add-sm" onclick="window.addTADynamicRow('ta-goals', 'Define an outcome...')"><span>+</span> Add</button></label>
                <div id="ta-goals" class="ta-dynamic-container">
                  <div class="ta-dynamic-row"><input type="text" class="ta-input" data-array="ta-goals" placeholder="Define an outcome..."><button type="button" class="ta-btn-remove" onclick="this.parentElement.remove()">✕</button></div>
                </div>
              </div>

              <div class="ta-group">
                <label class="ta-label">Required Hardware <button type="button" class="ta-btn-add-sm" onclick="window.addTADynamicRow('ta-materials', 'e.g. 1x ESP32 Board')"><span>+</span> Add</button></label>
                <div id="ta-materials" class="ta-dynamic-container">
                  <div class="ta-dynamic-row"><input type="text" class="ta-input" data-array="ta-materials" placeholder="e.g. 1x ESP32 Board"><button type="button" class="ta-btn-remove" onclick="this.parentElement.remove()">✕</button></div>
                </div>
              </div>

              <div class="ta-group">
                <label class="ta-label">Execution Steps <button type="button" class="ta-btn-add-sm" onclick="window.addTADynamicRow('ta-instructions', 'Describe this step...')"><span>+</span> Add</button></label>
                <div id="ta-instructions" class="ta-dynamic-container">
                  <div class="ta-dynamic-row"><input type="text" class="ta-input" data-array="ta-instructions" placeholder="Describe this step..."><button type="button" class="ta-btn-remove" onclick="this.parentElement.remove()">✕</button></div>
                </div>
              </div>

              <div class="ta-group">
                <label class="ta-label">Expected Data/Obs. <button type="button" class="ta-btn-add-sm" onclick="window.addTADynamicRow('ta-observations', 'What should happen?')"><span>+</span> Add</button></label>
                <div id="ta-observations" class="ta-dynamic-container">
                  <div class="ta-dynamic-row"><input type="text" class="ta-input" data-array="ta-observations" placeholder="What should happen?"><button type="button" class="ta-btn-remove" onclick="this.parentElement.remove()">✕</button></div>
                </div>
              </div>

              <div class="ta-group">
                <label class="ta-label">Safety & Pro Tips <button type="button" class="ta-btn-add-sm" onclick="window.addTADynamicRow('ta-tips', 'Important tip...')"><span>+</span> Add</button></label>
                <div id="ta-tips" class="ta-dynamic-container">
                  <div class="ta-dynamic-row"><input type="text" class="ta-input" data-array="ta-tips" placeholder="Important tip..."><button type="button" class="ta-btn-remove" onclick="this.parentElement.remove()">✕</button></div>
                </div>
              </div>

              <div class="ta-group">
                <label class="ta-label">Bonus Challenges <button type="button" class="ta-btn-add-sm" onclick="window.addTADynamicRow('ta-extensions', 'Bonus challenge...')"><span>+</span> Add</button></label>
                <div id="ta-extensions" class="ta-dynamic-container">
                  <div class="ta-dynamic-row"><input type="text" class="ta-input" data-array="ta-extensions" placeholder="Bonus challenge..."><button type="button" class="ta-btn-remove" onclick="this.parentElement.remove()">✕</button></div>
                </div>
              </div>

            </div>

            <div class="ta-group" style="margin-top:24px; margin-bottom:0;">
              <label class="ta-label">Web Resources & Links <button type="button" class="ta-btn-add-sm" onclick="window.addTADynamicRow('ta-resources', 'https://...')"><span>+</span> Add Link</button></label>
              <div id="ta-resources" class="ta-dynamic-container">
                <div class="ta-dynamic-row"><input type="url" class="ta-input" data-array="ta-resources" placeholder="https://youtube.com/..."><button type="button" class="ta-btn-remove" onclick="this.parentElement.remove()">✕</button></div>
              </div>
            </div>

          </div>

          <div class="ta-actions">
            <button type="reset" class="ta-btn-secondary">Reset Fields</button>
            <button type="submit" id="taSubmitBtn" class="ta-btn-primary">
              Deploy Activity <span style="font-size:1.2rem; margin-left:4px;">✨</span>
            </button>
          </div>

        </form>
      </div>
    `;

  } catch (error) {
    console.error("Error rendering TA Form:", error);
    contentArea.innerHTML = `<div style="text-align:center; padding: 40px; color:#ff3b30; font-weight:600;">Failed to load Activity Architect module.</div>`;
  }
}