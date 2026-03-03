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