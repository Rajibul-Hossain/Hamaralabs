//gemini
export async function dispatchEmailNotification(type, recipientEmail, data) {
  let subject = "";
  let htmlTemplate = "";
  const brandColor = "#4361ee"; 
  const accentColor = "#eef2ff";
  const header = `<div style="font-family: 'Poppins', 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
                  <div style="background: linear-gradient(135deg, ${brandColor}, #3a0ca3); padding: 24px; text-align: center; color: white;">
                    <h2 style="margin: 0; font-weight: 800; letter-spacing: -0.02em;">HamaraLabs <span style="font-size: 1.2rem;">🏠</span></h2>
                  </div>
                  <div style="padding: 32px; background: #ffffff; color: #334155; line-height: 1.6;">`;
  const footer = `</div><div style="background: #f8fafc; padding: 20px; text-align: center; font-size: 0.85rem; color: #64748b; border-top: 1px solid #e2e8f0;">
                  © 2026 HamaraLabs. This is an automated system dispatch.<br>
                  <a href="https://digital-atl.web.app" style="color: ${brandColor}; text-decoration: none; font-weight: 600;">Open Dashboard</a>
                  </div></div>`;

  if (type === "ACCOUNT_CREATED_MANUAL") {
    subject = "Welcome to HamaraLabs! 🚀";
    htmlTemplate = `${header}
      <h3 style="color: #0f172a;">Welcome aboard, ${data.userName}!</h3>
      <p>Your <strong>${(data.role || "student").toUpperCase()}</strong> account has been provisioned by the administration.</p>
      <div style="background: ${accentColor}; padding: 16px; border-radius: 12px; margin: 24px 0;">
        <p style="margin:0; color: #312e81;"><strong>Login Email:</strong> ${recipientEmail}</p>
        <p style="margin:8px 0 0 0; color: #312e81; font-size: 0.9rem;"><em>Use the password provided by your Admin.</em></p>
      </div>
      <p>Log in now to access your workspace and start building the future.</p>
      ${footer}`;
  }
  else if (type === "ACCOUNT_APPROVED") {
    subject = "Your HamaraLabs Account is Approved! 🎉";
    htmlTemplate = `${header}
      <h3 style="color: #0f172a;">Great news, ${data.userName}!</h3>
      <p>The administration team has officially approved your account. Your secure workspace is now active.</p>
      <p>You can now log in and access all platform features.</p>
      ${footer}`;
  }
  else if (type === "ACCOUNT_SUSPENDED") {
    subject = "⚠️ Action Required: Account Suspended";
    htmlTemplate = `${header}
      <h3 style="color: #dc2626;">Notice of Suspension</h3>
      <p>Hello ${data.userName},</p>
      <p>Your HamaraLabs account has been temporarily suspended by an Administrator.</p>
      <p>If you believe this is an error, please contact your school administrator or mentor.</p>
      ${footer}`;
  }
  else if (type === "TASK_ASSIGNED") {
    subject = `New Project Assigned: ${data.taskTitle}`;
    htmlTemplate = `${header}
      <h3 style="color: #0f172a;">Hello ${data.studentName},</h3>
      <p>Your Mentor has deployed a new project to your workspace.</p>
      <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border-left: 4px solid ${brandColor}; margin: 24px 0;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a;">${data.taskTitle}</h4>
        <div style="font-size: 0.9rem; color: #475569;">
          <strong>Priority:</strong> ${data.priority.toUpperCase()}<br>
          <strong>Due Date:</strong> ${data.dueDate}
        </div>
      </div>
      <p>Log in to your dashboard to review the action plan and begin tinkering!</p>
      ${footer}`;
  }
  else if (type === "TASK_UPDATED") {
    subject = `Task Update: ${data.taskTitle}`;
    htmlTemplate = `${header}
      <h3 style="color: #0f172a;">Hello ${data.studentName},</h3>
      <p>Your Mentor has updated the details or deadline for an active project.</p>
      <div style="background: #fffbeb; padding: 16px; border-radius: 12px; border-left: 4px solid #f59e0b; margin: 24px 0;">
        <strong>Project:</strong> ${data.taskTitle}<br>
        <strong>New Due Date:</strong> ${data.dueDate}
      </div>
      <p>Please check your workspace for the latest instructions.</p>
      ${footer}`;
  }
  else if (type === "TASK_OVERDUE_REMINDER") {
    subject = `⚠️ Overdue Project: ${data.taskTitle}`;
    htmlTemplate = `${header}
      <h3 style="color: #0f172a;">Action Required, ${data.studentName}</h3>
      <p>This is an automated reminder that a project in your workspace has passed its due date.</p>
      <div style="background: #fef2f2; padding: 16px; border-radius: 12px; border-left: 4px solid #ef4444; margin: 24px 0;">
        <strong style="color: #991b1b;">Project:</strong> <span style="color: #b91c1c;">${data.taskTitle}</span><br>
        <strong style="color: #991b1b;">Originally Due:</strong> <span style="color: #b91c1c;">${data.dueDate}</span>
      </div>
      <p>Please log in and submit your progress as soon as possible.</p>
      ${footer}`;
  }

  else if (type === "TASK_SUBMITTED") {
    subject = `Task Submitted: ${data.studentName} completed a project!`;
    htmlTemplate = `${header}
      <h3 style="color: #0f172a;">Update from your Hub,</h3>
      <p><strong>${data.studentName}</strong> has marked a task as 100% complete and submitted their work.</p>
      <div style="background: #f0fdf4; padding: 16px; border-radius: 12px; border: 1px solid #bbf7d0; margin: 24px 0;">
        <strong>Project:</strong> ${data.taskTitle}<br>
        <strong>Completion Date:</strong> ${new Date().toLocaleDateString()}
      </div>
      <p>Please log in to your Mentor dashboard to review their submission.</p>
      ${footer}`;
  }
  else if (type === "TASK_REVIEWED") {
    subject = `Mentor Feedback: ${data.taskTitle}`;
    htmlTemplate = `${header}
      <h3 style="color: #0f172a;">Hello ${data.studentName},</h3>
      <p>Your Mentor has reviewed your recent project submission.</p>
      <div style="background: #f0f9ff; padding: 16px; border-radius: 12px; border-left: 4px solid #0ea5e9; margin: 24px 0;">
        <strong style="color: #0369a1;">Mentor's Note:</strong><br>
        <span style="color: #0284c7;">"${data.mentorFeedback || 'Great job! Task approved.'}"</span>
      </div>
      <p>Keep up the great work in the lab!</p>
      ${footer}`;
  }

  else if (type === "DOUBT_RAISED") {
    subject = `New Question from ${data.studentName}`;
    htmlTemplate = `${header}
      <h3 style="color: #0f172a;">Student Assistance Required</h3>
      <p><strong>${data.studentName}</strong> has raised a doubt regarding the project: <em>${data.taskTitle}</em>.</p>
      <div style="background: #f8fafc; padding: 16px; border-radius: 12px; border-left: 4px solid #f59e0b; margin: 24px 0;">
        <span style="color: #475569; font-style: italic;">"${data.doubtMessage}"</span>
      </div>
      <p>Jump into your dashboard to reply and help them get unblocked.</p>
      ${footer}`;
  }
  else if (type === "DOUBT_REPLIED") {
    subject = `Your Mentor Replied to your Doubt!`;
    htmlTemplate = `${header}
      <h3 style="color: #0f172a;">Hello ${data.studentName},</h3>
      <p>Your Mentor has responded to your question regarding <em>${data.taskTitle}</em>.</p>
      <div style="background: #f0fdf4; padding: 16px; border-radius: 12px; border-left: 4px solid #22c55e; margin: 24px 0;">
        <strong style="color: #166534;">Mentor says:</strong><br>
        <span style="color: #15803d;">"${data.mentorReply}"</span>
      </div>
      <p>Head back to the dashboard to continue your project!</p>
      ${footer}`;
  }
  else if (type === "BULK_REGISTER_SUCCESS") {
    subject = "Pipeline Complete: Bulk Roster Imported 📁";
    htmlTemplate = `${header}
      <h3 style="color: #0f172a;">Bulk Registration Report</h3>
      <p>The automated CSV pipeline has finished executing.</p>
      <div style="background: #eef2ff; padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #c7d2fe;">
        <div style="margin-bottom: 8px;"><strong>Total Processed:</strong> <span style="color: ${brandColor};">${data.totalProcessed}</span></div>
        <div style="margin-bottom: 8px;"><strong>New Profiles Created:</strong> <span style="color: #10b981;">${data.newCount}</span></div>
        <div><strong>Profiles Merged/Updated:</strong> <span style="color: #f59e0b;">${data.mergedCount}</span></div>
      </div>
      <p>All students are now securely enrolled in the Firestore database.</p>
      ${footer}`;}
  else if (type === "NEW_SCHOOL_REGISTERED") {
    subject = "🏫 New Institution Registered";
    htmlTemplate = `${header}
      <h3 style="color: #0f172a;">Platform Expansion Alert</h3>
      <p>A new institution has been successfully added to the HamaraLabs ecosystem.</p>
      <div style="background: #f8fafc; padding: 16px; border-radius: 12px; margin: 24px 0;">
        <strong>School Name:</strong> ${data.schoolName}<br>
        <strong>Registry ID:</strong> ${data.schoolId}
      </div>
      <p>You can now begin onboarding mentors and students for this location.</p>
      ${footer}`;}
  else if (type === "MENTOR_ASSIGNED_SCHOOL") {
    subject = "🏫 New School Assignment";
    htmlTemplate = `${header}
      <h3 style="color: #0f172a;">Hello ${data.mentorName},</h3>
      <p>The administration team has assigned you as the official ATL Mentor for a new institution.</p>
      <div style="background: #f0f9ff; padding: 16px; border-radius: 12px; border-left: 4px solid #0ea5e9; margin: 24px 0;">
        <strong>Institution:</strong> ${data.schoolName}
      </div>
      <p>You can now view this school's student roster and begin deploying projects.</p>
      ${footer}`;}
  else if (type === "GLOBAL_ANNOUNCEMENT") {
    subject = `📢 Announcement: ${data.announcementTitle}`;
    htmlTemplate = `${header}
      <h3 style="color: #0f172a;">${data.announcementTitle}</h3>
      <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #cbd5e1;">
        <p style="color: #334155; margin: 0; line-height: 1.6;">${data.announcementMessage}</p>
      </div>
      <p style="font-size: 0.9rem; color: #64748b;"><em>Message sent by HamaraLabs Administration</em></p>
      ${footer}`;}
  else if (type === "HARDWARE_KIT_ASSIGNED") {
    subject = "⚙️ Hardware Kit Issued to You";
    htmlTemplate = `${header}
      <h3 style="color: #0f172a;">Hardware Checkout: ${data.studentName}</h3>
      <p>A physical hardware kit has been assigned to you for your upcoming ATL projects.</p>
      <div style="background: #fffbeb; padding: 16px; border-radius: 12px; border-left: 4px solid #f59e0b; margin: 24px 0;">
        <strong>Equipment:</strong> ${data.equipmentName} <br>
        <strong>Checkout Date:</strong> ${data.checkoutDate}<br>
        <strong>Expected Return:</strong> ${data.returnDate}
      </div>
      <p>Please handle the components with care and reach out to your mentor if you need help with wiring or firmware!</p>
      ${footer}`;
  }
  try {
    const response = await fetch('https://hamaralabs.vercel.app/api/sendMail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: recipientEmail, subject, htmlTemplate })
    });
    if (!response.ok) throw new Error("Backend rejected email request.");
    console.log(`Email dispatched successfully: [${type}] -> ${recipientEmail}`);
  } catch (error) {
    console.error(`Failed to dispatch email [${type}]:`, error);
  }
}
//studentttttttttttttttt
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
export async function loadStudentTAs(db, currentUID, contentArea) {
  contentArea.innerHTML = `<div class="loader">Loading...</div>`;
  try {
    const q = query(collection(db, "tinkering_activities"), where("assignedTo", "==", currentUID));
    const snap = await getDocs(q);
    const studentCss = `
      <style>
        :root {
          --ui-curve: cubic-bezier(0.2, 0.9, 0.2, 1); /* Samsung/Apple Fluid Easing */
          --glass-surface: rgba(255, 255, 255, 0.75);
          --glass-border: rgba(255, 255, 255, 0.9);
          --ambient-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.06);
          --accent-glow: 0 32px 64px -16px rgba(0, 122, 255, 0.2);
        }

        .stu-wrapper { 
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif; 
          max-width: 1160px; margin: 0 auto; padding: 40px 20px 80px 20px; 
          animation: stuFadeUp 0.7s var(--ui-curve); 
        }

        /* The Spring-Loaded Dynamic Heading (Kept your awesome interaction!) */
        .stu-dynamic-heading { position: relative; display: inline-flex; flex-direction: column; height: 1.1em; overflow: hidden; cursor: default; vertical-align: bottom; }
        .stu-heading-layer { font-size: 2.8rem; font-weight: 800; letter-spacing: -1.5px; line-height: 1.1; transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.15), opacity 0.5s ease; }
        .stu-heading-front { color: #1c1c1e; transform: translateY(0); opacity: 1; }
        .stu-heading-back { position: absolute; top: 0; left: 0; width: 100%; transform: translateY(100%); opacity: 0; background: linear-gradient(135deg, #007aff, #8a2be2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .stu-dynamic-heading:hover .stu-heading-front { transform: translateY(-100%); opacity: 0; }
        .stu-dynamic-heading:hover .stu-heading-back { transform: translateY(0); opacity: 1; }
        
        .stu-subtitle { font-size: 1.15rem; color: #8e8e93; font-weight: 500; margin-top: 8px; margin-bottom: 40px; letter-spacing: -0.2px;}
        
        .stu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 32px; }
        
        /* 🌌 The Aurora Glass Card */
        .stu-card { 
          background: linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 100%); 
          backdrop-filter: blur(40px) saturate(200%); -webkit-backdrop-filter: blur(40px) saturate(200%);
          border-radius: 36px; padding: 32px; position: relative; cursor: pointer;
          box-shadow: var(--ambient-shadow), inset 0 2px 4px rgba(255,255,255,0.8);
          transition: transform 0.5s var(--ui-curve), box-shadow 0.5s var(--ui-curve);
        }
        
        /* The Luminous Gradient Border (Visible on Hover) */
        .stu-card::before {
          content: ''; position: absolute; inset: 0; border-radius: 36px; padding: 2px;
          background: linear-gradient(135deg, rgba(0,122,255,0.6), rgba(138,43,226,0.2), transparent 60%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          opacity: 0; transition: opacity 0.6s var(--ui-curve); z-index: 1; pointer-events: none;
        }

        .stu-card:hover { 
          transform: translateY(-8px) scale(1.02); 
          box-shadow: var(--accent-glow), inset 0 2px 4px rgba(255,255,255,1); 
        }
        .stu-card:hover::before { opacity: 1; }
        
        /* Glowing Badges */
        .stu-badge { 
          position: absolute; top: 28px; right: 28px; 
          background: rgba(0, 122, 255, 0.08); color: #007aff; 
          padding: 8px 16px; border-radius: 100px; font-size: 0.8rem; font-weight: 800; 
          text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 6px;
          backdrop-filter: blur(10px); border: 1px solid rgba(0, 122, 255, 0.1);
        }
        .stu-badge::before { content: ''; display: block; width: 6px; height: 6px; border-radius: 50%; background: #007aff; box-shadow: 0 0 8px #007aff; }
        .stu-badge-completed { background: rgba(52, 199, 89, 0.08); color: #28a745; border-color: rgba(52, 199, 89, 0.1); }
        .stu-badge-completed::before { background: #28a745; box-shadow: 0 0 8px #28a745; }
        
        /* Typography Polish */
        .stu-subject { font-size: 0.85rem; font-weight: 800; color: #8e8e93; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; }
        .stu-activity-title { font-size: 1.6rem; font-weight: 800; color: #1c1c1e; margin-bottom: 16px; line-height: 1.2; letter-spacing: -0.5px; transition: color 0.3s ease; position: relative; z-index: 2; }
        .stu-card:hover .stu-activity-title { color: #007aff; }
        .stu-intro { font-size: 1rem; color: #636366; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 32px; font-weight: 500; }
        
        /* Fluid Pill Button */
        .stu-btn { 
          background: rgba(118, 118, 128, 0.06); color: #1c1c1e; border: none; 
          border-radius: 100px; padding: 16px; width: 100%; 
          font-size: 1.05rem; font-weight: 700; transition: all 0.4s var(--ui-curve); 
          display: flex; justify-content: center; align-items: center; gap: 8px;
          position: relative; z-index: 2;
        }
        .stu-btn span { transition: transform 0.3s var(--ui-curve); }
        .stu-card:hover .stu-btn { background: #007aff; color: #fff; box-shadow: 0 8px 24px rgba(0, 122, 255, 0.3); }
        .stu-card:hover .stu-btn span { transform: translateX(4px) translateY(-4px); }

        /* Blueprint Modal - Volumetric Glass */
        .stu-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); z-index: 1000; display: none; justify-content: center; align-items: center; opacity: 0; transition: opacity 0.4s var(--ui-curve); }
        .stu-modal-overlay.active { display: flex; opacity: 1; }
        
        .stu-modal { 
          background: linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,250,252,0.95) 100%); 
          width: 92%; max-width: 860px; max-height: 85vh; border-radius: 40px; 
          box-shadow: 0 40px 80px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,1); 
          transform: scale(0.9) translateY(40px); transition: all 0.5s var(--ui-curve); opacity: 0; 
          overflow-y: auto; -ms-overflow-style: none; scrollbar-width: none; border: 1px solid rgba(255,255,255,0.8);
        }
        .stu-modal::-webkit-scrollbar { display: none; }
        .stu-modal-overlay.active .stu-modal { transform: scale(1) translateY(0); opacity: 1; }
        
        .stu-modal-header { padding: 40px 40px 32px 40px; border-bottom: 1px solid rgba(0,0,0,0.04); position: sticky; top: 0; background: rgba(255,255,255,0.85); backdrop-filter: blur(30px); z-index: 10; display: flex; justify-content: space-between; align-items: flex-start;}
        .stu-modal-body { padding: 0 40px 40px 40px; }
        
        .stu-close { background: rgba(118,118,128,0.1); border: none; width: 40px; height: 40px; border-radius: 20px; font-size: 1.2rem; cursor: pointer; display: flex; justify-content: center; align-items: center; transition: 0.3s; color: #8e8e93;}
        .stu-close:hover { background: #e5e5ea; color: #1c1c1e; transform: rotate(90deg); }

        .stu-section { margin-top: 40px; }
        .stu-section h4 { font-size: 1.15rem; color: #1c1c1e; justify-content: center;  font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;}
        .stu-section h4 span { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: rgba(0,122,255,0.1); color: #007aff; border-radius: 10px; font-size: 1.2rem; }
        
        /* Interactive List Items */
        .stu-list { list-style: none; padding: 0; margin: 0; }
        .stu-list li { 
          background: #ffffff; border-radius: 20px; padding: 18px 24px; margin-bottom: 12px; 
          font-size: 1.05rem; color: #3a3a3c; font-weight: 500; border: 1px solid rgba(0,0,0,0.03); 
          display: flex; gap: 16px; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.02);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
        .stu-list li:hover { transform: translateX(6px); box-shadow: 0 8px 16px rgba(0,0,0,0.04); border-color: rgba(0,122,255,0.2); }
        .stu-list li::before { content: ''; width: 8px; height: 8px; background: #007aff; border-radius: 50%; display: inline-block; box-shadow: 0 0 8px rgba(0,122,255,0.5); }
        @keyframes stuFadeUp { from { opacity: 0; transform: translateY(30px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      </style>`;
    if (snap.empty) {
      contentArea.innerHTML = `
        ${studentCss}
        <div class="stu-wrapper" style="text-align:center; padding-top: 100px;">
          <div style="font-size: 4rem; margin-bottom: 20px;">🛰️</div>
          <h2 class="stu-header-title">No Active Missions</h2>
          <p class="stu-subtitle">Your ATL Incharge hasn't assigned any Tinkering Activities to you yet.</p>
        </div>`;
      return;
    }

    // 3. Build the Grid of Mission Cards
    window.taStudentData = {}; // Store locally for the modal
    let gridHtml = '';

    snap.forEach(doc => {
      const data = doc.data();
      window.taStudentData[doc.id] = data;
      const status = (data.status || 'assigned').toLowerCase();
      const isCompleted = status === 'completed';
      
      gridHtml += `
        <div class="stu-card" onclick="window.openStudentTAModal('${doc.id}')">
          <div class="stu-badge ${isCompleted ? 'stu-badge-completed' : ''}">${isCompleted ? 'Completed' : 'Active'}</div>
          <div class="stu-subject">${data.subject || 'Innovation'}</div>
          <div class="stu-activity-title">${data.activityName || 'Classified Project'}</div>
          <div class="stu-intro">${data.introduction || 'Click to view mission blueprint...'}</div>
          <button class="stu-btn">View Details <span>↗</span></button>
        </div>
      `;
    });

window.openStudentTAModal = function(taId) {
      const data = window.taStudentData[taId];
      if (!data) return;

      const buildList = (arr, icon) => {
        if (!arr || arr.length === 0) return `<p style="color:#8e8e93; font-style:italic;">None specified.</p>`;
        return `<ul class="stu-list">${arr.map(item => `<li><span style="display:none;">${icon}</span>${item}</li>`).join('')}</ul>`;
      };

      const status = data.status || 'assigned';
      let actionAreaHtml = '';

      // State Engine for the bottom action area
      if (status === 'completed') {
        actionAreaHtml = `
          <div style="background: rgba(52, 199, 89, 0.1); border: 1px solid rgba(52, 199, 89, 0.2); border-radius: 24px; padding: 24px; text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 8px;">🏆</div>
            <h4 style="color: #28a745; margin: 0 0 8px 0; font-size: 1.2rem;">Mission Accomplished</h4>
            <p style="color: #28a745; opacity: 0.8; margin: 0; font-weight: 500;">Your ATL Incharge has verified this activity.</p>
          </div>
        `;
      } else if (status === 'submitted') {
        actionAreaHtml = `
          <div style="background: rgba(0, 122, 255, 0.08); border: 1px solid rgba(0, 122, 255, 0.15); border-radius: 24px; padding: 24px; text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 8px; animation: atlSpin 2s linear infinite;">⏳</div>
            <h4 style="color: #007aff; margin: 0 0 8px 0; font-size: 1.2rem;">Under Review</h4>
            <p style="color: #007aff; opacity: 0.8; margin: 0; font-weight: 500;">Awaiting verification from Lab Command.</p>
          </div>
        `;
      } else {
        actionAreaHtml = `
          <div id="stu-submit-trigger-${taId}">
            <button onclick="document.getElementById('stu-submit-trigger-${taId}').style.display='none'; document.getElementById('stu-submit-form-${taId}').style.display='block';" 
                    style="background: linear-gradient(135deg, #007aff, #005bb5); color: #fff; border: none; border-radius: 100px; padding: 20px 60px; font-size: 1.15rem; font-weight: 800; cursor: pointer; box-shadow: 0 20px 40px rgba(0, 122, 255, 0.3); transition: transform 0.3s ease; width: 100%;">
              Log Mission Results 🚀
            </button>
          </div>
          
          <div id="stu-submit-form-${taId}" style="display: none; background: #f9f9fb; border-radius: 28px; padding: 32px; border: 1px solid rgba(0,0,0,0.05); animation: stuFadeUp 0.4s ease;">
            <h4 style="font-size: 1.2rem; color: #1c1c1e; margin: 0 0 16px 0; font-weight: 800;">Upload Telemetry</h4>
            
            <label style="display:block; font-size: 0.9rem; font-weight: 700; color: #8e8e93; margin-bottom: 8px;">Project Evidence (Drive/Video Link)</label>
            <input type="url" id="ta-stu-link-${taId}" placeholder="https://..." style="width: 100%; box-sizing: border-box; background: #fff; border: 2px solid transparent; border-radius: 16px; padding: 16px; font-size: 1rem; color: #1c1c1e; outline: none; transition: 0.3s; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);" onfocus="this.style.borderColor='#007aff'">
            
            <label style="display:block; font-size: 0.9rem; font-weight: 700; color: #8e8e93; margin-bottom: 8px;">Field Notes & Observations</label>
            <textarea id="ta-stu-notes-${taId}" placeholder="What did you learn? Did you face any issues?" style="width: 100%; box-sizing: border-box; background: #fff; border: 2px solid transparent; border-radius: 16px; padding: 16px; font-size: 1rem; color: #1c1c1e; outline: none; transition: 0.3s; margin-bottom: 24px; min-height: 100px; resize: vertical; box-shadow: 0 2px 8px rgba(0,0,0,0.02);" onfocus="this.style.borderColor='#007aff'"></textarea>
            
            <button onclick="window.submitTAMission('${taId}')" id="btn-submit-${taId}" style="background: #0099ff; color: #fff; border: none; border-radius: 100px; padding: 18px; font-size: 1.1rem; font-weight: 800; cursor: pointer; box-shadow: 0 10px 20px rgba(52, 140, 199, 0.3); width: 100%; transition: 0.2s;">
              Upload 📡
            </button>
          </div>
        `;
      }

      document.getElementById('stuModalContent').innerHTML = `
        <div class="stu-modal-content-scroll">
          <div class="stu-modal-header">
            <div>
              <div class="stu-subject">${data.subject || 'Innovation'} • ${data.topic || 'General'}</div>
              <h2 class="stu-heading-layer" style="margin-bottom:0; font-size:2.4rem; color:#1c1c1e;">${data.activityName || 'Classified Project'}</h2>
            </div>
            <button class="stu-close" onclick="window.closeStudentTAModal()">✕</button>
          </div>
          <div class="stu-modal-body">
            <div class="stu-section" style="margin-top: 24px;">
              <p style="font-size: 1.15rem; line-height: 1.7; color: #3a3a3c; font-weight: 500;">${data.introduction || ''}</p>
            </div>
            
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px;">
              <div class="stu-section"><h4><span>📦</span> Required Hardware</h4>${buildList(data.materials, '')}</div>
              <div class="stu-section"><h4><span>🎯</span> Mission Goals</h4>${buildList(data.goals, '')}</div>
            </div>

            <div class="stu-section"><h4><span>🚀</span> Execution Steps</h4>${buildList(data.instructions, '')}</div>

            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px;">
              <div class="stu-section"><h4><span>⚠️</span> Safety & Tips</h4>${buildList(data.tips, '')}</div>
              <div class="stu-section"><h4><span>📊</span> Expected Observations</h4>${buildList(data.observations, '')}</div>
            </div>
        <div class="stu-section" style="margin-top: 60px;">${actionAreaHtml}</div></div></div>`;
      
      const overlay = document.getElementById('stuModalOverlay');
      overlay.style.display = 'flex';
      requestAnimationFrame(() => overlay.classList.add('active'));};
    window.submitTAMission = async function(taId) {
      const btn = document.getElementById(`btn-submit-${taId}`);
      const linkVal = document.getElementById(`ta-stu-link-${taId}`).value.trim();
      const notesVal = document.getElementById(`ta-stu-notes-${taId}`).value.trim();

      if (!linkVal && !notesVal) {
        alert("Please provide either a project link or field notes to submit.");
        return;}
      btn.innerText = "Uploading⏳";
      btn.disabled = true;
      try {
        await updateDoc(doc(db, "tinkering_activities", taId), {
          status: 'submitted',
          submissionURL: linkVal,
          studentNotes: notesVal,
          submittedAt: serverTimestamp()});
        window.taStudentData[taId].status = 'submitted';
        window.taStudentData[taId].submissionURL = linkVal;
        window.taStudentData[taId].studentNotes = notesVal;
        btn.innerText = "Uploaded Successfullly ✅";
        btn.style.background = "#007aff";
        setTimeout(() => { window.openStudentTAModal(taId); }, 1500);
      } catch (err) {console.error("Submission error:", err);
        alert("Transmission failed. Please try again.");
        btn.innerText = "Transmit Data 📡";
        btn.disabled = false;}};
    window.closeStudentTAModal = function() {
      const overlay = document.getElementById('stuModalOverlay');
      overlay.classList.remove('active');
      setTimeout(() => overlay.style.display = 'none', 300);
      document.body.style.overflow = ''; };
    contentArea.innerHTML = `${studentCss}
      <div class="stu-wrapper">
        <h2 class="stu-header-title">Mission Briefings</h2>
        <p class="stu-subtitle">Tinkering Activities assigned by your ATL Incharge.</p>
        <div class="stu-grid">${gridHtml}</div>
      </div>
      
      <div id="stuModalOverlay" class="stu-modal-overlay" onclick="if(event.target===this) window.closeStudentTAModal()">
        <div class="stu-modal" id="stuModalContent"></div>
      </div>
    `;

  } catch (error) {
    console.error("Error loading student TAs:", error);
    contentArea.innerHTML = `<div style="text-align:center; padding: 40px; color:#ff3b30; font-weight:600;">Failed to establish connection.</div>`;
  }
}