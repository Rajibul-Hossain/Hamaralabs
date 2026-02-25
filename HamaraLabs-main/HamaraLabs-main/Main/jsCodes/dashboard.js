import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs, query, where, addDoc, onSnapshot, serverTimestamp, arrayUnion } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { updateDoc, orderBy, getCountFromServer } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { addCheckmarkAnimation, confettiBurst, startPremiumSparkle } from "./animations.js";
import { regformCSS, regHTML } from "./animations.js";
import { loadAdminOverview, loadAdminSchools, loadAdminUsers } from "./adminFxn.js";

const firebaseConfig = {
  apiKey: "AIzaSyAPyLzaSXa1wMjD77wMi1-Z2bSvhAbFCBU",
  authDomain: "digital-atl.firebaseapp.com",
  projectId: "digital-atl",
  storageBucket: "digital-atl.firebasestorage.app",
  messagingSenderId: "428997443618",
  appId: "1:428997443618:web:0cb487a807a8ccd5ee0a7b",
  measurementId: "G-G0SYKW59P6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const db = getFirestore(app);
const storage = getStorage(app);
const sidebar = document.getElementById("sidebar");
export const contentArea = document.getElementById("contentArea");
export let currentUID = null;
export let currentRole = null; 
let activeUnsubscribe = null;
function clearListener() {
  if (activeUnsubscribe) {
    activeUnsubscribe();
    activeUnsubscribe = null;}}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = "../index.html"; return; }
  currentUID = user.uid;
  const userSnap = await getDoc(doc(db, "users", user.uid));
  if (!userSnap.exists()) {
    alert("User profile not found."); return;
  }
  currentRole = userSnap.data().role || "DEAD"; 
  initDashboard(userSnap.data());
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function initDashboard(userData) {
  document.getElementById("welcomeText").innerText = `Welcome, ${userData.name || "User"}`;
  document.getElementById("roleBadge").innerText = (currentRole).toUpperCase();
  renderSidebar(currentRole);
  loadSection("overview");
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function renderSidebar(role) {
  sidebar.innerHTML = `<div class="logo">HamaraLabs 🏠</div>`;
  let modules = [];
  const safeRole = role.toLowerCase();
  
  if (safeRole === "mentor") {
    modules = ["overview", "students", "Register School", "assignedTeams", "sessions", "analytics"];
  }
  if (safeRole === "student") {
    modules = ["overview", "myTasks"];
  }
  if (safeRole === "admin") { 
    modules = [
      "overview",       // stats, recent activity logs, quick approvals
      "schools",        // Regs, activate/deactivate, subscriptions, mentor assignments
      "users",          // Mentors, Students, role control, suspensions
      "tasks",          // Global task monitoring and completion status
      "announcements",  // platform/school/role specific broadcasts
      "analytics",      // Growth trends, engagement metrics, detailed performance
      "settings"        // System configs, permissions, data governance
    ];
  }

  modules.forEach(module => {
    const item = document.createElement("div");
    item.className = "nav-item";
    item.innerText = module.charAt(0).toUpperCase() + module.slice(1);
    item.onclick = () => {
      document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
      item.classList.add("active");
      loadSection(module);
    };
    sidebar.appendChild(item);
  });
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function loadStudentTasks() {
  clearListener();
  const q = query(collection(db, "tasks"), where("studentId", "==", currentUID));
  activeUnsubscribe = onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      contentArea.innerHTML = `
        <div class="card">
          <div class="card-title">My Tasks</div>
          <p>No tasks assigned yet.</p>
        </div>`; 
      return;
    }
    
    let tasks = [];
    snapshot.forEach(docSnap => {
      tasks.push({ id: docSnap.id, ...docSnap.data() });
    });
    
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    tasks.sort((a, b) => {
      const pA = (a.priority || "low").toLowerCase();
      const pB = (b.priority || "low").toLowerCase();
      return (priorityOrder[pA] || 3) - (priorityOrder[pB] || 3);
    });
    
    let html = `
      <div class="card">
        <div class="card-title">My Tasks</div>`;
        
    tasks.forEach(task => {
      const progress = Number(task.progress) || 0;
      const priority = (task.priority || "low").toLowerCase();
      const status = task.status || "assigned";
      let isOverdue = false;
      
      if (task.dueDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(task.dueDate);
        due.setHours(0, 0, 0, 0);
        if (due < today && status !== "completed") {
          isOverdue = true;
        }
      }
      
      let borderColor = "#2ecc71"; 
      if (priority === "high") borderColor = "#ff9500"; 
      if (priority === "medium") borderColor = "#5ac8fa"; 
      if (isOverdue) borderColor = "#ff3b30"; 
      
      html += `
        <div style="border-left:6px solid ${borderColor};padding:16px;margin-bottom:18px; border-radius:14px;background:#f9fbff;">
          <strong>${task.title || "Your Task "}</strong><br>
          <small>${task.description || ""}</small><br><br>
          Due: ${task.dueDate || "No Deadline 🥳"}<br>
          Priority: ${priority.charAt(0).toUpperCase() + priority.slice(1)}<br>
          Status: ${status}<br><br>
          <label>Progress:</label><br>
          <input type="range" min="0" max="100" value="${progress}" ${status === "completed" ? "disabled" : ""} onchange="updateProgress('${task.id}', this.value)"/>
          ${progress}%<br><br>`;
          
      if (status === "completed") {
        html += `<button id="completeBtn-${task.id}" class="completed" disabled>Completed ✓</button>`;
      } else {
        const disabledAttr = progress < 100 ? "disabled style='opacity:0.5;cursor:not-allowed;'" : "";
        html += `<button id="completeBtn-${task.id}" onclick="markCompleted('${task.id}')" ${disabledAttr}>Mark Complete</button>`;
      }
      
      html += `<br><br><input type="file" ${status === "completed" ? "disabled" : ""} onchange="uploadSubmission('${task.id}', this.files[0])"/>`;
      
      if (task.submissionURL) {
        html += `
          <br><a href="${task.submissionURL}" target="_blank" class="ios-view-link">View Submitted File</a>
          <div id="doubtBox-${task.id}" class="ios-doubt-box">
            <div class="ios-doubt-header"><div class="ios-doubt-icon">?</div><div class="ios-doubt-title">Ask Your Mentor</div></div>
            <textarea id="doubt-${task.id}" class="ios-doubt-textarea" placeholder="Describe your doubt or problem..."></textarea>
            <div class="ios-doubt-footer">
              <button class="ios-doubt-send" onclick="submitDoubt('${task.id}')">Send</button>
            </div>
          </div>`;
      }
      html += `</div>`;
    });
    html += `</div>`;
    contentArea.innerHTML = html;
  });
}

window.updateProgress = async function (taskId, value) {
  const progressValue = Number(value);
  await updateDoc(doc(db, "tasks", taskId), {
    progress: progressValue, status: progressValue === 100 ? "ready" : "in progress"
  });
  const btn = document.getElementById(`completeBtn-${taskId}`);
  if (btn) {
    if (progressValue === 100) {
      btn.disabled = false; btn.style.opacity = "1"; btn.style.cursor = "pointer";
    } else { 
      btn.disabled = true; btn.style.opacity = "0.5"; btn.style.cursor = "not-allowed";
    }
  }
};

window.markCompleted = async function (taskId) {
  try {
    const taskRef = doc(db, "tasks", taskId); 
    const taskSnap = await getDoc(taskRef);
    if (!taskSnap.exists()) return;
    const taskData = taskSnap.data();
    
    if ((taskData.progress || 0) < 100) {
      alert("Complete 100% progress before marking as complete.");
      return;
    }
    
    await updateDoc(taskRef, {
      status: "completed",
      completedAt: serverTimestamp()
    });
    
    const btn = document.getElementById(`completeBtn-${taskId}`);
    if (btn) {
      btn.classList.add("completed");
      btn.innerText = "Completed ✓";
      addCheckmarkAnimation(btn);
      startPremiumSparkle();
      btn.disabled = true;
      btn.style.opacity = "0.7";
      btn.style.cursor = "default";
      const rect = btn.getBoundingClientRect();
      confettiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
  } catch (error) { console.error("Error completing task:", error); }
};

window.uploadSubmission = async function (taskId, file) {
  if (!file) return;
  const storageRef = ref(storage, `submissions/${currentUID}/${taskId}/${file.name}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  await updateDoc(doc(db, "tasks", taskId), {
    submissionURL: downloadURL,
    submittedAt: serverTimestamp()
  });
};

window.submitDoubt = async function (taskId) {
  const textarea = document.getElementById(`doubt-${taskId}`);
  if (!textarea) return;
  const message = textarea.value.trim();
  if (!message) {
    alert("Please enter your doubt.");
    return;
  }
  try {
    await addDoc(collection(db, "tasks", taskId, "doubts"), {
      message: message,
      studentId: currentUID,
      createdAt: serverTimestamp(),
      mentorReply: null,
      replyAt: null
    });
    textarea.value = "";
    alert("Doubt sent to mentor!");
  } catch (error) {
    console.error("Error sending doubt:", error);
    alert("Something went wrong.");
  }
};

function initStudentNotifications() {
  const q = query(collection(db, "tasks"), where("studentId", "==", currentUID));
  onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach(change => {
      if (change.type === "added") {
        alert("New task assigned: " + change.doc.data().title);}});});}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function loadSection(section) {
  clearListener();
  contentArea.innerHTML = `<div class="loader">Loading...</div>`;
  if (section === "students") loadStudentsSection();
  if (section === "assignedTeams") loadAssignedTeams();
  if (section === "sessions") loadSessions();
  if (section === "analytics") loadAnalytics();
  if (section === "myTasks") loadStudentTasks();
  if (section === "registerSchool" || section === "Register School") loadRegForm();
  if (currentRole && currentRole.toLowerCase() === "admin") {
    if (section === "overview" || section === "adminOverview") {loadAdminOverview(db, contentArea);}
    if (section === "schools") {loadAdminSchools(db, contentArea);}
    if (section === "users") {loadAdminUsers(db, contentArea);}
  } else {if ((section === "overview" || section === "adminOverview") && typeof loadOverview === "function") {loadOverview();}}}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function loadRegForm() {
  const container = contentArea || document.getElementById("dashboardContent");
  if (!container) return;
  
  if (!document.getElementById("school-form-styles")) {
    const style = document.createElement("style");
    style.id = "school-form-styles";
    style.textContent = regformCSS; 
    document.head.appendChild(style);
  }
  
  try {
    const response = await fetch("/forms/school.html"); 
    if (response.ok) {
      const html = await response.text();
      container.innerHTML = html;
    } else {
      throw new Error("Failed to fetch external HTML template");
    }
  } catch (error) {
    console.warn("External HTML failed to load, falling back to local layout.", error);
    container.innerHTML = regHTML;
  }
  
  try {
    await import("./reg.js"); 
  } catch (scriptError) {
    console.warn("Failed to dynamically load script (it may be missing or already loaded)", scriptError);
}}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function loadStudentsSection() {
  const schoolQ = query(collection(db, "mentorSchoolAssignments"), where("mentorId", "==", currentUID));
  const schoolSnap = await getDocs(schoolQ);
  
  if (schoolSnap.empty) { 
    contentArea.innerHTML = `<div class="card">No Schools Assigned</div>`; 
    return; 
  }
  
  let html = `
    <div class="card"> 
      <div class="card-title">Select School</div>
      <select id="schoolSelect" style="width: 25%; padding: 12px; border-radius: 8px; border: 1px solid #ccc; font-size: 1rem;">
        <option value="">-- Choose a School --</option>`;
        
  for (const docSnap of schoolSnap.docs) {
    const assignmentData = docSnap.data();
    const schoolRef = await getDoc(doc(db, "schools", assignmentData.schoolId));
    
    // Safely look for schoolName first, fallback to doc ID if somehow empty
    let displaySchoolName = assignmentData.schoolId;
    if (schoolRef.exists()) {
      displaySchoolName = schoolRef.data().schoolName || schoolRef.data().name || assignmentData.schoolId;
    }
    
    html += `<option value="${assignmentData.schoolId}">${displaySchoolName}</option>`;
  }
  
  html += `</select></div><div id="studentList"></div>`;
  contentArea.innerHTML = html;
  
  document.getElementById("schoolSelect").addEventListener("change", e => { 
    loadStudentsBySchool(e.target.value); 
  });
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function loadStudentsBySchool(schoolId) {
  if (!schoolId) return;
  const studentQ = query(collection(db, "users"), where("role", "==", "student"), where("schoolId", "==", schoolId));
  const studentSnap = await getDocs(studentQ);
  
  if (studentSnap.empty) {
    document.getElementById("studentList").innerHTML = `<div class="card">No Students Found</div>`;
    return;
  }
  
  let html = `<div class="card"><div class="card-title">Students</div>`;
  studentSnap.forEach(docSnap => {
    const student = docSnap.data();
    html += `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px; padding-bottom: 8px; border-bottom: 1px solid #eee;">
        <strong>${student.name}</strong>
        <div style="display:flex;gap:8px;">
          <button onclick="openStudentTaskView('${docSnap.id}','${student.name}')" style="background: #e0e0e0; color: #333;">View Tasks</button>
          <button onclick="openTaskModal('${docSnap.id}','${schoolId}')">Assign Task</button>
        </div>
      </div>`;
  });
  html += `</div>`;
  document.getElementById("studentList").innerHTML = html;
}

let selectedStudent = null; 
let selectedSchool = null;

window.openTaskModal = (studentId, schoolId) => {
  selectedStudent = studentId; 
  selectedSchool = schoolId;
  const modal = document.getElementById("assignTaskModal");
  if (!modal) return;
  modal.classList.remove("hidden");
};

window.closeTaskModal = () => {
  const modal = document.getElementById("assignTaskModal"); 
  if (!modal) return; 
  modal.classList.add("hidden");
};

document.addEventListener("click", async (e) => {
  if (e.target.id === "saveTaskBtn") { 
    const title = document.getElementById("taskTitle")?.value.trim(); 
    const description = document.getElementById("taskDescription")?.value.trim();
    const dueDate = document.getElementById("taskDueDate")?.value;
    const priority = document.getElementById("taskPriority")?.value;
    
    if (!title || !dueDate || !selectedStudent) return;
    
    await addDoc(collection(db, "tasks"), { 
      title, 
      description, 
      dueDate, 
      priority, 
      studentId: selectedStudent, 
      schoolId: selectedSchool, 
      mentorId: currentUID, 
      status: "assigned", 
      progress: 0, 
      assignedAt: serverTimestamp() 
    });
    
    document.getElementById("taskTitle").value = "";
    document.getElementById("taskDescription").value = "";
    document.getElementById("taskDueDate").value = "";
    closeTaskModal();
  }
});

let unsubscribeMentorTasks = null;

window.openStudentTaskView = function (studentId, studentName) {
  const modal = document.getElementById("studentTaskModal");
  const nameEl = document.getElementById("modalStudentName");
  const container = document.getElementById("mentorTaskListContainer");
  
  if (!modal || !container || !nameEl) return;
  nameEl.textContent = studentName + "'s Tasks";
  modal.classList.remove("hidden");
  modal.style.display = "flex";
  
  if (unsubscribeMentorTasks) unsubscribeMentorTasks();
  
  const q = query(collection(db, "tasks"), where("studentId", "==", studentId));
  unsubscribeMentorTasks = onSnapshot(q, (snapshot) => {
    container.innerHTML = "";
    if (snapshot.empty) { 
      container.innerHTML = "<p>No tasks assigned yet.</p>"; 
      return; 
    }
    
    snapshot.forEach(docSnap => {
      const task = docSnap.data();
      const taskId = docSnap.id;
      const wrapper = document.createElement("div");
      wrapper.style.marginBottom = "16px";
      wrapper.style.borderBottom = "1px solid #ddd";
      wrapper.style.paddingBottom = "12px";
      wrapper.innerHTML = `
        <div style="cursor:pointer;" onclick="openMentorDetailPanel('${taskId}')">
          <strong>${task.title}</strong><br>
          Due: ${task.dueDate}<br>
          Status: ${task.status}
        </div>
        <div id="mentor-task-detail-${taskId}" style="display:none;margin-top:12px;">
          <div><strong>Description:</strong><br>${task.description || "No description"}</div><br>
          <div><strong>Progress:</strong> ${task.progress || 0}%</div><br>
          ${task.submissionURL ? `
            <div><strong>Submission:</strong><br><a href="${task.submissionURL}" target="_blank">View Submitted File</a></div><br>
          ` : `<div><strong>Submission:</strong> Not submitted</div><br>`}
          <div>
            <strong>Doubts:</strong>
            <div id="mentor-doubt-${taskId}" style="margin-top:8px;"></div>
          </div>
        </div>`;
      container.appendChild(wrapper);
    });
  });
};

window.toggleMentorTaskDetail = function (taskId) {
  const el = document.getElementById(`mentor-task-detail-${taskId}`);
  if (!el) return; 
  el.style.display = el.style.display === "none" ? "block" : "none";
};

window.closeStudentTaskModal = function () {
  const modal = document.getElementById("studentTaskModal");
  const container = document.getElementById("mentorTaskListContainer");
  
  if (modal) { modal.classList.add("hidden"); modal.style.display = "none"; }
  if (container) { container.innerHTML = ""; }
  if (unsubscribeMentorTasks) { unsubscribeMentorTasks(); unsubscribeMentorTasks = null; }
};

window.openMentorDetailPanel = async function (taskId) {
  const panel = document.getElementById("mentorDetailPanel");
  const titleEl = document.getElementById("mentorDetailTitle");
  const bodyEl = document.getElementById("mentorDetailBody");
  const snap = await getDoc(doc(db, "tasks", taskId));
  
  if (!snap.exists()) return;
  const task = snap.data();
  titleEl.textContent = task.title;
  bodyEl.innerHTML = `
    <div><strong>Description:</strong><br>${task.description || "No description"}</div><br>
    <div><strong>Due:</strong> ${task.dueDate}</div>
    <div><strong>Status:</strong> ${task.status}</div>
    <div><strong>Progress:</strong> ${task.progress || 0}%</div><br>
    ${task.submissionURL ? `
      <div><strong>Submission:</strong><br><a href="${task.submissionURL}" target="_blank">View Submitted File</a></div><br>
    ` : `<div><strong>Submission:</strong> Not submitted</div><br>`}
    <div>
      <strong>Doubts:</strong>
      <div id="mentorPanelDoubts"></div>
    </div>`;
    
  loadPanelDoubts(taskId);
  panel.classList.remove("hidden");
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let unsubscribePanelDoubts = null;

function loadPanelDoubts(taskId) {
  const container = document.getElementById("mentorPanelDoubts");
  if (!container || !taskId) return;
  
  if (unsubscribePanelDoubts) { unsubscribePanelDoubts(); unsubscribePanelDoubts = null; }
  container.innerHTML = "<p>Loading doubts...</p>";
  
  try {
    const doubtsRef = collection(db, "tasks", taskId, "doubts");
    const doubtsQuery = query(doubtsRef, orderBy("createdAt", "desc"));
    
    unsubscribePanelDoubts = onSnapshot(
      doubtsQuery,
      (snapshot) => {
        container.innerHTML = "";
        if (snapshot.empty) { container.innerHTML = "<p>No doubts raised.</p>"; return; }
        
        snapshot.forEach((docSnap) => {
          const doubt = docSnap.data(); 
          const doubtBox = document.createElement("div"); 
          doubtBox.className = "mentor-doubt-card";
          
          const message = document.createElement("div");
          message.className = "mentor-doubt-text";
          message.textContent = doubt.message || "No message";
          
          const date = document.createElement("div");
          date.className = "mentor-doubt-date";
          date.textContent = doubt.createdAt?.toDate ? doubt.createdAt.toDate().toLocaleString() : "";
          
          doubtBox.appendChild(message);
          doubtBox.appendChild(date);
          
          if (doubt.mentorReply) {
            const replyBox = document.createElement("div");
            replyBox.className = "mentor-reply-box";
            
            const replyText = document.createElement("div");
            replyText.className = "mentor-reply-text";
            replyText.textContent = doubt.mentorReply;
      
            const replyDate = document.createElement("div");
            replyDate.className = "mentor-reply-date";
            replyDate.textContent = doubt.replyAt?.toDate ? doubt.replyAt.toDate().toLocaleString() : "";
            replyBox.appendChild(replyText);replyBox.appendChild(replyDate);doubtBox.appendChild(replyBox);}container.appendChild(doubtBox); });},
      (error) => {
        console.error("Error loading doubts:", error);
        container.innerHTML = "<p style='color:red;'>Failed to load doubts.</p>";});} catch (err) {
    console.error("Unexpected error:", err);
    container.innerHTML = "<p style='color:red;'>Something went wrong.</p>";}}
window.closeMentorDetailPanel = function closeMentorDetailPanel() {
  const panel = document.getElementById("mentorDetailPanel");
  if (!panel) return;
  panel.classList.add("closing");
  panel.classList.remove("active");
  setTimeout(() => {
    panel.classList.remove("closing");
    panel.classList.add("hidden");
  }, 400);
};
window.generateTaskWithAI = async function() {
  const ideaInput = document.getElementById("aiTaskIdea");
  const generateBtn = document.getElementById("aiGenerateBtn");
  const ideaText = ideaInput.value.trim();

  if (!ideaText) {
    alert("Please type a rough idea first! (e.g., 'Arduino radar')");
    ideaInput.focus(); return;
  }

  const originalBtnText = generateBtn.innerHTML;
  generateBtn.innerHTML = "Thinking... ⏳";
  generateBtn.classList.add("ai-generating");
  generateBtn.disabled = true;

try {
    const prompt = `
      You are an expert STEM mentor. A user wants to assign a project based on this idea: "${ideaText}".
      Generate a professional task. Output ONLY this exact JSON format, no markdown formatting:
      {
        "title": "A catchy title (max 6 words)",
        "description": "A detailed, step-by-step description using 3 bullet points.",
        "priority": "high",
        "daysToComplete": 7
      }
    `;

    // 🔥 Look here! We call YOUR secure backend, NO API keys in sight!
    const response = await fetch('https://hamaralabs-backend.vercel.app/api/generateTask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promptText: prompt })
    });

    if (!response.ok) throw new Error("Backend Connection Failed");

    const data = await response.json();
    let rawText = data.candidates[0].content.parts[0].text.replace(/```json/g, "").replace(/```/g, "").trim();
    const aiResult = JSON.parse(rawText);

    // ... (the rest of your population code remains exactly the same)
    document.getElementById("taskTitle").value = aiResult.title;
    document.getElementById("taskDescription").value = aiResult.description;
    
    const prioritySelect = document.getElementById("taskPriority");
    if (prioritySelect) prioritySelect.value = aiResult.priority.toLowerCase();

    if (document.getElementById("taskDueDate")) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (aiResult.daysToComplete || 5));
      document.getElementById("taskDueDate").value = dueDate.toISOString().split('T')[0];
    }

    generateBtn.innerHTML = "✅ Done!";
    setTimeout(() => { generateBtn.innerHTML = originalBtnText; ideaInput.value = ""; }, 2000);

  } catch (error) {
    console.error("AI Magic Failed:", error);
    alert("AI Generation failed. Did you paste your API key?");
    generateBtn.innerHTML = "❌ Error";
    setTimeout(() => { generateBtn.innerHTML = originalBtnText; }, 2000);
  } finally {
    generateBtn.classList.remove("ai-generating");
    generateBtn.disabled = false;
  }
};