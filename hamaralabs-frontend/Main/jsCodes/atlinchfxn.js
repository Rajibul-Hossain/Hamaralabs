import { collection, query, where, getDocs, getDoc, doc, addDoc, serverTimestamp, updateDoc, persistentLocalCache, persistentMultipleTabManager, } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { withHyperCache } from "./dataEngine.js";
// THE GLOBAL DATABASE CACHE

export async function loadInchargeOverview(db, currentUID, contentArea) {
  contentArea.innerHTML = `
    <div style="display:flex; justify-content:center; align-items:center; height: 60vh; flex-direction:column; gap: 16px;">
      <div style="width: 44px; height: 44px; border: 4px solid #e5e5ea; border-top-color: #007aff; border-radius: 50%; animation: atlSpin 0.8s cubic-bezier(0.6, 0.2, 0.4, 0.8) infinite;"></div>
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #8e8e93; font-weight: 600; letter-spacing: 0.5px;">Syncing Academic Telemetry...</div>
      <style>@keyframes atlSpin { to { transform: rotate(360deg); } }</style>
    </div>`;
  
  try {
    // Make sure 'getDoc' and 'doc' are imported at the top of your file!
    const { collection, query, where, getDocs, doc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");

    // 1. 🔐 SECURE ROLE & SCHOOL RETRIEVAL (The Fix)
    const userDocSnap = await getDoc(doc(db, "users", currentUID));
    if (!userDocSnap.exists()) {
      contentArea.innerHTML = `<div style="padding:40px; text-align:center; color:#ff3b30; font-family:-apple-system, sans-serif; font-weight:600; background:#fff; border-radius:24px; box-shadow:0 10px 30px rgba(0,0,0,0.05); margin: 20px;">⚠️ User profile not found in database.</div>`;
      return;
    }

    const userData = userDocSnap.data();
    let schoolId = userData.schoolId;

    // Fallback logic for ATL Incharges who use the assignments collection
    if ((userData.role === "atl-incharge" || userData.role === "school-admin") && !schoolId) {
      const assignmentSnap = await getDocs(query(collection(db, "inchargeSchoolAssignments"), where("inchargeId", "==", currentUID)));
      if (!assignmentSnap.empty) {
        schoolId = assignmentSnap.docs[0].data().schoolId;
      }
    }

    // Security Gate
    if (!schoolId) {
      contentArea.innerHTML = `<div style="padding:40px; text-align:center; color:#ff3b30; font-family:-apple-system, sans-serif; font-weight:600; background:#fff; border-radius:24px; box-shadow:0 10px 30px rgba(0,0,0,0.05); margin: 20px;">⚠️ No school assigned to your profile. Contact Platform Admin.</div>`;
      return;
    }

    // 2. 📊 FETCH METRICS IN PARALLEL
    const [schoolSnap, studentsSnap, tasksSnap, taSnap, mentorSnap] = await Promise.all([
      getDoc(doc(db, "schools", schoolId)),
      getDocs(query(collection(db, "users"), where("role", "==", "student"), where("schoolId", "==", schoolId))),
      getDocs(collection(db, "tasks")),
      getDocs(query(collection(db, "tinkering_activities"), where("schoolId", "==", schoolId))),
      getDocs(query(collection(db, "users"), where("role", "==", "mentor"), where("schoolId", "==", schoolId)))
    ]);

    const schoolName = schoolSnap.exists() ? (schoolSnap.data().schoolName || schoolId) : "Unknown Institution";
    const totalStudents = studentsSnap.size;
    const totalTAs = taSnap.size; 
    
    let mentorName = "Unassigned";
    if (!mentorSnap.empty) {
      mentorName = mentorSnap.docs[0].data().name || "Unnamed Mentor";
    }
    
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

    const totalSchoolTasks = schoolTasks.length;
    const globalProgress = totalSchoolTasks === 0 ? 0 : Math.round((completedSchoolTasks / totalSchoolTasks) * 100);
    
    let strugglingStudents = [];
    Object.keys(studentMap).forEach(sid => {
      const s = studentMap[sid];
      if (s.tasksTotal > 0 && s.tasksCompleted === 0) { strugglingStudents.push(s.name); }
    });

    const recentTasks = schoolTasks.slice(-4).reverse();

    // 🍎 THE CSS FOR MACOS PHYSICS
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

        .atl-ring-container { position: relative; width: 84px; height: 84px; }
        .atl-ring-svg { transform: rotate(-90deg); width: 100%; height: 100%; filter: drop-shadow(0 4px 8px rgba(0,122,255,0.2));}
        .atl-ring-bg { fill: none; stroke: #f2f2f7; stroke-width: 8; }
        .atl-ring-fill { fill: none; stroke: #007aff; stroke-width: 8; stroke-linecap: round; transition: stroke-dashoffset 1.5s cubic-bezier(0.25, 1, 0.5, 1); }
        .atl-ring-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 1.15rem; font-weight: 800; color: #007aff; }

        .atl-timeline { position: relative; padding-left: 20px; margin-top: 20px; }
        .atl-timeline::before { content: ''; position: absolute; left: 6px; top: 8px; bottom: 0; width: 2px; background: #e5e5ea; border-radius: 2px;}
        .atl-tl-item { position: relative; margin-bottom: 24px; }
        .atl-tl-dot { position: absolute; left: -20px; top: 4px; width: 14px; height: 14px; border-radius: 50%; background: #fff; border: 3px solid #007aff; z-index: 2;}
        .atl-tl-time { font-size: 0.75rem; font-weight: 800; color: #8e8e93; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px;}
        .atl-tl-desc { font-size: 1rem; font-weight: 500; color: #1c1c1e; line-height: 1.5; }
        .atl-tl-desc span { color: #007aff; font-weight: 700; }

        .atl-alert { display: flex; align-items: flex-start; gap: 14px; padding: 18px; border-radius: 20px; margin-bottom: 14px; font-weight: 500; font-size: 0.95rem; line-height: 1.5; border: 1px solid transparent;}
        .atl-alert-red { background: #fff0f0; color: #d70015; border-color: rgba(215, 0, 21, 0.1);}
        .atl-alert-orange { background: #fff8e6; color: #d97706; border-color: rgba(217, 119, 6, 0.1);}
        .atl-alert-green { background: #e8f8f5; color: #059669; border-color: rgba(5, 150, 105, 0.1);}
        .atl-alert-icon { font-size: 1.4rem; }

        /* 🍎 MACOS SCALE EFFECT MODAL */
        .cute-overlay { 
          position: fixed; inset: 0; background: rgba(0,0,0,0); 
          backdrop-filter: blur(0px); -webkit-backdrop-filter: blur(0px); 
          z-index: 9999; display: none; justify-content: center; align-items: center; 
          transition: background 0.5s ease, backdrop-filter 0.5s ease; 
        }
        .cute-overlay.active { 
          background: rgba(0,0,0,0.3); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); 
        }
        
        .cute-modal { 
          background: rgba(255,255,255,0.95); backdrop-filter: blur(40px); 
          padding: 40px 32px; text-align: center; width: 90%; max-width: 340px; 
          box-shadow: 0 40px 80px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,1); 
          border: 1px solid rgba(255,255,255,0.8);
          
          /* The starting "Minimized" state */
          border-radius: 100px;
          opacity: 0;
          transform: translate(var(--tx, 0px), var(--ty, 0px)) scale(0.05);
          
          /* Apple's official App Launch Curve */
          transition: 
            transform 0.55s cubic-bezier(0.32, 0.08, 0.24, 1), 
            opacity 0.4s ease, 
            border-radius 0.5s cubic-bezier(0.32, 0.08, 0.24, 1);
        }
        
        /* The final "Maximized" state */
        .cute-overlay.active .cute-modal { 
          transform: translate(0px, 0px) scale(1); 
          opacity: 1; 
          border-radius: 36px;
        }
        
        .cute-avatar { font-size: 4.5rem; line-height: 1; margin-bottom: 16px; display: inline-block; animation: cuteWave 2.5s infinite; transform-origin: 70% 70%; filter: drop-shadow(0 10px 10px rgba(0,0,0,0.1));}
        .cute-name { font-size: 1.6rem; font-weight: 800; color: #1c1c1e; margin: 0 0 4px 0; letter-spacing: -0.5px; }
        .cute-role { font-size: 0.9rem; color: #007aff; font-weight: 700; margin-bottom: 32px; text-transform: uppercase; letter-spacing: 1.5px; background: rgba(0,122,255,0.1); padding: 6px 14px; border-radius: 12px; display: inline-block;}
        
        .cute-btn { background: linear-gradient(135deg, #007aff, #34c759); color: white; border: none; border-radius: 20px; padding: 16px 32px; font-size: 1.1rem; font-weight: 800; cursor: pointer; transition: all 0.2s; box-shadow: 0 10px 20px rgba(0,122,255,0.25); width: 100%;}
        .cute-btn:hover { transform: translateY(-2px); box-shadow: 0 14px 28px rgba(0,122,255,0.35); }
        .cute-btn:active { transform: scale(0.94); box-shadow: 0 4px 10px rgba(0,122,255,0.2); }

        @keyframes atlSlideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cuteWave { 0% { transform: rotate(0deg); } 10% { transform: rotate(14deg); } 20% { transform: rotate(-8deg); } 30% { transform: rotate(14deg); } 40% { transform: rotate(-4deg); } 50% { transform: rotate(10deg); } 60% { transform: rotate(0deg); } 100% { transform: rotate(0deg); } }
      </style>
    `;

    let alertsHtml = '';
    if (strugglingStudents.length > 0) alertsHtml += `<div class="atl-alert atl-alert-red"><div class="atl-alert-icon">⚠️</div><div><strong>Attention Required:</strong> ${strugglingStudents.length} student(s) including ${strugglingStudents[0]} have 0% task completion. Intervention recommended.</div></div>`;
    if (globalProgress >= 80) alertsHtml += `<div class="atl-alert atl-alert-green"><div class="atl-alert-icon">🏆</div><div><strong>Milestone Reached:</strong> Your institution has surpassed 80% global task completion. Excellent engagement!</div></div>`;
    if (totalTAs === 0) alertsHtml += `<div class="atl-alert atl-alert-orange"><div class="atl-alert-icon">💡</div><div><strong>Lab Inactive:</strong> You have not deployed any Tinkering Activities yet. Use the Activity Architect to assign TA.</div></div>`;
    if (alertsHtml === '') alertsHtml = `<div style="color: #8e8e93; font-style: italic; padding: 10px;">All systems nominal. Student engagement is balanced.</div>`;

    let radarHtml = '';
    if (recentTasks.length === 0) {
      radarHtml = `<div style="color:#8e8e93; font-style:italic; font-size:0.95rem; margin-top:20px;">No recent lab activity recorded yet.</div>`;
    } else {
      recentTasks.forEach((t, index) => {
        const statusStr = (t.status || 'assigned').toLowerCase();
        let dotColor = statusStr === 'completed' ? '#34c759' : '#007aff';
        let action = statusStr === 'completed' ? 'completed task' : 'was assigned';
        radarHtml += `<div class="atl-tl-item" style="animation-delay: ${index * 0.1}s;"><div class="atl-tl-dot" style="border-color: ${dotColor};"></div><div class="atl-tl-time">Recent Activity</div><div class="atl-tl-desc">Student <span>${studentMap[t.studentId]?.name || 'Unknown'}</span> ${action}: <strong>${t.title || 'Untitled'}</strong></div></div>`;
      });
    }

    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (globalProgress / 100) * circumference;

    // 🍎 THE MACOS GEOMETRY ENGINE
    window.showMentorPopup = function(event) {
      const overlay = document.getElementById('cuteMentorPopup');
      const modal = overlay.querySelector('.cute-modal');

      if (event && event.currentTarget) {
        const rect = event.currentTarget.getBoundingClientRect();
        const btnCenterX = rect.left + (rect.width / 2);
        const btnCenterY = rect.top + (rect.height / 2);
        
        const windowCenterX = window.innerWidth / 2;
        const windowCenterY = window.innerHeight / 2;
        
        const translateX = btnCenterX - windowCenterX;
        const translateY = btnCenterY - windowCenterY;
        
        modal.style.setProperty('--tx', `${translateX}px`);
        modal.style.setProperty('--ty', `${translateY}px`);
      }

      if (overlay) {
        overlay.style.display = 'flex';
        void modal.offsetWidth; 
        overlay.classList.add('active');
      }
    };
    
    window.hideMentorPopup = function() {
      const overlay = document.getElementById('cuteMentorPopup');
      if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => overlay.style.display = 'none', 550);
      }
    };

    // 9. Render the Complete DOM
    contentArea.innerHTML = `
      ${iosCss}
      <div class="atl-dashboard">
        <header style="margin-bottom: 12px; animation: atlSlideUp 0.4s ease-out;">
          <h1 class="atl-header-title">${userData.role === 'school-admin' ? 'Admin Overview' : 'Overview'}</h1>
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

          <div class="atl-card" onclick="window.showMentorPopup(event)" style="animation-delay: 0.3s; background: linear-gradient(135deg, #007aff, #34c759); border: none; color: white; cursor: pointer; box-shadow: 0 16px 32px rgba(0, 122, 255, 0.25);" onmouseover="this.style.transform='translateY(-6px)'; this.style.boxShadow='0 20px 40px rgba(0, 122, 255, 0.35)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 16px 32px rgba(0, 122, 255, 0.25)';">
            <div class="atl-card-title" style="color: rgba(255,255,255,0.9);">
              <span>Tinkering Pulse</span> 
              <span style="font-size:1.2rem; background: rgba(255,255,255,0.25); border-radius: 50%; width: 34px; height: 34px; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(5px);">⚡</span>
            </div>
            <div class="atl-stat-val" style="color: white;">${totalTAs}</div>
            <div class="atl-stat-lbl" style="color: rgba(255,255,255,0.95); font-weight: 700; display: flex; align-items: center; justify-content: space-between;">
              <span>Active Tinkering Activities</span>
              <span style="background: rgba(255,255,255,0.25); padding: 6px 14px; border-radius: 14px; font-size: 0.85rem; backdrop-filter: blur(5px); transition: transform 0.2s;" onmouseover="this.style.transform='translateX(4px)'" onmouseout="this.style.transform='translateX(0)'">View Mentor 🧑‍🏫</span>
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

      <div id="cuteMentorPopup" class="cute-overlay" onclick="if(event.target===this) window.hideMentorPopup()">
        <div class="cute-modal">
          <div class="cute-avatar">👋</div>
          <h3 class="cute-name">${mentorName}</h3>
          <div class="cute-role">Assigned School Mentor</div>
          <p style="color: #636366; font-size: 1rem; margin-bottom: 32px; font-weight: 500; line-height: 1.5;">
            This is your partner in innovation. They help verify tasks and guide students through their Tinkering Activities!</p>
          <button class="cute-btn" onclick="window.hideMentorPopup()">Thank you!</button>
        </div>
      </div>`;

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
// ============================================================================
// 2️⃣ TA FORM: ACTIVITY ARCHITECT (BLUEPRINT MODE)
// ============================================================================
export async function loadTAForm(db, currentUID, contentArea) {
  contentArea.innerHTML = `<div class="loader">Loading Activity Architect...</div>`;
  try {
    const userDocSnap = await getDoc(doc(db, "users", currentUID));
    if (!userDocSnap.exists()) return;
    const userData = userDocSnap.data();
    let schoolId = userData.schoolId;

    if ((userData.role === "atl-incharge" || userData.role === "school-admin") && !schoolId) {
      const assignmentSnap = await getDocs(query(collection(db, "inchargeSchoolAssignments"), where("inchargeId", "==", currentUID)));
      if (!assignmentSnap.empty) schoolId = assignmentSnap.docs[0].data().schoolId;
    }

    if (!schoolId) {
      contentArea.innerHTML = `<div style="padding:40px; text-align:center; color:#ff3b30; font-weight:600;">⚠️ No school assigned. Cannot create blueprints.</div>`;
      return;
    }

    const generatedActivityId = `TA-${Date.now().toString().slice(-7)}`;

    // CSS (Unchanged from your beautiful design)
    const taCss = `
      <style>
        .ta-wrapper { font-family: -apple-system, sans-serif; max-width: 1040px; margin: 0 auto; padding: 20px 10px 60px 10px; animation: taFadeUp 0.6s ease; }
        .ta-title { font-size: 2.4rem; font-weight: 800; color: #1c1c1e; margin: 0; letter-spacing: -1.2px; line-height: 1.1; }
        .ta-subtitle { font-size: 1.05rem; color: #8e8e93; margin-top: 8px; font-weight: 500; }
        .ta-section-title { font-size: 0.85rem; font-weight: 700; color: #8e8e93; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 20px; display: flex; align-items: center; }
        .ta-section-title::after { content: ''; flex: 1; height: 1px; background: rgba(60, 60, 67, 0.1); margin-left: 16px; border-radius: 1px; }
        .ta-label { display: flex; justify-content: space-between; align-items: center; font-size: 0.95rem; font-weight: 600; color: #1c1c1e; margin-bottom: 10px; }
        .ta-card { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(30px); border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 8px 40px rgba(0,0,0,0.04); border-radius: 28px; padding: 36px; margin-bottom: 32px; transition: 0.4s; }
        .ta-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .ta-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; }
        .ta-group { margin-bottom: 24px; }
        .ta-input, .ta-select, .ta-textarea { width: 100%; box-sizing: border-box; background: rgba(118, 118, 128, 0.08); border: 2px solid transparent; border-radius: 16px; padding: 16px 20px; font-size: 1.05rem; outline: none; transition: 0.3s; }
        .ta-input:focus, .ta-select:focus, .ta-textarea:focus { background: #fff; border-color: #007aff; }
        .ta-textarea { resize: vertical; min-height: 120px; }
        .ta-dynamic-container { background: rgba(118, 118, 128, 0.04); border-radius: 20px; padding: 12px; }
        .ta-dynamic-row { display: flex; gap: 10px; margin-bottom: 8px; background: #fff; border-radius: 14px; padding: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .ta-dynamic-row .ta-input { background: transparent; padding: 12px 16px; flex: 1; border-radius: 10px;}
        .ta-btn-add-sm { background: rgba(0, 122, 255, 0.1); color: #007aff; border: none; border-radius: 20px; padding: 6px 14px; font-size: 0.85rem; font-weight: 700; cursor: pointer; }
        .ta-btn-remove { background: #ffe5e5; color: #ff3b30; border: none; border-radius: 10px; width: 44px; font-size: 1.2rem; cursor: pointer; }
        .ta-actions { display: flex; justify-content: flex-end; gap: 16px; }
        .ta-btn-primary { background: #007aff; color: #fff; border: none; border-radius: 20px; padding: 18px 40px; font-size: 1.1rem; font-weight: 700; cursor: pointer; transition: 0.3s; }
        .ta-btn-secondary { background: rgba(118, 118, 128, 0.12); border: none; border-radius: 20px; padding: 18px 32px; font-size: 1.1rem; font-weight: 600; cursor: pointer; }
        @keyframes taFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      </style>`;

    window.addTADynamicRow = function(containerId, placeholder) {
      const container = document.getElementById(containerId);
      const div = document.createElement('div');
      div.className = 'ta-dynamic-row';
      div.innerHTML = `<input type="text" class="ta-input" data-array="${containerId}" placeholder="${placeholder}"><button type="button" class="ta-btn-remove" onclick="this.parentElement.remove()">✕</button>`;
      container.appendChild(div);
    };

    window.submitTAForm = async function() {
      const submitBtn = document.getElementById('taSubmitBtn');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = "Saving to Library... ⏳";
      submitBtn.disabled = true;
      try {
        const getArrayData = (arrayId) => Array.from(document.querySelectorAll(`input[data-array="${arrayId}"]`)).map(input => input.value.trim()).filter(val => val !== "");
        
        // 🔥 THE MASSIVE CHANGE: Saved as a 'library' Blueprint, no student assigned.
        const payload = {
          schoolId: schoolId,
          createdBy: currentUID,
          createdAt: serverTimestamp(),
          status: "library", 
          assignedTo: "unassigned",
          activityId: document.getElementById('ta-id').value,
          activityName: document.getElementById('ta-name').value.trim(),
          subject: document.getElementById('ta-subject').value,
          topic: document.getElementById('ta-topic').value,
          subTopic: document.getElementById('ta-subtopic').value,
          introduction: document.getElementById('ta-intro').value.trim(),
          goals: getArrayData('ta-goals'),
          materials: getArrayData('ta-materials'),
          instructions: getArrayData('ta-instructions'),
          tips: getArrayData('ta-tips'),
          observations: getArrayData('ta-observations'),
          extensions: getArrayData('ta-extensions'),
          resources: getArrayData('ta-resources')
        };
        
        if (!payload.activityName || !payload.subject) {
          alert("Activity Name and Subject are required.");
          submitBtn.innerHTML = originalText; submitBtn.disabled = false; return;
        }
        await addDoc(collection(db, "tinkering_activities"), payload);
        submitBtn.innerHTML = "Saved to Blueprint Library! ✅";
        submitBtn.style.background = "#34c759";
        setTimeout(() => {
          document.getElementById('taForm').reset();
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = "#007aff";
          submitBtn.disabled = false;
        }, 2000);
      } catch (err) {
        alert("Failed to save blueprint.");
        submitBtn.innerHTML = originalText; submitBtn.disabled = false;
      }
    };

    contentArea.innerHTML = `
      ${taCss}
      <div class="ta-wrapper">
        <div style="margin-bottom: 32px;">
          <h2 class="ta-title">Activity Architect</h2>
          <p class="ta-subtitle">Design and save master blueprints to the institution's library.</p>
        </div>
        <form id="taForm" onsubmit="event.preventDefault(); window.submitTAForm();">
          <div class="ta-card">
            <div class="ta-section-title">Core Specifications</div>
            <div class="ta-grid-3">
              <div class="ta-group"><label class="ta-label">Subject</label><select id="ta-subject" class="ta-select" required><option value="">Select Domain...</option><option value="Electronics & IoT">Electronics & IoT</option><option value="Robotics">Robotics</option><option value="Coding & AI">Coding & AI</option><option value="3D Design & Printing">3D Design & Printing</option><option value="Science Experiment">Science Experiment</option></select></div>
              <div class="ta-group"><label class="ta-label">Topic</label><input type="text" id="ta-topic" class="ta-input" placeholder="e.g. Microcontrollers"></div>
              <div class="ta-group"><label class="ta-label">Sub Topic</label><input type="text" id="ta-subtopic" class="ta-input" placeholder="e.g. Arduino Basics"></div>
            </div>
            <div class="ta-grid-2">
              <div class="ta-group"><label class="ta-label">TA ID</label><input type="text" id="ta-id" class="ta-input" value="${generatedActivityId}" readonly style="background:#f2f2f7; color:#8e8e93;"></div>
              <div class="ta-group"><label class="ta-label">Blueprint Name</label><input type="text" id="ta-name" class="ta-input" placeholder="Enter an inspiring title..." required></div>
            </div>
            <div class="ta-group" style="margin-bottom:0;"><label class="ta-label">Executive Summary</label><textarea id="ta-intro" class="ta-textarea" placeholder="Describe the core concept..."></textarea></div>
          </div>
          <div class="ta-card">
            <div class="ta-section-title">Execution Parameters</div>
            <div class="ta-grid-2">
              <div class="ta-group"><label class="ta-label">Goals <button type="button" class="ta-btn-add-sm" onclick="window.addTADynamicRow('ta-goals', 'Outcome...')">+ Add</button></label><div id="ta-goals" class="ta-dynamic-container"><div class="ta-dynamic-row"><input type="text" class="ta-input" data-array="ta-goals" placeholder="Outcome..."><button type="button" class="ta-btn-remove" onclick="this.parentElement.remove()">✕</button></div></div></div>
              <div class="ta-group"><label class="ta-label">Hardware <button type="button" class="ta-btn-add-sm" onclick="window.addTADynamicRow('ta-materials', 'Material...')">+ Add</button></label><div id="ta-materials" class="ta-dynamic-container"><div class="ta-dynamic-row"><input type="text" class="ta-input" data-array="ta-materials" placeholder="Material..."><button type="button" class="ta-btn-remove" onclick="this.parentElement.remove()">✕</button></div></div></div>
              <div class="ta-group"><label class="ta-label">Steps <button type="button" class="ta-btn-add-sm" onclick="window.addTADynamicRow('ta-instructions', 'Step...')">+ Add</button></label><div id="ta-instructions" class="ta-dynamic-container"><div class="ta-dynamic-row"><input type="text" class="ta-input" data-array="ta-instructions" placeholder="Step..."><button type="button" class="ta-btn-remove" onclick="this.parentElement.remove()">✕</button></div></div></div>
              <div class="ta-group"><label class="ta-label">Observations <button type="button" class="ta-btn-add-sm" onclick="window.addTADynamicRow('ta-observations', 'Obs...')">+ Add</button></label><div id="ta-observations" class="ta-dynamic-container"><div class="ta-dynamic-row"><input type="text" class="ta-input" data-array="ta-observations" placeholder="Obs..."><button type="button" class="ta-btn-remove" onclick="this.parentElement.remove()">✕</button></div></div></div>
              <div class="ta-group"><label class="ta-label">Tips <button type="button" class="ta-btn-add-sm" onclick="window.addTADynamicRow('ta-tips', 'Tip...')">+ Add</button></label><div id="ta-tips" class="ta-dynamic-container"><div class="ta-dynamic-row"><input type="text" class="ta-input" data-array="ta-tips" placeholder="Tip..."><button type="button" class="ta-btn-remove" onclick="this.parentElement.remove()">✕</button></div></div></div>
              <div class="ta-group"><label class="ta-label">Bonus <button type="button" class="ta-btn-add-sm" onclick="window.addTADynamicRow('ta-extensions', 'Bonus...')">+ Add</button></label><div id="ta-extensions" class="ta-dynamic-container"><div class="ta-dynamic-row"><input type="text" class="ta-input" data-array="ta-extensions" placeholder="Bonus..."><button type="button" class="ta-btn-remove" onclick="this.parentElement.remove()">✕</button></div></div></div>
            </div>
            <div class="ta-group" style="margin-top:24px;"><label class="ta-label">Resources <button type="button" class="ta-btn-add-sm" onclick="window.addTADynamicRow('ta-resources', 'Link...')">+ Add</button></label><div id="ta-resources" class="ta-dynamic-container"><div class="ta-dynamic-row"><input type="url" class="ta-input" data-array="ta-resources" placeholder="https://..."><button type="button" class="ta-btn-remove" onclick="this.parentElement.remove()">✕</button></div></div></div>
          </div>
          <div class="ta-actions">
            <button type="reset" class="ta-btn-secondary">Reset Fields</button>
            <button type="submit" id="taSubmitBtn" class="ta-btn-primary">Save Blueprint ✨</button>
          </div>
        </form>
      </div>`;
  } catch (error) {
    contentArea.innerHTML = `<div style="text-align:center; padding: 40px; color:#ff3b30;">Failed to load module.</div>`;
  }
}
// ============================================================================
// 📊 TA REPORTS: MISSION HUB (LIBRARY + ACTIVE OPERATIONS)
// ============================================================================
// ============================================================================
// 📊 TA REPORTS: MISSION HUB (INSTANT SWR CACHE + EXACT MOUSE ORIGIN)
// ============================================================================
export async function loadTAReport(db, currentUID, contentArea) {
  const container = contentArea || document.getElementById("dashboardContent");
  if (!container) return;

  // ⚡ 1. SWR: INSTANT LOCAL STORAGE RESTORE
  const cacheKey = `ta_hub_persist_${currentUID}`;
  const savedData = localStorage.getItem(cacheKey);
  
  if (savedData && !window.forceTAHubRefresh) {
    try {
      const parsed = JSON.parse(savedData);
      window.taHubData = parsed.taData; 
      container.innerHTML = parsed.html;
      
      const header = container.querySelector('.hub-wrapper h1');
      if (header && !header.innerHTML.includes('Live Sync')) {
        header.innerHTML += `<span style="font-size:0.8rem; color:#007aff; background:rgba(0,122,255,0.1); padding:4px 10px; border-radius:10px; margin-left:16px; vertical-align:middle; display:inline-flex; align-items:center; gap:6px; letter-spacing:0; font-weight:700;"><span style="width:6px; height:6px; background:#007aff; border-radius:50%; animation:pulse 1s infinite;"></span>Live Sync</span><style>@keyframes pulse { 0% {opacity:1;} 50% {opacity:0.3;} 100% {opacity:1;} }</style>`;
      }
    } catch(e) { console.error("TA Hub Cache corrupted, fetching fresh."); }
  } else {
    container.innerHTML = `<div class="loader" style="text-align:center; padding:50px; color:#8e8e93; font-weight:600;">Loading Tinkering Activities... <span style="display:inline-block; animation:spin 1s linear infinite;">⏳</span></div><style>@keyframes spin { 100% { transform:rotate(360deg); } }</style>`;
  }

  window.forceTAHubRefresh = false;

  try {
    const { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");

    const userDocSnap = await getDoc(doc(db, "users", currentUID));
    if (!userDocSnap.exists()) return;
    const userData = userDocSnap.data();
    const userRole = userData.role;
    let schoolId = userData.schoolId;

    if ((userRole === "atl-incharge" || userRole === "school-admin") && !schoolId) {
      const assignmentSnap = await getDocs(query(collection(db, "inchargeSchoolAssignments"), where("inchargeId", "==", currentUID)));
      if (!assignmentSnap.empty) schoolId = assignmentSnap.docs[0].data().schoolId;
    }

    if (!schoolId) {
      container.innerHTML = `<div style="padding:40px; text-align:center; color:#ff3b30; font-weight:600;">⚠️ No school assigned.</div>`;
      return;
    }

    // 📡 2. SILENT BACKGROUND FETCH
    let taQuery = userRole === "student" 
      ? query(collection(db, "tinkering_activities"), where("schoolId", "==", schoolId), where("assignedTo", "==", currentUID))
      : query(collection(db, "tinkering_activities"), where("schoolId", "==", schoolId));

    const [taSnap, studentsSnap] = await Promise.all([
      getDocs(taQuery),
      getDocs(query(collection(db, "users"), where("role", "==", "student"), where("schoolId", "==", schoolId)))
    ]);
    
    let studentMap = {};
    let studentDropdownOptions = `<option value="">-- Select a Student --</option>`;
    studentsSnap.forEach(doc => { 
      studentMap[doc.id] = doc.data().name || "Unknown"; 
      studentDropdownOptions += `<option value="${doc.id}">${doc.data().name || 'Unknown'} (${doc.data().email || ''})</option>`;
    });

    let libraryHtml = '';
    let operationsHtml = '';
    let domains = new Set();
    const freshTaHubData = {};

    taSnap.forEach(docSnap => {
      const data = docSnap.data();
      const taId = docSnap.id;
      freshTaHubData[taId] = data;
      
      const status = (data.status || 'assigned').toLowerCase();
      const safeSubject = data.subject || 'General';
      domains.add(safeSubject);

      // 🚨 FIX RESTORED: Passing 'event' instead of 'this'
      if (status === 'library' || data.assignedTo === 'unassigned') {
        libraryHtml += `
          <div class="hub-card library-item" data-search="${(data.activityName+safeSubject+data.topic).toLowerCase()}" data-subject="${safeSubject}" onclick="window.openHubPanel(event, '${taId}')">
            <div>
              <div style="font-size: 0.75rem; font-weight: 800; color: #8e8e93; text-transform: uppercase; margin-bottom: 4px;">Library • ${safeSubject}</div>
              <h3 style="margin: 0; font-size: 1.2rem; color: #1c1c1e;">${data.activityName}</h3>
            </div>
            <div style="background: rgba(0,122,255,0.1); color: #007aff; padding: 8px 16px; border-radius: 12px; font-weight: 700; font-size: 0.85rem;">View & Assign ↗</div>
          </div>`;
      } else {
        const assignedName = studentMap[data.assignedTo] || "Unknown";
        let badgeStyle = "background:rgba(142,142,147,0.1); color:#8e8e93;"; 
        if (status === 'submitted') badgeStyle = "background:rgba(255,149,0,0.1); color:#ff9500;"; 
        if (status === 'completed') badgeStyle = "background:rgba(52,199,89,0.1); color:#34c759;"; 

        operationsHtml += `
          <div class="hub-card ops-item" data-search="${(data.activityName+assignedName+status).toLowerCase()}" data-subject="${safeSubject}" onclick="window.openHubPanel(event, '${taId}')">
            <div>
              <h3 style="margin: 0 0 4px 0; font-size: 1.1rem; color: #1c1c1e;">${data.activityName}</h3>
              <div style="color: #8e8e93; font-size: 0.9rem;">Innovator: <span style="font-weight:600; color:#1c1c1e;">${assignedName}</span></div>
            </div>
            <div style="${badgeStyle} padding: 6px 14px; border-radius: 12px; font-size: 0.8rem; font-weight: 800; text-transform: uppercase;">${status}</div>
          </div>`;
      }
    });

    window.taHubData = freshTaHubData;

    if (!libraryHtml) libraryHtml = `<div class="hub-empty">No Tinkering Activities in the library. Use the Activity Architect to create some!</div>`;
    if (!operationsHtml) operationsHtml = `<div class="hub-empty">No active TAs deployed yet.</div>`;

    let domainFilterOptions = `<option value="all">All Domains</option>`;
    domains.forEach(domain => { domainFilterOptions += `<option value="${domain}">${domain}</option>`; });

    window.filterHub = function() {
      const q = document.getElementById('hubSearchInput').value.toLowerCase();
      const domainFilter = document.getElementById('hubDomainFilter').value;
      const applyFilter = (el) => {
        const matchesSearch = el.dataset.search.includes(q);
        const matchesDomain = (domainFilter === 'all' || el.dataset.subject === domainFilter);
        el.style.display = (matchesSearch && matchesDomain) ? 'flex' : 'none';
      };
      document.querySelectorAll('.library-item').forEach(applyFilter);
      document.querySelectorAll('.ops-item').forEach(applyFilter);
    };

    // 🎨 3. BUILD FINAL HTML & SAVE TO CACHE
    const finalHtmlPayload = `
      <style>
        .hub-wrapper { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif; max-width: 1040px; margin: 0 auto; padding: 40px 10px; animation: hubFadeIn 0.5s ease; }
        .hub-controls { display: flex; gap: 16px; margin-bottom: 40px; }
        @media(max-width: 768px) { .hub-controls { flex-direction: column; } }
        
        .hub-search { flex: 1; box-sizing: border-box; background: #fff; border: 1px solid rgba(0,0,0,0.1); border-radius: 20px; padding: 18px 24px; font-size: 1.05rem; color: #1c1c1e; outline: none; transition: 0.3s; box-shadow: 0 4px 12px rgba(0,0,0,0.02); font-weight: 500; }
        .hub-search:focus { border-color: #007aff; box-shadow: 0 8px 24px rgba(0,122,255,0.15); }
        
        .hub-filter { appearance: none; background: #fff url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238e8e93' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e") no-repeat right 16px center; background-size: 16px; border: 1px solid rgba(0,0,0,0.1); border-radius: 20px; padding: 18px 48px 18px 20px; font-size: 1.05rem; color: #1c1c1e; outline: none; cursor: pointer; transition: 0.3s; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.02);}
        .hub-filter:focus { border-color: #007aff; box-shadow: 0 8px 24px rgba(0,122,255,0.15); }

        .hub-card { background: #fff; border-radius: 20px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.04); margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s; }
        .hub-card:hover { transform: translateY(-3px) scale(1.01); box-shadow: 0 12px 24px rgba(0,0,0,0.06); border-color: rgba(0,122,255,0.2); }
        .hub-empty { text-align: center; padding: 40px; background: rgba(0,0,0,0.02); border-radius: 20px; color: #8e8e93; font-weight: 500; font-style: italic; }
        
        .hub-mac-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0); backdrop-filter: blur(0px); -webkit-backdrop-filter: blur(0px); z-index: 9999; display: none; justify-content: center; align-items: center; transition: background 0.4s ease, backdrop-filter 0.4s ease; }
        .hub-mac-overlay.active { background: rgba(0,0,0,0.4); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
        
        .hub-mac-modal { 
          background: rgba(255,255,255,0.98); backdrop-filter: blur(40px);
          width: 92%; max-width: 600px; max-height: 85vh; 
          box-shadow: 0 40px 80px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,1); 
          border: 1px solid rgba(255,255,255,0.8);
          display: flex; flex-direction: column; overflow: hidden;
          transform-origin: center center; 
          opacity: 0; border-radius: 60px;
          transform: translate(var(--tx, 0px), var(--ty, 0px)) scale(0.01); 
          transition: transform 0.5s cubic-bezier(0.32, 0.08, 0.24, 1), opacity 0.3s ease, border-radius 0.5s cubic-bezier(0.32, 0.08, 0.24, 1);
        }
        
        .hub-mac-overlay.active .hub-mac-modal { transform: translate(0px, 0px) scale(1); opacity: 1; border-radius: 28px; }
        .hub-modal-body { flex: 1; overflow-y: auto; padding: 32px; scrollbar-width: none; }
        .hub-modal-body::-webkit-scrollbar { display: none; }
        @keyframes hubFadeIn { from{opacity:0; transform:translateY(20px);} to{opacity:1; transform:translateY(0);} }
      </style>
      
      <div class="hub-wrapper">
        <h1 style="font-size: 2.8rem; font-weight: 800; margin: 0 0 10px 0; color: #1c1c1e; letter-spacing: -1px; display:flex; align-items:center;">Mission Hub</h1>
        <p style="font-size: 1.15rem; color: #8e8e93; margin-bottom: 32px; font-weight: 500;">Manage Tinkering Activities, track telemetry, and deploy tasks.</p>
        
        <div class="hub-controls">
          <input type="text" id="hubSearchInput" class="hub-search" placeholder="Search activities, subjects, or innovators..." onkeyup="window.filterHub()">
          <select id="hubDomainFilter" class="hub-filter" onchange="window.filterHub()">
            ${domainFilterOptions}
          </select>
        </div>
        
        ${userRole !== 'student' ? `<h3 style="font-size: 1.3rem; color: #1c1c1e; margin-bottom: 20px;">Tinkering Activities Library 📘</h3>${libraryHtml}<div style="height: 40px;"></div>` : ''}
        <h3 style="font-size: 1.3rem; color: #1c1c1e; margin-bottom: 20px; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 24px;">Live Operations 📡</h3>
        ${operationsHtml}
      </div>

      <div id="hubOverlay" class="hub-mac-overlay" onclick="if(event.target===this) window.closeHubPanel()">
        <div class="hub-mac-modal" id="hubPanelContainer"></div>
      </div>`;

    container.innerHTML = finalHtmlPayload;
    
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        taData: window.taHubData,
        html: finalHtmlPayload
      }));
    } catch(e) { console.warn("Local storage full, skipping cache."); }

    // 🍎 EXACT MOUSE ORIGIN MATH RESTORED
    window.openHubPanel = function(event, taId) {
      const data = window.taHubData[taId];
      if (!data) return;
      
      const overlay = document.getElementById('hubOverlay');
      const modal = document.getElementById('hubPanelContainer');

      // Grab the exact X/Y pixel of the mouse click
      if (event) {
        const clickX = event.clientX || (window.innerWidth / 2);
        const clickY = event.clientY || (window.innerHeight / 2);
        const windowCenterX = window.innerWidth / 2;
        const windowCenterY = window.innerHeight / 2;
        
        modal.style.setProperty('--tx', `${clickX - windowCenterX}px`);
        modal.style.setProperty('--ty', `${clickY - windowCenterY}px`);
      }

      const status = (data.status || 'assigned').toLowerCase();
      let mainContent = '';

      if (status === 'library' && userRole !== 'student') {
        mainContent = `
          <div style="background: #f8f9fa; padding: 20px; border-radius: 16px; margin-bottom: 32px; border: 1px solid rgba(0,0,0,0.03);">
            <div style="color: #8e8e93; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 8px;">Executive Summary</div>
            <div style="font-size: 1.05rem; color: #3a3a3c; line-height: 1.6; font-weight:500;">${data.introduction || "No summary provided."}</div>
          </div>
          <h4 style="margin: 0 0 12px 0; color: #1c1c1e; font-size: 1.1rem;">Deploy this Activity</h4>
          <select id="assign-student-select" style="width: 100%; padding: 18px; border-radius: 16px; border: 1px solid rgba(0,0,0,0.1); background: #f2f2f7; font-size: 1.05rem; font-weight: 500; margin-bottom: 24px; outline: none; transition: 0.3s;" onfocus="this.style.background='#fff'; this.style.borderColor='#007aff'">
            ${studentDropdownOptions}
          </select>
          <button id="btn-deploy-${taId}" onclick="window.deployClone('${taId}')" style="background: linear-gradient(135deg, #007aff, #005bb5); color: #fff; border: none; border-radius: 16px; padding: 20px; width: 100%; font-size: 1.15rem; font-weight: 800; cursor: pointer; box-shadow: 0 10px 20px rgba(0,122,255,0.25); transition: transform 0.2s;" onactive="this.style.transform='scale(0.96)'">
            Assign to Innovator 🚀
          </button>`;
      } else {
        const linkHtml = data.submissionURL ? `<a href="${data.submissionURL}" target="_blank" style="display:flex; justify-content:center; align-items:center; gap:8px; background:linear-gradient(135deg, #f2f2f7, #e5e5ea); color:#007aff; padding: 18px; border-radius: 16px; font-weight: 800; text-decoration: none; margin-bottom: 24px; transition: 0.2s;" onmouseover="this.style.background='#fff'; this.style.boxShadow='0 4px 12px rgba(0,122,255,0.1)'">🔗 Open Evidence Link</a>` : '';
        const notesHtml = data.studentNotes ? `<div style="background: #fff8e6; border-left: 4px solid #f59e0b; padding: 24px; border-radius: 0 16px 16px 0; color: #3a3a3c; font-style: italic; margin-bottom: 32px; font-size:1.05rem; line-height:1.6;">"${data.studentNotes}"</div>` : '';
        
        let actionButtons = `<div style="padding: 18px; background: #f2f2f7; border-radius: 16px; text-align: center; color: #8e8e93; font-weight: 800; text-transform: uppercase; font-size:1rem;">Status: ${status}</div>`;
        
        if (userRole !== "student" && status === 'submitted') {
          actionButtons = `
            <div style="display:flex; gap:12px; flex-direction:column;">
              <button onclick="window.updateStatus('${taId}', 'completed')" style="background: linear-gradient(135deg, #34c759, #28a745); color: #fff; border: none; border-radius: 16px; padding: 18px; font-size: 1.1rem; font-weight: 800; cursor: pointer; box-shadow: 0 10px 20px rgba(52, 199, 89, 0.25);">Approve & Verify ✅</button>
              <button onclick="window.updateStatus('${taId}', 'assigned')" style="background: rgba(255, 59, 48, 0.1); color: #ff3b30; border: none; border-radius: 16px; padding: 18px; font-size: 1.1rem; font-weight: 700; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='rgba(255, 59, 48, 0.15)'" onmouseout="this.style.background='rgba(255, 59, 48, 0.1)'">Request Revisions ↩️</button>
            </div>`;
        }
        mainContent = `
          <div style="display:flex; align-items:center; gap:10px; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid rgba(0,0,0,0.05);">
            <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(0,122,255,0.1); color: #007aff; display:flex; justify-content:center; align-items:center; font-weight:800; font-size:1.1rem;">${(studentMap[data.assignedTo]||"U").substring(0,2).toUpperCase()}</div>
            <div>
              <div style="font-size:0.8rem; color:#8e8e93; font-weight:700; text-transform:uppercase; letter-spacing:1px;">Assigned Innovator</div>
              <div style="font-weight:800; color:#1c1c1e; font-size:1.1rem;">${studentMap[data.assignedTo] || 'Unknown'}</div>
            </div>
          </div>
          ${linkHtml || '<div style="color:#8e8e93; font-style:italic; margin-bottom:24px; text-align:center; padding:16px; background:#f9f9fb; border-radius:16px;">No evidence link provided yet.</div>'}
          ${notesHtml}
          ${actionButtons}
        `;
      }

      modal.innerHTML = `
        <div style="padding: 24px 32px; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.95); position: sticky; top: 0; z-index: 10;">
          <h2 style="margin: 0; font-size: 1.1rem; color: #8e8e93; text-transform: uppercase; letter-spacing: 1px;">${status === 'library' ? 'Activity Menu' : ' Review'}</h2>
          <button onclick="window.closeHubPanel()" style="background: #f2f2f7; border: none; width: 36px; height: 36px; border-radius: 18px; font-size: 1.2rem; cursor: pointer; color: #8e8e93; display:flex; justify-content:center; align-items:center; transition:0.2s;" onmouseover="this.style.background='#e5e5ea'">✕</button>
        </div>
        <div class="hub-modal-body">
          <div style="font-size: 0.85rem; color: #007aff; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">${data.subject || 'Domain'}</div>
          <h3 style="font-size: 2.2rem; margin: 0 0 8px 0; letter-spacing: -0.8px; color: #1c1c1e; line-height: 1.1;">${data.activityName}</h3>
          <div style="color: #8e8e93; font-size: 0.9rem; margin-bottom: 32px; font-family: monospace;">SYS-ID: ${data.activityId || taId}</div>
          ${mainContent}
        </div>
      `;
      
      overlay.style.display = 'flex';
      void modal.offsetWidth; 
      overlay.classList.add('active');
    };

    window.closeHubPanel = function() {
      const overlay = document.getElementById('hubOverlay');
      overlay.classList.remove('active');
      setTimeout(() => overlay.style.display = 'none', 450); 
    };

    window.deployClone = async function(templateId) {
      const studentId = document.getElementById('assign-student-select').value;
      if (!studentId) return alert("Please select a student.");
      const btn = document.getElementById(`btn-deploy-${templateId}`);
      btn.innerHTML = "Cloning... ⏳"; btn.disabled = true;
      try {
        const newInstance = { ...window.taHubData[templateId], assignedTo: studentId, status: 'assigned', deployedAt: serverTimestamp(), parentTemplateId: templateId };
        await addDoc(collection(db, "tinkering_activities"), newInstance);
        btn.innerHTML = "Assigned! ✅"; btn.style.background = "#34c759";
        
        window.forceTAHubRefresh = true;
        setTimeout(() => { window.closeHubPanel(); loadTAReport(db, currentUID, contentArea); }, 1000);
      } catch(err) { alert("Assignment failed."); btn.innerHTML = "Assign to Innovator 🚀"; btn.disabled = false; }
    };

    window.updateStatus = async function(taId, newStatus) {
      if (userRole === 'student') return;
      await updateDoc(doc(db, "tinkering_activities", taId), { status: newStatus });
      window.forceTAHubRefresh = true;
      window.closeHubPanel();
      setTimeout(() => loadTAReport(db, currentUID, contentArea), 350);
    };

  } catch (error) {
    container.innerHTML = `<div style="text-align:center; padding: 40px; color:#ff3b30;">System Error. Data retrieval failed.</div>`;
  }
}
export async function loadPersonnelManagement(db, currentUID, contentArea) {
  contentArea.innerHTML = `<div class="loader" style="text-align:center; padding:50px; color:#8e8e93; font-weight:600;">Loading</div>`;

  try {
    const userDocSnap = await getDoc(doc(db, "users", currentUID));
    if (!userDocSnap.exists()) return;
    const userData = userDocSnap.data();
    let schoolId = userData.schoolId;
    if ((userData.role === "atl-incharge" || userData.role === "school-admin") && !schoolId) {
      const assignmentSnap = await getDocs(query(collection(db, "inchargeSchoolAssignments"), where("inchargeId", "==", currentUID)));
      if (!assignmentSnap.empty) {
        schoolId = assignmentSnap.docs[0].data().schoolId;}}

    if (!schoolId) {
      contentArea.innerHTML = `<div style="padding:40px; text-align:center; color:#ff3b30; font-weight:600;">⚠️ No school assigned.</div>`;
      return;
    }

    // 2. 🔍 FETCH ALL PERSONNEL FOR THIS SCHOOL
    const q = query(collection(db, "users"), where("schoolId", "==", schoolId));
    const querySnapshot = await getDocs(q);
    
    let studentsHtml = '';
    let mentorsHtml = '';
    let studentCount = 0;
    let mentorCount = 0;

    querySnapshot.forEach((docSnap) => {
      const user = docSnap.data();
      const userId = docSnap.id;
      const initials = (user.name || "U").substring(0, 2).toUpperCase();
      
      const roleBadge = user.role === 'mentor' 
        ? `<span style="background:rgba(138,43,226,0.1); color:#8a2be2; padding:4px 10px; border-radius:8px; font-size:0.7rem; font-weight:800; text-transform:uppercase;">Mentor</span>`
        : `<span style="background:rgba(0,122,255,0.1); color:#007aff; padding:4px 10px; border-radius:8px; font-size:0.7rem; font-weight:800; text-transform:uppercase;">Student</span>`;

      const cardHtml = `
        <div style="background: #fff; border-radius: 20px; padding: 20px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.04); margin-bottom: 12px; transition: 0.2s;" onmouseover="this.style.transform='translateX(6px)'" onmouseout="this.style.transform='none'">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 44px; height: 44px; border-radius: 14px; background: #f2f2f7; display: flex; justify-content: center; align-items: center; font-weight: 800; color: #1c1c1e;">${initials}</div>
            <div>
              <h4 style="margin: 0 0 4px 0; font-size: 1.05rem; color: #1c1c1e;">${user.name || 'Unknown Enlistee'}</h4>
              <div style="color: #8e8e93; font-size: 0.85rem; font-weight: 500;">${user.email || 'No email provided'}</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 16px;">
            ${roleBadge}
            <button onclick="window.removeUser('${userId}', '${user.name || 'User'}')" style="background: rgba(255, 59, 48, 0.05); color: #ff3b30; border: none; width: 36px; height: 36px; border-radius: 12px; font-weight:bold; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='rgba(255, 59, 48, 0.1)'" onmouseout="this.style.background='rgba(255, 59, 48, 0.05)'" title="Revoke Access">✕</button>
          </div>
        </div>`;

      if (user.role === 'student') { studentsHtml += cardHtml; studentCount++; }
      else if (user.role === 'mentor') { mentorsHtml += cardHtml; mentorCount++; }
    });

    if (!studentsHtml) studentsHtml = `<div style="text-align:center; padding: 30px; color:#8e8e93; font-style:italic;">No students enlisted yet.</div>`;
    if (!mentorsHtml) mentorsHtml = `<div style="text-align:center; padding: 30px; color:#8e8e93; font-style:italic;">No mentors enlisted yet.</div>`;

    // 3. EXPOSE GLOBAL FUNCTIONS
    window.openAddUserPopup = function() {
      const overlay = document.getElementById('rosOverlay');
      overlay.style.display = 'flex';
      setTimeout(() => overlay.classList.add('active'), 10);
    };

    window.closeAddUserPopup = function() {
      const overlay = document.getElementById('rosOverlay');
      overlay.classList.remove('active');
      setTimeout(() => overlay.style.display = 'none', 400);
    };

    window.submitNewUser = async function() {
      const btn = document.getElementById('btn-add-user');
      const name = document.getElementById('ros-new-name').value.trim();
      const email = document.getElementById('ros-new-email').value.trim();
      const role = document.getElementById('ros-new-role').value;

      if (!name || !email) return alert("Name and Email are required.");

      btn.innerHTML = "Encrypting Profile... ⏳";
      btn.disabled = true;

      try {
        await addDoc(collection(db, "users"), {
          name: name,
          email: email,
          role: role,
          schoolId: schoolId,
          createdAt: serverTimestamp()
        });

        btn.innerHTML = "Enlisted! ✅";
        btn.style.background = "#34c759";
        
        setTimeout(() => {
          window.closeAddUserPopup();
          if (typeof loadSection === 'function') loadSection('students');
        }, 800);

      } catch (err) {
        console.error("Error adding user:", err);
        alert("Failed to enlist user.");
        btn.innerHTML = "Confirm Enlistment";
        btn.disabled = false;
      }
    };

    window.removeUser = async function(userId, userName) {
      if (confirm(`Are you sure you want to revoke access for ${userName}? This cannot be undone.`)) {
        try {
          await deleteDoc(doc(db, "users", userId));
          if (typeof loadSection === 'function') loadSection('students');
        } catch(err) {
          console.error("Delete failed", err);
          alert("Failed to revoke access. Check your permissions.");
        }
      }
    };

    // 4. RENDER UI
    contentArea.innerHTML = `
      <style>
        .ros-wrapper { font-family: -apple-system, sans-serif; max-width: 1040px; margin: 0 auto; padding: 40px 10px; animation: rosFadeUp 0.6s ease; }
        .ros-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
        .ros-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 48px; }
        .ros-stat-card { background: rgba(255,255,255,0.8); border-radius: 20px; padding: 24px; border: 1px solid #eee; box-shadow: 0 8px 24px rgba(0,0,0,0.03); display: flex; justify-content: space-between; align-items: center;}
        
        .ros-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); z-index: 5000; display: none; justify-content: center; align-items: center; opacity: 0; transition: 0.4s; }
        .ros-overlay.active { opacity: 1; }
        .ros-modal { background: #fff; border-radius: 36px; padding: 40px; width: 90%; max-width: 400px; box-shadow: 0 40px 80px rgba(0,0,0,0.2); transform: scale(0.9) translateY(20px); opacity: 0; transition: 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        .ros-overlay.active .ros-modal { transform: scale(1) translateY(0); opacity: 1; }
        
        .ros-input { width: 100%; box-sizing: border-box; background: #f2f2f7; border: 2px solid transparent; border-radius: 16px; padding: 16px; font-size: 1rem; margin-bottom: 16px; outline: none; transition: 0.3s;}
        .ros-input:focus { background: #fff; border-color: #007aff; }
        @keyframes rosFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      </style>

      <div class="ros-wrapper">
        <div class="ros-header">
          <div>
            <h1 style="font-size: 2.6rem; font-weight: 800; margin: 0 0 8px 0; color: #1c1c1e;">Roster Command</h1>
            <p style="font-size: 1.1rem; color: #8e8e93; margin: 0;">Manage innovators and mentors for your institution.</p>
          </div>

        </div>

        <div class="ros-stats-grid">
          <div class="ros-stat-card">
            <div>
              <div style="font-size: 0.85rem; font-weight: 700; color: #8e8e93; text-transform: uppercase; letter-spacing:1px;">Active Innovators</div>
              <div style="font-size: 2.5rem; font-weight: 800; color: #1c1c1e;">${studentCount}</div>
            </div>
            <div style="font-size: 2.5rem; opacity:0.3;">🧑‍🎓</div>
          </div>
          <div class="ros-stat-card">
            <div>
              <div style="font-size: 0.85rem; font-weight: 700; color: #8e8e93; text-transform: uppercase; letter-spacing:1px;">Assigned Mentors</div>
              <div style="font-size: 2.5rem; font-weight: 800; color: #1c1c1e;">${mentorCount}</div>
            </div>
            <div style="font-size: 2.5rem; opacity:0.3;">🧑‍🏫</div>
          </div>
        </div>

        <h3 style="font-size: 1.1rem; color: #8e8e93; margin-bottom: 16px; text-transform:uppercase; letter-spacing:1px;">Mentors & Staff</h3>
        ${mentorsHtml}

        <h3 style="font-size: 1.1rem; color: #8e8e93; margin-top: 48px; margin-bottom: 16px; text-transform:uppercase; letter-spacing:1px;">Student Innovators</h3>
        ${studentsHtml}
      </div>

      <div id="rosOverlay" class="ros-overlay" onclick="if(event.target===this) window.closeAddUserPopup()">
        <div class="ros-modal">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 24px;">
            <h2 style="margin:0;">Enlist Personnel</h2>
            <button onclick="window.closeAddUserPopup()" style="background:#f2f2f7; border:none; width:32px; height:32px; border-radius:16px; cursor:pointer; color:#8e8e93; font-weight:bold;">✕</button>
          </div>
          
          <input type="text" id="ros-new-name" class="ros-input" placeholder="Full Name">
          <input type="email" id="ros-new-email" class="ros-input" placeholder="Email Address">
          
          <select id="ros-new-role" class="ros-input" style="cursor:pointer; appearance:none;">
            <option value="student">Student Innovator</option>
            <option value="mentor">Lab Mentor</option>
          </select>
          
          <p style="font-size:0.8rem; color:#8e8e93; text-align:center; margin-bottom:20px;">They will log in using this exact email address.</p>
          
          <button id="btn-add-user" onclick="window.submitNewUser()" style="background: #007aff; color: #fff; border: none; border-radius: 16px; padding: 18px; width: 100%; font-size: 1.1rem; font-weight: 800; cursor: pointer; transition: 0.2s;">
            Confirm Enlistment
          </button>
        </div>
      </div>
    `;

  } catch (error) {
    console.error("Error loading roster:", error);
    contentArea.innerHTML = `<div style="text-align:center; padding: 40px; color:#ff3b30;">System Error. Could not access personnel data.</div>`;
  }
}
// ============================================================================
// 🤝 TEAM OPERATIONS: HIERARCHICAL STAFF DELEGATION
// ============================================================================
export async function loadStaffTasks(db, currentUID, contentArea) {
  contentArea.innerHTML = `<div class="loader" style="text-align:center; padding:50px; color:#8e8e93; font-weight:600; font-family:sans-serif;">Loading.../ <span style="display:inline-block; animation:spin 1s linear infinite;">⏳</span></div>`;
  
  try {
    const { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");

    // 1. 🔐 SECURE ROLE & SCHOOL RETRIEVAL
    const userDocSnap = await getDoc(doc(db, "users", currentUID));
    if (!userDocSnap.exists()) return;
    const userData = userDocSnap.data();
    const userRole = userData.role || 'student';
    const isAdmin = (userRole === 'admin' || userRole === 'platform-admin');
    let mySchoolId = userData.schoolId;

    if (!isAdmin && (userRole === "atl-incharge" || userRole === "school-admin") && !mySchoolId) {
      const assignmentSnap = await getDocs(query(collection(db, "inchargeSchoolAssignments"), where("inchargeId", "==", currentUID)));
      if (!assignmentSnap.empty) mySchoolId = assignmentSnap.docs[0].data().schoolId;
    }

    if (!isAdmin && !mySchoolId) {
      contentArea.innerHTML = `<div style="padding:40px; text-align:center; color:#ff3b30; font-weight:600;">⚠️ No institution linked for staff operations.</div>`;
      return;
    }

    // 2. 🔍 HIERARCHICAL DATA FETCHING
    let usersSnap, tasksSnap;
    if (isAdmin) {
      // Admin sees everything to allow global delegation
      usersSnap = await getDocs(collection(db, "users"));
      tasksSnap = await getDocs(collection(db, "staff_tasks"));
    } else {
      // Staff only pull their institution's matrix
      usersSnap = await getDocs(query(collection(db, "users"), where("schoolId", "==", mySchoolId)));
      tasksSnap = await getDocs(query(collection(db, "staff_tasks"), where("schoolId", "==", mySchoolId)));
    }

    // 3. 🧠 THE DELEGATION ENGINE (Strict Rules applied)
    let staffMap = {};
    window.staffTargetData = {}; // Stores target's schoolId for cross-routing
    let staffOptionsHtml = '';
    
    usersSnap.forEach(docSnap => {
      const u = docSnap.data();
      const uid = docSnap.id;
      const targetRole = u.role;

      // Rule 1: No one assigns to Admins or Students.
      if (targetRole === 'admin' || targetRole === 'platform-admin' || targetRole === 'student') return;
      // Rule 2: Cannot assign to yourself.
      if (uid === currentUID) return;

      // Rule 3: If you are NOT an admin, you CANNOT assign to a School Admin.
      if (!isAdmin && targetRole === 'school-admin') return;

      staffMap[uid] = { name: u.name || "Unknown Staff", role: targetRole, schoolId: u.schoolId };
      window.staffTargetData[uid] = u.schoolId; // Save for routing

      // Build beautiful Dropdown
      const roleLabel = (targetRole || '').replace('-', ' ').toUpperCase();
      let displayContext = isAdmin && u.schoolId ? ` - [Sch-ID: ${u.schoolId.substring(0,4)}]` : '';
      staffOptionsHtml += `<option value="${uid}">${u.name || 'Unknown'} (${roleLabel})${displayContext}</option>`;
    });

    if (staffOptionsHtml === '') staffOptionsHtml = `<option value="">No eligible staff members available.</option>`;

    let myTasksHtml = '';
    let delegatedTasksHtml = '';
    let myTaskCount = 0;
    let delegatedCount = 0;

    // 4. 🧩 TASK ROUTING & RENDERING
    tasksSnap.forEach(docSnap => {
      const t = docSnap.data();
      const tId = docSnap.id;
      const status = t.status || 'pending';
      const isCompleted = status === 'completed';
      
      const assignedToMe = t.assignedTo === currentUID;
      const assignedByMe = t.assignedBy === currentUID && !assignedToMe; 

      // If Admin is viewing, only show tasks they created or were assigned (should be none)
      if (isAdmin && !assignedByMe && !assignedToMe) return;

      const checkIcon = isCompleted 
        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>` : ``;
      
      const checkClass = isCompleted ? 'st-check-active' : '';
      const textClass = isCompleted ? 'st-text-done' : '';

      const taskHTML = (context) => `
        <div class="st-task-card" id="task-card-${tId}">
          <div style="display:flex; align-items:flex-start; gap:18px;">
            ${context === 'mine' ? `
              <button class="st-checkbox ${checkClass}" onclick="window.toggleStaffTask('${tId}', '${status}')" id="check-${tId}">${checkIcon}</button>
            ` : `
              <div class="st-status-indicator ${isCompleted ? 'st-ind-done' : 'st-ind-pending'}"></div>
            `}
            <div style="flex:1;">
              <h4 class="st-task-title ${textClass}" id="title-${tId}">${t.title}</h4>
              <p class="st-task-desc">${t.description || ''}</p>
              <div class="st-task-meta">
                ${context === 'mine' 
                  ? `<span style="color:#007aff; font-weight:700;">From:</span> ${t.assignedByName || 'Admin'}` 
                  : `<span style="color:#8e8e93; font-weight:700;">To:</span> ${staffMap[t.assignedTo]?.name || 'Staff'}`}
                ${t.dueDate ? `&nbsp; • &nbsp; Due: <span style="font-weight:600; color:#1c1c1e;">${t.dueDate}</span>` : ''}
              </div>
            </div>
            ${context === 'delegated' ? `
              <button class="st-del-btn" onclick="window.deleteStaffTask('${tId}')" title="Retract Task">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            ` : ''}
          </div>
        </div>
      `;

      if (assignedToMe) { myTasksHtml += taskHTML('mine'); if (!isCompleted) myTaskCount++; }
      if (assignedByMe) { delegatedTasksHtml += taskHTML('delegated'); if (!isCompleted) delegatedCount++; }
    });

    if (!myTasksHtml) myTasksHtml = `<div class="st-empty">Zero action items. You are clear.</div>`;
    if (!delegatedTasksHtml) delegatedTasksHtml = `<div class="st-empty">No tasks delegated to your team.</div>`;

    // 5. 🎨 ULTRA PREMIUM ONE UI 9 + MACOS CSS
    const stCss = `
      <style>
        .st-wrapper { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif; max-width: 960px; margin: 0 auto; padding: 50px 10px 80px 10px; animation: stFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .st-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 48px; }
        
        .st-section-header { font-size: 1.3rem; color: #1c1c1e; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 20px; display:flex; align-items:center; gap:12px; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 12px;}
        .st-badge { background: rgba(0,122,255,0.1); color: #007aff; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;}

        /* Glassmorphic Widget Cards */
        .st-task-card { background: rgba(255,255,255,0.85); backdrop-filter: blur(20px); border-radius: 28px; padding: 24px 28px; box-shadow: 0 8px 24px rgba(0,0,0,0.03); border: 1px solid rgba(255,255,255,0.8); margin-bottom: 16px; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .st-task-card:hover { transform: translateY(-4px) scale(1.005); box-shadow: 0 16px 40px rgba(0,122,255,0.08); border-color: rgba(0,122,255,0.2); }
        
        .st-task-title { font-size: 1.25rem; font-weight: 700; color: #1c1c1e; margin: 0 0 8px 0; transition: all 0.3s ease; letter-spacing: -0.2px; }
        .st-task-desc { font-size: 1.05rem; color: #636366; margin: 0 0 16px 0; line-height: 1.5; font-weight: 500;}
        .st-task-meta { font-size: 0.9rem; color: #8e8e93; background: rgba(0,0,0,0.02); display: inline-block; padding: 6px 12px; border-radius: 10px; font-weight: 500;}
        .st-text-done { color: #8e8e93; text-decoration: line-through; opacity: 0.6; }

        /* Liquid Checkbox */
        .st-checkbox { width: 32px; height: 32px; border-radius: 50%; border: 2.5px solid #d1d1d6; background: transparent; cursor: pointer; display: flex; justify-content: center; align-items: center; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); outline: none; margin-top: 2px; flex-shrink: 0; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);}
        .st-checkbox:hover { border-color: #007aff; transform: scale(1.1); }
        .st-check-active { background: linear-gradient(135deg, #34c759, #28a745); border-color: transparent; transform: scale(1) !important; box-shadow: 0 8px 16px rgba(52,199,89,0.3); }
        
        .st-status-indicator { width: 14px; height: 14px; border-radius: 50%; margin-top: 8px; flex-shrink: 0; }
        .st-ind-pending { background: #ff9500; box-shadow: 0 0 12px rgba(255,149,0,0.5); }
        .st-ind-done { background: #34c759; box-shadow: 0 0 12px rgba(52,199,89,0.5); }

        .st-del-btn { background: #f2f2f7; border: none; color: #ff3b30; cursor: pointer; transition: 0.3s; padding: 12px; border-radius: 14px; display:flex; justify-content:center; align-items:center;}
        .st-del-btn:hover { background: #ffe5e5; transform: scale(1.1); }
        
        .st-empty { text-align: center; padding: 40px; font-size: 1.1rem; color: #8e8e93; font-weight: 600; background: rgba(0,0,0,0.02); border-radius: 28px; border: 2px dashed rgba(0,0,0,0.05); }

        /* Floating Action Button (FAB) */
        .st-fab { background: linear-gradient(135deg, #007aff, #5856d6); color: white; border: none; border-radius: 100px; padding: 16px 32px; font-size: 1.1rem; font-weight: 800; cursor: pointer; box-shadow: 0 12px 24px rgba(0,122,255,0.3); transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); display:flex; align-items:center; gap:8px;}
        .st-fab:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 16px 32px rgba(0,122,255,0.4); }

        /* macOS Spatial Eruption Modal */
        .st-mac-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0); z-index: 9999; display: none; justify-content: center; align-items: center; transition: background 0.4s ease, backdrop-filter 0.4s ease; }
        .st-mac-overlay.active { background: rgba(0,0,0,0.4); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
        
        .st-mac-modal { 
          background: rgba(255,255,255,0.95); backdrop-filter: blur(40px); width: 92%; max-width: 480px; 
          border-radius: 100px; padding: 40px 32px; box-shadow: 0 40px 80px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,1); border: 1px solid rgba(255,255,255,0.8);
          opacity: 0; transform: translate(var(--tx, 0px), var(--ty, 0px)) scale(0.05); 
          transition: transform 0.55s cubic-bezier(0.32, 0.08, 0.24, 1), opacity 0.4s ease, border-radius 0.5s cubic-bezier(0.32, 0.08, 0.24, 1);
        }
        .st-mac-overlay.active .st-mac-modal { transform: translate(0px, 0px) scale(1); opacity: 1; border-radius: 40px; }

        .st-input, .st-select, .st-textarea { width: 100%; box-sizing: border-box; background: #f2f2f7; border: 2px solid transparent; border-radius: 20px; padding: 20px 24px; font-size: 1.1rem; color: #1c1c1e; margin-bottom: 16px; outline: none; transition: 0.3s; font-family: inherit; font-weight:500;}
        .st-input:focus, .st-select:focus, .st-textarea:focus { background: #fff; border-color: #007aff; box-shadow: 0 8px 24px rgba(0,122,255,0.15); transform: translateY(-2px);}
        .st-textarea { resize: vertical; min-height: 120px; line-height: 1.5; }
        
        @keyframes stFadeIn { from{opacity:0; transform:translateY(20px);} to{opacity:1; transform:translateY(0);} }
        @keyframes liquidPulse { 0%{transform:scale(1);} 50%{transform:scale(1.25);} 100%{transform:scale(1);} }
      </style>
    `;

    contentArea.innerHTML = `
      ${stCss}
      <div class="st-wrapper">
        <div class="st-header">
          <div>
            <div style="color:#007aff; font-weight:800; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; font-size:0.85rem;">Operations Matrix</div>
            <h1 style="font-size: 3.2rem; font-weight: 800; margin: 0 0 4px 0; color: #1c1c1e; letter-spacing: -1.5px; line-height:1;">Tasks</h1>
            <p style="font-size: 1.15rem; color: #8e8e93; margin: 0; font-weight: 500;">Hierarchical task management and team sync.</p>
          </div>
          <button class="st-fab" onclick="window.openStaffTaskModal(event)">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg>
            Dispatch Task
          </button>
        </div>

        <div class="st-section-header">My Action Items <span class="st-badge">${myTaskCount}</span></div>
        <div style="margin-bottom: 56px;">${myTasksHtml}</div>

        <div class="st-section-header">Assigned by Me <span class="st-badge">${delegatedCount}</span></div>
        <div>${delegatedTasksHtml}</div>
      </div>

      <div id="stOverlay" class="st-mac-overlay" onclick="if(event.target===this) window.closeStaffTaskModal()">
        <div class="st-mac-modal" id="stModal">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 32px;">
            <h2 style="margin:0; font-size: 1.8rem; font-weight:800; letter-spacing:-0.5px; color:#1c1c1e;">New Directive</h2>
            <button onclick="window.closeStaffTaskModal()" style="background:#f2f2f7; border:none; width:40px; height:40px; border-radius:20px; cursor:pointer; color:#8e8e93; font-size:1.2rem; transition:0.2s;" onmouseover="this.style.background='#e5e5ea'">✕</button>
          </div>
          
          <input type="text" id="st-new-title" class="st-input" placeholder="Directive Title (e.g. Audit Hardware)" required>
          <textarea id="st-new-desc" class="st-textarea" placeholder="Details, requirements, and instructions..."></textarea>
          
          <select id="st-new-assignee" class="st-select" required>
            <option value="">-- Assign To Personnel --</option>
            ${staffOptionsHtml}
          </select>
          
          <input type="date" id="st-new-date" class="st-input">
          
          <button id="btn-create-st" onclick="window.submitStaffTask()" style="background: linear-gradient(135deg, #007aff, #34c759); color: #fff; border: none; border-radius: 20px; padding: 22px; width: 100%; font-size: 1.2rem; font-weight: 800; cursor: pointer; box-shadow: 0 12px 24px rgba(0,122,255,0.3); margin-top: 12px; transition: transform 0.2s;" onactive="this.style.transform='scale(0.96)'">
            Initialize & Deploy 🚀
          </button>
        </div>
      </div>
    `;

    // 6. 🚀 FLAGSHIP INTERACTIVITY

    window.openStaffTaskModal = function(event) {
      const overlay = document.getElementById('stOverlay');
      const modal = document.getElementById('stModal');
      
      if (event && event.currentTarget) {
        const rect = event.currentTarget.getBoundingClientRect();
        modal.style.setProperty('--tx', `${(rect.left + rect.width/2) - (window.innerWidth/2)}px`);
        modal.style.setProperty('--ty', `${(rect.top + rect.height/2) - (window.innerHeight/2)}px`);
      }
      
      overlay.style.display = 'flex';
      void modal.offsetWidth; 
      overlay.classList.add('active');
    };

    window.closeStaffTaskModal = function() {
      const overlay = document.getElementById('stOverlay');
      overlay.classList.remove('active');
      setTimeout(() => overlay.style.display = 'none', 450);
    };

    window.submitStaffTask = async function() {
      const title = document.getElementById('st-new-title').value.trim();
      const desc = document.getElementById('st-new-desc').value.trim();
      const assigneeId = document.getElementById('st-new-assignee').value;
      const dueDate = document.getElementById('st-new-date').value;
      const btn = document.getElementById('btn-create-st');

      if (!title || !assigneeId) return alert("Title and Assigned Personnel are required.");

      btn.innerHTML = "Encrypting... ⏳"; btn.disabled = true;

      try {
        const targetSchoolId = window.staffTargetData[assigneeId] || mySchoolId;
        await addDoc(collection(db, "staff_tasks"), {
          title: title,
          description: desc,
          assignedBy: currentUID,
          assignedByName: userData.name || 'Platform Admin',
          assignedTo: assigneeId,
          schoolId: targetSchoolId, 
          status: "pending",
          dueDate: dueDate,
          createdAt: serverTimestamp()});
        btn.innerHTML = "Deployed! ✅";
        setTimeout(() => {
          window.closeStaffTaskModal();
          loadStaffTasks(db, currentUID, contentArea);
        }, 800);
      } catch(err) {
        console.error(err); alert("Failed to initialize directive.");
        btn.innerHTML = "Initialize & Deploy 🚀"; btn.disabled = false;
      }
    };

    window.toggleStaffTask = async function(taskId, currentStatus) {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      const checkBtn = document.getElementById(`check-${taskId}`);
      const titleEl = document.getElementById(`title-${taskId}`);
      
      // Liquid Optimistic UI
      if (newStatus === 'completed') {
        checkBtn.classList.add('st-check-active');
        checkBtn.style.animation = 'liquidPulse 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        checkBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        titleEl.classList.add('st-text-done');
      } else {
        checkBtn.classList.remove('st-check-active');
        checkBtn.style.animation = '';
        checkBtn.innerHTML = '';
        titleEl.classList.remove('st-text-done');
      }

      try {
        await updateDoc(doc(db, "staff_tasks", taskId), { status: newStatus });
        setTimeout(() => loadStaffTasks(db, currentUID, contentArea), 1000); 
      } catch(err) {
        alert("Sync failed. Reverting.");
        loadStaffTasks(db, currentUID, contentArea);
      }
    };

    window.deleteStaffTask = async function(taskId) {
      if (!confirm("Retract this operational directive?")) return;
      document.getElementById(`task-card-${taskId}`).style.opacity = '0.3';
      document.getElementById(`task-card-${taskId}`).style.transform = 'scale(0.95)';
      try {
        await deleteDoc(doc(db, "staff_tasks", taskId));
        setTimeout(() => loadStaffTasks(db, currentUID, contentArea), 300);
      } catch(err) {
        alert("Retraction failed.");
        loadStaffTasks(db, currentUID, contentArea);
      }
    };

  } catch (error) {
    console.error("Operational Matrix Error:", error);
    contentArea.innerHTML = `<div style="text-align:center; padding: 40px; color:#ff3b30; font-weight:600;">System Error: Failed to access operational matrix.</div>`;
  }
}