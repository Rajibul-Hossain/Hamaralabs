import { 
  collection, query, where, getCountFromServer,getDocs,updateDoc,addDoc, doc, deleteDoc} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/** 
 * @param {Object} db 
 * @param {HTMLElement} contentArea 
 */
export async function loadAdminOverview(db, contentArea) {
  const container = contentArea || document.getElementById("dashboardContent");
  if (!container) return;
  try {
    const schoolsColl = collection(db, "schools");
    const tasksColl = collection(db, "tasks");
    const mentorsQuery = query(collection(db, "users"), where("role", "==", "mentor"));
    const studentsQuery = query(collection(db, "users"), where("role", "==", "student"));
    const paidSchoolsQuery = query(collection(db, "school"), where("paidSubscription", "==", true));
    const [schoolsSnap, mentorsSnap, studentsSnap, tasksSnap, paidSchoolsSnap] = await Promise.all([getCountFromServer(schoolsColl),getCountFromServer(mentorsQuery),getCountFromServer(studentsQuery),getCountFromServer(tasksColl),getCountFromServer(paidSchoolsQuery)]); //counter
    const stats = {
      schools: schoolsSnap.data().count,mentors: mentorsSnap.data().count,
      students: studentsSnap.data().count,tasks: tasksSnap.data().count,
      paid: paidSchoolsSnap.data().count};
    container.innerHTML = `
      <style>
        .admin-dashboard { animation: floatIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .admin-header { margin-bottom: 32px; color: #111; font-size: 24px; font-weight: 800; }
        .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px; margin-bottom: 32px; }
        
        /* --- PREMIUM CASCADING SLIDE-IN ANIMATION --- */
        @keyframes premiumSlideInLeft {
          0% { opacity: 0; transform: translateX(-40px); }
          100% { opacity: 1; transform: translateX(0); }
        }

        .kpi-card { 
          background: rgba(255, 255, 255, 0.45); 
          backdrop-filter: blur(24px) saturate(200%);
          -webkit-backdrop-filter: blur(24px) saturate(200%);
          padding: 24px; 
          border-radius: 16px; 
          box-shadow: 
            0 8px 24px -4px rgba(0, 0, 0, 0.08),
            inset 0 1px 2px rgba(255, 255, 255, 0.9),
            inset 0 -1px 2px rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.6); 
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease, background 0.4s ease; 
          position: relative; 
          overflow: hidden;
          cursor: pointer;
          
          /* Add the animation base here */
          opacity: 0; 
          animation: premiumSlideInLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity;
        }

        /* Stagger the KPI Cards so they wave in one by one */
        .kpi-card:nth-child(1) { animation-delay: 0.05s; }
        .kpi-card:nth-child(2) { animation-delay: 0.15s; }
        .kpi-card:nth-child(3) { animation-delay: 0.25s; }
        .kpi-card:nth-child(4) { animation-delay: 0.35s; }
        .kpi-card:nth-child(5) { animation-delay: 0.45s; }
        
        .kpi-card:hover { 
          transform: translateY(-6px) scale(1.02); 
          background: rgba(255, 255, 255, 0.6); 
          border-color: rgba(255, 255, 255, 0.9);
          box-shadow: 
            0 20px 40px -8px rgba(0, 0, 0, 0.15),
            inset 0 1px 2px rgba(255, 255, 255, 1),
            inset 0 -1px 2px rgba(255, 255, 255, 0.3); 
        }
        
        .kpi-card:active { 
          transform: scale(0.98); 
        }
        
        .kpi-card::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: #0066ff; }
        .kpi-card:nth-child(2)::before { background: #00c853; }
        .kpi-card:nth-child(3)::before { background: #ff9500; }
        .kpi-card:nth-child(4)::before { background: #5856d6; }
        .kpi-card:nth-child(5)::before { background: #ff2d55; }
        
        .kpi-title { font-size: 0.85rem; color: #666; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        .kpi-value { font-size: 2.8rem; font-weight: 800; color: #1a1a1a; margin: 0; line-height: 1; }
        .kpi-icon { font-size: 2.5rem; position: absolute; right: 20px; top: 24px; opacity: 0.15; transition: opacity 0.3s, transform 0.3s; }
        .kpi-card:hover .kpi-icon { opacity: 0.3; transform: scale(1.1); }
        
        /* 💎 PREMIUM LIQUID GLASS MODAL STYLES 💎 */
        .admin-modal-overlay {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0, 0, 0, 0.3); 
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(4px);
          display: flex; justify-content: center; align-items: center;
          z-index: 9999; opacity: 0; pointer-events: none; transition: opacity 0.4s ease;
        }
        .admin-modal-overlay.active { opacity: 1; pointer-events: auto; }
        
        .admin-modal-content {
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(32px) saturate(200%);
          -webkit-backdrop-filter: blur(32px) saturate(200%);
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 
            0 32px 64px -12px rgba(0, 0, 0, 0.2),
            inset 0 1px 1px rgba(255, 255, 255, 1),
            inset 0 -1px 1px rgba(255, 255, 255, 0.3);
            
          width: 90%; max-width: 900px; max-height: 85vh;
          border-radius: 24px; padding: 32px; 
          display: flex; flex-direction: column; position: relative;
          
          --origin-x: 0px;
          --origin-y: 0px;
          transform: translate(var(--origin-x), var(--origin-y)) scale(0.1); 
          opacity: 0;
          transition: transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
        }
        
        .admin-modal-overlay.active .admin-modal-content { 
          transform: translate(0px, 0px) scale(1); 
          opacity: 1;
        }
        .admin-modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.08); padding-bottom: 16px; margin-bottom: 20px; }
        .admin-modal-header h2 { margin: 0; font-size: 1.8rem; color: #111; font-weight: 800; letter-spacing: -0.5px; }
        .close-btn { background: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.8); font-size: 1.5rem; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: center; color: #555; }
        .close-btn:hover { background: #ff3b30; color: white; border-color: #ff3b30; transform: scale(1.1); }
        .admin-modal-body { overflow-y: auto; padding-right: 8px; max-height: 60vh; }
        .admin-modal-body::-webkit-scrollbar { width: 8px; }
        .admin-modal-body::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border-radius: 10px; }
        
        /* Glass-Optimized Table */
        .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
        .admin-table th { background: rgba(255,255,255,0.6); backdrop-filter: blur(10px); padding: 16px; font-weight: 700; color: #444; border-bottom: 1px solid rgba(0,0,0,0.08); position: sticky; top: 0; z-index: 10; }
        .admin-table td { padding: 16px; border-bottom: 1px solid rgba(0,0,0,0.04); color: #222; font-size: 0.95rem; }
        .admin-table tr { transition: background 0.2s; }
        
        /* Modal Table Row Staggering Setup */
        .slide-in-item {
          opacity: 0; 
          animation: premiumSlideInLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity;
        }
        
        /* Adding hover only after animation settles */
        .admin-table tr.slide-in-item:hover { background: rgba(255,255,255,0.7); }

        .admin-table tbody tr:nth-child(1) { animation-delay: 0.05s; }
        .admin-table tbody tr:nth-child(2) { animation-delay: 0.10s; }
        .admin-table tbody tr:nth-child(3) { animation-delay: 0.15s; }
        .admin-table tbody tr:nth-child(4) { animation-delay: 0.20s; }
        .admin-table tbody tr:nth-child(5) { animation-delay: 0.25s; }
        .admin-table tbody tr:nth-child(6) { animation-delay: 0.30s; }
        .admin-table tbody tr:nth-child(7) { animation-delay: 0.35s; }
        .admin-table tbody tr:nth-child(8) { animation-delay: 0.40s; }
        .admin-table tbody tr:nth-child(9) { animation-delay: 0.45s; }
        .admin-table tbody tr:nth-child(10) { animation-delay: 0.50s; }
        .admin-table tbody tr:nth-child(n+11) { animation-delay: 0.55s; }

        .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; background: rgba(0, 137, 123, 0.15); color: #00796b; }
        .badge.pro { background: rgba(255, 143, 0, 0.15); color: #e65100; }
      </style>

      <div class="admin-dashboard">
        <h2 class="admin-header">Platform Command Center</h2>
        <div class="kpi-grid">
          <div class="kpi-card" onclick="window.openAdminModal('schools', this)">
            <div class="kpi-icon">🏫</div><div class="kpi-title">Registered Schools</div><div class="kpi-value">${stats.schools}</div>
          </div>
          <div class="kpi-card" onclick="window.openAdminModal('mentors', this)">
            <div class="kpi-icon">👨‍🏫</div><div class="kpi-title">Active Mentors</div><div class="kpi-value">${stats.mentors}</div>
          </div>
          <div class="kpi-card" onclick="window.openAdminModal('students', this)">
            <div class="kpi-icon">🎓</div><div class="kpi-title">Students</div><div class="kpi-value">${stats.students}</div>
          </div>
          <div class="kpi-card" onclick="window.openAdminModal('tasks', this)">
            <div class="kpi-icon">📋</div><div class="kpi-title">Tasks Assigned</div><div class="kpi-value">${stats.tasks}</div>
          </div>
          <div class="kpi-card" onclick="window.openAdminModal('pro', this)">
            <div class="kpi-icon">💎</div><div class="kpi-title">Pro Subscriptions</div><div class="kpi-value">${stats.paid}</div>
          </div>
        </div>
      </div>

      <div id="adminModalOverlay" class="admin-modal-overlay" onclick="if(event.target === this) window.closeAdminModal()">
        <div class="admin-modal-content" id="adminModalContent">
          <div class="admin-modal-header">
            <h2 id="adminModalTitle">Data View</h2>
            <button class="close-btn" onclick="window.closeAdminModal()">×</button>
          </div>
          <div id="adminModalBody" class="admin-modal-body"></div>
        </div>
      </div>`;
    window.closeAdminModal = function() {document.getElementById('adminModalOverlay').classList.remove('active');};
    window.openAdminModal = async function(type, clickedElement) {
      const overlay = document.getElementById('adminModalOverlay');
      const contentCard = document.getElementById('adminModalContent');
      const body = document.getElementById('adminModalBody');
      const title = document.getElementById('adminModalTitle');
      if(clickedElement) {
        const rect = clickedElement.getBoundingClientRect();
        const cardCenterX = rect.left + (rect.width / 2);
        const cardCenterY = rect.top + (rect.height / 2);
        const windowCenterX = window.innerWidth / 2;
        const windowCenterY = window.innerHeight / 2;
        const offsetX = cardCenterX - windowCenterX;
        const offsetY = cardCenterY - windowCenterY;
        contentCard.style.setProperty('--origin-x', `${offsetX}px`);
        contentCard.style.setProperty('--origin-y', `${offsetY}px`);}
      overlay.classList.add('active');
      body.innerHTML = '<div style="text-align:center; padding: 40px; color: #444;"><h3>Fetching Live Data... ⏳</h3></div>';
      try {
        if (type === 'schools') {
          title.innerText = "Registered Schools";
          const snap = await getDocs(collection(db, "schools"));
          let html = `<table class="admin-table">
            <thead><tr><th>School Name</th><th>City / State</th><th>Incharge</th><th>Status</th></tr></thead><tbody>`;
          snap.forEach(doc => {
            const data = doc.data();
            const isPro = data.paidSubscription ? `<span class="badge pro">PRO</span>` : `<span class="badge">FREE</span>`;
            html += `<tr>
              <td><strong>${data.schoolName || doc.id}</strong></td>
              <td>${data.address?.city || 'N/A'}, ${data.address?.state || ''}</td>
              <td>${data.incharge?.firstName || 'N/A'}</td>
              <td>${isPro}</td></tr>`;});
          html += `</tbody></table>`;
          body.innerHTML = html;}
        if (type === 'mentors') {
          title.innerText = "Active Mentors";
          const mentorSnap = await getDocs(query(collection(db, "users"), where("role", "==", "mentor")));
          const assignmentSnap = await getDocs(collection(db, "mentorSchoolAssignments"));
          let mentorSchools = {}; 
          assignmentSnap.forEach(d => {const data = d.data(); if (!mentorSchools[data.mentorId]) mentorSchools[data.mentorId] = []; mentorSchools[data.mentorId].push(data.schoolId);});
          let html = `<table class="admin-table"><thead><tr><th>Mentor Name</th><th>Email</th><th>Assigned Schools (IDs)</th></tr></thead><tbody>`;
          mentorSnap.forEach(doc => {
            const data = doc.data();
            const assigned = mentorSchools[doc.id] ? mentorSchools[doc.id].join(", ") : "Unassigned";
            html += `<tr><td><strong>${data.name || 'Unknown'}</strong></td><td>${data.email || 'N/A'}</td>
              <td><span class="badge">${assigned}</span></td></tr>`;});
          html += `</tbody></table>`;body.innerHTML = html;    }
        if (type === 'students') {
          title.innerText = "Student Directory";
          const studentSnap = await getDocs(query(collection(db, "users"), where("role", "==", "student")));
          const tasksSnap = await getDocs(collection(db, "tasks"));
          let taskCounts = {};let studentMentors = {}; 
          tasksSnap.forEach(d => {
            const t = d.data();
            if (t.studentId) {taskCounts[t.studentId] = (taskCounts[t.studentId] || 0) + 1;
              if (t.mentorId) studentMentors[t.studentId] = t.mentorId;}});
          let html = `<table class="admin-table"><thead><tr><th>Student Name</th><th>School ID</th><th>Assigned Tasks</th><th>Mentor ID</th></tr></thead><tbody>`;
          studentSnap.forEach(doc => {
            const data = doc.data();
            const tasksAssigned = taskCounts[doc.id] || 0;
            const mentorAssigned = studentMentors[doc.id] || "No Mentor Yet";
            html += `<tr><td><strong>${data.name || 'Unknown'}</strong></td> <td>${data.schoolId || 'Unassigned'}</td>
              <td><span class="badge pro">${tasksAssigned} Tasks</span></td><td>${mentorAssigned}</td></tr>`;});
          html += `</tbody></table>`;body.innerHTML = html;}} catch (error) {
        console.error("Error fetching modal data:", error);
        body.innerHTML = `<div style="text-align:center; padding: 40px; color: #ff3b30;">
          <h3>Failed to load data.</h3><p>${error.message}</p></div>`;}
        if (type === 'tasks') {title.innerText = "Global Task Monitor";
          const tasksSnap = await getDocs(collection(db, "tasks"));
          const usersSnap = await getDocs(collection(db, "users"));
          let userMap = {}; usersSnap.forEach(u => userMap[u.id] = u.data().name || 'Unknown User');
          let html = `<table class="admin-table"><thead><tr><th>Task Title</th><th>Assigned Student</th><th>Status</th><th>Progress</th></tr></thead><tbody>`;
          if (tasksSnap.empty) {
            html += `<tr><td colspan="4" style="text-align:center;">No tasks have been assigned yet.</td></tr>`;} else {
            tasksSnap.forEach(doc => {
              const data = doc.data();
              const studentName = userMap[data.studentId] || data.studentId || 'Unassigned';
              let statusBadge = `<span class="badge">${data.status || 'Assigned'}</span>`;
              if (data.status === 'completed') statusBadge = `<span class="badge pro">Completed ✓</span>`;
              if (data.status === 'in progress') statusBadge = `<span class="badge" style="background: rgba(0, 102, 255, 0.15); color: #0066ff;">In Progress</span>`;
              html += `<tr>
                <td><strong>${data.title || 'Untitled Task'}</strong><br><small style="color:#666;">Due: ${data.dueDate || 'No Date'}</small></td>
                <td>${studentName}</td><td>${statusBadge}</td><td><strong>${data.progress || 0}%</strong></td></tr>`;});}
          html += `</tbody></table>`;body.innerHTML = html;}
        if (type === 'pro') {title.innerText = "Premium Schools Directory";
          const proSnap = await getDocs(query(collection(db, "school"), where("paidSubscription", "==", true)));
          let html = `<table class="admin-table"><thead><tr><th>School Name</th><th>Location</th><th>Primary Contact</th><th>Plan</th></tr></thead><tbody>`;
          if (proSnap.empty) { html += `<tr><td colspan="4" style="text-align:center;">No active Pro subscriptions found.</td></tr>`;} else {
            proSnap.forEach(doc => {const data = doc.data();html += `<tr>
                <td><strong>${data.schoolName || doc.id}</strong></td>
                <td>${data.address?.city || 'N/A'}, ${data.address?.state || ''}</td>
                <td>${data.incharge?.firstName || 'N/A'} ${data.incharge?.lastName || ''}<br>
                    <small style="color:#666;">${data.incharge?.email || 'No Email'}</small></td>
                <td><span class="badge pro">PRO Active 💎</span></td>
              </tr>`;});}
          html += `</tbody></table>`;body.innerHTML = html;}};
  } catch (error) {
    console.error("Fatal error loading admin overview:", error);
    container.innerHTML = `<div class="card"><h3 style="color: #ff3b30;">Database Connection Error</h3><code>${error.message}</code></div>`;}}
export async function loadAdminSchools(db, contentArea) {
  const container = contentArea || document.getElementById("dashboardContent");
  if (!container) return;
  container.innerHTML = `<div style="text-align:center; padding: 40px; color: #444;"><h3>Loading School Database... ⏳</h3></div>`;
  try {
    const [schoolsSnap, mentorsSnap, assignmentsSnap] = await Promise.all([
      getDocs(collection(db, "schools")),
      getDocs(query(collection(db, "users"), where("role", "==", "mentor"))),
      getDocs(collection(db, "mentorSchoolAssignments"))]);
    let mentorOptions = `<option value="">-- Unassigned --</option>`;
    mentorsSnap.forEach(doc => {
      mentorOptions += `<option value="${doc.id}">${doc.data().name || doc.data().email}</option>`;});
    let schoolAssignments = {};
    assignmentsSnap.forEach(doc => {
      const data = doc.data();
      schoolAssignments[data.schoolId] = { docId: doc.id, mentorId: data.mentorId };});

    // i'll js add the liquid glass here
    let html = `
      <style>
        .admin-page-header { margin-bottom: 32px; color: #111; font-size: 24px; font-weight: 800; animation: floatIn 0.5s ease-out forwards; }
        .glass-panel {
          background: rgba(255, 255, 255, 0.55);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 16px 40px -8px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.9);
          border-radius: 20px; padding: 24px; overflow: hidden;
          animation: floatIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        .glass-table { width: 100%; border-collapse: collapse; text-align: left; }
        .glass-table th { 
          padding: 16px; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.5px; font-size: 0.85rem;
          border-bottom: 2px solid rgba(0,0,0,0.05);
        }
        .glass-table td { padding: 16px; border-bottom: 1px solid rgba(0,0,0,0.03); color: #333; font-size: 0.95rem; vertical-align: middle; }
        .glass-table tr:hover { background: rgba(255,255,255,0.4); }
        .glass-table tr:last-child td { border-bottom: none; }

        /* Premium Dropdown */
        .glass-select {
          all: unset; box-sizing: border-box;
          background: rgba(255, 255, 255, 0.7); border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 8px; padding: 8px 12px; font-size: 0.9rem; font-weight: 600; color: #333;
          cursor: pointer; transition: all 0.2s; width: 100%; max-width: 200px;
        }
        .glass-select:hover { background: #fff; border-color: #0066ff; box-shadow: 0 4px 12px rgba(0, 102, 255, 0.1); }
        .glass-select:focus { border-color: #0066ff; box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.15); }

        /* Premium Toggles */
        .status-toggle {
          all: unset; cursor: pointer; padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 700;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); text-align: center; display: inline-block; width: 60px;
        }
        .status-toggle.free { background: rgba(0,0,0,0.05); color: #666; }
        .status-toggle.free:hover { background: rgba(0,0,0,0.1); transform: scale(1.05); }
        .status-toggle.pro { background: #fff8e1; color: #ff8f00; box-shadow: 0 4px 12px rgba(255, 143, 0, 0.2); border: 1px solid rgba(255, 143, 0, 0.3); }
        .status-toggle.pro:hover { transform: scale(1.05); box-shadow: 0 6px 16px rgba(255, 143, 0, 0.3); }
        .status-toggle.disabled { opacity: 0.5; pointer-events: none; }
      </style>
      <h2 class="admin-page-header">School Directory</h2>
      <div class="glass-panel">
        <table class="glass-table">
          <thead>
            <tr>
              <th>School Name & Location</th>
              <th>Contact Info</th>
              <th>Pro Status</th>
              <th>Assigned Mentor</th>
            </tr>
          </thead>
          <tbody>`;
    if (schoolsSnap.empty) {
      html += `<tr><td colspan="4" style="text-align:center; padding: 40px; color: #666;">No schools registered yet.</td></tr>`;
    } else {
      schoolsSnap.forEach(schoolDoc => {
        const data = schoolDoc.data();
        const schoolId = schoolDoc.id;
        const isPro = data.paidSubscription === true;
        const proClass = isPro ? 'pro' : 'free';
        const proText = isPro ? 'PRO' : 'FREE';
        const currentAssignment = schoolAssignments[schoolId];
        const assignedMentorId = currentAssignment ? currentAssignment.mentorId : "";
        const assignmentDocId = currentAssignment ? currentAssignment.docId : "";
        let dynamicDropdown = `<select class="glass-select" onchange="window.adminChangeMentor('${schoolId}', this.value, '${assignmentDocId}', this)">
          ${mentorOptions}
        </select>`;
        if (assignedMentorId) {
          dynamicDropdown = dynamicDropdown.replace(`value="${assignedMentorId}"`, `value="${assignedMentorId}" selected`);}
        html += `
          <tr><td><strong style="font-size: 1.05rem;">${data.schoolName || schoolId}</strong><br>
              <span style="color: #666; font-size: 0.85rem;">${data.address?.city || 'City N/A'}, ${data.address?.state || 'State N/A'}</span></td><td>
              <div style="font-weight: 600;">${data.incharge?.firstName || ''} ${data.incharge?.lastName || ''}</div>
              <div style="color: #666; font-size: 0.85rem;">${data.incharge?.email || 'No Email'}</div>
              <div style="color: #666; font-size: 0.85rem;">${data.incharge?.phone || 'No Phone'}</div>
            </td><td>
              <button class="status-toggle ${proClass}" id="pro-btn-${schoolId}" onclick="window.adminTogglePro('${schoolId}', ${isPro}, this)">
                ${proText}</button></td><td>
              ${dynamicDropdown}</td></tr>`;});}
    html += `</tbody></table></div>`;
    container.innerHTML = html;
    window.adminTogglePro = async function(schoolId, currentStatus, btnElement) {
      btnElement.classList.add('disabled');
      btnElement.innerText = "...";
      try {const newStatus = !currentStatus;
        await updateDoc(doc(db, "schools", schoolId), {paidSubscription: newStatus});
          btnElement.className = `status-toggle ${newStatus ? 'pro' : 'free'}`;
          btnElement.innerText = newStatus ? 'PRO' : 'FREE';
        btnElement.setAttribute('onclick', `window.adminTogglePro('${schoolId}', ${newStatus}, this)`);
      } catch (error) {
        console.error("Failed to update subscription:", error);
        alert("Update failed. Check console.");
        btnElement.innerText = currentStatus ? 'PRO' : 'FREE';
      } finally {
        btnElement.classList.remove('disabled');}};
    window.adminChangeMentor = async function(schoolId, newMentorId, existingAssignmentDocId, selectElement) {
      selectElement.disabled = true;
      const originalColor = selectElement.style.color;
      selectElement.style.color = "#ff9500";
      try {if (!newMentorId) {
          if (existingAssignmentDocId) {
            await deleteDoc(doc(db, "mentorSchoolAssignments", existingAssignmentDocId));
            selectElement.setAttribute('onchange', `window.adminChangeMentor('${schoolId}', this.value, '', this)`);
          }} else {
          if (existingAssignmentDocId) {
            await updateDoc(doc(db, "mentorSchoolAssignments", existingAssignmentDocId), {
              mentorId: newMentorId,
              assignedAt: new Date()
            });} else {
            const docRef = await addDoc(collection(db, "mentorSchoolAssignments"), {
              schoolId: schoolId, mentorId: newMentorId, assignedAt: new Date(), assignedBy: "admin"});
            selectElement.setAttribute('onchange', `window.adminChangeMentor('${schoolId}', this.value, '${docRef.id}', this)`);}}
        selectElement.style.color = "#00c853";
        setTimeout(() => selectElement.style.color = originalColor, 1500);} catch (error) {
        console.error("Failed to reassign mentor:", error);
        alert("Failed to assign mentor. Check console.");
        selectElement.style.color = "#ff3b30"; } finally {
        selectElement.disabled = false;}};} catch (error) {
    console.error("Error loading schools directory:", error);
    container.innerHTML = `<div class="glass-panel"><h3 style="color: #ff3b30;">Failed to load Database</h3><code>${error.message}</code></div>`;}}
  
export async function loadAdminUsers(db, contentArea) {
  const container = contentArea || document.getElementById("dashboardContent");
  if (!container) return;
  container.innerHTML = `
    <style>
      .admin-page-header { margin-bottom: 24px; color: #111; font-size: 24px; font-weight: 800; animation: floatIn 0.5s ease-out forwards; }
      .admin-tabs { display: flex; gap: 16px; margin-bottom: 24px; animation: floatIn 0.6s ease-out forwards; }
      .admin-tab { padding: 12px 24px; border-radius: 12px; cursor: pointer; font-weight: 700; color: #555; background: rgba(255,255,255,0.4); border: 1px solid rgba(255,255,255,0.6); backdrop-filter: blur(10px); transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
      .admin-tab:hover { background: rgba(255,255,255,0.7); transform: translateY(-2px); }
      .admin-tab.active { background: rgba(255,255,255,0.9); box-shadow: 0 8px 24px rgba(0, 102, 255, 0.15); border-color: #0066ff; color: #0066ff; transform: scale(1.02); }
      .glass-panel { background: rgba(255, 255, 255, 0.55); backdrop-filter: blur(24px) saturate(180%); -webkit-backdrop-filter: blur(24px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.8); box-shadow: 0 16px 40px -8px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.9); border-radius: 20px; padding: 24px; overflow: hidden; animation: floatIn 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
      .glass-table { width: 100%; border-collapse: collapse; text-align: left; }
      .glass-table th { padding: 16px; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.5px; font-size: 0.85rem; border-bottom: 2px solid rgba(0,0,0,0.05); }
      .glass-table td { padding: 16px; border-bottom: 1px solid rgba(0,0,0,0.03); color: #333; font-size: 0.95rem; vertical-align: middle; }
      .glass-table tr.slide-in-item:hover { background: rgba(255,255,255,0.6); }
      .badge-status { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; }
      .badge-status.approved { background: #e0f2f1; color: #00897b; border: 1px solid rgba(0, 137, 123, 0.2); }
      .badge-status.pending { background: #fff3cd; color: #856404; border: 1px solid #ffeeba; box-shadow: 0 0 12px rgba(255, 193, 7, 0.4); animation: pulseAlert 2s infinite; }
      .badge-status.suspended { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
      @keyframes pulseAlert { 0% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.4); } 70% { box-shadow: 0 0 0 8px rgba(255, 193, 7, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0); } }
      .glass-select { all: unset; box-sizing: border-box; background: rgba(255, 255, 255, 0.7); border: 1px solid rgba(0, 0, 0, 0.1); border-radius: 8px; padding: 8px 12px; font-size: 0.85rem; font-weight: 600; color: #333; cursor: pointer; transition: all 0.2s; width: 100%; max-width: 140px; }
      .glass-select:hover { background: #fff; border-color: #0066ff; }
      @keyframes premiumSlideInLeft { 0% { opacity: 0; transform: translateX(-40px); } 100% { opacity: 1; transform: translateX(0); } }
      .slide-in-item { opacity: 0; animation: premiumSlideInLeft 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards; will-change: transform, opacity; }
      .glass-table tbody tr:nth-child(1) { animation-delay: 0.00s; } .glass-table tbody tr:nth-child(2) { animation-delay: 0.05s; }
      .glass-table tbody tr:nth-child(3) { animation-delay: 0.10s; } .glass-table tbody tr:nth-child(4) { animation-delay: 0.15s; }
      .glass-table tbody tr:nth-child(5) { animation-delay: 0.20s; } .glass-table tbody tr:nth-child(6) { animation-delay: 0.25s; }
      .glass-table tbody tr:nth-child(7) { animation-delay: 0.30s; } .glass-table tbody tr:nth-child(8) { animation-delay: 0.35s; }
      .glass-table tbody tr:nth-child(9) { animation-delay: 0.40s; } .glass-table tbody tr:nth-child(10) { animation-delay: 0.45s; }
      .glass-table tbody tr:nth-child(n+11) { animation-delay: 0.50s; }
    </style>
    <h2 class="admin-page-header">User Directory</h2>
    <div class="admin-tabs">
      <div class="admin-tab active" id="tab-mentor" onclick="window.adminLoadUsersTab('mentor')">Mentors & Approvals</div>
      <div class="admin-tab" id="tab-student" onclick="window.adminLoadUsersTab('student')">Students</div>
    </div>
    <div class="glass-panel" id="usersTableContainer"><div style="text-align:center; padding: 40px; color: #666;">Initializing directory... ⏳</div></div>`;

  window.adminLoadUsersTab = async function(role) {
    document.getElementById('tab-mentor').classList.toggle('active', role === 'mentor');
    document.getElementById('tab-student').classList.toggle('active', role === 'student');
    const tableContainer = document.getElementById('usersTableContainer');
    tableContainer.innerHTML = `<div style="text-align:center; padding: 40px; color: #666;">Fetching ${role}s... ⏳</div>`;
    try {
      const [usersSnap, schoolsSnap] = await Promise.all([ getDocs(query(collection(db, "users"), where("role", "==", role))), getDocs(collection(db, "schools")) ]);
      let schoolMap = {};
      schoolsSnap.forEach(s => schoolMap[s.id] = s.data().schoolName || s.id);
      let html = `<table class="glass-table"><thead><tr><th>User Info</th><th>Registered School</th><th>Account Status</th><th>Quick Action</th></tr></thead><tbody>`;
      if (usersSnap.empty) {
        html += `<tr><td colspan="4" style="text-align:center; padding:40px;">No ${role}s found in the database.</td></tr>`;
      } else {
        let usersData = [];
        usersSnap.forEach(doc => usersData.push({ id: doc.id, ...doc.data() }));
        usersData.sort((a, b) => {
          if (a.approvalStatus === 'pending' && b.approvalStatus !== 'pending') return -1;
          if (a.approvalStatus !== 'pending' && b.approvalStatus === 'pending') return 1; return 0;
        });
        usersData.forEach(data => {
          const schoolName = schoolMap[data.schoolId] || data.schoolId || '<span style="color:#ff3b30">Unassigned</span>';
          const status = data.approvalStatus || 'approved'; 
          let statusText = status.charAt(0).toUpperCase() + status.slice(1);
          if (status === 'approved') statusText = 'Active ✓';
          if (status === 'pending') statusText = 'Pending Approval ⚠️';
          html += `<tr class="slide-in-item"><td><strong style="font-size: 1.05rem;">${data.name || 'Unknown User'}</strong><br><span style="color: #666; font-size: 0.85rem;">${data.email || 'No email provided'}</span></td><td><strong>${schoolName}</strong></td><td><span class="badge-status ${status}">${statusText}</span></td><td><select class="glass-select" onchange="window.adminUserAction('${data.id}', this.value, '${role}', this)"><option value="">Select Action...</option>${status !== 'approved' ? `<option value="approved">✅ Approve User</option>` : ''}${status !== 'suspended' ? `<option value="suspended">🚫 Suspend User</option>` : ''}${status !== 'pending' ? `<option value="pending">⚠️ Mark as Pending</option>` : ''}<option value="delete" style="color:red;">❌ Delete Profile</option></select></td></tr>`;
        });
      }
      tableContainer.innerHTML = html + `</tbody></table>`;
    } catch (error) {
      console.error("Error loading users:", error);
      tableContainer.innerHTML = `<div style="text-align:center; color: #ff3b30; padding:40px;">Failed to load data. Check console.</div>`;
    }
  };

  window.adminUserAction = async function(userId, action, currentRoleTab, selectElement) {
    if (!action) return;
    selectElement.disabled = true;
    try {
      if (action === 'delete') {
        if (confirm("⚠️ Are you sure you want to permanently delete this user profile? This cannot be undone.")) {
          await deleteDoc(doc(db, "users", userId));
          window.adminLoadUsersTab(currentRoleTab);
        } else { selectElement.value = ""; }
      } else {
        await updateDoc(doc(db, "users", userId), { approvalStatus: action });
        window.adminLoadUsersTab(currentRoleTab);
      }
    } catch (error) {
      console.error("Action failed:", error); alert("Failed to update user. Check console.");
    } finally { selectElement.disabled = false; }
  };

  window.adminLoadUsersTab('mentor');
}