import { collection, query, where, getCountFromServer, getDocs, updateDoc, addDoc, doc, deleteDoc, getDoc, persistentLocalCache, persistentMultipleTabManager, } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { stCss, csss } from "./animations.js";

export async function loadAdminOverview(db, contentArea) {const container = contentArea || document.getElementById("dashboardContent");
  if (!container) return;
  try {const schoolsColl = collection(db, "schools");const tasksColl = collection(db, "tasks");
    const mentorsQuery = query(collection(db, "users"), where("role", "==", "mentor"));
    const studentsQuery = query(collection(db, "users"), where("role", "==", "student"));
    const paidSchoolsQuery = query(collection(db, "schools"), where("paidSubscription", "==", true));
    const [schoolsSnap, mentorsSnap, studentsSnap, tasksSnap, paidSchoolsSnap] = await Promise.all([getCountFromServer(schoolsColl),getCountFromServer(mentorsQuery),getCountFromServer(studentsQuery),getCountFromServer(tasksColl),getCountFromServer(paidSchoolsQuery)]); 
    const stats = {schools: schoolsSnap.data().count,mentors: mentorsSnap.data().count, students: studentsSnap.data().count,tasks: tasksSnap.data().count,
paid: paidSchoolsSnap.data().count};
    container.innerHTML = `
      <style>
        .admin-dashboard { animation: floatIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .admin-header { margin-bottom: 32px; color: #111; font-size: 24px; font-weight: 800; }
        .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px; margin-bottom: 32px; }
        @keyframes premiumSlideInLeft {
          0% { opacity: 0; transform: translateX(-40px); }
          100% { opacity: 1; transform: translateX(0); }}.kpi-card { background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(24px) saturate(200%);
webkit-backdrop-filter: blur(24px) saturate(200%);
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
          opacity: 0; 
          animation: premiumSlideInLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity;}
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
        .admin-modal-overlay {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0, 0, 0, 0.3); 
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(4px);
          display: flex; justify-content: center; align-items: center;
          z-index: 9999; opacity: 0; pointer-events: none; transition: opacity 0.4s ease;}
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
          transition: transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;}
        .admin-modal-overlay.active .admin-modal-content { 
          transform: translate(0px, 0px) scale(1); 
          opacity: 1;}
        .admin-modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.08); padding-bottom: 16px; margin-bottom: 20px; }
        .admin-modal-header h2 { margin: 0; font-size: 1.8rem; color: #111; font-weight: 800; letter-spacing: -0.5px; }
        .close-btn { background: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.8); font-size: 1.5rem; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: center; color: #555; }
        .close-btn:hover { background: #ff3b30; color: white; border-color: #ff3b30; transform: scale(1.1); }
        .admin-modal-body { overflow-y: auto; padding-right: 8px; max-height: 60vh; }
        .admin-modal-body::-webkit-scrollbar { width: 8px; }
        .admin-modal-body::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border-radius: 10px; }
        .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
        .admin-table th { background: rgb(255, 255, 255); backdrop-filter: blur(10px); padding: 16px; font-weight: 700; color: #444; border-bottom: 1px solid rgba(0,0,0,0.08); position: sticky; top: 0; z-index: 10; }
        .admin-table td { padding: 16px; border-bottom: 1px solid rgba(0,0,0,0.04); color: #222; font-size: 0.95rem; }
        .admin-table tr { transition: background 0.2s; }
        .slide-in-item {opacity: 0; animation: premiumSlideInLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; will-change: transform, opacity;}
        .admin-table tr.slide-in-item:hover { background: rgb(255, 255, 255); }
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
          html += `</tbody></table>`;body.innerHTML = html;   }
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
    container.innerHTML = `<div class="card"><h3 style="color: #ff3b30;">Database Connection Error</h3><code>${error.message}</code></div>`;}
}

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
        .school-clickable { cursor: pointer; transition: all 0.2s ease; display: inline-block; padding: 4px 10px; margin: -4px -10px; border-radius: 25px; width: 95%}
        .school-clickable:hover { background: rgba(0, 102, 255, 0.08); }
        .school-clickable strong { color: #007AFF; transition: color 0.2s; }
        .school-clickable:hover strong { color: #0070e7; }
        .ios-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.25); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); z-index: 9998; opacity: 0; transition: opacity 0.4s ease; pointer-events: none; }
        .ios-backdrop.active { opacity: 1; pointer-events: auto; }
/* ==========================================================================
   ULTRA-PREMIUM 3D DRAWER (One UI / Next-Gen iOS Aesthetic)
   ========================================================================== */

.ios-drawer {
  /* --- 1. YOUR ORIGINAL BASE (Untouched Structure) --- */
  position: fixed; 
  top: 0; 
  right: 0; 
  width: 100%; 
  max-width: 470px; 
  height: 100vh; 
  z-index: 9999; 
  display: flex; 
  flex-direction: column;

  /* --- 2. ENHANCED ACRYLIC BACKGROUND --- */
  /* Upgraded from flat #F2F2F7 to a translucent base for glass physics */
  background: rgba(242, 242, 247, 0.85);
  backdrop-filter: blur(48px) saturate(200%);
  -webkit-backdrop-filter: blur(48px) saturate(200%);

  /* --- 3. 3D SPATIAL SHADOWS & RIM LIGHTING --- */
  box-shadow: 
    -32px 0 64px -12px rgba(0, 0, 0, 0.15), /* Deep ambient 3D shadow */
    -8px 0 24px -4px rgba(0, 0, 0, 0.08),   /* Close contact shadow */
    inset 1.5px 0 0 rgba(255, 255, 255, 0.95), /* Crisp left-edge glass highlight */
    inset 0 1.5px 0 rgba(255, 255, 255, 0.6);  /* Soft top-edge light bounce */

  border-radius: 32px 0 0 32px;
  transform: translateX(100%) translateZ(0);
  will-change: transform, box-shadow;
  transition: 
    transform 0.55s cubic-bezier(0.32, 0.72, 0, 1),
    box-shadow 0.55s cubic-bezier(0.32, 0.72, 0, 1);}
.ios-drawer.active {
  transform: translateX(0) translateZ(0);
  box-shadow: 
    -40px 0 80px -16px rgba(0, 0, 0, 0.22),
    -12px 0 32px -8px rgba(0, 0, 0, 0.12),
    inset 1.5px 0 0 rgba(255, 255, 255, 0.89),
    inset 0 1.5px 0 rgba(255, 255, 255, 0.53);}
        .ios-drawer-header { background: #fff; padding: 24px 20px 16px; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; }
        .ios-drawer-title { font-size: 20px; font-weight: 700; color: #000; margin: 0; letter-spacing: -0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 85%; }
        .ios-drawer-close { background: #E5E5EA; border: none; width: 32px; height: 32px; border-radius: 16px; color: #8E8E93; font-weight: bold; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .ios-drawer-close:hover { background: #D1D1D6; color: #000; transform: scale(1.05); }
        .ios-drawer-content { flex: 1; overflow-y: auto; padding: 24px 30px; }
        .ios-data-group { background: #fff; border-radius: 14px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); overflow: hidden; }
        .ios-data-group-title { font-size: 13px; text-transform: uppercase; color: #8E8E93; margin: 0 0 8px 16px; font-weight: 600; letter-spacing: 0.02em; }
        .ios-data-row { display: flex; justify-content: space-between; padding: 14px 16px; border-bottom: 0.5px solid rgba(60,60,67,0.12); align-items: center; }
        .ios-data-row:last-child { border-bottom: none; }
        .ios-data-label { color: #000; font-size: 16px; font-weight: 500; }
        .ios-data-value { color: #8E8E93; font-size: 16px; text-align: right; max-width: 65%; word-wrap: break-word; line-height: 1.4; }
        .ios-badge { padding: 5px 12px; border-radius: 14px; font-size: 13px; font-weight: 600; }
        .ios-badge.success { background: rgba(52, 199, 89, 0.15); color: #34C759; }
        .ios-badge.warning { background: rgba(255, 149, 0, 0.15); color: #FF9500; }</style>
      <h2 class="admin-page-header">School Directory</h2>
      <div class="glass-panel"><table class="glass-table">
        <thead><tr><th>School Name & Location</th><th>Contact Info</th><th>Pro Status</th><th>Assigned Mentor</th></tr></thead><tbody>`;
    if (schoolsSnap.empty) {html += `<tr><td colspan="4" style="text-align:center; padding: 40px; color: #666;">No schools registered yet.</td></tr>`;} 
      else {schoolsSnap.forEach(schoolDoc => {const data = schoolDoc.data(); const schoolId = schoolDoc.id;
        const isPro = data.paidSubscription === true; const proClass = isPro ? 'pro' : 'free';
        const proText = isPro ? 'PRO' : 'FREE'; const currentAssignment = schoolAssignments[schoolId];
        const assignedMentorId = currentAssignment ? currentAssignment.mentorId : ""; const assignmentDocId = currentAssignment ? currentAssignment.docId : "";
        let dynamicDropdown = `<select class="glass-select" onchange="window.adminChangeMentor('${schoolId}', this.value, '${assignmentDocId}', this)">${mentorOptions}</select>`;
        if (assignedMentorId) {dynamicDropdown = dynamicDropdown.replace(`value="${assignedMentorId}"`, `value="${assignedMentorId}" selected`);}
        html += `<tr><td><div class="school-clickable" onclick="window.openSchoolDetails('${schoolId}')">
                <strong style="font-size: 1.05rem;">${data.schoolName || data.name || schoolId}</strong>
                <svg style="vertical-align: middle; margin-left: 4px; margin-bottom: 2px;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#007AFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg><br>
                <span style="color: #666; font-size: 0.85rem;">${data.address?.city || data.city || 'City N/A'}, ${data.address?.state || data.state || 'State N/A'}</span></div></td><td>
              <div style="font-weight: 600;">${data.incharge?.firstName || data.inFirst || ''} ${data.incharge?.lastName || data.inLast || ''}</div>
              <div style="color: #666; font-size: 0.85rem;">${data.incharge?.email || data.inEmail || 'No Email'}</div>
              <div style="color: #666; font-size: 0.85rem;">${data.incharge?.phone || data.inPhone || 'No Phone'}</div></td><td>
              <button class="status-toggle ${proClass}" id="pro-btn-${schoolId}" onclick="window.adminTogglePro('${schoolId}', ${isPro}, this)">${proText}</button></td><td>${dynamicDropdown}</td></tr>`;});}
    html += `</tbody></table></div>`;
    html += `<div id="schoolDrawerBackdrop" class="ios-backdrop" onclick="window.closeSchoolDetails()"></div><div id="schoolDrawer" class="ios-drawer">
         <div class="ios-drawer-header"><h2 id="drawerSchoolName" class="ios-drawer-title">Loading...</h2>
            <button class="ios-drawer-close" onclick="window.closeSchoolDetails()">✕</button></div><div id="drawerSchoolContent" class="ios-drawer-content">
            <div style="text-align:center; padding: 40px; color: #8E8E93;">Fetching secure data...</div></div></div>`;
    container.innerHTML = html;
    window.openSchoolDetails = async function(schoolId) {
      document.getElementById("schoolDrawerBackdrop").classList.add("active");
      document.getElementById("schoolDrawer").classList.add("active");
      const title = document.getElementById("drawerSchoolName");
      const content = document.getElementById("drawerSchoolContent");
      title.innerText = "Loading Database..."; content.innerHTML = '<div style="text-align:center; padding: 40px; color: #8E8E93; font-weight:500;">Securely fetching school profile...</div>';
      try {const docRef = doc(db, "schools", schoolId); const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {content.innerHTML = '<div style="text-align:center; padding: 40px; color: #ff3b30;">School records not found.</div>';return;}
        const data = docSnap.data();
        title.innerText = data.schoolName || data.name || schoolId;
        let drawerHtml = `<div class="ios-data-group-title">Institution Profile</div><div class="ios-data-group">
            <div class="ios-data-row"><div class="ios-data-label">ATL Recognized</div><div class="ios-data-value">${data.isAtl ? '<span class="ios-badge success">Yes</span>' : '<span style="color:#8E8E93">No</span>'}</div></div>
            <div class="ios-data-row"><div class="ios-data-label">Subscription</div><div class="ios-data-value">${data.paidSubscription ? '<span class="ios-badge success">PRO Active</span>' : '<span class="ios-badge warning">Free Tier</span>'}</div></div>
            <div class="ios-data-row"><div class="ios-data-label">State / Province</div><div class="ios-data-value">${data.state || data.address?.state || 'N/A'}</div></div>
            <div class="ios-data-row" style="flex-direction:column; align-items:flex-start; gap:8px;">
              <div class="ios-data-label">Complete Address</div>
              <div class="ios-data-value" style="text-align:left; max-width:100%;">${data.addressLine || data.address?.line1 || ''}, ${data.city || data.address?.city || ''} - ${data.pincode || data.address?.pincode || 'N/A'}</div></div></div>
          <div class="ios-data-group-title">Lab Incharge</div>
          <div class="ios-data-group"><div class="ios-data-row"><div class="ios-data-label">Name</div><div class="ios-data-value">${data.inFirst || data.incharge?.firstName || ''} ${data.inLast || data.incharge?.lastName || ''}</div></div>
            <div class="ios-data-row"><div class="ios-data-label">Email</div><div class="ios-data-value" style="color:#007AFF;">${data.inEmail || data.incharge?.email || 'N/A'}</div></div>
            <div class="ios-data-row"><div class="ios-data-label">WhatsApp</div><div class="ios-data-value">${data.inPhone || data.incharge?.phone || 'N/A'}</div></div></div>
          <div class="ios-data-group-title">Principal Details</div>
          <div class="ios-data-group"><div class="ios-data-row"><div class="ios-data-label">Name</div><div class="ios-data-value">${data.prFirst || data.principal?.firstName || ''} ${data.prLast || data.principal?.lastName || ''}</div></div>
            <div class="ios-data-row"><div class="ios-data-label">Email</div><div class="ios-data-value" style="color:#007AFF;">${data.prEmail || data.principal?.email || 'N/A'}</div></div>
            <div class="ios-data-row"><div class="ios-data-label">Phone Contact</div><div class="ios-data-value">${data.prPhone || data.principal?.phone || 'N/A'}</div></div></div>`;
        if (data.sameAsPrincipal === false || data.coFirst) {
          drawerHtml += `<div class="ios-data-group-title">Correspondent Details</div>
            <div class="ios-data-group"><div class="ios-data-row"><div class="ios-data-label">Name</div><div class="ios-data-value">${data.coFirst || ''} ${data.coLast || ''}</div></div>
              <div class="ios-data-row"><div class="ios-data-label">Email</div><div class="ios-data-value" style="color:#007AFF;">${data.coEmail || 'N/A'}</div></div>
              <div class="ios-data-row"><div class="ios-data-label">Phone Contact</div><div class="ios-data-value">${data.coPhone || 'N/A'}</div></div></div>`;}
        if (data.website) {drawerHtml += `
            <div class="ios-data-group" style="margin-top: 24px; text-align:center;"><a href="${data.website.startsWith('http') ? data.website : 'https://'+data.website}" target="_blank" style="display:block; padding:16px; color:#007AFF; font-weight:600; text-decoration:none; font-size:16px;">Open School Website ↗</a></div>`;}
        content.innerHTML = drawerHtml;} catch (err) {console.error("Error fetching school details", err);
        content.innerHTML = '<div style="text-align:center; padding: 40px; color: #ff3b30;">Failed to fetch database records. Check console.</div>';}};
    window.closeSchoolDetails = function() {
      document.getElementById("schoolDrawerBackdrop").classList.remove("active");
      document.getElementById("schoolDrawer").classList.remove("active");};
    window.adminTogglePro = async function(schoolId, currentStatus, btnElement) {
      btnElement.classList.add('disabled'); btnElement.innerText = "...";
      try {const newStatus = !currentStatus;
        await updateDoc(doc(db, "schools", schoolId), {paidSubscription: newStatus});
          btnElement.className = `status-toggle ${newStatus ? 'pro' : 'free'}`;
          btnElement.innerText = newStatus ? 'PRO' : 'FREE';
        btnElement.setAttribute('onclick', `window.adminTogglePro('${schoolId}', ${newStatus}, this)`);
      } catch (error) {
        console.error("Failed to update subscription:", error);
        alert("Update failed. Check console.");
        btnElement.innerText = currentStatus ? 'PRO ❤️' : 'FREE 💔';
      } finally {btnElement.classList.remove('disabled');}};
    window.adminChangeMentor = async function(schoolId, newMentorId, existingAssignmentDocId, selectElement) {
      selectElement.disabled = true;
      const originalColor = selectElement.style.color;
      selectElement.style.color = "#ff9500";
      try {if (!newMentorId) {if (existingAssignmentDocId) {await deleteDoc(doc(db, "mentorSchoolAssignments", existingAssignmentDocId));selectElement.setAttribute('onchange', `window.adminChangeMentor('${schoolId}', this.value, '', this)`);}} 
          else {if (existingAssignmentDocId) {await updateDoc(doc(db, "mentorSchoolAssignments", existingAssignmentDocId), {mentorId: newMentorId, assignedAt: new Date()});}
              else {const docRef = await addDoc(collection(db, "mentorSchoolAssignments"), {schoolId: schoolId, mentorId: newMentorId, assignedAt: new Date(), assignedBy: "admin"});
            selectElement.setAttribute('onchange', `window.adminChangeMentor('${schoolId}', this.value, '${docRef.id}', this)`);}}
        selectElement.style.color = "#00c853";
        setTimeout(() => selectElement.style.color = originalColor, 1500);} catch (error) {console.error("Failed to reassign mentor:", error);
        alert("Failed to assign mentor. Check console.");
        selectElement.style.color = "#ff3b30"; } finally {selectElement.disabled = false;}};} catch (error) {console.error("Error loading schools directory:", error);
    container.innerHTML = `<div class="glass-panel"><h3 style="color: #ff3b30;">Failed to load Database</h3><code>${error.message}</code></div>`;}}
export async function loadAdminUsers(db, contentArea) {const container = contentArea || document.getElementById("dashboardContent");
  if (!container) return;
  const safeStr = (str) => {if (!str) return '';
    return String(str).replace(/[&<>"']/g, function(m) {return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[m];});};
  container.innerHTML = `<style>
      .admin-page-header { margin-bottom: 24px; color: #111; font-size: 24px; font-weight: 800; animation: floatIn 0.5s ease-out forwards; }
      .admin-tabs { display: flex; gap: 16px; margin-bottom: 24px; animation: floatIn 0.6s ease-out forwards; }
      .admin-tab { padding: 12px 24px; border-radius: 12px; cursor: pointer; font-weight: 700; color: #555; background: rgba(255,255,255,0.4); border: 1px solid rgba(255,255,255,0.6); backdrop-filter: blur(10px); transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
      .admin-tab:hover { background: rgba(255,255,255,0.7); transform: translateY(-2px); }
      .admin-tab.active { background: rgba(255,255,255,0.9); box-shadow: 0 8px 24px rgba(0, 102, 255, 0.15); border-color: #3586ff; color: #0066ff; transform: scale(1.02); }
      .glass-controls { display: flex; gap: 16px; margin-bottom: 20px; align-items: center; animation: floatIn 0.65s ease-out forwards; flex-wrap: wrap; }
      .glass-search-wrap { position: relative; flex: 2; min-width: 250px; }
      .glass-search-wrap svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 18px; color: #888; transition: 0.3s; }
      .glass-search { appearance: none; -webkit-appearance: none; width: 100%; padding: 12px 16px 12px 42px; font-family: 'Poppins', sans-serif; font-size: 0.95rem; font-weight: 500; border: 1px solid rgba(255,255,255,0.8); border-radius: 30px; background: rgba(255, 255, 255, 0.55); color: #111; backdrop-filter: blur(30px); box-shadow: inset 0 4px 8px rgba(0,0,0,0.02); transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); box-sizing: border-box; }
      .glass-search:focus { outline: none; background: rgba(255,255,255,0.9); border-color: #0066ff; box-shadow: 0 0 0 4px rgba(0, 102, 255, 0.15); }
      .glass-search-wrap:focus-within svg { color: #2378f7; transform: translateY(-50%) scale(1.1); }
      .glass-filter-btn { flex: 1; min-width: 160px; appearance: none; -webkit-appearance: none; padding: 12px 16px; border-radius: 25px; border: 1px solid rgba(255,255,255,0.8);  font-family: 'Poppins', sans-serif; font-size: 0.95rem; font-weight: 600; background: rgba(255, 255, 255, 0.55); color: #333; backdrop-filter: blur(12px); cursor: pointer; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
      .glass-filter-btn:focus, .glass-filter-btn:hover { outline: none; background: rgba(255,255,255,0.9); border-color: #2a7bf4; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
      .glass-panel { background: rgba(255, 255, 255, 0.55); backdrop-filter: blur(24px) saturate(180%); -webkit-backdrop-filter: blur(30px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.8); box-shadow: 0 16px 40px -8px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.9); border-radius: 30px; padding: 24px; overflow: hidden; animation: floatIn 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
      .glass-table { width: 100%; border-collapse: collapse; text-align: left; }
      .glass-table th { padding: 16px; font-weight: 700; color: #555; text-transform: uppercase; border-radius: 35px;  letter-spacing: 0.5px; font-size: 0.85rem; border-bottom: 2px solid rgba(0,0,0,0.05); }
      .glass-table td { padding: 16px; border-bottom: 1px solid rgba(0,0,0,0.03); color: #333; border-radius: 35px; font-size: 0.95rem; vertical-align: middle; transition: all 0.3s ease; }
      .glass-table tr.dir-row { transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); border-radius: 30px}
      .glass-table tr.dir-row:hover { background: rgba(255,255,255,0.8); transform: scale(1.005); box-shadow: 0 4px 12px rgba(0,0,0,0.03); border-radius: 30px; }
      .glass-table tr.dir-row:hover td { border-bottom-color: transparent;border-radius: 30px; }
      .badge-status { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; }
      .badge-status.approved { background: #e0f2f1; color: #00897b; border: 1px solid rgba(0, 137, 123, 0.2); }
      .badge-status.pending { background: #fff3cd; color: #856404; border: 1px solid #ffeeba; box-shadow: 0 0 12px rgba(255, 193, 7, 0.4); animation: pulseAlert 2s infinite; }
      .badge-status.suspended { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
      @keyframes pulseAlert { 0% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.4); } 70% { box-shadow: 0 0 0 8px rgba(255, 193, 7, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0); } }
      .glass-select { all: unset; box-sizing: border-box; background: rgba(255, 255, 255, 0.7); border: 1px solid rgba(0, 0, 0, 0.1); border-radius: 25px; padding: 8px 12px; font-size: 0.85rem; font-weight: 600; color: #333; cursor: pointer; transition: all 0.2s; width: 100%; max-width: 140px; }
      .glass-select:hover { background: #fff; border-color: #2466ca; }
      @keyframes premiumSlideInLeft { 0% { opacity: 0; transform: translateX(-40px); } 100% { opacity: 1; transform: translateX(0); } }
      .slide-in-item { opacity: 0; animation: premiumSlideInLeft 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards; will-change: transform, opacity; }
      .glass-table tbody tr:nth-child(1) { animation-delay: 0.00s; } .glass-table tbody tr:nth-child(2) { animation-delay: 0.05s; }
      .glass-table tbody tr:nth-child(3) { animation-delay: 0.10s; } .glass-table tbody tr:nth-child(4) { animation-delay: 0.15s; }
      .glass-table tbody tr:nth-child(5) { animation-delay: 0.20s; } .glass-table tbody tr:nth-child(6) { animation-delay: 0.25s; }
      .glass-table tbody tr:nth-child(7) { animation-delay: 0.30s; } .glass-table tbody tr:nth-child(8) { animation-delay: 0.35s; }</style>
    <h2 class="admin-page-header">User Directory</h2><div class="admin-tabs">
      <div class="admin-tab active" id="tab-mentor" style="border-radius:35px" onclick="window.adminLoadUsersTab('mentor')">Mentors & Approvals</div>
      <div class="admin-tab" id="tab-student" style="border-radius:35px" onclick="window.adminLoadUsersTab('student')">Students</div></div>
    <div class="glass-controls"><div class="glass-search-wrap">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input type="text" id="adminUserSearch" class="glass-search" placeholder="Search by name, email, or school..." onkeyup="window.filterAdminUsers()"></div>
      <select id="adminStatusFilter" class="glass-filter-btn" onchange="window.filterAdminUsers()">
        <option value="all">All Statuses</option><option value="pending">Pending Approval ⚠️</option>
        <option value="approved">Active ✓</option><option value="suspended">Suspended ❌</option></select></div>
    <div class="glass-panel" id="usersTableContainer"><div style="text-align:center; padding: 40px; color: #666;">Initializing directory... ⏳</div></div>`;
  window.adminLoadUsersTab = async function(role) {
    document.getElementById('tab-mentor').classList.toggle('active', role === 'mentor');
    document.getElementById('tab-student').classList.toggle('active', role === 'student');
    const tableContainer = document.getElementById('usersTableContainer');
    tableContainer.innerHTML = `<div style="text-align:center; border-radius:100px; padding: 40px; color: #666;">Fetching ${role}s... ⏳</div>`;
    document.getElementById("adminUserSearch").value = "";
    document.getElementById("adminStatusFilter").value = "all";
    try {
      const { collection, query, where, getDocs, doc, deleteDoc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
      window.deleteDocAdmin = deleteDoc;
      window.updateDocAdmin = updateDoc;window.docAdmin = doc;window.dbAdmin = db;
      const [usersSnap, schoolsSnap] = await Promise.all([ 
        getDocs(query(collection(db, "users"), where("role", "==", role))), 
        getDocs(collection(db, "schools")) ]);
      let schoolMap = {}; 
      schoolsSnap.forEach(s => schoolMap[s.id] = s.data().schoolName || s.data().name || s.id);
      let html = `<table class="glass-table"><thead><tr><th>User Info</th><th>Registered School</th><th>Account Status</th><th>Quick Action</th></tr></thead><tbody id="adminUserTableBody">`;
      if (usersSnap.empty) {
        html += `<tr><td colspan="4" style="text-align:center; padding:40px; color:#666;">No ${role}s found in the database.</td></tr>`;} else {
        let usersData = [];
        usersSnap.forEach(doc => usersData.push({ id: doc.id, ...doc.data() }));
        usersData.sort((a, b) => {
          if (a.approvalStatus === 'pending' && b.approvalStatus !== 'pending') return -1;
          if (a.approvalStatus !== 'pending' && b.approvalStatus === 'pending') return 1; 
          return 0;});
        usersData.forEach(data => {
          const schoolName = schoolMap[data.schoolId] || data.schoolId || '<span style="color:#ff3b30">Unassigned</span>';
          const status = data.approvalStatus || 'approved'; 
          let statusText = status.charAt(0).toUpperCase() + status.slice(1);
          if (status === 'approved') statusText = 'Active ✓'; 
          if (status === 'pending') statusText = 'Pending Approval ⚠️';
          const name = safeStr(data.name || 'Unknown User');const email = safeStr(data.email || 'No email provided');
          const searchStr = `${name} ${email} ${schoolName}`.toLowerCase();
          html += `<tr class="slide-in-item dir-row" data-search="${searchStr}" data-status="${status}"><td>
                <strong style="font-size: 1.05rem;">${name}</strong><br>
                <span style="color: #666; font-size: 0.85rem;">${email}</span></td>
              <td><strong>${schoolName}</strong></td>
              <td><span class="badge-status ${status}">${statusText}</span></td><td>
                <select class="glass-select" onchange="window.adminUserAction('${data.id}', this.value, '${role}', this)">
                  <option value="">Select Action...</option>
                  ${status !== 'approved' ? `<option value="approved">✅ Approve User</option>` : ''}
                  ${status !== 'suspended' ? `<option value="suspended">⏸️ Suspend User</option>` : ''}
                  ${status !== 'pending' ? `<option value="pending">⚠️ Mark as Pending</option>` : ''}
                  <option value="delete" style="color:red;">❌ Delete Profile</option>
                </select></td></tr>`;});}
      tableContainer.innerHTML = html + `</tbody></table>`;} catch (error) {
      console.error("Error loading users:", error);
      tableContainer.innerHTML = `<div style="text-align:center; color: #ff3b30; padding:40px;">Failed to load data. Check console.</div>`;}}
  window.filterAdminUsers = function() {
    const searchInput = document.getElementById("adminUserSearch").value.toLowerCase();
    const statusFilter = document.getElementById("adminStatusFilter").value;
    const rows = document.querySelectorAll(".dir-row");
    rows.forEach(row => {
      const searchStr = row.getAttribute("data-search") || "";
      const rowStatus = row.getAttribute("data-status") || "";
      const matchesSearch = searchStr.includes(searchInput);
      const matchesStatus = statusFilter === 'all' || rowStatus === statusFilter;
      if (matchesSearch && matchesStatus) {
        row.style.display = "table-row";
      } else {row.style.display = "none";}});};
  window.adminUserAction = async function(userId, action, currentRoleTab, selectElement) {
    if (!action) return; 
    selectElement.disabled = true;
    try {if (action === 'delete') { if (confirm("⚠️ Are you sure you want to permanently delete this user profile? This cannot be undone.")) {
          await window.deleteDocAdmin(window.docAdmin(window.dbAdmin, "users", userId));
          window.adminLoadUsersTab(currentRoleTab);} else {selectElement.value = ""; selectElement.disabled = false;}} else {
        await window.updateDocAdmin(window.docAdmin(window.dbAdmin, "users", userId), { approvalStatus: action });
        window.adminLoadUsersTab(currentRoleTab);}} catch (error) {
      console.error("Action failed:", error); 
      alert("Failed to update user. Check console.");
      selectElement.disabled = false;}};
  window.adminLoadUsersTab('mentor');}
export async function loadStudentRegistration(db, contentArea) {
  const container = contentArea || document.getElementById("dashboardContent");
  if (!container) return;
  
  container.innerHTML = `<div style="text-align:center; padding: 80px; color: #71717a; font-weight:500; font-family: 'Poppins', 'Inter', sans-serif;">Provisioning Secure Workspace...</div>`;
  
  try {
    const { collection, getDocs, doc, setDoc, updateDoc, query, where, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
    const schoolsSnap = await getDocs(collection(db, "schools"));
    
    let schoolOptions = `<option value="" disabled selected>Select an institution</option>`;
    schoolsSnap.forEach(doc => {
      schoolOptions += `<option value="${doc.id}">${doc.data().schoolName || doc.data().name || doc.id}</option>`;
    });
    
    const formCSS = typeof stCss !== 'undefined' ? stCss : ''; 
    
    const html = `<style>
      ${formCSS}
     </style>

<div class="saas-workspace">
  <div class="saas-header">
    <h2 style="font-family: 'Plus Jakarta Sans', sans-serif;">Enroll Student</h2>
    <p>Register a new student profile into HamaraLabs</p>
  </div>
  
  <div class="bulk-trigger-card" onclick="window.openBulkRegistrationModal()">
    <span class="bulk-icon">📁</span>
    <div class="bulk-trigger-title">Register Multiple Students in One Go ⌚</div>
    <div class="bulk-trigger-desc">Upload a CSV  file to instantly create multiple student accounts.</div></div>
  <form id="studentRegForm">
    <div class="saas-card">
      <div class="saas-card-header">
        <svg class="saas-card-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
        <h3 class="saas-card-title">Academic Placement</h3></div>
      <div class="saas-grid">
        <div class="saas-field saas-col-span-2"><label class="saas-label">Registered Institution *</label><select id="regSchool" class="saas-input" required>${schoolOptions}</select></div>
        <div class="saas-field"><label class="saas-label">Academic Grade *</label>
          <select id="regClass" class="saas-input" required>
            <option value="" disabled selected>Select Grade Level</option>
            <option value="6">Grade 6</option><option value="7">Grade 7</option>
            <option value="8">Grade 8</option><option value="9">Grade 9</option>
            <option value="10">Grade 10</option><option value="11">Grade 11</option><option value="12">Grade 12</option></select></div>
        <div class="saas-field"><label class="saas-label">Section / Cohort</label><input type="text" id="regSection" class="saas-input" placeholder="e.g. Science-A"></div></div></div>
    <div class="saas-card">
      <div class="saas-card-header">
        <svg class="saas-card-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
        <h3 class="saas-card-title">Personal Identity</h3></div>
      <div class="saas-grid">
        <div class="saas-field"><label class="saas-label">First Name *</label><input type="text" id="regFirst" class="saas-input" placeholder="John" required></div>
        <div class="saas-field"><label class="saas-label">Last Name</label><input type="text" id="regLast" class="saas-input" placeholder="Doe"></div>
        <div class="saas-field saas-col-span-2"><label class="saas-label">Email Address *</label><input type="email" id="regEmail" class="saas-input" placeholder="john.doe@student.edu" required></div>
        <div class="saas-field"><label class="saas-label">Gender</label>
          <select id="regGender" class="saas-input">
            <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Non-Binary / Prefer not to say</option>
          </select></div></div></div>
    <div class="saas-card">
      <div class="saas-card-header">
        <svg class="saas-card-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
        <h3 class="saas-card-title">Attributes & Skills</h3></div>
      <div class="saas-grid">
        <div class="saas-field"><label class="saas-label">Career Aspiration</label><input type="text" id="regAspiration" class="saas-input" placeholder="e.g. AI Researcher"></div>
        <div class="saas-field"><label class="saas-label">Leadership Status</label>
          <div class="saas-toggle-wrapper"><span style="font-size:0.95rem;color:var(--text-main);font-weight:500;">Assign as Team Leader</span><input type="checkbox" id="regLeader" class="saas-toggle"></div></div>
        <div class="saas-field saas-col-span-2"><label class="saas-label">Interests</label><input type="text" id="regComments" class="saas-input" placeholder="Mention about the studnet's interests.."></div>
        <div class="saas-field saas-col-span-2">
          <label class="saas-label">Skill Tags</label>
          <div class="saas-tag-input-group">
            <input type="text" id="tagInput" class="saas-input" placeholder="Type a skill and hit Enter" onkeypress="if(event.key==='Enter'){event.preventDefault();window.addStudentTag();}">
            <button type="button" class="saas-tag-btn" onclick="window.addStudentTag()">Add Tag</button></div>
          <div class="saas-tags-area" id="tagsContainer"></div></div></div></div>
    <div class="saas-card">
      <div class="saas-card-header">
        <svg class="saas-card-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
        <h3 class="saas-card-title">Guardian Records</h3></div>
      <div id="guardiansWrapper">
        <div class="guardian-block">
          <div class="guardian-header"><span>Primary Guardian</span></div><div class="saas-grid">
            <div class="saas-field"><label class="saas-label">Full Name *</label><input type="text" class="saas-input g-name" required></div>
            <div class="saas-field"><label class="saas-label">Relation</label><input type="text" class="saas-input g-relation" placeholder="e.g. Mother"></div>
            <div class="saas-field saas-col-span-2"><label class="saas-label">Contact Email</label><input type="email" class="saas-input g-email" placeholder="guardian@email.com"></div></div></div></div>
      <button type="button" class="btn-add-g" onclick="window.addGuardianBlock()">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg>
        Add Another Guardian</button></div></form></div>
<div class="saas-command-bar">
  <button type="button" class="btn-outline" onclick="document.getElementById('studentRegForm').reset();document.getElementById('tagsContainer').innerHTML='';window.studentTags=[];">Clear Fields</button>
  <button type="button" class="btn-solid" onclick="window.submitStudentForm(this)">Complete Enrollment
    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg></button></div>
<div id="bulkRegOverlay" class="bulk-overlay" onclick="if(event.target===this) window.closeBulkRegistrationModal()">
  <div class="bulk-modal">
    <div class="bulk-header"><div>
        <div style="font-size: 0.8rem; color: #4361ee; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Automated Pipeline</div>
        <h3 style="margin: 4px 0 0 0; font-size: 1.6rem; color: #09090b; font-weight: 800; letter-spacing: -0.02em;">CSV Import</h3></div>
      <button class="bulk-close" onclick="window.closeBulkRegistrationModal()">✕</button> </div>
    <div class="bulk-body">
      <p style="color: #64748b; font-size: 0.95rem; line-height: 1.6; margin-top: 0; margin-bottom: 24px;">Ensure your CSV contains columns for <strong>email, name, schoolId</strong>. Existing students will automatically be merged.</p>
      <div class="bulk-drop-zone" id="csvBulkDropZone">
        <span style="font-size: 3rem; margin-bottom: 16px; display: block; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));">📄</span>
        <div style="font-size: 1.2rem; font-weight: 800; color: #0f172a;" id="bulkDropText">Click to select a .CSV file</div>
        <div style="font-size: 0.95rem; color: #64748b; margin-top: 8px;" id="bulkDropSubtext">Valid formats: .csv only (save Excel as CSV)</div>
        <input type="file" id="csvBulkInput" accept=".csv" onchange="window.handleBulkCSVSelection(event)">
      </div>

      <div class="bulk-status-box" id="bulkProcStatus">
        <div style="font-size: 1.3rem; font-weight: 800; color: #0f172a; letter-spacing:-0.02em;" id="bulkProcCount">Preparing Pipeline...</div>
        <div class="bulk-prog-wrap"><div class="bulk-prog-fill" id="bulkProcFill"></div></div>
        <div style="font-size: 0.95rem; color: #64748b; font-weight: 600;" id="bulkProcLog">Awaiting execution command.</div>
      </div>
      
      <button class="bulk-btn" id="executeBulkBtn" style="display:none; margin-top: 12px;" onclick="window.executeBulkRegistration()">▶ Execute Data Import</button>
    </div>
  </div>
</div>
`;
    container.innerHTML = html; 

    window.studentTags = [];
    window.addStudentTag = function() {const input = document.getElementById('tagInput');const val = input.value.trim();
      if (val && !window.studentTags.includes(val)) {window.studentTags.push(val); window.renderStudentTags();input.value = '';}};
    window.removeStudentTag = function(tagToRemove) {window.studentTags = window.studentTags.filter(t => t !== tagToRemove);window.renderStudentTags();};
    window.renderStudentTags = function() {const cont = document.getElementById('tagsContainer');cont.innerHTML = window.studentTags.map(tag => `<div class="saas-chip">${tag} <span onclick="window.removeStudentTag('${tag}')">✕</span></div>`).join('');};
    window.guardianCount = 1;
    window.addGuardianBlock = function() {window.guardianCount++;const wrapper = document.getElementById('guardiansWrapper');
      const newId = Date.now(); const blockHTML = `<div class="guardian-block" id="g-block-${newId}">
            <div class="guardian-header"><span>Secondary Guardian</span><button type="button" class="btn-remove-g" onclick="document.getElementById('g-block-${newId}').remove();">Remove</button></div>
            <div class="saas-grid"><div class="saas-field"><label class="saas-label">Full Name *</label><input type="text" class="saas-input g-name" required></div><div class="saas-field"><label class="saas-label">Relation</label><input type="text" class="saas-input g-relation" placeholder="e.g. Father"></div>
              <div class="saas-field saas-col-span-2"><label class="saas-label">Contact Email</label><input type="email" class="saas-input g-email" placeholder="guardian@email.com"></div></div></div>`;
      wrapper.insertAdjacentHTML('beforeend', blockHTML);};
      
    window.submitStudentForm = async function(btn) {
      const form = document.getElementById('studentRegForm');
      if (!form.reportValidity()) return; 

      const originalHtml = btn.innerHTML;
      btn.innerHTML = `<svg class="animate-spin" width="18" height="18" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Scanning Database...`;
      btn.disabled = true;
      try { const guardians = [];
        document.querySelectorAll('.guardian-block').forEach(block => {guardians.push({name: block.querySelector('.g-name').value,relation: block.querySelector('.g-relation').value,email: block.querySelector('.g-email').value});});
        const studentEmail = document.getElementById('regEmail').value.trim().toLowerCase();
        const studentName = `${document.getElementById('regFirst').value} ${document.getElementById('regLast').value}`.trim();
        const payload = {
          role: "student",
          schoolId: document.getElementById('regSchool').value,
          class: document.getElementById('regClass').value,
          section: document.getElementById('regSection').value,
          name: studentName,
          email: studentEmail,
          gender: document.getElementById('regGender').value,
          aspiration: document.getElementById('regAspiration').value,
          isTeamLeader: document.getElementById('regLeader').checked,
          comments: document.getElementById('regComments').value,
          tags: window.studentTags,
          guardians: guardians,
          approvalStatus: 'approved'
        };
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", studentEmail));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {btn.innerHTML = `<svg class="animate-spin" width="18" height="18" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Merging Profile...`;
          const existingUID = querySnapshot.docs[0].id;
          payload.updatedAt = new Date(); 
          await updateDoc(doc(db, "users", existingUID), payload);
          btn.innerHTML = "Profile Updated! ✓"; btn.style.background = "#10b981";} else {
          btn.innerHTML = `<svg class="animate-spin" width="18" height="18" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Provisioning Account...`;
          const defaultPassword = "hamaralabs@1234"; 
          const firebaseConfig = {
            apiKey: "AIzaSyAPyLzaSXa1wMjD77wMi1-Z2bSvhAbFCBU",
            authDomain: "digital-atl.firebaseapp.com",
            projectId: "digital-atl",
            storageBucket: "digital-atl.firebasestorage.app",
            messagingSenderId: "428997443618",
            appId: "1:428997443618:web:0cb487a807a8ccd5ee0a7b"};
          
          const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
          const { getAuth, createUserWithEmailAndPassword, signOut } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");

          let secondaryApp;
          try { secondaryApp = initializeApp(firebaseConfig, "SecondaryAuthApp"); } catch (e) {secondaryApp = window.secondaryAppInstance; }
          window.secondaryAppInstance = secondaryApp;
          const secondaryAuth = getAuth(secondaryApp);
          const userCredential = await createUserWithEmailAndPassword(secondaryAuth, studentEmail, defaultPassword);
          const newStudentUID = userCredential.user.uid;
          await signOut(secondaryAuth);
          payload.createdAt = new Date(); 
          await setDoc(doc(db, "users", newStudentUID), payload);
          btn.innerHTML = "Account Created! ✓";
          btn.style.background = "#10b981";}
        setTimeout(() => {
          form.reset();
          window.studentTags = [];
          window.renderStudentTags();
          document.getElementById('guardiansWrapper').innerHTML = `
            <div class="guardian-block">
                <div class="guardian-header"><span>Primary Guardian</span></div>
                <div class="saas-grid">
                  <div class="saas-field"><label class="saas-label">Full Name *</label><input type="text" class="saas-input g-name" required></div>
                  <div class="saas-field"><label class="saas-label">Relation</label><input type="text" class="saas-input g-relation" placeholder="e.g. Mother"></div>
                  <div class="saas-field saas-col-span-2"><label class="saas-label">Contact Email</label><input type="email" class="saas-input g-email" placeholder="guardian@email.com"></div>
                </div>
            </div>`;
          window.guardianCount = 1;
          btn.innerHTML = originalHtml;
          btn.style.background = "var(--brand-primary)";
          btn.disabled = false;}, 2500);
      } catch (err) {
        console.error("Enrollment/Update Error:", err);
        let errorMsg = "An error occurred while processing the student data. Check console.";
        if (err.code === 'auth/email-already-in-use') {
            errorMsg = "An account with this email already exists in the authentication system.";}
        alert(errorMsg);
        btn.innerHTML = "Try Again";
        btn.style.background = "var(--danger)";
        btn.disabled = false;}};

    window.parsedBulkData = null;

    window.openBulkRegistrationModal = () => {
      document.body.classList.add("modal-active-body");
      const overlay = document.getElementById("bulkRegOverlay");
      overlay.classList.add("active");
    };

    window.closeBulkRegistrationModal = () => {
      const overlay = document.getElementById("bulkRegOverlay");
      overlay.classList.remove("active");
      document.body.classList.remove("modal-active-body");
      setTimeout(() => {
        document.getElementById("bulkDropText").innerText = "Click to select a .CSV file";
        document.getElementById("bulkDropText").style.color = "#0f172a";
        document.getElementById("bulkDropSubtext").innerText = "Valid formats: .csv only";
        document.getElementById("csvBulkInput").value = "";
        document.getElementById("executeBulkBtn").style.display = "none";
        document.getElementById("csvBulkDropZone").style.display = "block";
        document.getElementById("bulkProcStatus").style.display = "none";
        document.getElementById("executeBulkBtn").innerText = "▶ Execute Data Import";
        document.getElementById("executeBulkBtn").style.background = "linear-gradient(135deg, #10b981, #059669)";
        document.getElementById("executeBulkBtn").onclick = window.executeBulkRegistration;
        window.parsedBulkData = null;
      }, 500); 
    };

    window.handleBulkCSVSelection = function(event) {
      const file = event.target.files[0];
      if (!file) return;
      if (!file.name.toLowerCase().endsWith('.csv')) {
        alert("Please upload a valid .CSV file. If you have Excel, save it as CSV first.");
        event.target.value = '';
        return;
      }
      document.getElementById("bulkDropText").innerText = `Ready: ${file.name}`;
      document.getElementById("bulkDropText").style.color = "#4361ee";
      document.getElementById("bulkDropSubtext").innerText = "File parsed successfully.";
      document.getElementById("executeBulkBtn").style.display = "block";
      document.getElementById("bulkProcStatus").style.display = "none";

      const reader = new FileReader();
      reader.onload = function(e) {
        const text = e.target.result;
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) return;
        
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^\uFEFF/, '').replace(/["']/g, ''));
        const results = [];
        for (let i = 1; i < lines.length; i++) {const currentLine = lines[i].split(',');const obj = {};
          for (let j = 0; j < headers.length; j++) {if (headers[j]) obj[headers[j]] = currentLine[j] ? currentLine[j].trim().replace(/^"|"$/g, '') : '';}
          if (obj.email) results.push(obj); }window.parsedBulkData = results;};reader.readAsText(file);};

    window.executeBulkRegistration = async function() {
      const data = window.parsedBulkData;
      if (!data || data.length === 0) { alert("No valid data found. Ensure CSV has an 'email' column."); return; }
      document.getElementById("executeBulkBtn").style.display = "none";
      document.getElementById("csvBulkDropZone").style.display = "none";
      document.getElementById("bulkProcStatus").style.display = "block";
      const countText = document.getElementById("bulkProcCount");
      const fillBar = document.getElementById("bulkProcFill");
      const logText = document.getElementById("bulkProcLog");
      const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
      const { getAuth, createUserWithEmailAndPassword, signOut } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");
      const firebaseConfig = { apiKey: "AIzaSyAPyLzaSXa1wMjD77wMi1-Z2bSvhAbFCBU", authDomain: "digital-atl.firebaseapp.com", projectId: "digital-atl", storageBucket: "digital-atl.firebasestorage.app", messagingSenderId: "428997443618", appId: "1:428997443618:web:0cb487a807a8ccd5ee0a7b" };
      
      let secondaryApp;
      try { secondaryApp = initializeApp(firebaseConfig, "BulkAuthApp"); } catch (e) { secondaryApp = window.bulkAppInstance || window.secondaryAppInstance; }
      window.bulkAppInstance = secondaryApp;
      const secondaryAuth = getAuth(secondaryApp);

      let successCount = 0; let mergedCount = 0; let newCount = 0;

      for (let i = 0; i < data.length; i++) {
        const student = data[i];
        const email = student.email.toLowerCase();
        
        countText.innerText = `Processing: ${i + 1} / ${data.length}`;
        fillBar.style.width = `${Math.round(((i + 1) / data.length) * 100)}%`;
        logText.innerText = `Scanning DB for: ${email}...`;

        try {
          const q = query(collection(db, "users"), where("email", "==", email));
          const snap = await getDocs(q);
          const cleanName = student.name || student.fullname || student.studentname || "Unknown Student";
          const cleanSchoolId = student.schoolid || student.schoolId || student.school || "unassigned";
          const safePayload = {
            ...student,
            name: cleanName,
            email: email,schoolId: cleanSchoolId,role: "student",approvalStatus: 'approved'};

          if (!snap.empty) {
            const docId = snap.docs[0].id;
            logText.innerText = `Merging updates: ${cleanName}`;
            safePayload.updatedAt = serverTimestamp();
            await updateDoc(doc(db, "users", docId), safePayload); 
            mergedCount++;
          } else {
            logText.innerText = `Creating Auth & Profile: ${cleanName}`;
            const userCred = await createUserWithEmailAndPassword(secondaryAuth, email, "hamaralabs@1234");
            await signOut(secondaryAuth);
            
            safePayload.createdAt = serverTimestamp();
            safePayload.tags = safePayload.tags || [];
            safePayload.guardians = safePayload.guardians || [];
            
            await setDoc(doc(db, "users", userCred.user.uid), safePayload);
            newCount++;
          }
          successCount++;
        } catch (err) { console.error("Error processing:", email, err); }
      }

      countText.innerText = `Import Complete! ✓`;
      countText.style.color = "#10b981";
      fillBar.style.width = `100%`;
      logText.innerHTML = `<span style="color:#10b981; font-weight:800;">${successCount} Processed</span> <br> (${mergedCount} Merged | ${newCount} Created)`;
      
      const actionBtn = document.getElementById("executeBulkBtn");
      actionBtn.style.display = "block";
      actionBtn.innerText = "Close Window";
      actionBtn.style.background = "#0f172a";
      actionBtn.onclick = window.closeBulkRegistrationModal;
    };

  } catch (error) {
    console.error("Form load error:", error);
    container.innerHTML = `<div style="text-align:center; padding: 40px; color: #ef4444;">Error initializing database components.</div>`;
  }
}  export async function loadStudentList(db, contentArea) {
  const container = contentArea || document.getElementById("dashboardContent");
  if (!container) return;

  container.innerHTML = `<div style="text-align:center; padding: 80px; color: #71717a; font-family: 'Inter', sans-serif;">Fetching Student Records...</div>`;

  const safeStr = (str) => {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function(m) {
      return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[m];
    });
  };

  try {
    const { collection, query, where, getDocs } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
    const schoolsSnap = await getDocs(collection(db, "schools"));
    const schoolMap = {};
    let schoolFilterOptions = `<option value="all">All Institutions</option>`;
    
    schoolsSnap.forEach(s => {
        const sName = s.data().schoolName || s.data().name || "Unknown School";
        schoolMap[s.id] = sName;
        schoolFilterOptions += `<option value="${s.id}">${safeStr(sName)}</option>`;
    });
    schoolFilterOptions += `<option value="unassigned">Unassigned / Independent</option>`;
    const studentsSnap = await getDocs(query(collection(db, "users"), where("role", "==", "student")));
    window.studentCache = {};
    let studentRowsHTML = '';
    let delay = 0;

    if (studentsSnap.empty) {
      studentRowsHTML = `<tr><td colspan="4" style="text-align:center; padding: 40px; color:#71717a;">No students found in the database.</td></tr>`;
    } else {
      studentsSnap.forEach(doc => {
        const data = doc.data();
        window.studentCache[doc.id] = { id: doc.id, ...data }; 
        const schoolId = data.schoolId && schoolMap[data.schoolId] ? data.schoolId : "unassigned";
        const schoolName = schoolMap[data.schoolId] || "Unassigned";
        const gradeClass = data.class ? safeStr(data.class).toLowerCase() : "unassigned";
        const gradeInfo = data.class ? `Class ${safeStr(data.class)} ${data.section ? '- ' + safeStr(data.section) : ''}` : "N/A";
        const name = safeStr(data.name || 'Unknown Student');
        const email = safeStr(data.email || 'No email provided');
        const avatarInitial = name.charAt(0).toUpperCase();
        const searchString = `${name} ${email} ${schoolName}`.toLowerCase();
        studentRowsHTML += `
          <tr class="sl-row" data-search="${searchString}" data-school-id="${schoolId}" data-grade="${gradeClass}" style="animation-delay: ${delay}s" onclick="window.openStudentDrawer('${doc.id}')">
            <td>
              <div class="sl-user-cell">
                <div class="sl-avatar">${avatarInitial}</div>
                <div>
                  <div class="sl-name">${name}</div>
                  <div class="sl-email">${email}</div>
                </div>
              </div>
            </td>
            <td><div class="sl-school">${safeStr(schoolName)}</div></td>
            <td><div class="sl-grade">${gradeInfo}</div></td>
            <td><button class="sl-view-btn">Profile</button></td>
          </tr>`;delay += 0.03;});}

    const css = `
      <style>
        .sl-theme-container { --brand-primary: oklch(0.55 0.16 245); --brand-hover: oklch(0.48 0.18 245); --brand-glow: oklch(0.55 0.16 245 / 0.15); --brand-gradient: linear-gradient(135deg, oklch(0.55 0.16 245), oklch(0.50 0.18 255)); --surface-solid: #ffffff; --surface-muted: oklch(0.97 0.01 250); --text-main: oklch(0.2 0.02 250); --text-muted: oklch(0.55 0.02 250); --border-subtle: rgba(0, 0, 0, 0.04); --border-default: rgba(0, 0, 0, 0.08); --shadow-md: 0 12px 24px -4px rgba(0, 0, 0, 0.06), 0 4px 8px -2px rgba(0, 0, 0, 0.03), inset 0 1px 1px rgba(255, 255, 255, 1); --shadow-drawer: -30px 0 60px -15px rgba(0, 0, 0, 0.2), -2px 0 10px rgba(0, 0, 0, 0.05); --spring-bouncy: cubic-bezier(0.34, 1.56, 0.64, 1); --spring-smooth: cubic-bezier(0.2, 0.8, 0.2, 1); color-scheme: light !important; }
        .sl-workspace { max-width: 1040px; margin: 0 auto; padding: 40px 24px 100px 24px; font-family: 'Inter', sans-serif; color: var(--text-main); animation: workspaceEnter 0.8s var(--spring-smooth) forwards; }
        .sl-header-flex { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; gap: 24px; flex-wrap: wrap; }
        .sl-header h2 { font-size: clamp(2rem, 4vw, 2.5rem); font-weight: 800; margin: 0 0 8px 0; letter-spacing: -0.04em; background: linear-gradient(135deg, oklch(0.1 0 0), oklch(0.4 0.02 250)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .sl-header p { margin: 0; color: var(--text-muted); font-size: 1.05rem; font-weight: 500; }
        .sl-controls { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; align-items: center; }
        .sl-search-box { position: relative; flex: 2; min-width: 250px; }
        .sl-search-box svg { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); width: 18px; color: oklch(0.6 0.02 250); transition: 0.3s; }
        .sl-search-input { appearance: none; -webkit-appearance: none; width: 100%; padding: 12px 16px 12px 44px; font-family: inherit; font-size: 0.95rem; font-weight: 500; border: 1px solid var(--border-default); border-radius: 12px; background: rgba(255, 255, 255, 0.6); color: var(--text-main); transition: all 0.3s var(--spring-bouncy); box-sizing: border-box; }
        .sl-search-input:focus { outline: none; background: var(--surface-solid); border-color: var(--brand-primary); box-shadow: 0 0 0 4px var(--brand-glow); }
        .sl-filter { flex: 1; min-width: 180px; padding: 12px 16px; border: 1px solid var(--border-default); border-radius: 12px; font-family: inherit; font-size: 0.95rem; font-weight: 500; background-color: var(--surface-solid); color: var(--text-main); cursor: pointer; transition: 0.3s; }
        .sl-filter:focus { outline: none; border-color: var(--brand-primary); box-shadow: 0 0 0 4px var(--brand-glow); }
        .sl-card { background: var(--surface-solid); border: 1px solid var(--border-subtle); border-radius: 20px; box-shadow: var(--shadow-md); overflow: hidden; position: relative; }
        .sl-table { width: 100%; border-collapse: separate; border-spacing: 0; text-align: left; }
        .sl-table th { padding: 20px 24px; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid var(--border-default); background: var(--surface-muted); }
        .sl-table td { padding: 16px 24px; border-bottom: 1px solid var(--border-subtle); vertical-align: middle; transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1); }
        .sl-row { transition: all 0.4s var(--spring-smooth); cursor: pointer; opacity: 0; animation: rowEnter 0.6s var(--spring-smooth) forwards; background: var(--surface-solid); }
        .sl-table:has(.sl-row:hover) .sl-row:not(:hover) { opacity: 0.4; filter: blur(1px) grayscale(20%); transform: scale(0.99); }
        .sl-row:hover { background: var(--surface-solid); box-shadow: 0 12px 24px -8px rgba(0,0,0,0.1), 0 0 0 1px var(--border-subtle); transform: scale(1.01) translateZ(10px); z-index: 10; position: relative; border-radius: 12px; }
        .sl-row:hover td { border-bottom-color: transparent; }
        .sl-row:last-child td { border-bottom: none; }
        .sl-user-cell { display: flex; align-items: center; gap: 16px; }
        .sl-avatar { width: 44px; height: 44px; border-radius: 50%; background: var(--brand-gradient); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem; flex-shrink: 0; }
        .sl-name { font-weight: 700; font-size: 0.95rem; color: var(--text-main); margin-bottom: 2px; }
        .sl-email { font-size: 0.85rem; color: var(--text-muted); font-weight: 500; }
        .sl-school { font-weight: 600; color: var(--text-main); font-size: 0.95rem; }
        .sl-grade { display: inline-block; padding: 6px 12px; background: var(--surface-muted); border-radius: 20px; font-size: 0.8rem; font-weight: 700; color: oklch(0.4 0.02 250); border: 1px solid var(--border-default); }
        .sl-view-btn { all: unset; font-size: 0.85rem; font-weight: 700; color: var(--brand-primary); padding: 8px 16px; border-radius: 20px; transition: all 0.3s var(--spring-bouncy); background: var(--brand-glow); cursor: pointer; opacity: 0; transform: translateX(-10px); }
        .sl-row:hover .sl-view-btn { opacity: 1; transform: translateX(0); background: var(--brand-primary); color: white; box-shadow: 0 4px 12px var(--brand-glow); }
        .sl-backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); z-index: 9998; opacity: 0; pointer-events: none; transition: opacity 0.4s var(--spring-smooth); will-change: opacity; }
        .sl-backdrop.active { opacity: 1; pointer-events: auto; }
        .sl-drawer { position: fixed; top: 0; right: 0; bottom: 0; width: 100%; max-width: 480px; background: #f2f2f7; box-shadow: var(--shadow-drawer); z-index: 9999; transform: translateX(100%); transition: transform 0.65s var(--spring-bouncy); display: flex; flex-direction: column; color-scheme: light !important; will-change: transform; border-left: 1px solid rgba(255,255,255,0.8); }
        .sl-drawer.active { transform: translateX(0); }
        .sl-drawer-header { padding: 32px 32px 24px; display: flex; justify-content: space-between; align-items: flex-start; background: #f2f2f7; position: relative; z-index: 2; }
        .sl-drawer-close { background: #e5e5ea; border: none; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #8e8e93; transition: all 0.3s var(--spring-bouncy); outline: none; }
        .sl-drawer-close:hover { background: #d1d1d6; color: #1c1c1e; transform: scale(1.1) rotate(90deg); }
        .sl-drawer-profile { display: flex; align-items: center; gap: 20px; margin-top: 12px; }
        .sl-drawer-avatar { width: 68px; height: 68px; border-radius: 50%; background: var(--brand-gradient); color: white; display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 700; box-shadow: 0 8px 20px -4px var(--brand-glow); border: 3px solid #ffffff; transform: scale(0.5) rotate(-15deg); opacity: 0; transition: all 0.6s var(--spring-bouncy); }
        .sl-drawer.active .sl-drawer-avatar { transform: scale(1) rotate(0deg); opacity: 1; transition-delay: 0.1s; }
        .sl-drawer-body { padding: 0 24px 40px; overflow-y: auto; flex: 1; background: #f2f2f7; }
        .sl-data-group { background: #ffffff; border-radius: 14px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); position: relative; overflow: hidden; opacity: 0; transform: translateY(30px) scale(0.98); transition: all 0.6s var(--spring-smooth); will-change: transform, opacity; }
        .sl-drawer.active .sl-data-group { opacity: 1; transform: translateY(0) scale(1); }
        .sl-drawer.active .sl-data-group:nth-child(1) { transition-delay: 0.15s; }
        .sl-drawer.active .sl-data-group:nth-child(2) { transition-delay: 0.22s; }
        .sl-drawer.active .sl-data-group:nth-child(3) { transition-delay: 0.29s; }
        .sl-data-title { background: transparent; padding: 20px 16px 8px 20px; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; color: #8e8e93; }
        .sl-data-row { display: flex; justify-content: space-between; align-items: baseline; padding: 16px 20px; position: relative; gap: 16px; transition: background 0.2s; }
        .sl-data-row:hover { background: #fafafc; }
        .sl-data-row:not(:last-child)::after { content: ''; position: absolute; bottom: 0; left: 20px; right: 0; height: 1px; background: #f2f2f7; }
        .sl-data-label { font-size: 0.95rem; color: #8e8e93; font-weight: 500; flex-shrink: 0; }
        .sl-data-val { font-size: 1rem; color: #1c1c1e; font-weight: 600; text-align: right; word-break: break-word; line-height: 1.4; }
        .sl-drawer-chip { display: inline-flex; padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; background: var(--brand-glow); color: var(--brand-primary); margin: 4px 2px; }
        @keyframes workspaceEnter { 0% { opacity: 0; transform: translateY(30px) scale(0.98); filter: blur(4px); } 100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } }
        @keyframes rowEnter { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 1; transform: translateY(0); } }
      </style>`;
    const html = `
      ${css}
      <div class="sl-theme-container">
        <div class="sl-workspace">
          <div class="sl-header-flex">
            <div class="sl-header"><h2>Student Directory</h2>
              <p>View and manage all enrolled students across the platform.</p></div></div>
          <div class="sl-controls"><div class="sl-search-box">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" id="dirGlobalSearch" class="sl-search-input" placeholder="Search by name, email..." onkeyup="window.filterStudentDir()">
            </div>
            <select id="dirFilterSchool" class="sl-filter" onchange="window.filterStudentDir()">
              ${schoolFilterOptions}
            </select>
            <select id="dirFilterGrade" class="sl-filter" onchange="window.filterStudentDir()">
              <option value="all">All Grades</option><option value="6">Class 6</option><option value="7">Class 7</option><option value="8">Class 8</option>
              <option value="9">Class 9</option><option value="10">Class 10</option><option value="11">Class 11</option><option value="12">Class 12</option>
              <option value="unassigned">Unassigned</option></select></div>
          <div class="sl-card">
            <table class="sl-table"><thead><tr>
                  <th>Student Profile</th><th>Institution</th><th>Academic Level</th>
                  <th>Action</th></tr></thead>
              <tbody id="studentTableBody">
                ${studentRowsHTML}
              </tbody></table></div></div>
        <div class="sl-backdrop" id="slBackdrop" onclick="window.closeStudentDrawer()"></div>
        <div class="sl-drawer" id="slDrawer">
           <div class="sl-drawer-header">
              <div>
                <span style="font-size:0.75rem; font-weight:800; color:#8b5cf6; text-transform:uppercase; letter-spacing:1.5px;">Profile Overview</span>
                <div class="sl-drawer-profile">
                  <div class="sl-drawer-avatar" id="drawerAvatar">?</div><div>
                    <h3 style="margin:0; font-size:1.5rem; color:#09090b; font-weight:800; letter-spacing:-0.02em;" id="drawerName">Student Name</h3>
                    <div style="color:#71717a; font-size:0.95rem; font-weight:500;" id="drawerEmail">email@domain.com</div>
                  </div></div></div>
              <button class="sl-drawer-close" onclick="window.closeStudentDrawer()">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg></button></div>
           <div class="sl-drawer-body" id="drawerBody"><div></div></div>`;
    container.innerHTML = html;
    window.filterStudentDir = function() {
      const searchInput = document.getElementById("dirGlobalSearch").value.toLowerCase();
      const schoolFilter = document.getElementById("dirFilterSchool").value;
      const gradeFilter = document.getElementById("dirFilterGrade").value;
      const rows = document.querySelectorAll(".sl-row");
      rows.forEach(row => {
        const searchStr = row.getAttribute("data-search");
        const rowSchoolId = row.getAttribute("data-school-id");
        const rowGrade = row.getAttribute("data-grade");

        const matchesSearch = searchStr.includes(searchInput);
        const matchesSchool = schoolFilter === 'all' || rowSchoolId === schoolFilter;
        const matchesGrade = gradeFilter === 'all' || rowGrade === gradeFilter;

        if (matchesSearch && matchesSchool && matchesGrade) {
          row.style.display = "table-row";} else {row.style.display = "none";}});};
    window.openStudentDrawer = function(studentId) {
      const data = window.studentCache[studentId]; 
      if (!data) return;
      const name = safeStr(data.name || 'Unknown Student');
      const email = safeStr(data.email || 'No email provided');
      document.getElementById('drawerAvatar').innerText = name.charAt(0).toUpperCase();
      document.getElementById('drawerName').innerText = name;
      document.getElementById('drawerEmail').innerText = email;
      const schoolName = safeStr(schoolMap[data.schoolId] || "Unassigned");
      let tagsHtml = `<span style="color:#a1a1aa; font-weight:500; font-size:0.9rem;">No tags assigned</span>`;
      if (data.tags && data.tags.length > 0) {
        tagsHtml = data.tags.map(tag => `<span class="sl-drawer-chip">${safeStr(tag)}</span>`).join('');}
      let leaderBadge = data.isTeamLeader ? `<span style="background:#fef08a; color:#854d0e; padding:4px 12px; border-radius:12px; font-size:0.85rem; font-weight:700;">Team Leader</span>` 
        : `<span style="color:#a1a1aa; font-weight:500;">Standard Member</span>`;
      let bodyHtml = `<div class="sl-data-group">
          <div class="sl-data-title">Academic Details</div>
          <div class="sl-data-row"><div class="sl-data-label">Institution</div><div class="sl-data-val">${schoolName}</div></div>
          <div class="sl-data-row"><div class="sl-data-label">Class</div><div class="sl-data-val">${safeStr(data.class || 'N/A')}</div></div>
          <div class="sl-data-row"><div class="sl-data-label">Section</div><div class="sl-data-val">${safeStr(data.section || 'N/A')}</div></div>
        </div>
        <div class="sl-data-group">
          <div class="sl-data-title">Profile & Skills</div>
          <div class="sl-data-row"><div class="sl-data-label">Gender</div><div class="sl-data-val">${safeStr(data.gender || 'N/A')}</div></div>
          <div class="sl-data-row"><div class="sl-data-label">Aspiration</div><div class="sl-data-val">${safeStr(data.aspiration || 'N/A')}</div></div>
          <div class="sl-data-row"><div class="sl-data-label">Team Role</div><div class="sl-data-val">${leaderBadge}</div></div>
          <div class="sl-data-row" style="flex-direction:column; align-items:flex-start; gap:12px;">
            <div class="sl-data-label">Tags / Skills</div><div>${tagsHtml}</div></div></div>`;
      if (data.guardians && data.guardians.length > 0) {
        bodyHtml += `<div class="sl-data-group"><div class="sl-data-title">Guardians & Contact</div>`;
        data.guardians.forEach((g) => {
          bodyHtml += `<div class="sl-data-row" style="flex-direction:column; align-items:flex-start; gap:6px;">
              <div style="font-weight:700; color:#09090b; font-size:1.05rem;">${safeStr(g.name || 'Unknown')} <span style="font-weight:500; color:#8e8e93; font-size:0.9rem;">(${safeStr(g.relation || 'Relation N/A')})</span></div>
              <div style="color:#4f46e5; font-size:0.95rem; font-weight:600;">${safeStr(g.email || 'No Email')}</div></div>`;});bodyHtml += `</div>`;}
      document.getElementById('drawerBody').innerHTML = bodyHtml;
      document.getElementById('slBackdrop').classList.add('active');
      document.getElementById('slDrawer').classList.add('active');};
    window.closeStudentDrawer = function() {
      document.getElementById('slBackdrop').classList.remove('active');
      document.getElementById('slDrawer').classList.remove('active');};
  } catch (error) {console.error("Error loading student list:", error);
    container.innerHTML = `<div style="text-align:center; padding: 40px; color: #ef4444; font-weight:600;">Failed to load directory. Check console.</div>`;
  }}
  export async function loadStudentSnapshot(db, contentArea, restrictedSchoolId = null) {
  const container = contentArea || document.getElementById("dashboardContent");
  if (!container) return;

  const safeStr = (str) => {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function(m) {
      return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[m];
    });
  };

  const getSortTime = (item) => {
    if (item.createdAt && typeof item.createdAt.toMillis === 'function') return item.createdAt.toMillis();
    if (item.timestamp && typeof item.timestamp.toMillis === 'function') return item.timestamp.toMillis();
    if (item.deployedAt && typeof item.deployedAt.toMillis === 'function') return item.deployedAt.toMillis();
    if (item.createdAt) return new Date(item.createdAt).getTime() || 0;
    return 0;
  };
  window.activeSnapTab = window.activeSnapTab || 'tab-missions';
  const tabCss = `
    <style>
      .snap-tab-container { background: #f1f5f9; padding: 6px; border-radius: 14px; display: inline-flex; gap: 4px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); margin-bottom: 24px; }
      .snap-tab-btn { background: transparent; color: #64748b; border: none; padding: 12px 24px; border-radius: 10px; font-size: 1.05rem; font-weight: 600; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
      .snap-tab-btn:hover { color: #0f172a; }
      .snap-tab-btn.active { background: #fff; color: #0f172a; font-weight: 700; box-shadow: 0 4px 12px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.05); }
      .snap-tab-content { animation: tabFadeIn 0.3s ease-out; }
      @keyframes tabFadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    </style>
  `;

  try {
    const { collection, query, where, getDocs, doc, getDoc, deleteDoc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
    const { getAuth } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");
    
    window.snapshotDb = db;
    window.snapshotGetDoc = getDoc;
    window.snapshotDocRef = doc;
    window.snapshotStudents = window.snapshotStudents || {}; 
    const cacheKey = `snap_persist_${restrictedSchoolId || 'global'}`;
    const savedData = localStorage.getItem(cacheKey);
    
    if (savedData && !window.forceSnapshotRefresh) {
      try {
        const parsed = JSON.parse(savedData);
        window.snapshotStudents = parsed.students || {};
        window.allStudentsList = parsed.studentList || [];
        window.snapshotMetaMap = parsed.metaMap || [];
        container.innerHTML = parsed.html;
        
        const header = container.querySelector('.snap-header h2');
        if (header && !header.innerHTML.includes('Syncing')) {
          header.innerHTML += `<span id="silent-sync-badge" style="font-size:0.8rem; color:#3b82f6; background:rgba(59, 130, 246, 0.1); padding:4px 10px; border-radius:10px; margin-left:12px; vertical-align:middle; display:inline-flex; align-items:center; gap:6px;"><span style="width:6px; height:6px; background:#3b82f6; border-radius:50%; animation:pulse 1s infinite;"></span> Syncing</span>`;
        }
        setTimeout(() => window.switchSnapshotTab(window.activeSnapTab), 50);
      } catch(e) { console.error("Cache corrupted, fetching fresh."); }
    } else {
      container.innerHTML = `<div style="text-align:center; padding: 80px; color: #71717a; font-family: 'Plus Jakarta Sans', sans-serif;">Aggregating Global Snapshot... <span style="display:inline-block; animation:spin 1s linear infinite;">⏳</span></div><style>@keyframes spin { 100% { transform:rotate(360deg); } }</style>`;
    }

    window.forceSnapshotRefresh = false;
    const auth = getAuth();
    const currentUID = auth.currentUser ? auth.currentUser.uid : null;
    if (!currentUID) return;

    const userSnap = await getDoc(doc(db, "users", currentUID));
    if (!userSnap.exists()) return;
    const userData = userSnap.data();
    const userRole = userData.role || 'student';
    
    const isAdmin = (userRole === 'admin' || userRole === 'platform-admin' || userRole === 'super-admin');
    let actualSchoolId = restrictedSchoolId || userData.schoolId;

    if (!isAdmin && (userRole === "atl-incharge" || userRole === "school-admin") && !actualSchoolId && !restrictedSchoolId) {
      const assignmentSnap = await getDocs(query(collection(db, "inchargeSchoolAssignments"), where("inchargeId", "==", currentUID)));
      if (!assignmentSnap.empty) actualSchoolId = assignmentSnap.docs[0].data().schoolId;
    }

    if (!isAdmin && !actualSchoolId) {
      container.innerHTML = `<div style="padding:40px; text-align:center; color:#ef4444; font-weight:700;">⚠️ No school assigned to your profile. Please contact Admin.</div>`;
      return;
    }

    if (isAdmin && !restrictedSchoolId) actualSchoolId = null; 
    if (userRole === "student") {
      const [tasksSnap, taSnap] = await Promise.all([
        getDocs(query(collection(db, "tasks"), where("studentId", "==", currentUID))),
        getDocs(query(collection(db, "tinkering_activities"), where("assignedTo", "==", currentUID)))
      ]);

      let myTasks = []; let myMissions = [];
      tasksSnap.forEach(doc => myTasks.push({ id: doc.id, ...doc.data() }));
      taSnap.forEach(doc => myMissions.push({ id: doc.id, ...doc.data() }));

      myTasks.sort((a, b) => getSortTime(b) - getSortTime(a));
      myMissions.sort((a, b) => getSortTime(b) - getSortTime(a));

      window.snapshotStudents[currentUID] = { id: currentUID, name: userData.name, email: userData.email, tasks: myTasks, missions: myMissions };

      const totalItems = myTasks.length + myMissions.length;
      const totalCompleted = myTasks.filter(t => (t.status||'').toLowerCase() === 'completed').length + myMissions.filter(m => (m.status||'').toLowerCase() === 'completed').length;
      const myProgress = totalItems === 0 ? 0 : Math.round((totalCompleted / totalItems) * 100);

      const finalHtmlPayload = `
        ${typeof csss !== 'undefined' ? csss : ''}
        ${tabCss}
        <div style="max-width: 900px; margin: 0 auto; padding: 40px 10px; font-family: -apple-system, sans-serif; animation: taFadeIn 0.5s ease;">
          <div class="snap-header">
            <h2 style="font-size:2.4rem; font-weight:800; color:#0f172a; margin:0 0 8px 0; letter-spacing:-1px;">My Telemetry</h2>
          </div>
          <p style="color:#64748b; font-size:1.1rem; margin-bottom:40px; font-weight:500;">Monitor your tasks and Tinkering Activity progress.</p>
          
          <div style="background:#fff; border-radius:24px; padding:32px; box-shadow:0 4px 20px rgba(0,0,0,0.03); border:1px solid #f1f5f9; display:flex; align-items:center; gap:24px; margin-bottom:40px;">
            <div style="width:80px; height:80px; border-radius:50%; background:conic-gradient(from ${myProgress * 3.6}deg, #f1f5f9, #f1f5f9), conic-gradient(#3b82f6, #10b981); display:flex; justify-content:center; align-items:center; border: 8px solid #fff; box-shadow: 0 0 0 1px rgba(0,0,0,0.05);">
              <div style="background:#fff; width:100%; height:100%; border-radius:50%; display:flex; justify-content:center; align-items:center; font-weight:800; font-size:1.2rem; color:#0f172a;">${myProgress}%</div>
            </div>
            <div>
              <h3 style="margin:0 0 8px 0; font-size:1.4rem; color:#0f172a;">Global Completion</h3>
              <div style="color:#64748b; font-weight:600;">${totalCompleted} of ${totalItems} Total Assignments Verified</div>
            </div>
          </div>
          
          <div style="display:flex; justify-content:center;">
            <div class="snap-tab-container">
              <button id="btn-tab-missions" class="snap-tab-btn ${window.activeSnapTab === 'tab-missions' ? 'active' : ''}" onclick="window.switchSnapshotTab('tab-missions')">Missions (${myMissions.length})</button>
              <button id="btn-tab-tasks" class="snap-tab-btn ${window.activeSnapTab === 'tab-tasks' ? 'active' : ''}" onclick="window.switchSnapshotTab('tab-tasks')">Standard Tasks (${myTasks.length})</button>
            </div>
          </div>

          <div id="tab-missions" class="snap-tab-content" style="display: ${window.activeSnapTab === 'tab-missions' ? 'block' : 'none'};">
            <div style="background:#fff; border-radius:20px; padding:12px 24px; border:1px solid #f1f5f9; box-shadow:0 2px 10px rgba(0,0,0,0.02);">
              ${myMissions.map(m => `
                <div onclick="window.openTADetailModal('${m.id}')" style="cursor:pointer; padding:16px 0; border-bottom:1px solid #f8fafc; display:flex; justify-content:space-between; align-items:center; transition:0.2s;" onmouseover="this.style.paddingLeft='8px'" onmouseout="this.style.paddingLeft='0'">
                  <span style="font-weight:600; color:#0f172a;">${safeStr(m.activityName)}</span> 
                  <span style="background:rgba(59,130,246,0.1); padding:6px 12px; border-radius:8px; color:#3b82f6; font-size:0.75rem; text-transform:uppercase; font-weight:800;">${m.status||'Assigned'}</span>
                </div>`).join('') || '<div style="color:#94a3b8; font-style:italic; padding:20px; text-align:center; font-weight:500;">No missions deployed.</div>'}
            </div>
          </div>

          <div id="tab-tasks" class="snap-tab-content" style="display: ${window.activeSnapTab === 'tab-tasks' ? 'block' : 'none'};">
            <div style="background:#fff; border-radius:20px; padding:12px 24px; border:1px solid #f1f5f9; box-shadow:0 2px 10px rgba(0,0,0,0.02);">
              ${myTasks.map(t => `
                <div onclick="window.openTaskDetailModal('${t.id}')" style="cursor:pointer; padding:16px 0; border-bottom:1px solid #f8fafc; display:flex; justify-content:space-between; align-items:center; transition:0.2s;" onmouseover="this.style.paddingLeft='8px'" onmouseout="this.style.paddingLeft='0'">
                  <span style="font-weight:600; color:#0f172a;">${safeStr(t.title)}</span> 
                  <span style="background:rgba(148,163,184,0.1); padding:6px 12px; border-radius:8px; color:#64748b; font-size:0.75rem; text-transform:uppercase; font-weight:800;">${t.status||'Assigned'}</span>
                </div>`).join('') || '<div style="color:#94a3b8; font-style:italic; padding:20px; text-align:center; font-weight:500;">No tasks assigned.</div>'}
            </div>
          </div>
        </div>
        ${buildModalsHTML()}
      `;
      
      container.innerHTML = finalHtmlPayload;
      try { localStorage.setItem(cacheKey, JSON.stringify({ students: window.snapshotStudents, html: finalHtmlPayload })); } catch(e){}
    } 
    else {
      const studentQuery = actualSchoolId ? query(collection(db, "users"), where("role", "==", "student"), where("schoolId", "==", actualSchoolId)) : query(collection(db, "users"), where("role", "==", "student"));
      const [schoolsSnap, studentsSnap] = await Promise.all([ getDocs(collection(db, "schools")), getDocs(studentQuery) ]);

      const schoolNames = {};
      schoolsSnap.forEach(s => schoolNames[s.id] = s.data().schoolName || s.data().name || "Unknown");

      window.snapshotMetaMap = [];
      const classesSet = new Set();
      const schoolsSet = new Set();

      studentsSnap.forEach(doc => {
        const d = doc.data();
        const sId = d.schoolId || "unassigned";
        const sClass = d.class || d.grade || "Unassigned";
        classesSet.add(sClass); schoolsSet.add(sId);
        window.snapshotMetaMap.push({ id: doc.id, name: d.name || "Unknown", email: d.email || "", class: sClass, schoolId: sId, schoolName: schoolNames[sId] || "Unassigned" });
      });

      let adminSchoolSelect = '';
      if (isAdmin) {
        let schoolOpts = `<option value="all">-- All Institutions --</option>`;
        Array.from(schoolsSet).forEach(sId => { schoolOpts += `<option value="${sId}">${safeStr(schoolNames[sId] || 'Unassigned')}</option>`; });
        adminSchoolSelect = `<select id="snapTargetSchool" onchange="window.updateSnapDropdowns()" class="snap-pro-select">${schoolOpts}</select>`;
      }

      let classOpts = `<option value="all">-- All Classes --</option>`;
      Array.from(classesSet).sort().forEach(c => { classOpts += `<option value="${c}">${safeStr(c)}</option>`; });

      const finalHtmlPayload = `
        ${typeof csss !== 'undefined' ? csss : ''} 
        ${tabCss}
        <style>
          .snap-pro-select { flex: 1; padding: 16px 20px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; color: #0f172a; font-size: 1rem; font-weight: 500; outline: none; transition: all 0.2s ease; min-width: 200px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.01); appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 16px center; background-size: 16px; }
          .snap-pro-select:focus { border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
          .snap-pro-btn { background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); color: #fff; border: none; border-radius: 12px; padding: 16px 32px; font-size: 1.05rem; font-weight: 700; letter-spacing: 0.3px; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25), inset 0 1px 0 rgba(255,255,255,0.2); display: inline-flex; justify-content: center; align-items: center; gap: 10px; }
          .snap-pro-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(59, 130, 246, 0.35), inset 0 1px 0 rgba(255,255,255,0.2); }
          .snap-pro-btn:active { transform: translateY(0); box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2); }
        </style>

        <div class="snap-theme-container">
          <div class="snap-header">
            <h2 style="display:inline-block; margin-right:10px; color:#0f172a;">Innovator Telemetry</h2>
            <p style="color:#64748b;">Target a specific student to load their live telemetry snapshot.</p>
          </div>

          <div style="background:#fff; border-radius:20px; padding:32px; border:1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.03); margin-bottom:40px;">
            <h3 style="margin: 0 0 20px 0; font-size: 1.15rem; color: #0f172a; font-weight:700;">Target Parameters</h3>
            <div style="display: flex; gap: 16px; flex-wrap: wrap;">
              ${adminSchoolSelect}
              <select id="snapTargetClass" onchange="window.updateSnapDropdowns()" class="snap-pro-select">
                ${classOpts}
              </select>
              <select id="snapTargetStudent" class="snap-pro-select" style="flex:2;">
                <option value="">-- Select a Student Target --</option>
              </select>
            </div>
            
            <div style="display:flex; justify-content: flex-end; margin-top: 24px;">
              <button onclick="window.fetchSingleStudentSnapshot()" class="snap-pro-btn">
                Retrieve Telemetry 
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>

          <div id="singleStudentResultArea">
             <div style="text-align:center; padding: 60px; color:#94a3b8; font-style:italic; font-weight:500;">Awaiting target selection...</div>
          </div>
        </div>
        ${buildModalsHTML()}
      `;

      container.innerHTML = finalHtmlPayload;
      try { localStorage.setItem(cacheKey, JSON.stringify({ metaMap: window.snapshotMetaMap, html: finalHtmlPayload })); } catch(e){}

      window.updateSnapDropdowns = function() {
        const selSchool = document.getElementById('snapTargetSchool');
        const selClass = document.getElementById('snapTargetClass');
        const selStudent = document.getElementById('snapTargetStudent');
        
        const schoolFilter = selSchool ? selSchool.value : 'all';
        const classFilter = selClass ? selClass.value : 'all';

        let filteredStudents = window.snapshotMetaMap.filter(s => {
          const matchSchool = schoolFilter === 'all' || s.schoolId === schoolFilter;
          const matchClass = classFilter === 'all' || s.class === classFilter;
          return matchSchool && matchClass;
        });

        let opts = `<option value="">-- Select a Student Target (${filteredStudents.length} found) --</option>`;
        filteredStudents.sort((a,b)=> a.name.localeCompare(b.name)).forEach(s => {
           opts += `<option value="${s.id}">${safeStr(s.name)} (Class ${safeStr(s.class)})</option>`;
        });
        selStudent.innerHTML = opts;
      };

      window.updateSnapDropdowns();

      window.fetchSingleStudentSnapshot = async function() {
        const studentId = document.getElementById('snapTargetStudent').value;
        const resultArea = document.getElementById('singleStudentResultArea');
        if (!studentId) { alert("Please select a student target first."); return; }

        resultArea.innerHTML = `<div style="text-align:center; padding: 60px; color: #3b82f6; font-weight:600; font-size:1.1rem;">Securely retrieving records... <span style="display:inline-block; animation:spin 1s linear infinite;">⏳</span></div>`;
        
        try {
          const { collection, query, where, getDocs } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");

          const [tasksSnap, taSnap] = await Promise.all([
            getDocs(query(collection(window.snapshotDb, "tasks"), where("studentId", "==", studentId))),
            getDocs(query(collection(window.snapshotDb, "tinkering_activities"), where("assignedTo", "==", studentId)))
          ]);

          let stTasks = []; let stMissions = [];
          tasksSnap.forEach(doc => stTasks.push({ id: doc.id, ...doc.data() }));
          taSnap.forEach(doc => stMissions.push({ id: doc.id, ...doc.data() }));

          stTasks.sort((a, b) => getSortTime(b) - getSortTime(a));
          stMissions.sort((a, b) => getSortTime(b) - getSortTime(a));

          const targetStudent = window.snapshotMetaMap.find(s => s.id === studentId);
          window.snapshotStudents[studentId] = { ...targetStudent, tasks: stTasks, missions: stMissions };

          const totalTasks = stTasks.length;
          const completedTasks = stTasks.filter(t => (t.status || '').toLowerCase() === 'completed').length;
          const totalMissions = stMissions.length;
          const completedMissions = stMissions.filter(m => (m.status || '').toLowerCase() === 'completed').length;
          const totalItems = totalTasks + totalMissions;
          const completedItems = completedTasks + completedMissions;
          const progressPct = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);

          let tasksHtml = '';
          if (stTasks.length === 0) tasksHtml = `<div style="color:#94a3b8; font-style:italic; padding:20px; background:#f8fafc; border-radius:12px; text-align:center; font-weight:500;">No standard tasks assigned.</div>`;
          stTasks.forEach(task => {
            const status = (task.status || 'assigned').toLowerCase();
            tasksHtml += `
              <div class="tm-task-row" id="task-row-${task.id}" style="border-bottom: 1px solid #f1f5f9; padding: 16px 0; display:flex; justify-content:space-between; align-items:center;">
                <div class="tm-task-info">
                  <h4 onclick="window.openTaskDetailModal('${task.id}')" style="cursor:pointer; color:#0f172a; margin:0 0 6px 0; font-size:1.1rem;">${safeStr(task.title)}</h4>
                  <span style="background:rgba(148,163,184,0.1); color:#64748b; padding:4px 10px; border-radius:6px; font-size:0.75rem; font-weight:700; text-transform:uppercase;">${status}</span>
                  <span style="border:1px solid #e2e8f0; color:#64748b; padding:3px 10px; border-radius:6px; font-size:0.75rem; font-weight:700; margin-left:8px;">Lvl: ${safeStr(task.difficulty || 'Beginner')}</span>
                </div>
                <div style="display:flex; gap:8px;">
                  <button onclick="window.editTaskInline('${task.id}', '${studentId}')" style="background:#f1f5f9; color:#3b82f6; border:none; padding:8px 16px; border-radius:8px; font-weight:700; cursor:pointer; transition:0.2s;">Manage</button>
                  <button onclick="window.deleteTaskInline('${task.id}', '${studentId}')" style="background:#fef2f2; color:#ef4444; border:none; padding:8px 16px; border-radius:8px; font-weight:700; cursor:pointer; transition:0.2s;">Delete</button>
                </div>
              </div>`;
          });

          let taHtml = '';
          if (stMissions.length === 0) taHtml = `<div style="color:#94a3b8; font-style:italic; padding:20px; background:#f8fafc; border-radius:12px; text-align:center; font-weight:500;">No missions deployed.</div>`;
          stMissions.forEach(m => {
            const status = (m.status || 'assigned').toLowerCase();
            taHtml += `
              <div class="tm-task-row" style="background:#f8fafc; border-left:4px solid #8b5cf6; padding: 16px; border-radius: 8px; margin-bottom: 12px; display:flex; justify-content:space-between; align-items:center;">
                <div class="tm-task-info">
                  <div style="font-size:0.75rem; color:#64748b; font-weight:800; text-transform:uppercase; letter-spacing:0.5px;">${safeStr(m.subject || 'Mission')}</div>
                  <h4 onclick="window.openTADetailModal('${m.id}')" style="cursor:pointer; color:#0f172a; margin:4px 0; font-size:1.1rem;">${safeStr(m.activityName)}</h4>
                  <span style="background:rgba(59,130,246,0.1); color:#3b82f6; padding:4px 10px; border-radius:6px; font-size:0.75rem; font-weight:700; text-transform:uppercase;">${status}</span>
                </div>
                <div class="tm-actions"><span style="font-size:0.85rem; color:#64748b; font-weight:600;">Grade via TA Reports ↗</span></div>
              </div>`;
          });

          resultArea.innerHTML = `
            <div style="background:#fff; border-radius:24px; padding:32px; border:1px solid #e2e8f0; box-shadow:0 4px 20px rgba(0,0,0,0.03); display:flex; align-items:center; gap:24px; margin-bottom:40px; animation: taFadeIn 0.4s ease-out;">
              <div style="width:80px; height:80px; border-radius:50%; background:conic-gradient(from ${progressPct * 3.6}deg, #f1f5f9, #f1f5f9), conic-gradient(#4f46e5, #3b82f6); display:flex; justify-content:center; align-items:center; border: 8px solid #fff; box-shadow: 0 0 0 1px #e2e8f0;">
                <div style="background:#fff; width:100%; height:100%; border-radius:50%; display:flex; justify-content:center; align-items:center; font-weight:800; font-size:1.2rem; color:#0f172a;">${progressPct}%</div>
              </div>
              <div>
                <h3 style="margin:0 0 4px 0; font-size:1.5rem; color:#0f172a; font-weight:800;">${safeStr(targetStudent.name)}</h3>
                <div style="color:#64748b; font-weight:600; font-size:1.05rem;">Class ${safeStr(targetStudent.class)} • ${completedItems} of ${totalItems} Master Logs Verified</div>
              </div>
            </div>
            
            <div style="display:flex; justify-content:center;">
              <div class="snap-tab-container">
                <button id="btn-tab-missions" class="snap-tab-btn ${window.activeSnapTab === 'tab-missions' ? 'active' : ''}" onclick="window.switchSnapshotTab('tab-missions')">Tinkering Activities (${stMissions.length})</button>
                <button id="btn-tab-tasks" class="snap-tab-btn ${window.activeSnapTab === 'tab-tasks' ? 'active' : ''}" onclick="window.switchSnapshotTab('tab-tasks')">Standard Tasks (${stTasks.length})</button>
              </div>
            </div>

            <div id="tab-missions" class="snap-tab-content" style="display: ${window.activeSnapTab === 'tab-missions' ? 'block' : 'none'};">
              <div style="background:#fff; border-radius:20px; padding:20px; border:1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                ${taHtml}
              </div>
            </div>

            <div id="tab-tasks" class="snap-tab-content" style="display: ${window.activeSnapTab === 'tab-tasks' ? 'block' : 'none'};">
              <div style="background:#fff; border-radius:20px; padding:20px; border:1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                ${tasksHtml}
              </div>
            </div>
          `;

        } catch (e) {
          console.error(e);
          resultArea.innerHTML = `<div style="color:#ef4444; text-align:center; padding:40px; background:#fef2f2; border-radius:16px; border:1px solid #fca5a5;">System Error: Failed to retrieve telemetry records.</div>`;
        }
      };
    }
    window.switchSnapshotTab = function(tabId) {
      window.activeSnapTab = tabId; // Save state!
      document.querySelectorAll('.snap-tab-content').forEach(el => el.style.display = 'none');
      document.querySelectorAll('.snap-tab-btn').forEach(el => el.classList.remove('active'));
      const content = document.getElementById(tabId);
      const btn = document.getElementById('btn-' + tabId);
      
      if (content) content.style.display = 'block';
      if (btn) btn.classList.add('active');
    };

    function buildModalsHTML() {
      return `
        <div id="taskDetailOverlay" class="td-overlay" onclick="if(event.target===this) window.closeTaskDetailModal()">
          <div class="td-modal" style="background:#fff; border-radius:24px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); border: 1px solid #e2e8f0; max-width:600px; width:90%;">
            <div style="padding: 24px 32px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;">
              <h3 id="tdTitle" style="margin:0; font-size:1.3rem; font-weight:800; color:#0f172a;">Loading...</h3>
              <button onclick="window.closeTaskDetailModal()" style="background:#f1f5f9; border:none; width:36px; height:36px; border-radius:18px; cursor:pointer; color:#64748b; font-weight:bold; transition:0.2s;">✕</button>
            </div>
            <div id="tdBody" style="padding:32px; max-height: 70vh; overflow-y:auto;"></div>
          </div>
        </div>
      `;
    }

    window.openTADetailModal = async function(taId) {
      const overlay = document.getElementById("taskDetailOverlay"); 
      const titleEl = document.getElementById("tdTitle");
      const bodyEl = document.getElementById("tdBody");
      if (!overlay) return;
      
      titleEl.innerText = "Mission Dossier";
      bodyEl.innerHTML = `<div style="text-align:center; color:#64748b; font-weight:600; padding:40px;">Decrypting Dossier...</div>`;
      document.body.classList.add("modal-active-body");
      overlay.classList.add("active");

      try {
        const taSnap = await window.snapshotGetDoc(window.snapshotDocRef(window.snapshotDb, "tinkering_activities", taId));
        if (!taSnap.exists()) { bodyEl.innerHTML = "Mission not found."; return; }
        const ta = taSnap.data();
        const status = (ta.status || 'assigned').toLowerCase();
        titleEl.innerText = ta.activityName || "Untitled Mission";
        let statusColor = status === 'completed' ? '#10b981' : (status === 'submitted' ? '#3b82f6' : '#64748b');

        bodyEl.innerHTML = `
          <div style="display:flex; gap:32px; margin-bottom:24px; padding-bottom:24px; border-bottom:1px solid #f1f5f9;">
            <div><strong style="color:#64748b; font-size:0.8rem; text-transform:uppercase; letter-spacing:0.5px;">Domain</strong><div style="font-weight:800; font-size:1.1rem; color:#0f172a; margin-top:6px;">${safeStr(ta.subject || "N/A")}</div></div>
            <div><strong style="color:#64748b; font-size:0.8rem; text-transform:uppercase; letter-spacing:0.5px;">TAs ID</strong><div style="font-weight:800; font-size:1.1rem; color:#0f172a; margin-top:6px;">${ta.activityId || taId.substring(0,6)}</div></div>
            <div><strong style="color:#64748b; font-size:0.8rem; text-transform:uppercase; letter-spacing:0.5px;">Status</strong><div style="font-weight:800; font-size:1.1rem; color:${statusColor}; margin-top:6px; text-transform:capitalize;">${status}</div></div>
          </div>
          <div style="background:#f8fafc; padding:24px; border-radius:16px; border:1px solid #f1f5f9; margin-bottom:24px;">
            <strong style="font-size:0.85rem; color:#64748b; text-transform:uppercase;">Mission Blueprint</strong>
            <div style="margin-top:12px; font-size:1.05rem; line-height:1.7; color:#334155; font-weight:500;">${ta.introduction || "No details provided."}</div>
          </div>
          <h4 style="font-size: 0.85rem; color: #64748b; text-transform: uppercase; margin-bottom: 12px;">Telemetry Notes</h4>
          ${ta.studentNotes ? `<div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 0 12px 12px 0; color: #78350f; font-size: 1.05rem; line-height: 1.6; margin-bottom: 24px; font-style: italic; font-weight:500;">"${ta.studentNotes}"</div>` : `<div style="color: #94a3b8; font-style: italic; margin-bottom: 24px; padding: 16px; background: #f8fafc; border-radius: 12px; text-align: center; font-weight: 500;">No field notes logged.</div>`}
          ${ta.submissionURL ? `<a href="${ta.submissionURL}" target="_blank" style="display:block; text-align:center; background:linear-gradient(135deg, #4f46e5, #3b82f6); color:white; padding:16px; border-radius:12px; font-weight:800; text-decoration:none; box-shadow:0 4px 12px rgba(59,130,246,0.3);">🔗 View Mission Evidence ↗</a>` : `<div style="text-align:center; padding:16px; background:#f8fafc; color:#64748b; border-radius:12px; font-weight:700; font-style:italic;">No evidence link submitted</div>`}
        `;}
         catch(e) { bodyEl.innerHTML = "Error loading data."; }};
      
    window.openTaskDetailModal = async function(taskId) {
      const overlay = document.getElementById("taskDetailOverlay");
      const titleEl = document.getElementById("tdTitle");
      const bodyEl = document.getElementById("tdBody");
      if (!overlay) return;
      titleEl.innerText = "Task Dossier";
      bodyEl.innerHTML = `<div style="text-align:center; color:#64748b; font-weight:600; padding:40px;">Decrypting Dossier...</div>`;
      document.body.classList.add("modal-active-body");
      overlay.classList.add("active");
      try {
        const taskSnap = await window.snapshotGetDoc(window.snapshotDocRef(window.snapshotDb, "tasks", taskId));
        if (!taskSnap.exists()) { bodyEl.innerHTML = "Task not found."; return; }
        const task = taskSnap.data();
        const progress = Number(task.progress) || 0;
        titleEl.innerText = task.title || "Untitled Task";
        bodyEl.innerHTML = `
          <div style="display:flex; gap:32px; margin-bottom:24px; padding-bottom:24px; border-bottom:1px solid #f1f5f9;">
            <div><strong style="color:#64748b; font-size:0.8rem; text-transform:uppercase;">Due Date</strong><div style="font-weight:800; font-size:1.1rem; color:#ef4444; margin-top:6px;">${task.dueDate || "N/A"}</div></div>
            <div><strong style="color:#64748b; font-size:0.8rem; text-transform:uppercase;">Priority</strong><div style="font-weight:800; font-size:1.1rem; color:#0f172a; margin-top:6px;">${task.priority || "Medium"}</div></div>
            <div><strong style="color:#64748b; font-size:0.8rem; text-transform:uppercase;">Difficulty</strong><div style="font-weight:800; font-size:1.1rem; color:#3b82f6; margin-top:6px;">${task.difficulty || "Standard"}</div></div>
          </div>
          <div style="margin-bottom:32px;">
            <div style="display:flex; justify-content:space-between; font-size:0.85rem; font-weight:800; text-transform:uppercase; margin-bottom:8px;"><span style="color:#64748b;">Completion</span><span style="color:#3b82f6;">${progress}%</span></div>
            <div style="width:100%; background:#f1f5f9; border-radius:10px; height:12px; overflow:hidden;"><div style="width:${progress}%; background:#3b82f6; height:100%; border-radius:10px; transition:width 1s ease;"></div></div>
          </div>
          <div style="background:#f8fafc; padding:24px; border-radius:16px; border:1px solid #f1f5f9; margin-bottom:32px;">
            <strong style="font-size:0.85rem; color:#64748b; text-transform:uppercase;">Task Blueprint</strong>
            <div style="margin-top:12px; font-size:1.05rem; line-height:1.7; color:#334155; font-weight:500;">${task.description || "No description provided."}</div>
          </div>
          ${task.submissionURL ? `<a href="${task.submissionURL}" target="_blank" style="display:block; text-align:center; background:linear-gradient(135deg, #4f46e5, #3b82f6); color:white; padding:16px; border-radius:12px; font-weight:800; text-decoration:none; box-shadow:0 4px 12px rgba(59,130,246,0.3);">View Submitted Files ↗</a>` : `<div style="text-align:center; padding:16px; background:#f8fafc; color:#64748b; border-radius:12px; font-weight:700; font-style:italic;">No file submitted yet</div>`}`;
      } catch(e) { bodyEl.innerHTML = "Error loading task data."; }
    };
    
    window.closeTaskDetailModal = function() {
      const overlay = document.getElementById("taskDetailOverlay");
      if (overlay) {
        overlay.classList.remove("active");
        document.body.classList.remove("modal-active-body");
      }
    };
    window.deleteTaskInline = async function(taskId, studentId) {
      if (!confirm("Delete this task permanently?")) return;
      const row = document.getElementById(`task-row-${taskId}`);
      row.style.opacity = '0.4'; row.style.pointerEvents = 'none';
      try {
        await deleteDoc(doc(db, "tasks", taskId));
        window.forceSnapshotRefresh = true; 
        window.fetchSingleStudentSnapshot(); 
      } catch (err) { alert("Failed to delete."); row.style.opacity = '1'; row.style.pointerEvents = 'auto'; }
    };
        
    window.editTaskInline = function(taskId, studentId) {
      const task = window.snapshotStudents[studentId].tasks.find(t => t.id === taskId);
      const row = document.getElementById(`task-row-${taskId}`);
      
      let studentOptions = '';
      if (window.snapshotMetaMap) {
         window.snapshotMetaMap.forEach(s => { studentOptions += `<option value="${s.id}" ${s.id === studentId ? 'selected' : ''}>${safeStr(s.name)}</option>`; });
      }

      const st = (task.status || 'assigned').toLowerCase();
      const diff = (task.difficulty || 'Beginner').toLowerCase();

      row.innerHTML = `
        <div style="width:100%; display:grid; grid-template-columns: 1fr 1fr; gap:12px; padding:16px; background:#f8fafc; border-radius:12px; border:1px solid #e2e8f0;">
          <input type="text" id="edit-title-${taskId}" value="${safeStr(task.title)}" style="grid-column: 1 / -1; padding: 12px 16px; border-radius:8px; border:1px solid #cbd5e1; outline:none; font-family:inherit; font-size:1rem;">
          <select id="edit-status-${taskId}" style="padding:12px 16px; border-radius:8px; border:1px solid #cbd5e1; outline:none; font-family:inherit;">
            <option value="assigned" ${st === 'assigned' ? 'selected' : ''}>Assigned</option>
            <option value="in progress" ${st === 'in progress' ? 'selected' : ''}>In Progress</option>
            <option value="completed" ${st === 'completed' ? 'selected' : ''}>Completed</option>
          </select>
          <select id="edit-diff-${taskId}" style="padding:12px 16px; border-radius:8px; border:1px solid #cbd5e1; outline:none; font-family:inherit;">
            <option value="Beginner" ${diff === 'beginner' ? 'selected' : ''}>Beginner</option>
            <option value="Intermediate" ${diff === 'intermediate' ? 'selected' : ''}>Intermediate</option>
            <option value="Advanced" ${diff === 'advanced' ? 'selected' : ''}>Advanced</option>
            <option value="Expert" ${diff === 'expert' ? 'selected' : ''}>Expert</option>
          </select>
          <select id="edit-student-${taskId}" style="grid-column: 1 / -1; padding:12px 16px; border-radius:8px; border:1px solid #cbd5e1; outline:none; font-family:inherit;">${studentOptions}</select>
          <div style="grid-column: 1 / -1; display:flex; gap:12px; margin-top:8px;">
            <button onclick="window.saveTaskInline('${taskId}', '${studentId}')" style="flex:1; background:#10b981; color:#fff; border:none; padding:12px; border-radius:8px; font-weight:700; cursor:pointer;">Save</button>
            <button onclick="window.fetchSingleStudentSnapshot()" style="flex:1; background:#e2e8f0; color:#475569; border:none; padding:12px; border-radius:8px; font-weight:700; cursor:pointer;">Cancel</button>
          </div>
        </div>`;
    };

    window.saveTaskInline = async function(taskId, oldStudentId) {
      const newTitle = document.getElementById(`edit-title-${taskId}`).value;
      const newStatus = document.getElementById(`edit-status-${taskId}`).value;
      const newDiff = document.getElementById(`edit-diff-${taskId}`).value;
      const newStudentId = document.getElementById(`edit-student-${taskId}`).value;
      try {
        await updateDoc(doc(db, "tasks", taskId), { title: newTitle, status: newStatus, difficulty: newDiff, studentId: newStudentId });
        window.forceSnapshotRefresh = true; 
        window.fetchSingleStudentSnapshot(); 
      } catch (err) { alert("Failed to update task."); }
    };

  } catch (error) {
    console.error("Error loading snapshot:", error);
    container.innerHTML = `<div style="text-align:center; padding: 60px; color: #ef4444; font-weight:700;">Failed to generate snapshot.</div>`;
  }
}
export function setupAdminTaskDetailDrawer(dbInstance) {
  window.adminDbInstance = dbInstance;
  if (!document.getElementById("adminTaskPremiumDrawerWrapper")) {
    const wrapper = document.createElement("div");
    wrapper.id = "adminTaskPremiumDrawerWrapper";
    wrapper.innerHTML = `
      <style>
        .at-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.3); backdrop-filter: blur(4px); z-index: 100000; opacity: 0; visibility: hidden; transition: all 0.4s ease; }
        .at-backdrop.active { opacity: 1; visibility: visible; }
        
        /* 💎 Professional Right-Side Drawer */
        .at-drawer { position: fixed; top: 0; right: 0; height: 100vh; width: 100%; max-width: 550px; background: #ffffff; box-shadow: -10px 0 50px rgba(0,0,0,0.15); z-index: 100001; transform: translateX(100%); transition: transform 0.5s cubic-bezier(0.32, 0.72, 0, 1); display: flex; flex-direction: column; border-left: 1px solid #f0f0f0; }
        .at-drawer.active { transform: translateX(0); }
        
        .at-header { padding: 24px 32px; border-bottom: 1px solid #f0f0f0; background: #fafafa; display: flex; justify-content: space-between; align-items: center; }
        .at-body { padding: 32px; overflow-y: auto; flex: 1; }
        
        /* Animated Progress Bar */
        .at-prog-track { width: 100%; height: 8px; background: #f4f4f5; border-radius: 10px; overflow: hidden; margin-top: 8px; }
        .at-prog-fill { height: 100%; background: linear-gradient(90deg, #8b5cf6, #3b82f6); width: 0%; transition: width 1s cubic-bezier(0.65, 0, 0.35, 1); }
        .at-tag { display: inline-block; padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
      </style>

      <div id="atBackdrop" class="at-backdrop" onclick="window.closeAdminTaskDetailModal()"></div>
      <div id="atDrawer" class="at-drawer">
        <div class="at-header">
          <div>
            <div style="font-size: 0.75rem; color: #8b5cf6; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Task Audit Profile</div>
            <h3 id="atTitle" style="margin: 4px 0 0 0; font-size: 1.5rem; color: #09090b; font-weight: 800; letter-spacing: -0.5px;">Loading...</h3>
          </div>
          <button onclick="window.closeAdminTaskDetailModal()" style="background: #e4e4e7; border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; color: #52525b; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; transition: 0.2s;">✕</button>
        </div><div class="at-body" id="atBody"></div></div> `;
    document.body.appendChild(wrapper);}
  window.openAdminTaskDetailModal = async function(taskId) {
    const backdrop = document.getElementById("atBackdrop");
    const drawer = document.getElementById("atDrawer");
    const titleEl = document.getElementById("atTitle");
    const bodyEl = document.getElementById("atBody");
    if (!backdrop || !drawer) return;
    titleEl.textContent = "Fetching Data...";
    bodyEl.innerHTML = `<div style="text-align:center; color:#888; margin-top:40px;">Scanning secure database... ⏳</div>`;
    backdrop.classList.add("active");
    drawer.classList.add("active");
    try {
      const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
      const taskSnap = await getDoc(doc(window.adminDbInstance, "tasks", taskId)); 

      if (!taskSnap.exists()) {
        bodyEl.innerHTML = `<div style="color:red; text-align:center;">Error: Task data not found.</div>`;
        return;
      }

      const task = taskSnap.data();
      const progress = Number(task.progress) || 0;
      titleEl.textContent = task.title || "Untitled Task";
      bodyEl.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px;">
          <div><div style="font-size:0.8rem; color:#71717a; font-weight:700; text-transform:uppercase;">Status</div><div style="margin-top:6px;"><span class="at-tag" style="background:#e0e7ff; color:#3730a3;">${task.status || "Assigned"}</span></div></div>
          <div><div style="font-size:0.8rem; color:#71717a; font-weight:700; text-transform:uppercase;">Due Date</div><div style="font-size:1.05rem; font-weight:700; color:#ef4444; margin-top:6px;">${task.dueDate || "N/A"}</div></div>
          <div><div style="font-size:0.8rem; color:#71717a; font-weight:700; text-transform:uppercase;">Priority</div><div style="font-size:1rem; font-weight:600; color:#09090b; margin-top:4px;">${task.priority || "Medium"}</div></div>
          <div><div style="font-size:0.8rem; color:#71717a; font-weight:700; text-transform:uppercase;">Difficulty</div><div style="font-size:1rem; font-weight:600; color:#09090b; margin-top:4px;">${task.difficulty || "Standard"}</div></div>
        </div>
        <div style="margin-bottom: 32px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="font-size:0.85rem; color:#71717a; text-transform:uppercase;">Task Completion</strong>
            <span style="color:#3b82f6; font-weight:800; font-size:1.1rem;">${progress}%</span>
          </div>
          <div class="at-prog-track"><div id="atFill" class="at-prog-fill" data-percent="${progress}"></div></div>
        </div>
        <div style="margin-bottom: 32px; padding: 20px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
          <strong style="font-size:0.85rem; color:#71717a; text-transform:uppercase;">Description & TA</strong>
          <div style="margin-top: 10px; font-size: 0.95rem; color: #3f3f46; line-height: 1.6;">${task.description || "No description available."}</div>
        </div>
        ${task.submissionURL ? `<div style="margin-bottom: 32px;"><a href="${task.submissionURL}" target="_blank" style="display:flex; justify-content:center; align-items:center; gap:8px; padding:14px 20px; background:#3b82f6; color:white; font-weight:700; text-decoration:none; border-radius:12px; transition:0.2s; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">📄 View Student Submission</a></div>` : `<div style="margin-bottom: 32px; padding:14px; text-align:center; background:#f4f4f5; border-radius:12px; color:#a1a1aa; font-weight:600; font-style:italic;">No file submitted yet.</div>`}
        <div style="border-top: 2px dashed #e4e4e7; padding-top: 24px;">
          <strong style="font-size:0.85rem; color:#ef4444; text-transform:uppercase; display:block; margin-bottom:12px;">Admin Override (Danger Zone)</strong>
          <p style="font-size:0.85rem; color:#71717a; margin-top:0; margin-bottom:12px;">Forcefully bypass the mentor and update the task status directly.</p>
          <div style="display:flex; gap:12px;">
            <select id="adminOverrideStatus-${taskId}" style="flex:1; padding:12px; border-radius:10px; border:1px solid #e2e8f0; font-size:0.95rem; outline:none; background: #fff; cursor: pointer;">
              <option value="assigned" ${task.status === 'assigned' ? 'selected' : ''}>Assigned</option>
              <option value="in progress" ${task.status === 'in progress' ? 'selected' : ''}>In Progress</option>
              <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed ✓</option>
            </select>
            <button onclick="window.adminForceUpdateTask('${taskId}')" style="padding:12px 24px; background:#09090b; color:white; border:none; border-radius:10px; font-weight:700; cursor:pointer; transition:0.2s;">Execute</button>
          </div></div>`;
      setTimeout(() => {
        const fill = document.getElementById("atFill");
        if (fill) fill.style.width = fill.getAttribute("data-percent") + "%";
      }, 100);

    } catch (error) {
      console.error(error);
      bodyEl.innerHTML = `<div style="color:red; text-align:center;">Failed to load data.</div>`;}};
  window.closeAdminTaskDetailModal = function() {
    const backdrop = document.getElementById("atBackdrop");
    const drawer = document.getElementById("atDrawer");
    if (backdrop) backdrop.classList.remove("active");
    if (drawer) {
      drawer.classList.remove("active");
      const fill = document.getElementById("atFill");
      if(fill) fill.style.width = "0%";}};

  window.adminForceUpdateTask = async function(taskId) {
    const newStatus = document.getElementById(`adminOverrideStatus-${taskId}`).value;
    if(confirm(`⚠️ Are you sure you want to force override this task status to: ${newStatus.toUpperCase()}?`)) {
      try {const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        await updateDoc(doc(window.adminDbInstance, "tasks", taskId), { status: newStatus });
        alert("Task status successfully overridden.");
        window.closeAdminTaskDetailModal();
} catch(e) {console.error(e);alert("Failed to execute override.");}}};}
