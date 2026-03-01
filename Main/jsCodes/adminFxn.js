import { collection, query, where, getCountFromServer, getDocs, updateDoc, addDoc, doc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { stCss } from "./animations.js";
export async function loadAdminOverview(db, contentArea) {
  const container = contentArea || document.getElementById("dashboardContent");
  if (!container) return;
  try {const schoolsColl = collection(db, "schools");const tasksColl = collection(db, "tasks");
    const mentorsQuery = query(collection(db, "users"), where("role", "==", "mentor"));
    const studentsQuery = query(collection(db, "users"), where("role", "==", "student"));
    const paidSchoolsQuery = query(collection(db, "school"), where("paidSubscription", "==", true));
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
          will-change: transform, opacity;
        }
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
          transition: transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;}
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
        
        .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
        .admin-table th { background: rgba(255,255,255,0.6); backdrop-filter: blur(10px); padding: 16px; font-weight: 700; color: #444; border-bottom: 1px solid rgba(0,0,0,0.08); position: sticky; top: 0; z-index: 10; }
        .admin-table td { padding: 16px; border-bottom: 1px solid rgba(0,0,0,0.04); color: #222; font-size: 0.95rem; }
        .admin-table tr { transition: background 0.2s; }
        
        .slide-in-item {
          opacity: 0; 
          animation: premiumSlideInLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity;
        }
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

        /* 💎 iPadOS Drawer System 💎 */
        .school-clickable { 
          cursor: pointer; transition: all 0.2s ease; display: inline-block; padding: 4px 10px; margin: -4px -10px; border-radius: 10px; 
        }
        .school-clickable:hover { background: rgba(0, 102, 255, 0.08); }
        .school-clickable strong { color: #007AFF; transition: color 0.2s; }
        .school-clickable:hover strong { color: #0056b3; }

        .ios-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.25); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); z-index: 9998; opacity: 0; transition: opacity 0.4s ease; pointer-events: none; }
        .ios-backdrop.active { opacity: 1; pointer-events: auto; }
        
        .ios-drawer { position: fixed; top: 0; right: 0; width: 100%; max-width: 460px; height: 100vh; background: #F2F2F7; box-shadow: -10px 0 50px rgba(0,0,0,0.15); z-index: 9999; transform: translateX(100%); transition: transform 0.55s cubic-bezier(0.32, 0.72, 0, 1); display: flex; flex-direction: column; }
        .ios-drawer.active { transform: translateX(0); }
        
        .ios-drawer-header { background: #fff; padding: 24px 20px 16px; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; }
        .ios-drawer-title { font-size: 20px; font-weight: 700; color: #000; margin: 0; letter-spacing: -0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 85%; }
        
        .ios-drawer-close { background: #E5E5EA; border: none; width: 32px; height: 32px; border-radius: 16px; color: #8E8E93; font-weight: bold; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .ios-drawer-close:hover { background: #D1D1D6; color: #000; transform: scale(1.05); }
        
        .ios-drawer-content { flex: 1; overflow-y: auto; padding: 24px 20px; }
        .ios-data-group { background: #fff; border-radius: 14px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); overflow: hidden; }
        .ios-data-group-title { font-size: 13px; text-transform: uppercase; color: #8E8E93; margin: 0 0 8px 16px; font-weight: 600; letter-spacing: 0.02em; }
        .ios-data-row { display: flex; justify-content: space-between; padding: 14px 16px; border-bottom: 0.5px solid rgba(60,60,67,0.12); align-items: center; }
        .ios-data-row:last-child { border-bottom: none; }
        .ios-data-label { color: #000; font-size: 16px; font-weight: 500; }
        .ios-data-value { color: #8E8E93; font-size: 16px; text-align: right; max-width: 65%; word-wrap: break-word; line-height: 1.4; }
        
        .ios-badge { padding: 5px 12px; border-radius: 14px; font-size: 13px; font-weight: 600; }
        .ios-badge.success { background: rgba(52, 199, 89, 0.15); color: #34C759; }
        .ios-badge.warning { background: rgba(255, 149, 0, 0.15); color: #FF9500; }
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
        if (assignedMentorId) {dynamicDropdown = dynamicDropdown.replace(`value="${assignedMentorId}"`, `value="${assignedMentorId}" selected`);}
        html += `
          <tr><td><div class="school-clickable" onclick="window.openSchoolDetails('${schoolId}')">
                <strong style="font-size: 1.05rem;">${data.schoolName || data.name || schoolId}</strong>
                <svg style="vertical-align: middle; margin-left: 4px; margin-bottom: 2px;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#007AFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                <br>
                <span style="color: #666; font-size: 0.85rem;">${data.address?.city || data.city || 'City N/A'}, ${data.address?.state || data.state || 'State N/A'}</span>
              </div></td><td>
              <div style="font-weight: 600;">${data.incharge?.firstName || data.inFirst || ''} ${data.incharge?.lastName || data.inLast || ''}</div>
              <div style="color: #666; font-size: 0.85rem;">${data.incharge?.email || data.inEmail || 'No Email'}</div>
              <div style="color: #666; font-size: 0.85rem;">${data.incharge?.phone || data.inPhone || 'No Phone'}</div></td><td>
              <button class="status-toggle ${proClass}" id="pro-btn-${schoolId}" onclick="window.adminTogglePro('${schoolId}', ${isPro}, this)">
                ${proText}</button>
            </td>
            <td>${dynamicDropdown}</td>
</tr>`;});}
    html += `</tbody></table></div>`;
    html += `
      <div id="schoolDrawerBackdrop" class="ios-backdrop" onclick="window.closeSchoolDetails()"></div>
      <div id="schoolDrawer" class="ios-drawer">
         <div class="ios-drawer-header">
            <h2 id="drawerSchoolName" class="ios-drawer-title">Loading...</h2>
            <button class="ios-drawer-close" onclick="window.closeSchoolDetails()">✕</button>
         </div>
         <div id="drawerSchoolContent" class="ios-drawer-content">
            <div style="text-align:center; padding: 40px; color: #8E8E93;">Fetching secure data...</div>
         </div></div>`;
    container.innerHTML = html;
    window.openSchoolDetails = async function(schoolId) {
      document.getElementById("schoolDrawerBackdrop").classList.add("active");
      document.getElementById("schoolDrawer").classList.add("active");
      const title = document.getElementById("drawerSchoolName");
      const content = document.getElementById("drawerSchoolContent");
      
      title.innerText = "Loading Database...";
      content.innerHTML = '<div style="text-align:center; padding: 40px; color: #8E8E93; font-weight:500;">Securely fetching school profile...</div>';

      try {
        const docRef = doc(db, "schools", schoolId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          content.innerHTML = '<div style="text-align:center; padding: 40px; color: #ff3b30;">School records not found.</div>';
          return;
        }

        const data = docSnap.data();
        title.innerText = data.schoolName || data.name || schoolId;
        
        let drawerHtml = `
          <div class="ios-data-group-title">Institution Profile</div>
          <div class="ios-data-group">
            <div class="ios-data-row"><div class="ios-data-label">ATL Recognized</div><div class="ios-data-value">${data.isAtl ? '<span class="ios-badge success">Yes</span>' : '<span style="color:#8E8E93">No</span>'}</div></div>
            <div class="ios-data-row"><div class="ios-data-label">Subscription</div><div class="ios-data-value">${data.paidSubscription ? '<span class="ios-badge success">PRO Active</span>' : '<span class="ios-badge warning">Free Tier</span>'}</div></div>
            <div class="ios-data-row"><div class="ios-data-label">State / Province</div><div class="ios-data-value">${data.state || data.address?.state || 'N/A'}</div></div>
            <div class="ios-data-row" style="flex-direction:column; align-items:flex-start; gap:8px;">
              <div class="ios-data-label">Complete Address</div>
              <div class="ios-data-value" style="text-align:left; max-width:100%;">${data.addressLine || data.address?.line1 || ''}, ${data.city || data.address?.city || ''} - ${data.pincode || data.address?.pincode || 'N/A'}</div>
            </div></div>
          <div class="ios-data-group-title">Lab Incharge</div>
          <div class="ios-data-group">
            <div class="ios-data-row"><div class="ios-data-label">Name</div><div class="ios-data-value">${data.inFirst || data.incharge?.firstName || ''} ${data.inLast || data.incharge?.lastName || ''}</div></div>
            <div class="ios-data-row"><div class="ios-data-label">Email</div><div class="ios-data-value" style="color:#007AFF;">${data.inEmail || data.incharge?.email || 'N/A'}</div></div>
            <div class="ios-data-row"><div class="ios-data-label">WhatsApp</div><div class="ios-data-value">${data.inPhone || data.incharge?.phone || 'N/A'}</div></div>
          </div>

          <div class="ios-data-group-title">Principal Details</div>
          <div class="ios-data-group">
            <div class="ios-data-row"><div class="ios-data-label">Name</div><div class="ios-data-value">${data.prFirst || data.principal?.firstName || ''} ${data.prLast || data.principal?.lastName || ''}</div></div>
            <div class="ios-data-row"><div class="ios-data-label">Email</div><div class="ios-data-value" style="color:#007AFF;">${data.prEmail || data.principal?.email || 'N/A'}</div></div>
            <div class="ios-data-row"><div class="ios-data-label">Phone Contact</div><div class="ios-data-value">${data.prPhone || data.principal?.phone || 'N/A'}</div></div></div>`;
        if (data.sameAsPrincipal === false || data.coFirst) {
          drawerHtml += `
            <div class="ios-data-group-title">Correspondent Details</div>
            <div class="ios-data-group">
              <div class="ios-data-row"><div class="ios-data-label">Name</div><div class="ios-data-value">${data.coFirst || ''} ${data.coLast || ''}</div></div>
              <div class="ios-data-row"><div class="ios-data-label">Email</div><div class="ios-data-value" style="color:#007AFF;">${data.coEmail || 'N/A'}</div></div>
              <div class="ios-data-row"><div class="ios-data-label">Phone Contact</div><div class="ios-data-value">${data.coPhone || 'N/A'}</div></div>
            </div>`;}
        if (data.website) {drawerHtml += `
            <div class="ios-data-group" style="margin-top: 24px; text-align:center;">
               <a href="${data.website.startsWith('http') ? data.website : 'https://'+data.website}" target="_blank" style="display:block; padding:16px; color:#007AFF; font-weight:600; text-decoration:none; font-size:16px;">Open School Website ↗</a>
            </div>`;}
        content.innerHTML = drawerHtml;} catch (err) {
        console.error("Error fetching school details", err);
        content.innerHTML = '<div style="text-align:center; padding: 40px; color: #ff3b30;">Failed to fetch database records. Check console.</div>';}};
    window.closeSchoolDetails = function() {
      document.getElementById("schoolDrawerBackdrop").classList.remove("active");
      document.getElementById("schoolDrawer").classList.remove("active");
    };

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
        selectElement.disabled = false;}};
        
  } catch (error) {
    console.error("Error loading schools directory:", error);
    container.innerHTML = `<div class="glass-panel"><h3 style="color: #ff3b30;">Failed to load Database</h3><code>${error.message}</code></div>`;}
}
  
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
    try {const [usersSnap, schoolsSnap] = await Promise.all([ getDocs(query(collection(db, "users"), where("role", "==", role))), getDocs(collection(db, "schools")) ]);
      let schoolMap = {}; schoolsSnap.forEach(s => schoolMap[s.id] = s.data().schoolName || s.id);
      let html = `<table class="glass-table"><thead><tr><th>User Info</th><th>Registered School</th><th>Account Status</th><th>Quick Action</th></tr></thead><tbody>`;
      if (usersSnap.empty) {html += `<tr><td colspan="4" style="text-align:center; padding:40px;">No ${role}s found in the database.</td></tr>`;} else {
        let usersData = [];usersSnap.forEach(doc => usersData.push({ id: doc.id, ...doc.data() }));
        usersData.sort((a, b) => {if (a.approvalStatus === 'pending' && b.approvalStatus !== 'pending') return -1;
          if (a.approvalStatus !== 'pending' && b.approvalStatus === 'pending') return 1; return 0;});
        usersData.forEach(data => {const schoolName = schoolMap[data.schoolId] || data.schoolId || '<span style="color:#ff3b30">Unassigned</span>';
          const status = data.approvalStatus || 'approved'; let statusText = status.charAt(0).toUpperCase() + status.slice(1);
          if (status === 'approved') statusText = 'Active ✓'; if (status === 'pending') statusText = 'Pending Approval ⚠️';
          html += `<tr class="slide-in-item"><td><strong style="font-size: 1.05rem;">${data.name || 'Unknown User'}</strong><br><span style="color: #666; font-size: 0.85rem;">${data.email || 'No email provided'}</span></td><td><strong>${schoolName}</strong></td><td><span class="badge-status ${status}">${statusText}</span></td><td><select class="glass-select" onchange="window.adminUserAction('${data.id}', this.value, '${role}', this)"><option value="">Select Action...</option>${status !== 'approved' ? `<option value="approved">✅ Approve User</option>` : ''}${status !== 'suspended' ? `` : ''}${status !== 'pending' ? `<option value="pending">⚠️ Mark as Pending</option>` : ''}<option value="delete" style="color:red;">❌ Delete Profile</option></select></td></tr>`;});}
      tableContainer.innerHTML = html + `</tbody></table>`;} catch (error) {console.error("Error loading users:", error);
      tableContainer.innerHTML = `<div style="text-align:center; color: #ff3b30; padding:40px;">Failed to load data. Check console.</div>`;}};
  window.adminUserAction = async function(userId, action, currentRoleTab, selectElement) {
    if (!action) return; selectElement.disabled = true;
    try {if (action === 'delete') { if (confirm("⚠️ Are you sure you want to permanently delete this user profile? This cannot be undone.")) {
          await deleteDoc(doc(db, "users", userId));
          window.adminLoadUsersTab(currentRoleTab);
        } else { selectElement.value = ""; }} else {
        await updateDoc(doc(db, "users", userId), { approvalStatus: action });
        window.adminLoadUsersTab(currentRoleTab);}} catch (error) {
      console.error("Action failed:", error); alert("Failed to update user. Check console.");
} finally { selectElement.disabled = false; }};
  window.adminLoadUsersTab('mentor');}
export async function loadStudentRegistration(db, contentArea) {
  const container = contentArea || document.getElementById("dashboardContent");
  if (!container) return;
  container.innerHTML = `<div style="text-align:center; padding: 80px; color: #71717a; font-weight:500; font-family: 'Inter', sans-serif;">Provisioning Secure Workspace...</div>`;
  try {const { collection, getDocs } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
      const schoolsSnap = await getDocs(collection(db, "schools"));
    let schoolOptions = `<option value="" disabled selected>Select an institution</option>`;
    schoolsSnap.forEach(doc => {schoolOptions += `<option value="${doc.id}">${doc.data().schoolName || doc.data().name || doc.id}</option>`;});
    const formCSS = stCss;
    const html = `<style>${formCSS}</style>
<div class="saas-workspace">
  <div class="saas-header"><h2>Enroll Student</h2><p>Register a new student profile into HamaraLabs</p></div>
  <div class="saas-dropzone" onclick="document.getElementById('bulkFile').click()">
    <svg fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
    <div class="saas-dropzone-title" id="bulkFileName">Click or drag CSV to bulk import</div>
    <div class="saas-dropzone-subtitle">Supports .csv and .xlsx files up to 10MB</div>
    <input type="file" id="bulkFile" accept=".csv, .xlsx" style="display:none;" onchange="document.getElementById('bulkFileName').innerText=this.files[0]?.name||'Click or drag CSV to bulk import';document.getElementById('bulkFileName').style.color='var(--brand-primary)';"></div>
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
        <div class="saas-field saas-col-span-2"><label class="saas-label">Additional Comments</label><input type="text" id="regComments" class="saas-input" placeholder="Achievements, prior courses, special needs..."></div>
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
    `;

    container.innerHTML = html;

    // --- LOGIC ---
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

        // 3. Construct the base Data Payload
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

        // 4. Query the database to check for existing student by email
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", studentEmail));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // 🔄 SCENARIO A: STUDENT EXISTS (Merge Data)
          btn.innerHTML = `<svg class="animate-spin" width="18" height="18" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Merging Profile...`;
          
          const existingUID = querySnapshot.docs[0].id;
          payload.updatedAt = new Date(); 
          await updateDoc(doc(db, "users", existingUID), payload);
          
          btn.innerHTML = "Profile Updated! ✓"; btn.style.background = "#10b981";
        } else {
          btn.innerHTML = `<svg class="animate-spin" width="18" height="18" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Provisioning Account...`;
          const defaultPassword = "hamaralabs@1234"; 
          const firebaseConfig = {
            apiKey: "AIzaSyAPyLzaSXa1wMjD77wMi1-Z2bSvhAbFCBU",
            authDomain: "digital-atl.firebaseapp.com",
            projectId: "digital-atl",
            storageBucket: "digital-atl.firebasestorage.app",
            messagingSenderId: "428997443618",
            appId: "1:428997443618:web:0cb487a807a8ccd5ee0a7b"
          };
          
          let secondaryApp;
          try { 
              secondaryApp = initializeApp(firebaseConfig, "SecondaryAuthApp"); 
          } catch (e) { 
              secondaryApp = window.secondaryAppInstance; 
          }
          window.secondaryAppInstance = secondaryApp;
          const secondaryAuth = getAuth(secondaryApp);
          const userCredential = await createUserWithEmailAndPassword(secondaryAuth, studentEmail, defaultPassword);
          const newStudentUID = userCredential.user.uid;
          
          await signOut(secondaryAuth);

          payload.createdAt = new Date(); 
          await setDoc(doc(db, "users", newStudentUID), payload);

          btn.innerHTML = "Account Created! ✓";
          btn.style.background = "#10b981"; 
        }
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
          btn.disabled = false;
        }, 2500);

      } catch (err) {
        console.error("Enrollment/Update Error:", err);
        let errorMsg = "An error occurred while processing the student data. Check console.";
        if (err.code === 'auth/email-already-in-use') {
            errorMsg = "An account with this email already exists in the authentication system.";}
        alert(errorMsg);
        btn.innerHTML = "Try Again";
        btn.style.background = "var(--danger)";
        btn.disabled = false;}};
  } catch (error) {
    console.error("Form load error:", error);
    container.innerHTML = `<div style="text-align:center; padding: 40px; color: #ef4444;">Error initializing database components.</div>`;}}
  export async function loadStudentList(db, contentArea) {
  const container = contentArea || document.getElementById("dashboardContent");
  if (!container) return;

  container.innerHTML = `<div style="text-align:center; padding: 80px; color: #71717a; font-family: 'Inter', sans-serif;">Fetching Student Records...</div>`;

  // 💎 PROFESSIONAL TOUCH: XSS Sanitization Helper
  const safeStr = (str) => {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function(m) {
      return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[m];
    });
  };

  try {
    const { collection, query, where, getDocs } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
    
    // Fetch Schools to map IDs to Names
    const schoolsSnap = await getDocs(collection(db, "schools"));
    const schoolMap = {};
    schoolsSnap.forEach(s => {
        schoolMap[s.id] = s.data().schoolName || s.data().name || "Unknown School";
    });

    // Fetch all Students
    const studentsSnap = await getDocs(query(collection(db, "users"), where("role", "==", "student")));
    
    // CLIENT-SIDE CACHE: Store full student data in memory for instant drawer loading
    window.studentCache = {};
    let studentRowsHTML = '';
    let delay = 0;

    if (studentsSnap.empty) {
      studentRowsHTML = `<tr><td colspan="4" style="text-align:center; padding: 40px; color:#71717a;">No students found in the database.</td></tr>`;
    } else {
      studentsSnap.forEach(doc => {
        const data = doc.data();
        window.studentCache[doc.id] = { id: doc.id, ...data }; // Store in cache

        const schoolName = schoolMap[data.schoolId] || "Unassigned";
        const gradeInfo = data.class ? `Class ${safeStr(data.class)} ${data.section ? '- ' + safeStr(data.section) : ''}` : "N/A";
        const name = safeStr(data.name || 'Unknown Student');
        const email = safeStr(data.email || 'No email provided');
        const avatarInitial = name.charAt(0).toUpperCase();
        
        // Search string for filtering (lowercased)
        const searchString = `${name} ${email} ${schoolName}`.toLowerCase();

        studentRowsHTML += `
          <tr class="sl-row" data-search="${searchString}" style="animation-delay: ${delay}s" onclick="window.openStudentDrawer('${doc.id}')">
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
            <td>
              <button class="sl-view-btn">View Profile</button>
            </td>
          </tr>
        `;
        delay += 0.03;
      });
    }

    const css = `
      <style>
        @charset "UTF-8";
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&display=swap');

        /* 💎 THE FIX: Master Theme Container holds all variables securely */
        .sl-theme-container {
          --brand-primary: oklch(0.55 0.16 245);
          --brand-hover: oklch(0.48 0.18 245);
          --brand-glow: oklch(0.55 0.16 245 / 0.15);
          --brand-gradient: linear-gradient(135deg, oklch(0.55 0.16 245), oklch(0.50 0.18 255));
          
          --surface-solid: #ffffff;
          --surface-muted: oklch(0.97 0.01 250);
          
          --text-main: oklch(0.2 0.02 250);
          --text-muted: oklch(0.55 0.02 250);
          
          --border-subtle: rgba(0, 0, 0, 0.04);
          --border-default: rgba(0, 0, 0, 0.08);
          
          --shadow-md: 0 12px 24px -4px rgba(0, 0, 0, 0.06), 0 4px 8px -2px rgba(0, 0, 0, 0.03), inset 0 1px 1px rgba(255, 255, 255, 1);
          --shadow-drawer: -30px 0 60px -15px rgba(0, 0, 0, 0.2), -2px 0 10px rgba(0, 0, 0, 0.05);

          /* 💎 The Physics Variables */
          --spring-bouncy: cubic-bezier(0.34, 1.56, 0.64, 1);
          --spring-smooth: cubic-bezier(0.2, 0.8, 0.2, 1);
          
          color-scheme: light !important; 
        }

        .sl-workspace {
          max-width: 1040px; 
          margin: 0 auto; 
          padding: 40px 24px 100px 24px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
          color: var(--text-main);
          animation: workspaceEnter 0.8s var(--spring-smooth) forwards;
        }

        /* Header & Search */
        .sl-header-flex { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; gap: 24px; flex-wrap: wrap; }
        .sl-header h2 { font-size: clamp(2rem, 4vw, 2.5rem); font-weight: 800; margin: 0 0 8px 0; letter-spacing: -0.04em; background: linear-gradient(135deg, oklch(0.1 0 0), oklch(0.4 0.02 250)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .sl-header p { margin: 0; color: var(--text-muted); font-size: 1.05rem; font-weight: 500; }
        
        .sl-search-box { position: relative; width: 100%; max-width: 360px; }
        .sl-search-box svg { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; color: oklch(0.6 0.02 250); transition: 0.3s; }
        .sl-search-input { appearance: none; -webkit-appearance: none; width: 100%; padding: 14px 16px 14px 44px; font-family: inherit; font-size: 0.95rem; font-weight: 500; border: 1px solid var(--border-default); border-radius: 16px; background: rgba(255, 255, 255, 0.6); color: var(--text-main); box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); transition: all 0.4s var(--spring-bouncy); box-sizing: border-box; }
        .sl-search-input::placeholder { color: oklch(0.6 0.02 250); font-weight: 400; }
        .sl-search-input:focus { outline: none; background: var(--surface-solid); border-color: var(--brand-primary); box-shadow: 0 0 0 4px var(--brand-glow), 0 8px 16px -4px rgba(0,0,0,0.05); transform: translateY(-2px); }
        .sl-search-box:focus-within svg { color: var(--brand-primary); transform: translateY(-50%) scale(1.1); }

        /* Table & Rows */
        .sl-card { background: var(--surface-solid); border: 1px solid var(--border-subtle); border-radius: 20px; box-shadow: var(--shadow-md); overflow: hidden; position: relative; }
        .sl-table { width: 100%; border-collapse: separate; border-spacing: 0; text-align: left; }
        .sl-table th { padding: 20px 24px; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid var(--border-default); background: var(--surface-muted); }
        .sl-table td { padding: 16px 24px; border-bottom: 1px solid var(--border-subtle); vertical-align: middle; transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1); }
        
        .sl-row { transition: all 0.4s var(--spring-smooth); cursor: pointer; opacity: 0; animation: rowEnter 0.6s var(--spring-smooth) forwards; background: var(--surface-solid); }
        .sl-table:has(.sl-row:hover) .sl-row:not(:hover) { opacity: 0.4; filter: blur(1px) grayscale(20%); transform: scale(0.99); }
        .sl-row:hover { background: var(--surface-solid); box-shadow: 0 12px 24px -8px rgba(0,0,0,0.1), 0 0 0 1px var(--border-subtle); transform: scale(1.01) translateZ(10px); z-index: 10; position: relative; border-radius: 12px; }
        .sl-row:hover td { border-bottom-color: transparent; }
        .sl-row:last-child td { border-bottom: none; }

        /* Cell Details */
        .sl-user-cell { display: flex; align-items: center; gap: 16px; }
        .sl-avatar { width: 44px; height: 44px; border-radius: 50%; background: var(--brand-gradient); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem; flex-shrink: 0; box-shadow: inset 0 -2px 6px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.1); }
        .sl-name { font-weight: 700; font-size: 0.95rem; color: var(--text-main); margin-bottom: 2px; }
        .sl-email { font-size: 0.85rem; color: var(--text-muted); font-weight: 500; }
        .sl-school { font-weight: 600; color: var(--text-main); font-size: 0.95rem; }
        .sl-grade { display: inline-block; padding: 6px 12px; background: var(--surface-muted); border-radius: 20px; font-size: 0.8rem; font-weight: 700; color: oklch(0.4 0.02 250); border: 1px solid var(--border-default); }
        
        .sl-view-btn { all: unset; font-size: 0.85rem; font-weight: 700; color: var(--brand-primary); padding: 8px 16px; border-radius: 20px; transition: all 0.3s var(--spring-bouncy); background: var(--brand-glow); cursor: pointer; opacity: 0; transform: translateX(-10px); }
        .sl-row:hover .sl-view-btn { opacity: 1; transform: translateX(0); background: var(--brand-primary); color: white; box-shadow: 0 4px 12px var(--brand-glow); }

        /* ==========================================================================
           💎 PREMIUM DRAWER (Now fully connected to animation physics)
           ========================================================================== */
        
        .sl-backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); z-index: 9998; opacity: 0; pointer-events: none; transition: opacity 0.4s var(--spring-smooth); will-change: opacity; }
        .sl-backdrop.active { opacity: 1; pointer-events: auto; }

        .sl-drawer { position: fixed; top: 0; right: 0; bottom: 0; width: 100%; max-width: 480px; background: #f2f2f7; box-shadow: var(--shadow-drawer); z-index: 9999; transform: translateX(100%); transition: transform 0.65s var(--spring-bouncy); display: flex; flex-direction: column; color-scheme: light !important; will-change: transform; border-left: 1px solid rgba(255,255,255,0.8); }
        .sl-drawer.active { transform: translateX(0); }

        .sl-drawer-header { padding: 32px 32px 24px; display: flex; justify-content: space-between; align-items: flex-start; background: #f2f2f7; position: relative; z-index: 2; }
        .sl-drawer-close { background: #e5e5ea; border: none; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #8e8e93; transition: all 0.3s var(--spring-bouncy); outline: none; }
        .sl-drawer-close:hover { background: #d1d1d6; color: #1c1c1e; transform: scale(1.1) rotate(90deg); }
        .sl-drawer-close:active { transform: scale(0.9); }

        .sl-drawer-profile { display: flex; align-items: center; gap: 20px; margin-top: 12px; }
        
        /* Avatar Entrance Animation */
        .sl-drawer-avatar { width: 68px; height: 68px; border-radius: 50%; background: var(--brand-gradient); color: white; display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 700; box-shadow: 0 8px 20px -4px var(--brand-glow); border: 3px solid #ffffff; transform: scale(0.5) rotate(-15deg); opacity: 0; transition: all 0.6s var(--spring-bouncy); }
        .sl-drawer.active .sl-drawer-avatar { transform: scale(1) rotate(0deg); opacity: 1; transition-delay: 0.1s; }

        .sl-drawer-body { padding: 0 24px 40px; overflow-y: auto; flex: 1; background: #f2f2f7; }

        /* Cascading Data Cards */
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
    const html = `${css}<div class="sl-theme-container">
        <div class="sl-workspace">
          <div class="sl-header-flex">
            <div class="sl-header">
              <h2>Student Directory</h2>
              <p>View and manage all enrolled students across the platform.</p></div>
            <div class="sl-search-box">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input type="text" class="sl-search-input" id="studentSearch" placeholder="Search by name, email, or school..." onkeyup="window.filterStudentList()">
            </div></div>
          <div class="sl-card">
            <table class="sl-table"><thead><tr>
                  <th>Student Profile</th>
                  <th>Institution</th>
                  <th>Academic Level</th>
                  <th>Action</th></tr></thead>
              <tbody id="studentTableBody">
                ${studentRowsHTML}
              </tbody></table></div></div>
        <div class="sl-backdrop" id="slBackdrop" onclick="window.closeStudentDrawer()"></div>
        <div class="sl-drawer" id="slDrawer">
           <div class="sl-drawer-header"><div>
                <span style="font-size:0.75rem; font-weight:800; color:#8b5cf6; text-transform:uppercase; letter-spacing:1.5px;">Profile Overview</span>
                <div class="sl-drawer-profile"><div class="sl-drawer-avatar" id="drawerAvatar">?</div><div>
                    <h3 style="margin:0; font-size:1.5rem; color:#09090b; font-weight:800; letter-spacing:-0.02em;" id="drawerName">Student Name</h3>
                    <div style="color:#71717a; font-size:0.95rem; font-weight:500;" id="drawerEmail">email@domain.com</div></div></div></div>
              <button class="sl-drawer-close" onclick="window.closeStudentDrawer()">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button></div><div class="sl-drawer-body" id="drawerBody"></div></div></div>`;
    container.innerHTML = html;
    window.filterStudentList = function() {
      const input = document.getElementById("studentSearch").value.toLowerCase();
      const rows = document.querySelectorAll(".sl-row");
      rows.forEach(row => {const dataStr = row.getAttribute("data-search");
        if (dataStr.includes(input)) {row.style.display = "table-row";} else {row.style.display = "none";}});};
    window.openStudentDrawer = function(studentId) {
      const data = window.studentCache[studentId]; if (!data) return;
      const name = safeStr(data.name || 'Unknown Student');
      const email = safeStr(data.email || 'No email provided');
      document.getElementById('drawerAvatar').innerText = name.charAt(0).toUpperCase();
      document.getElementById('drawerName').innerText = name;
      document.getElementById('drawerEmail').innerText = email;
      const schoolName = safeStr(schoolMap[data.schoolId] || "Unassigned");
      let tagsHtml = `<span style="color:#a1a1aa; font-weight:500; font-size:0.9rem;">No tags assigned</span>`;
      if (data.tags && data.tags.length > 0) {
        tagsHtml = data.tags.map(tag => `<span class="sl-drawer-chip">${safeStr(tag)}</span>`).join('');}
      let leaderBadge = data.isTeamLeader 
        ? `<span style="background:#fef08a; color:#854d0e; padding:4px 12px; border-radius:12px; font-size:0.85rem; font-weight:700;">Team Leader</span>` 
        : `<span style="color:#a1a1aa; font-weight:500;">Standard Member</span>`;
      let bodyHtml = `
        <div class="sl-data-group">
          <div class="sl-data-title">Academic Details</div>
          <div class="sl-data-row"><div class="sl-data-label">Institution</div><div class="sl-data-val">${schoolName}</div></div>
          <div class="sl-data-row"><div class="sl-data-label">Class</div><div class="sl-data-val">${safeStr(data.class || 'N/A')}</div></div>
          <div class="sl-data-row"><div class="sl-data-label">Section</div><div class="sl-data-val">${safeStr(data.section || 'N/A')}</div></div></div>
        <div class="sl-data-group">
          <div class="sl-data-title">Profile & Skills</div>
          <div class="sl-data-row"><div class="sl-data-label">Gender</div><div class="sl-data-val">${safeStr(data.gender || 'N/A')}</div></div>
          <div class="sl-data-row"><div class="sl-data-label">Aspiration</div><div class="sl-data-val">${safeStr(data.aspiration || 'N/A')}</div></div>
          <div class="sl-data-row"><div class="sl-data-label">Team Role</div><div class="sl-data-val">${leaderBadge}</div></div>
          <div class="sl-data-row" style="flex-direction:column; align-items:flex-start; gap:12px;">
            <div class="sl-data-label">Tags / Skills</div>
            <div>${tagsHtml}</div></div></div>`;
      if (data.guardians && data.guardians.length > 0) {
        bodyHtml += `<div class="sl-data-group"><div class="sl-data-title">Guardians & Contact</div>`;
        data.guardians.forEach((g) => {
          bodyHtml += `<div class="sl-data-row" style="flex-direction:column; align-items:flex-start; gap:6px;">
              <div style="font-weight:700; color:#09090b; font-size:1.05rem;">${safeStr(g.name || 'Unknown')} <span style="font-weight:500; color:#8e8e93; font-size:0.9rem;">(${safeStr(g.relation || 'Relation N/A')})</span></div>
              <div style="color:#4f46e5; font-size:0.95rem; font-weight:600;">${safeStr(g.email || 'No Email')}</div>
            </div>`;});bodyHtml += `</div>`;}
      document.getElementById('drawerBody').innerHTML = bodyHtml;
      document.getElementById('slBackdrop').classList.add('active');
      document.getElementById('slDrawer').classList.add('active');};
    window.closeStudentDrawer = function() {
      document.getElementById('slBackdrop').classList.remove('active');
      document.getElementById('slDrawer').classList.remove('active');
    };} catch (error) {
    console.error("Error loading student list:", error);
    container.innerHTML = `<div style="text-align:center; padding: 40px; color: #ef4444; font-weight:600;">Failed to load directory. Check console.</div>`;}}
export async function loadStudentSnapshot(db, contentArea) {const container = contentArea || document.getElementById("dashboardContent");
  if (!container) return;
  container.innerHTML = `<div style="text-align:center; padding: 80px; color: #71717a; font-family: 'Inter', sans-serif;">Aggregating Global Snapshot...</div>`;
  const safeStr = (str) => {if (!str) return '';
    return String(str).replace(/[&<>"']/g, function(m) {return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[m];});};
  try {const { collection, query, where, getDocs, doc, deleteDoc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
    const [schoolsSnap, studentsSnap, tasksSnap] = await Promise.all([
      getDocs(collection(db, "schools")),
      getDocs(query(collection(db, "users"), where("role", "==", "student"))),
      getDocs(collection(db, "tasks"))]);
    const dataArchitecture = {};
    window.snapshotStudents = {}; //  cache 
    window.allStudentsList = [];  
    schoolsSnap.forEach(doc => {
      dataArchitecture[doc.id] = { schoolName: doc.data().schoolName || doc.data().name || "Unnamed School", students: {} };});
    dataArchitecture["unassigned"] = { schoolName: "Unassigned / Independent", students: {} };
    const studentToSchoolMap = {};
    studentsSnap.forEach(doc => {
      const d = doc.data();
      const sId = d.schoolId && dataArchitecture[d.schoolId] ? d.schoolId : "unassigned";
      const studentObj = { id: doc.id, name: d.name || "Unknown Student", email: d.email || "", tasks: [] };
      dataArchitecture[sId].students[doc.id] = studentObj;
      window.snapshotStudents[doc.id] = studentObj;
      window.allStudentsList.push({ id: doc.id, name: studentObj.name });
      studentToSchoolMap[doc.id] = sId;});
    tasksSnap.forEach(doc => {
      const t = doc.data();
      const studentId = t.studentId;
      if (studentId && studentToSchoolMap[studentId]) {
        const sId = studentToSchoolMap[studentId];
        dataArchitecture[sId].students[studentId].tasks.push({ id: doc.id, ...t });}});
    let htmlContent = '';
    for (const [schoolId, schoolData] of Object.entries(dataArchitecture)) {
      const studentKeys = Object.keys(schoolData.students);
      if (studentKeys.length === 0) continue; let schoolTotalTasks = 0;
      let schoolCompletedTasks = 0; let studentsHTML = '';
      studentKeys.forEach(studentId => {const student = schoolData.students[studentId]; const totalTasks = student.tasks.length;
        const completedTasks = student.tasks.filter(t => (t.status || '').toLowerCase() === 'completed').length;
        schoolTotalTasks += totalTasks; schoolCompletedTasks += completedTasks;
        const progressPct = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
        const avatarLetter = safeStr(student.name).charAt(0).toUpperCase();
        let tasksPreviewHTML = '';
        if (totalTasks === 0) {tasksPreviewHTML = `<div class="snap-no-tasks">No tasks assigned yet</div>`;} else {
          student.tasks.slice(0, 3).forEach(task => {
            const status = (task.status || 'assigned').toLowerCase();
            let statusColor = '#a1a1aa'; 
            if (status === 'completed') statusColor = '#34d399'; 
            if (status === 'in progress') statusColor = '#60a5fa'; 
            tasksPreviewHTML += `<div class="snap-task-item"><div class="snap-task-dot" style="background-color: ${statusColor};"></div><div class="snap-task-title">${safeStr(task.title || 'Untitled')}</div></div>`;});
          if (totalTasks > 3) tasksPreviewHTML += `<div style="font-size:0.75rem; color:#8e8e93; margin-top:4px;">+ ${totalTasks - 3} more tasks</div>`;}
        studentsHTML += `
          <div class="snap-student-card" onclick="window.openStudentTaskModal(event, '${studentId}')">
            <div class="snap-student-header">
              <div class="snap-avatar">${avatarLetter}</div>
              <div style="flex:1;">
                <div class="snap-student-name">${safeStr(student.name)}</div>
                <div class="snap-student-meta">${totalTasks} Tasks • ${progressPct}% Done</div></div></div>
            <div class="snap-progress-track">
              <div class="snap-progress-fill" style="width: ${progressPct}%;"></div></div>
            <div class="snap-task-list">${tasksPreviewHTML}</div></div>`;});

      const schoolProgress = schoolTotalTasks === 0 ? 0 : Math.round((schoolCompletedTasks / schoolTotalTasks) * 100);
      htmlContent += `
        <div class="snap-school-block">
          <div class="snap-school-trigger" onclick="this.parentElement.classList.toggle('active')">
            <div class="snap-school-info">
              <h3>${safeStr(schoolData.schoolName)}</h3>
              <span class="snap-school-badge">${studentKeys.length} Students Enrolled</span></div>
            <div class="snap-school-metrics">
              <div class="snap-metric"><span class="snap-metric-val">${schoolProgress}%</span><span class="snap-metric-lbl">Completion</span></div>
              <div class="snap-arrow"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></div></div></div>
          <div class="snap-school-content"><div class="snap-school-content-inner"><div class="snap-student-grid">${studentsHTML}</div></div></div></div>`;}

    if (!htmlContent) htmlContent = `<div style="text-align:center; padding: 60px; color:#71717a;">No student data available.</div>`;

    const css = `
      <style>.snap-theme-container {
          --brand-primary: #4f46e5; --surface: #ffffff; --surface-muted: #fafafa;
          --border: rgba(0,0,0,0.08); --text-main: #09090b; --text-muted: #71717a;
          --spring: cubic-bezier(0.32, 0.72, 0, 1);
          max-width: 1100px; margin: 0 auto; padding: 20px 20px 80px 20px;
          font-family: 'Inter', sans-serif; color-scheme: light !important; color: var(--text-main);
          animation: slideUpFade 0.6s var(--spring) forwards;}
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .snap-header { margin-bottom: 40px; }
        .snap-header h2 { font-size: 2.2rem; font-weight: 800; margin: 0 0 8px 0; letter-spacing: -0.03em; }
        .snap-school-block { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; margin-bottom: 16px; overflow: hidden; transition: 0.3s; }
        .snap-school-trigger { padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: background 0.2s; }
        .snap-school-trigger:hover { background: var(--surface-muted); }
        .snap-school-info h3 { margin: 0 0 6px 0; font-size: 1.15rem; font-weight: 700; color: var(--text-main); }
        .snap-school-badge { display: inline-block; padding: 4px 10px; background: rgba(79, 70, 229, 0.1); color: var(--brand-primary); border-radius: 12px; font-size: 0.8rem; font-weight: 600; }
        .snap-school-metrics { display: flex; align-items: center; gap: 24px; }
        .snap-metric { text-align: right; }
        .snap-metric-val { display: block; font-size: 1.2rem; font-weight: 800; color: var(--text-main); }
        .snap-metric-lbl { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600; }
        .snap-arrow { color: #a1a1aa; transition: transform 0.4s var(--spring); }
        .snap-school-block.active .snap-arrow { transform: rotate(180deg); color: var(--brand-primary); }
        .snap-school-content { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.4s var(--spring); background: var(--surface-muted); }
        .snap-school-block.active .snap-school-content { grid-template-rows: 1fr; border-top: 1px solid var(--border); }
        .snap-school-content-inner { overflow: hidden; }
        .snap-student-grid { padding: 24px; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        .snap-student-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 16px; cursor: pointer; transition: all 0.3s var(--spring); }
        .snap-student-card:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 12px 24px rgba(0,0,0,0.06); border-color: rgba(79, 70, 229, 0.3); z-index: 2; position: relative; }
        .snap-student-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .snap-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #e0e7ff, #c7d2fe); color: var(--brand-primary); display: flex; justify-content: center; align-items: center; font-weight: 700; font-size: 1.1rem; flex-shrink: 0; }
        .snap-student-name { font-weight: 700; font-size: 1rem; color: var(--text-main); }
        .snap-student-meta { font-size: 0.8rem; color: var(--text-muted); font-weight: 500; }
        .snap-progress-track { height: 6px; background: #e4e4e7; border-radius: 3px; overflow: hidden; margin-bottom: 16px; }
        .snap-progress-fill { height: 100%; background: var(--brand-primary); border-radius: 3px; }
        .snap-task-item { display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px dashed var(--border); }
        .snap-task-item:last-child { border-bottom: none; }
        .snap-task-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .snap-task-title { font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .tm-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.3); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); z-index: 10000; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; display: flex; justify-content: center; align-items: center; }
        .tm-backdrop.active { opacity: 1; pointer-events: auto; }
        .tm-modal { background: #ffffff; width: 90%; max-width: 700px; max-height: 85vh; border-radius: 24px; box-shadow: 0 40px 80px rgba(0,0,0,0.2); display: flex; flex-direction: column; overflow: hidden; transform: scale(0); opacity: 0; transition: transform 0.5s var(--spring), opacity 0.3s; will-change: transform; color-scheme: light !important;}
        .tm-backdrop.active .tm-modal { transform: scale(1); opacity: 1; }
        .tm-header { padding: 24px 32px; border-bottom: 1px solid var(--border); background: var(--surface-muted); display: flex; justify-content: space-between; align-items: center; }
        .tm-header h3 { margin: 0; font-size: 1.4rem; font-weight: 800; color: var(--text-main); }
        .tm-close { background: #e4e4e7; border: none; width: 32px; height: 32px; border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; color: #52525b; transition: 0.2s; }
        .tm-close:hover { background: #d4d4d8; transform: scale(1.1); }
        .tm-body { padding: 24px 32px; overflow-y: auto; flex: 1; }
        .tm-task-row { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; transition: 0.2s; }
        .tm-task-row:hover { border-color: #a5b4fc; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
        .tm-task-info h4 { margin: 0 0 4px 0; font-size: 1.05rem; font-weight: 600; color: var(--text-main); }
        .tm-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
        .badge-assigned { background: #f4f4f5; color: #52525b; }
        .badge-progress { background: #e0f2fe; color: #2563eb; }
        .badge-completed { background: #d1fae5; color: #059669; }
        .tm-actions { display: flex; gap: 8px; }
        .tm-btn { padding: 8px 16px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; border: none; transition: 0.2s; }
        .tm-btn-edit { background: rgba(79, 70, 229, 0.1); color: var(--brand-primary); }
        .tm-btn-edit:hover { background: var(--brand-primary); color: white; }
        .tm-btn-del { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .tm-btn-del:hover { background: #ef4444; color: white; }
        .tm-edit-grid { display: grid; grid-template-columns: 2fr 1fr 1.5fr auto; gap: 12px; width: 100%; align-items: center; }
        .tm-input { padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 0.9rem; width: 100%; box-sizing: border-box; }
        .tm-input:focus { outline: none; border-color: var(--brand-primary); }
        @media (max-width: 768px) { .tm-edit-grid { grid-template-columns: 1fr; } }
      </style>`;
    container.innerHTML = `${css}
      <div class="snap-theme-container">
        <div class="snap-header"><h2>Student Snapshot</h2><p>Task progression across all institutions.</p></div>
        ${htmlContent}</div>
      <div class="tm-backdrop" id="taskModalBackdrop">
        <div class="tm-modal" id="taskModalContent">
          <div class="tm-header"><div>
              <div style="font-size: 0.8rem; color: #8b5cf6; font-weight: 700; text-transform: uppercase;">Task Manager</div>
              <h3 id="tmStudentName">Loading...</h3></div>
            <button class="tm-close" onclick="window.closeStudentTaskModal()">✕</button></div>
          <div class="tm-body" id="tmBody"></div></div></div>`;
    window.openStudentTaskModal = function(event, studentId) {
      event.stopPropagation(); 
      const modalContent = document.getElementById('taskModalContent');
      const backdrop = document.getElementById('taskModalBackdrop');
      const student = window.snapshotStudents[studentId];
      const rect = event.currentTarget.getBoundingClientRect();
      const originX = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
      const originY = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
      modalContent.style.transformOrigin = `${originX}% ${originY}%`;
      document.getElementById('tmStudentName').innerText = student.name;
      window.renderTaskModalBody(studentId);
      backdrop.classList.add('active');};
    window.closeStudentTaskModal = function() {
      document.getElementById('taskModalBackdrop').classList.remove('active');};
    window.renderTaskModalBody = function(studentId) {
      const student = window.snapshotStudents[studentId]; const body = document.getElementById('tmBody');
      if (!student.tasks || student.tasks.length === 0) {
        body.innerHTML = `<div style="text-align:center; color:#a1a1aa; padding:40px;">No tasks assigned.</div>`;
        return;}
      let html = '';
      student.tasks.forEach(task => {
        const status = (task.status || 'assigned').toLowerCase();
        let badgeClass = 'badge-assigned';
        if (status === 'in progress') badgeClass = 'badge-progress';
        if (status === 'completed') badgeClass = 'badge-completed';
        html += `<div class="tm-task-row" id="task-row-${task.id}">
            <div class="tm-task-info"><h4>${safeStr(task.title)}</h4>
              <span class="tm-badge ${badgeClass}">${status}</span></div>
            <div class="tm-actions">
              <button class="tm-btn tm-btn-edit" onclick="window.editTaskInline('${task.id}', '${studentId}')">Edit / Reassign</button>
              <button class="tm-btn tm-btn-del" onclick="window.deleteTaskInline('${task.id}', '${studentId}')">Delete</button></div></div>`;});
      body.innerHTML = html;};
    window.deleteTaskInline = async function(taskId, studentId) {
      if (!confirm("Delete this task permanently?")) return;
      const row = document.getElementById(`task-row-${taskId}`);
      row.style.opacity = '0.5';
      row.style.pointerEvents = 'none';
      try {await deleteDoc(doc(db, "tasks", taskId));
        window.snapshotStudents[studentId].tasks = window.snapshotStudents[studentId].tasks.filter(t => t.id !== taskId);
        row.style.transform = 'scale(0.9)';
        setTimeout(() => window.renderTaskModalBody(studentId), 300);} catch (err) {
        console.error(err);
        alert("Failed to delete task.");
        row.style.opacity = '1'; row.style.pointerEvents = 'auto'; }};
    window.editTaskInline = function(taskId, studentId) {
      const task = window.snapshotStudents[studentId].tasks.find(t => t.id === taskId);
      const row = document.getElementById(`task-row-${taskId}`);
      
      // Build options for reassigning
      let studentOptions = '';
      window.allStudentsList.forEach(s => {
        studentOptions += `<option value="${s.id}" ${s.id === studentId ? 'selected' : ''}>${safeStr(s.name)}</option>`;
      });

      const st = (task.status || 'assigned').toLowerCase();

      row.innerHTML = `
        <div class="tm-edit-grid">
          <input type="text" class="tm-input" id="edit-title-${taskId}" value="${safeStr(task.title)}">
          <select class="tm-input" id="edit-status-${taskId}">
            <option value="assigned" ${st === 'assigned' ? 'selected' : ''}>Assigned</option>
            <option value="in progress" ${st === 'in progress' ? 'selected' : ''}>In Progress</option>
            <option value="completed" ${st === 'completed' ? 'selected' : ''}>Completed</option>
          </select>
          <select class="tm-input" id="edit-student-${taskId}">
            ${studentOptions}
          </select>
          <div style="display:flex; gap:8px;">
            <button class="tm-btn tm-btn-edit" style="background:#10b981; color:white;" onclick="window.saveTaskInline('${taskId}', '${studentId}')">Save</button>
            <button class="tm-btn" style="background:#f4f4f5;" onclick="window.renderTaskModalBody('${studentId}')">Cancel</button>
          </div>
        </div>
      `;
    };

    window.saveTaskInline = async function(taskId, oldStudentId) {
      const newTitle = document.getElementById(`edit-title-${taskId}`).value;
      const newStatus = document.getElementById(`edit-status-${taskId}`).value;
      const newStudentId = document.getElementById(`edit-student-${taskId}`).value;

      try {
        await updateDoc(doc(db, "tasks", taskId), {
          title: newTitle,
          status: newStatus,
          studentId: newStudentId
        });

        // If reassigned to a different student, move it in cache
        if (oldStudentId !== newStudentId) {
          const taskIndex = window.snapshotStudents[oldStudentId].tasks.findIndex(t => t.id === taskId);
          const taskObj = window.snapshotStudents[oldStudentId].tasks.splice(taskIndex, 1)[0];
          taskObj.title = newTitle;
          taskObj.status = newStatus;
          taskObj.studentId = newStudentId;
          
          if (window.snapshotStudents[newStudentId]) {
            window.snapshotStudents[newStudentId].tasks.push(taskObj);
          }
        } else {
          const task = window.snapshotStudents[oldStudentId].tasks.find(t => t.id === taskId);
          task.title = newTitle;
          task.status = newStatus;}
        window.renderTaskModalBody(oldStudentId);
      } catch (err) {
        console.error(err);
        alert("Failed to update task.");}};
  } catch (error) {
    console.error("Error loading snapshot:", error);
    container.innerHTML = `<div style="text-align:center; padding: 60px; color: #ef4444; font-weight:600;">Failed to generate snapshot. Check console.</div>`;
  }
}