import { collection, query, where, getDocs, getDoc, doc, addDoc, serverTimestamp, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
// ============================================================================
// ⚙️ ATL INCHARGE: ONE-UI / IOS COMMAND CENTER (MACOS PHYSICS EDITION)
// ============================================================================

export async function loadInchargeOverview(db, currentUID, contentArea) {
  contentArea.innerHTML = `
    <div style="display:flex; justify-content:center; align-items:center; height: 60vh; flex-direction:column; gap: 16px;">
      <div style="width: 44px; height: 44px; border: 4px solid #e5e5ea; border-top-color: #007aff; border-radius: 50%; animation: atlSpin 0.8s cubic-bezier(0.6, 0.2, 0.4, 0.8) infinite;"></div>
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #8e8e93; font-weight: 600; letter-spacing: 0.5px;">Syncing Academic Telemetry...</div>
      <style>@keyframes atlSpin { to { transform: rotate(360deg); } }</style>
    </div>`;
  
  try {
    const assignmentSnap = await getDocs(query(collection(db, "inchargeSchoolAssignments"), where("inchargeId", "==", currentUID)));

    if (assignmentSnap.empty) {
      contentArea.innerHTML = `<div style="padding:40px; text-align:center; color:#ff3b30; font-family:-apple-system, sans-serif; font-weight:600; background:#fff; border-radius:24px; box-shadow:0 10px 30px rgba(0,0,0,0.05); margin: 20px;">⚠️ No school assigned to your profile. Contact Platform Admin.</div>`;
      return;
    }

    const schoolId = assignmentSnap.docs[0].data().schoolId;

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
          
          /* The starting "Minimized" state (Tiny, curved, and located exactly where the button is) */
          border-radius: 100px;
          opacity: 0;
          transform: translate(var(--tx, 0px), var(--ty, 0px)) scale(0.05);
          
          /* Apple's official App Launch Curve */
          transition: 
            transform 0.55s cubic-bezier(0.32, 0.08, 0.24, 1), 
            opacity 0.4s ease, 
            border-radius 0.5s cubic-bezier(0.32, 0.08, 0.24, 1);
        }
        
        /* The final "Maximized" state (Center of screen, full size) */
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
        // Get the exact physical coordinates of the clicked button
        const rect = event.currentTarget.getBoundingClientRect();
        const btnCenterX = rect.left + (rect.width / 2);
        const btnCenterY = rect.top + (rect.height / 2);
        
        // Get the exact physical center of your monitor
        const windowCenterX = window.innerWidth / 2;
        const windowCenterY = window.innerHeight / 2;
        
        // Calculate the exact distance the modal needs to fly to reach the button
        const translateX = btnCenterX - windowCenterX;
        const translateY = btnCenterY - windowCenterY;
        
        // Inject those distances directly into the CSS engine
        modal.style.setProperty('--tx', `${translateX}px`);
        modal.style.setProperty('--ty', `${translateY}px`);
      }

      if (overlay) {
        overlay.style.display = 'flex';
        // Force the browser to register the new coordinates before triggering the animation
        void modal.offsetWidth; 
        overlay.classList.add('active');
      }
    };
    
    window.hideMentorPopup = function() {
      const overlay = document.getElementById('cuteMentorPopup');
      if (overlay) {
        overlay.classList.remove('active');
        // When 'active' is removed, the CSS automatically sucks it back to --tx and --ty!
        setTimeout(() => overlay.style.display = 'none', 550); // Matches the 0.55s transition duration
      }
    };

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

          <div class="atl-card" onclick="window.showMentorPopup(event)" style="animation-delay: 0.3s; background: linear-gradient(135deg, #007aff, #34c759); border: none; color: white; cursor: pointer; box-shadow: 0 16px 32px rgba(0, 122, 255, 0.25);" onmouseover="this.style.transform='translateY(-6px)'; this.style.boxShadow='0 20px 40px rgba(0, 122, 255, 0.35)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 16px 32px rgba(0, 122, 255, 0.25)';">
            <div class="atl-card-title" style="color: rgba(255,255,255,0.9);">
              <span>Tinkering Pulse</span> 
              <span style="font-size:1.2rem; background: rgba(255,255,255,0.25); border-radius: 50%; width: 34px; height: 34px; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(5px);">⚡</span>
            </div>
            <div class="atl-stat-val" style="color: white;">${totalTAs}</div>
            <div class="atl-stat-lbl" style="color: rgba(255,255,255,0.95); font-weight: 700; display: flex; align-items: center; justify-content: space-between;">
              <span>Active Lab Missions</span>
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
</div></div></div>
      <div id="cuteMentorPopup" class="cute-overlay" onclick="if(event.target===this) window.hideMentorPopup()">
        <div class="cute-modal">
          <div class="cute-avatar">👋</div>
          <h3 class="cute-name">${mentorName}</h3>
          <div class="cute-role">Assigned School Mentor</div>
          <p style="color: #636366; font-size: 1rem; margin-bottom: 32px; font-weight: 500; line-height: 1.5;">
            This is your partner in innovation. They help verify tasks and guide students through their Tinkering Activities!</p>
          <button class="cute-btn" onclick="window.hideMentorPopup()">Thank you!</button>
        </div></div>`;

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
  try {
    // 1. Role-Aware Profile Fetching
    const userDocSnap = await getDoc(doc(db, "users", currentUID));
    if (!userDocSnap.exists()) {
      contentArea.innerHTML = `<div style="padding:40px; text-align:center; color:#ff3b30; font-weight:600;">⚠️ User profile not found.</div>`;
      return;
    }

    const userData = userDocSnap.data();
    const userRole = userData.role;
    let schoolId = userData.schoolId;

    // Fallback for Incharge if schoolId isn't directly on the user doc
    if (userRole === "atl-incharge" && !schoolId) {
      const assignmentSnap = await getDocs(query(collection(db, "inchargeSchoolAssignments"), where("inchargeId", "==", currentUID)));
      if (!assignmentSnap.empty) {
        schoolId = assignmentSnap.docs[0].data().schoolId;
      }
    }

    if (!schoolId) {
      contentArea.innerHTML = `<div style="padding:40px; text-align:center; color:#ff3b30; font-weight:600;">⚠️ No school assigned to your profile. Cannot create activities.</div>`;
      return;
    }

    // 2. 🔐 SMART ASSIGNMENT LOGIC
    let studentOptions = "";
    
    if (userRole === "student") {
      // If user is a student, they can ONLY assign to themselves
      studentOptions = `<option value="${currentUID}">${userData.name || 'Me'} (Personal Activity)</option>`;
    } else {
      // Mentors and Incharges get the full school list
      const studentsSnap = await getDocs(query(collection(db, "users"), where("role", "==", "student"), where("schoolId", "==", schoolId)));
      studentOptions = `<option value="unassigned">-- Do not assign yet (Save to Library) --</option>`;
      studentsSnap.forEach(doc => {
        const s = doc.data();
        studentOptions += `<option value="${doc.id}">${s.name || 'Unknown Student'} (${s.email || ''})</option>`;
      });
    }

    const generatedActivityId = `TA-${Date.now().toString().slice(-7)}`;

    // 3. CSS (Preserved perfectly)
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

    // Window functions
    window.addTADynamicRow = function(containerId, placeholder) {
      const container = document.getElementById(containerId);
      const div = document.createElement('div');
      div.className = 'ta-dynamic-row';
      div.innerHTML = `
        <input type="text" class="ta-input" data-array="${containerId}" placeholder="${placeholder}">
        <button type="button" class="ta-btn-remove" onclick="this.parentElement.remove()" title="Remove item">✕</button>`;
      container.appendChild(div);
    };

    window.submitTAForm = async function() {
      const submitBtn = document.getElementById('taSubmitBtn');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = "Deploying... <span style='font-size:1.2rem; animation: taSpin 1s infinite linear;'>⏳</span>";
      submitBtn.disabled = true;
      try {
        const getArrayData = (arrayId) => {
          const inputs = document.querySelectorAll(`input[data-array="${arrayId}"]`);
          return Array.from(inputs).map(input => input.value.trim()).filter(val => val !== "");
        };
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
          resources: getArrayData('ta-resources')
        };
        if (!payload.activityName || !payload.subject) {
          alert("Activity Name and Subject are required.");
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          return;
        }
        await addDoc(collection(db, "tinkering_activities"), payload);
        submitBtn.innerHTML = "Deployed Successfully! ✅";
        submitBtn.style.background = "#34c759";
        submitBtn.style.boxShadow = "0 10px 20px rgba(52, 199, 89, 0.3)";
        setTimeout(() => {
          document.getElementById('taForm').reset();
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = "#007aff";
          submitBtn.disabled = false;
        }, 2500);
      } catch (err) {
        console.error("Error saving TA:", err);
        alert("Failed to save activity.");
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    };

    // 4. Render UI
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
              <div class="ta-group"><label class="ta-label">Subject</label><select id="ta-subject" class="ta-select" required><option value="">Select Domain...</option><option value="Electronics & IoT">Electronics & IoT</option><option value="Robotics">Robotics</option><option value="Coding & AI">Coding & AI</option><option value="3D Design & Printing">3D Design & Printing</option><option value="Science Experiment">Science Experiment</option></select></div>
              <div class="ta-group"><label class="ta-label">Topic</label><input type="text" id="ta-topic" class="ta-input" placeholder="e.g. Microcontrollers"></div>
              <div class="ta-group"><label class="ta-label">Sub Topic</label><input type="text" id="ta-subtopic" class="ta-input" placeholder="e.g. Arduino Basics"></div>
            </div>
            <div class="ta-grid-2">
              <div class="ta-group"><label class="ta-label">System ID</label><input type="text" id="ta-id" class="ta-input ta-id-badge" value="${generatedActivityId}" readonly></div>
              <div class="ta-group"><label class="ta-label">Activity Name</label><input type="text" id="ta-name" class="ta-input" placeholder="Enter an inspiring title..." required></div>
            </div>
            <div class="ta-group">
              <label class="ta-label">Target Innovator</label>
              <select id="ta-assign" class="ta-select" ${userRole === 'student' ? 'disabled' : ''}>
                ${studentOptions}
              </select>
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
            <button type="submit" id="taSubmitBtn" class="ta-btn-primary">Deploy Activity ✨</button>
          </div>
        </form>
      </div>`;

  } catch (error) {
    console.error("Error rendering TA Form:", error);
    contentArea.innerHTML = `<div style="text-align:center; padding: 40px; color:#ff3b30; font-weight:600;">Failed to load module.</div>`;
  }
}


// ============================================================================
// 📊 TA REPORTS: UNIVERSAL TRACKER (Incharge, Mentor, & Student)
// ============================================================================

export async function loadTAReport(db, currentUID, contentArea) {
  contentArea.innerHTML = `<div class="loader">Loading Reports...</div>`;
  try {
    // 1. 🔐 SECURE ROLE & SCHOOL RETRIEVAL
    const userDocSnap = await getDoc(doc(db, "users", currentUID));
    if (!userDocSnap.exists()) {
      contentArea.innerHTML = `<div style="padding:40px; text-align:center; color:#ff3b30; font-weight:600;">⚠️ User profile not found.</div>`;
      return;
    }

    const userData = userDocSnap.data();
    const userRole = userData.role;
    let schoolId = userData.schoolId;

    // Fallback for Incharge if schoolId isn't on the main doc
    if (userRole === "atl-incharge" && !schoolId) {
      const assignmentSnap = await getDocs(query(collection(db, "inchargeSchoolAssignments"), where("inchargeId", "==", currentUID)));
      if (!assignmentSnap.empty) {
        schoolId = assignmentSnap.docs[0].data().schoolId;
      }
    }

    if (!schoolId) {
      contentArea.innerHTML = `<div style="padding:40px; text-align:center; color:#ff3b30; font-weight:600;">⚠️ No school assigned to your profile.</div>`;
      return;
    }

    // 2. 🔍 CONTEXTUAL DATA QUERIES
    let taQuery;
    if (userRole === "student") {
      // Students ONLY see their own activities
      taQuery = query(collection(db, "tinkering_activities"), where("schoolId", "==", schoolId), where("assignedTo", "==", currentUID));
    } else {
      // Incharge and Mentors see everything in the school
      taQuery = query(collection(db, "tinkering_activities"), where("schoolId", "==", schoolId));
    }

    const [taSnap, studentsSnap] = await Promise.all([
      getDocs(taQuery),
      getDocs(query(collection(db, "users"), where("role", "==", "student"), where("schoolId", "==", schoolId)))
    ]);
    
    let studentMap = {};
    studentsSnap.forEach(doc => { studentMap[doc.id] = doc.data().name || "Unknown Student"; });
    let pendingReviews = '';
    let otherMissions = '';
    
    window.taReviewData = {};

    taSnap.forEach(docSnap => {
      const data = docSnap.data();
      const taId = docSnap.id;
      window.taReviewData[taId] = data;
      
      const status = (data.status || 'assigned').toLowerCase();
      const assignedName = data.assignedTo && data.assignedTo !== "unassigned" ? studentMap[data.assignedTo] : "Unassigned (Library)";
      
      if (status === 'submitted') {
        pendingReviews += `
          <div style="background: #fff; border-radius: 24px; padding: 24px; box-shadow: 0 10px 30px rgba(0, 122, 255, 0.1); border: 1px solid rgba(0, 122, 255, 0.2); margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; transition: 0.3s; animation: taFadeIn 0.5s ease;" onmouseover="this.style.transform='translateX(8px)'" onmouseout="this.style.transform='translateX(0)'">
            <div>
              <div style="font-size: 0.8rem; font-weight: 800; color: #007aff; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; display:flex; align-items:center; gap:6px;"><span style="display:inline-block; width:8px; height:8px; background:#007aff; border-radius:50%; box-shadow:0 0 8px #007aff;"></span> Review Required</div>
              <h3 style="margin: 0 0 4px 0; font-size: 1.4rem; color: #1c1c1e; letter-spacing: -0.5px;">${data.activityName || 'Untitled'}</h3>
              <div style="color: #8e8e93; font-weight: 500;">Innovator: <strong style="color:#1c1c1e;">${assignedName}</strong></div>
            </div>
            <button onclick="window.openTAReviewModal('${taId}')" style="background: rgba(0, 122, 255, 0.1); color: #007aff; border: none; border-radius: 16px; padding: 14px 24px; font-weight: 800; cursor: pointer; transition: 0.2s;">View Details ↗</button>
          </div>`;
      } else {
        const badgeColor = status === 'completed' ? '#34c759' : '#8e8e93';
        const badgeBg = status === 'completed' ? 'rgba(52, 199, 89, 0.1)' : 'rgba(142, 142, 147, 0.1)';
        
        otherMissions += `
          <div onclick="window.openTAReviewModal('${taId}')" style="cursor: pointer; background: #fff; border-radius: 20px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.04); margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; transition: 0.2s;" onmouseover="this.style.background='#f9f9fb'; this.style.transform='scale(1.01)';" onmouseout="this.style.background='#fff'; this.style.transform='scale(1)';">
            <div>
              <h3 style="margin: 0 0 4px 0; font-size: 1.1rem; color: #1c1c1e;">${data.activityName || 'Untitled'}</h3>
              <div style="color: #8e8e93; font-size: 0.9rem;">Assigned to: ${assignedName}</div>
            </div>
            <div style="background: ${badgeBg}; color: ${badgeColor}; padding: 6px 14px; border-radius: 12px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase;">${status}</div>
          </div>`;
      }
    });

    if (!pendingReviews) pendingReviews = `<div style="text-align:center; padding: 40px; background: rgba(0,0,0,0.02); border-radius: 24px; color: #8e8e93; font-weight: 600;">No pending reviews.</div>`;
    if (!otherMissions) otherMissions = `<div style="text-align:center; padding: 20px; color: #8e8e93; font-weight: 500;">No other active TAs.</div>`;

    contentArea.innerHTML = `
      <style>
        .tar-wrapper { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif; max-width: 1000px; margin: 0 auto; padding: 40px 10px; animation: taFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .tar-header { font-size: 2.6rem; font-weight: 800; letter-spacing: -1.2px; margin: 0 0 8px 0; color: #1c1c1e;}
        .tar-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); z-index: 999; display: none; justify-content: center; align-items: center; opacity: 0; transition: opacity 0.4s ease; }
        .tar-overlay.active { display: flex; opacity: 1; }
        .tar-mac-modal { 
          background: #fff; width: 90%; max-width: 550px; max-height: 85vh; border-radius: 16px; 
          box-shadow: 0 25px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05); 
          display: flex; flex-direction: column; overflow: hidden;
          transform: scale(0.7) translateY(20px); opacity: 0; 
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
        }
        .tar-overlay.active .tar-mac-modal { transform: scale(1) translateY(0); opacity: 1; }
        .tar-modal-body { flex: 1; overflow-y: auto; padding: 32px; }
        @keyframes taFadeIn { from{opacity:0; transform:translateY(20px);} to{opacity:1; transform:translateY(0);} }
      </style>
      
      <div class="tar-wrapper">
        <h2 class="tar-header">${userRole === 'student' ? 'My TA Reports' : 'TA Reports'}</h2>
        <p style="font-size: 1.1rem; color: #8e8e93; margin-bottom: 40px; font-weight: 500;">${userRole === 'student' ? 'Track your activity status and review feedback.' : 'Review incoming telemetry and verify student projects.'}</p>
        
        <h3 style="font-size: 1.4rem; color: #1c1c1e; margin-bottom: 20px;">To Be Reviewed</h3>
        ${pendingReviews}
        
        <h3 style="font-size: 1.2rem; color: #8e8e93; margin-top: 48px; margin-bottom: 16px; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 12px;">All Operations Log</h3>
        ${otherMissions}
      </div>

      <div id="tarReviewOverlay" class="tar-overlay" onclick="if(event.target===this) window.closeTAReviewModal()">
        <div class="tar-mac-modal" id="tarReviewContent"></div>
      </div>`;

    window.openTAReviewModal = function(taId) {
      const data = window.taReviewData[taId];
      if (!data) return;

      const isSubmitted = (data.status || 'assigned').toLowerCase() === 'submitted';

      const linkHtml = data.submissionURL 
        ? `<a href="${data.submissionURL}" target="_blank" style="display:block; text-align:center; background:#f2f2f7; color:#007aff; padding: 16px; border-radius: 12px; font-weight: 800; text-decoration: none; margin-bottom: 24px; transition: 0.2s;" onmouseover="this.style.background='#e5e5ea'">🔗 Open Submission Link</a>` 
        : `<div style="padding: 16px; background: rgba(0,0,0,0.03); border-radius: 12px; color: #8e8e93; text-align: center; font-style: italic; margin-bottom: 24px;">No link provided.</div>`;

      const notesHtml = data.studentNotes 
        ? `<div style="background: #fff8e6; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 0 12px 12px 0; color: #3a3a3c; font-size: 1.05rem; line-height: 1.6; margin-bottom: 16px; font-style: italic;">"${data.studentNotes}"</div>`
        : `<div style="color: #8e8e93; font-style: italic; margin-bottom: 16px;">No field notes provided.</div>`;

      // 🛡️ STUDENT PROTECTION: Only show buttons to Incharge/Mentor
      let actionButtons = "";
      if (userRole !== "student" && isSubmitted) {
        actionButtons = `
          <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 32px;">
            <button id="btn-approve-${taId}" onclick="window.updateTAStatus('${taId}', 'completed')" style="background: linear-gradient(135deg, #34c759, #28a745); color: #fff; border: none; border-radius: 16px; padding: 18px; font-size: 1.1rem; font-weight: 800; cursor: pointer; box-shadow: 0 10px 20px rgba(52, 199, 89, 0.25); transition: 0.2s;">Approve & Verify ✅</button>
            <button id="btn-reject-${taId}" onclick="window.updateTAStatus('${taId}', 'assigned')" style="background: rgba(255, 59, 48, 0.1); color: #ff3b30; border: none; border-radius: 16px; padding: 16px; font-size: 1.1rem; font-weight: 700; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='rgba(255, 59, 48, 0.15)'" onmouseout="this.style.background='rgba(255, 59, 48, 0.1)'">Request Revisions ↩️</button>
          </div>`;
      } else {
        actionButtons = `<div style="margin-top: 32px; padding: 16px; background: #f2f2f7; border-radius: 12px; text-align: center; color: #8e8e93; font-weight: 700; text-transform: uppercase;">Current Status: ${data.status}</div>`;
      }

      document.getElementById('tarReviewContent').innerHTML = `
        <div style="background: #f6f6f6; border-bottom: 1px solid rgba(0,0,0,0.1); padding: 14px 20px; display: flex; align-items: center; position: sticky; top: 0; z-index: 10;">
          <div style="display: flex; gap: 8px;">
            <div onclick="window.closeTAReviewModal()" style="width: 13px; height: 13px; border-radius: 50%; background: #ff5f56; border: 1px solid #e0443e; cursor: pointer;"></div>
            <div onclick="window.closeTAReviewModal()" style="width: 13px; height: 13px; border-radius: 50%; background: #ffbd2e; border: 1px solid #dea123; cursor: pointer;"></div>
            <div onclick="window.closeTAReviewModal()" style="width: 13px; height: 13px; border-radius: 50%; background: #27c93f; border: 1px solid #1aab29; cursor: pointer;"></div>
          </div>
          <div style="flex: 1; text-align: center; font-size: 0.95rem; font-weight: 600; color: #3a3a3c; transform: translateX(-24px);">Mission Intelligence</div>
        </div>
        <div class="tar-modal-body">
          <h3 style="font-size: 1.8rem; margin: 0 0 8px 0; letter-spacing: -0.5px;">${data.activityName}</h3>
          <div style="color: #8e8e93; font-weight: 500; margin-bottom: 32px; text-transform: uppercase; letter-spacing: 1px; font-size: 0.85rem;">System ID: ${data.activityId || taId}</div>
          <h4 style="font-size: 0.9rem; color: #8e8e93; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">Evidence Details</h4>
          ${linkHtml}
          <h4 style="font-size: 0.9rem; color: #8e8e93; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">Submission Notes</h4>
          ${notesHtml}
          ${actionButtons}
        </div>`;
      
      const overlay = document.getElementById('tarReviewOverlay');
      overlay.style.display = 'flex';
      requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('active')));
    };

    window.closeTAReviewModal = function() {
      const overlay = document.getElementById('tarReviewOverlay');
      overlay.classList.remove('active');
      setTimeout(() => overlay.style.display = 'none', 400);
    };

    window.updateTAStatus = async function(taId, newStatus) {
      if (userRole === 'student') return; // Double security
      const btnApprove = document.getElementById(`btn-approve-${taId}`);
      const btnReject = document.getElementById(`btn-reject-${taId}`);
      btnApprove.disabled = true; btnReject.disabled = true;
      btnApprove.innerText = "Syncing... ⏳";
      try {
        await updateDoc(doc(db, "tinkering_activities", taId), { status: newStatus });
        alert(newStatus === 'completed' ? "Activity Verified!" : "Returned for revisions.");
        window.closeTAReviewModal();
        if (typeof loadSection === 'function') {
          setTimeout(() => loadSection('tinkering activity report'), 300);
        }
      } catch(err) {
        alert("Sync Failed.");
        btnApprove.disabled = false; btnReject.disabled = false;
        btnApprove.innerText = "Approve & Verify ✅";
      }
    };
  } catch (error) {
    console.error(error);
    contentArea.innerHTML = `<div style="text-align:center; padding: 40px; color:#ff3b30; font-weight:600;">System Error.</div>`;
  }
}