import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs, query, where, addDoc, onSnapshot, serverTimestamp, arrayUnion, updateDoc, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { addCheckmarkAnimation, confettiBurst, startPremiumSparkle, regformCSS, regHTML, tinkerCSS } from "./animations.js";
import { loadAdminOverview, loadAdminSchools, loadAdminUsers } from "./adminFxn.js";
const firebaseConfig = {
  apiKey: "AIzaSyAPyLzaSXa1wMjD77wMi1-Z2bSvhAbFCBU",
  authDomain: "digital-atl.firebaseapp.com",
  projectId: "digital-atl",
  storageBucket: "digital-atl.firebasestorage.app",
  messagingSenderId: "428997443618",
  appId: "1:428997443618:web:0cb487a807a8ccd5ee0a7b",
  measurementId: "G-G0SYKW59P6"}; const app = initializeApp(firebaseConfig);
const auth = getAuth(app); export const db = getFirestore(app);
const storage = getStorage(app); const sidebar = document.getElementById("sidebar");
export const contentArea = document.getElementById("contentArea");
export let currentUID = null; export let currentRole = null;  let activeUnsubscribe = null;
function clearListener() {if (activeUnsubscribe) { activeUnsubscribe(); activeUnsubscribe = null; }}
onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = "../index.html"; return; }
  currentUID = user.uid; const userSnap = await getDoc(doc(db, "users", user.uid));
  if (!userSnap.exists()) { alert("User profile not found."); return; }
  currentRole = userSnap.data().role || "DEAD";initDashboard(userSnap.data());});
function initDashboard(userData) {
  document.getElementById("welcomeText").innerText = `Welcome, ${userData.name || "User"}`;
  document.getElementById("roleBadge").innerText = (currentRole).toUpperCase();
  renderSidebar(currentRole); loadSection("overview");}
function renderSidebar(role) {
  sidebar.innerHTML = `<div class="logo" style="margin-bottom: 16px; font-weight: 800; font-size: 1.4rem; padding: 10px 16px;">
      HamaraLabs <span style="font-size: 1.4rem;">🏠</span></div>`;
  let menuStructure = []; const safeRole = role.toLowerCase();
  if (safeRole === "mentor") {menuStructure = [
      { category: "Overview", items: ["overview", "analytics"] },
      { category: "My Hub", items: ["assignedTeams", "students", "sessions"] },
      { category: "Activities", items: ["tinkerLab"] }];
  } else if (safeRole === "student") {menuStructure = [
      { category: "Overview", items: ["overview"] },
      { category: "My Workspace", items: ["myTasks"] }];
  } else if (safeRole === "admin") { menuStructure = [
      { category: "Home", items: ["overview"] },
      {category: "Approvals", items: ["users"]},
      { category: "Schools", items: ["schools", "Register School"] },
      { category: "Students", items: ["studentReg", "studentList", "studentSnapshot"] },
      { category: "Operations", items: ["tasks", "announcements"] },
      { category: "System", items: ["settings"] }];}
  const displayNames = {"overview": "Overview", "analytics": "Analytics", "schools": "School Report", "Register School": "Register School", 
    "users": "Mentors & Students", "studentReg": "Student Registration", "tasks": "Global Tasks", "announcements": "Announcements", 
    "settings": "Settings", "students": "My Students", "assignedTeams": "Assigned Schools", "sessions": "Live Sessions", 
    "tinkerLab": "AI Activity Lab 💡", "myTasks": "My Tasks", "studentList": "Student Data", "studentSnapshot": "Student Snapshot"};
  menuStructure.forEach(group => {const catHeader = document.createElement("div"); catHeader.className = "sidebar-category";
    catHeader.innerText = group.category; sidebar.appendChild(catHeader);
    group.items.forEach(module => {const item = document.createElement("div"); item.className = "nav-item";
      item.innerText = displayNames[module] || module.charAt(0).toUpperCase() + module.slice(1);
      item.onclick = () => {document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
      item.classList.add("active"); loadSection(module);}; sidebar.appendChild(item);});});}
async function loadStudentTasks() {clearListener(); const q = query(collection(db, "tasks"), where("studentId", "==", currentUID));
  activeUnsubscribe = onSnapshot(q, (snapshot) => {if (snapshot.empty) {
    contentArea.innerHTML = `<div class="card"><div class="card-title">My Tasks</div> <p>No tasks assigned yet.</p></div>`; return;}
    let tasks = []; snapshot.forEach(docSnap => tasks.push({ id: docSnap.id, ...docSnap.data() }));
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    tasks.sort((a, b) => (priorityOrder[(a.priority || "low").toLowerCase()] || 3) - (priorityOrder[(b.priority || "low").toLowerCase()] || 3));
    let html = `<div class="card"> <div class="card-title">My Tasks</div>`;   
    tasks.forEach(task => {const progress = Number(task.progress) || 0; 
      const priority = (task.priority || "low").toLowerCase(); 
      const status = task.status || "assigned";
      let isOverdue = false;
      if (task.dueDate) {const today = new Date(); today.setHours(0, 0, 0, 0); 
        const due = new Date(task.dueDate); due.setHours(0, 0, 0, 0); 
        if (due < today && status !== "completed") isOverdue = true;}
      let borderColor = priority === "high" ? "#ff9500" : priority === "medium" ? "#5ac8fa" : "#2ecc71";
      if (isOverdue) borderColor = "#ff3b30"; 
      html += `<div style="border-left:6px solid ${borderColor};padding:16px;margin-bottom:18px; border-radius:14px;background:#f9fbff;">
          <strong>${task.title || "Your Task "}</strong><br><small>${task.description || ""}</small><br><br>
          Due: ${task.dueDate || "No Deadline 🥳"}<br>Priority: ${priority.charAt(0).toUpperCase() + priority.slice(1)}<br>
          Status: ${status}<br><br><label>Progress:</label><br>
          <input type="range" min="0" max="100" value="${progress}" ${status === "completed" ? "disabled" : ""} onchange="updateProgress('${task.id}', this.value)"/>
          ${progress}%<br><br>`;
      if (status === "completed") {
        html += `<button id="completeBtn-${task.id}" class="completed" disabled>Completed ✓</button>`;} else {
        const disabledAttr = progress < 100 ? "disabled style='opacity:0.5;cursor:not-allowed;'" : "";
        html += `<button id="completeBtn-${task.id}" onclick="markCompleted('${task.id}')" ${disabledAttr}>Mark Complete</button>`;}
      html += `<br><br><input type="file" ${status === "completed" ? "disabled" : ""} onchange="uploadSubmission('${task.id}', this.files[0])"/>`;
      if (task.submissionURL) {
        html += `<br><a href="${task.submissionURL}" target="_blank" class="ios-view-link">View Submitted File</a>
          <div id="doubtBox-${task.id}" class="ios-doubt-box">
            <div class="ios-doubt-header"><div class="ios-doubt-icon">?</div><div class="ios-doubt-title">Ask Your Mentor</div></div>
            <textarea id="doubt-${task.id}" class="ios-doubt-textarea" placeholder="Describe your doubt or problem..."></textarea>
            <div class="ios-doubt-footer"><button class="ios-doubt-send" onclick="submitDoubt('${task.id}')">Send</button></div></div>`;}
      html += `</div>`;});
    contentArea.innerHTML = html + `</div>`;});}
window.updateProgress = async function (taskId, value) {
  const progressValue = Number(value);
  await updateDoc(doc(db, "tasks", taskId), { progress: progressValue, status: progressValue === 100 ? "ready" : "in progress" });
  const btn = document.getElementById(`completeBtn-${taskId}`);
  if (btn) {btn.disabled = progressValue !== 100;
    btn.style.opacity = progressValue === 100 ? "1" : "0.5";
    btn.style.cursor = progressValue === 100 ? "pointer" : "not-allowed";}};
window.markCompleted = async function (taskId) {
  try {const taskRef = doc(db, "tasks", taskId); 
    const taskSnap = await getDoc(taskRef);
    if (!taskSnap.exists() || (taskSnap.data().progress || 0) < 100) { alert("Complete 100% progress before marking as complete."); return; }
    await updateDoc(taskRef, { status: "completed", completedAt: serverTimestamp() });
    const btn = document.getElementById(`completeBtn-${taskId}`);
    if (btn) { 
      btn.classList.add("completed"); btn.innerText = "Completed ✓";
      addCheckmarkAnimation(btn); startPremiumSparkle();
      btn.disabled = true; btn.style.opacity = "0.7"; btn.style.cursor = "default";
      const rect = btn.getBoundingClientRect(); confettiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);}
  } catch (error) { console.error("Error completing task:", error); }};
window.uploadSubmission = async function (taskId, file) {
  if (!file) return;
  const storageRef = ref(storage, `submissions/${currentUID}/${taskId}/${file.name}`);
  await uploadBytes(storageRef, file);
  await updateDoc(doc(db, "tasks", taskId), { submissionURL: await getDownloadURL(storageRef), submittedAt: serverTimestamp() });};
window.submitDoubt = async function (taskId) {
  const textarea = document.getElementById(`doubt-${taskId}`);
  if (!textarea || !textarea.value.trim()) { alert("Please enter your doubt."); return; }
  try {
    await addDoc(collection(db, "tasks", taskId, "doubts"), { message: textarea.value.trim(), studentId: currentUID, createdAt: serverTimestamp(), mentorReply: null, replyAt: null });
    textarea.value = ""; alert("Doubt sent to mentor!");
  } catch (error) { console.error("Error sending doubt:", error); alert("Something went wrong.");}};
async function loadSection(section) {
  clearListener();
  contentArea.innerHTML = `<div class="loader">Loading...</div>`;
  if (section === "tinkerLab") { loadTinkerLab(); return; }
  if (section === "students") loadStudentsSection();
  if (section === "assignedTeams") loadAssignedTeams();
  if (section === "sessions") loadSessions();
  if (section === "analytics") loadAnalytics();
  if (section === "myTasks") loadStudentTasks();
  if (currentRole && currentRole.toLowerCase() === "admin") {
    if (section === "overview" || section === "adminOverview") loadAdminOverview(db, contentArea);
    if (section === "schools") loadAdminSchools(db, contentArea);
    if (section === "users") loadAdminUsers(db, contentArea);
    if (section === "registerSchool" || section === "Register School") loadRegForm();
    if (section === "studentReg") { 
      import('./adminFxn.js').then(module => module.loadStudentRegistration(db, contentArea))
        .catch(error => { console.error("Error:", error); contentArea.innerHTML = `<div style="text-align:center; padding:40px; color:#FF3B30;">Failed to load.</div>`; });}
    if (section === "studentList") { 
      import('./adminFxn.js')
        .then(module => module.loadStudentList(db, contentArea))
        .catch(err => console.error("Error loading Student List:", err));
      return; 
    }
    if (section === "studentSnapshot") { 
      import('./adminFxn.js')
        .then(module => module.loadStudentSnapshot(db, contentArea))
        .catch(err => console.error("Error loading Snapshot:", err));
      return; 
    }
  } else if ((section === "overview" || section === "adminOverview") && typeof loadOverview === "function") {
    loadOverview();}}
async function loadRegForm() {
  const container = contentArea || document.getElementById("dashboardContent");
  if (!container) return;
  if (!document.getElementById("school-form-styles")) {
    const style = document.createElement("style"); style.id = "school-form-styles";
    style.textContent = regformCSS + `.switch { margin-right: 8px !important; } .toggle-container, .switch-wrapper, label.switch-label { gap: 8px !important; } .toggle-text, input[type="checkbox"] + span { margin-left: 6px !important; padding-left: 0 !important; }`;
    document.head.appendChild(style);}
  try {const response = await fetch("/forms/school.html"); 
    if (response.ok) container.innerHTML = await response.text();
    else throw new Error("Failed");
  } catch (error) { container.innerHTML = regHTML; }
  try { await import("./reg.js"); } catch (err) { console.warn("Script loading error", err); }}
async function loadStudentsSection() {
  const schoolSnap = await getDocs(query(collection(db, "mentorSchoolAssignments"), where("mentorId", "==", currentUID)));
  if (schoolSnap.empty) { contentArea.innerHTML = `<div class="card">No Schools Assigned</div>`; return; }
  let html = `<div class="card"> <div class="card-title">Select School</div><select id="schoolSelect" style="width: 25%; padding: 12px; border-radius: 8px; border: 1px solid #ccc; font-size: 1rem;"><option value="">-- Choose a School --</option>`;
  for (const docSnap of schoolSnap.docs) {
    const assignmentData = docSnap.data(), schoolRef = await getDoc(doc(db, "schools", assignmentData.schoolId));
    let displaySchoolName = schoolRef.exists() ? (schoolRef.data().schoolName || schoolRef.data().name || assignmentData.schoolId) : assignmentData.schoolId;
    html += `<option value="${assignmentData.schoolId}">${displaySchoolName}</option>`;}
  contentArea.innerHTML = html + `</select></div><div id="studentList"></div>`;
  document.getElementById("schoolSelect").addEventListener("change", e => loadStudentsBySchool(e.target.value));}
async function loadStudentsBySchool(schoolId) {
  if (!schoolId) return;
  const studentSnap = await getDocs(query(collection(db, "users"), where("role", "==", "student"), where("schoolId", "==", schoolId)));
  if (studentSnap.empty) { document.getElementById("studentList").innerHTML = `<div class="card">No Students Found</div>`; return; }
  let html = `<div class="card"><div class="card-title">Students</div>`;
  studentSnap.forEach(docSnap => {
    const student = docSnap.data();
    html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px; padding-bottom: 8px; border-bottom: 1px solid #eee;">
        <strong>${student.name}</strong><div style="display:flex;gap:8px;"><button onclick="openStudentTaskView('${docSnap.id}','${student.name}')" style="background: #e0e0e0; color: #333;">View Tasks</button>
        <button onclick="openTaskModal('${docSnap.id}','${schoolId}')">Assign Task</button></div></div>`;});
  document.getElementById("studentList").innerHTML = html + `</div>`;}
let selectedStudent = null, selectedSchool = null, unsubscribeMentorTasks = null;
window.openTaskModal = (studentId, schoolId) => {
  selectedStudent = studentId; selectedSchool = schoolId;
  const modal = document.getElementById("assignTaskModal"); if (modal) modal.classList.remove("hidden");};
window.closeTaskModal = () => {
  const modal = document.getElementById("assignTaskModal"); if (modal) modal.classList.add("hidden");};
document.addEventListener("click", async (e) => {
  if (e.target.id === "saveTaskBtn") { 
    const title = document.getElementById("taskTitle")?.value.trim(), description = document.getElementById("taskDescription")?.value.trim(), dueDate = document.getElementById("taskDueDate")?.value, priority = document.getElementById("taskPriority")?.value;
    if (!title || !dueDate || !selectedStudent) return;
    await addDoc(collection(db, "tasks"), { title, description, dueDate, priority, studentId: selectedStudent, schoolId: selectedSchool, mentorId: currentUID, status: "assigned", progress: 0, assignedAt: serverTimestamp() });
    document.getElementById("taskTitle").value = ""; document.getElementById("taskDescription").value = ""; document.getElementById("taskDueDate").value = "";
    closeTaskModal();}});
window.openStudentTaskView = function (studentId, studentName) {
  const modal = document.getElementById("studentTaskModal"), nameEl = document.getElementById("modalStudentName"), container = document.getElementById("mentorTaskListContainer");
  if (!modal || !container || !nameEl) return;
  nameEl.textContent = studentName + "'s Tasks"; modal.classList.remove("hidden"); modal.style.display = "flex";
  if (unsubscribeMentorTasks) unsubscribeMentorTasks();
  unsubscribeMentorTasks = onSnapshot(query(collection(db, "tasks"), where("studentId", "==", studentId)), (snapshot) => {
    container.innerHTML = ""; if (snapshot.empty) { container.innerHTML = "<p>No tasks assigned yet.</p>"; return; }
    snapshot.forEach(docSnap => {
      const task = docSnap.data(), taskId = docSnap.id, wrapper = document.createElement("div");
      wrapper.style.cssText = "margin-bottom:16px; border-bottom:1px solid #ddd; padding-bottom:12px;";
      wrapper.innerHTML = `<div style="cursor:pointer;" onclick="openMentorDetailPanel('${taskId}')"><strong>${task.title}</strong><br>Due: ${task.dueDate}<br>Status: ${task.status}</div>
        <div id="mentor-task-detail-${taskId}" style="display:none;margin-top:12px;"><div><strong>Description:</strong><br>${task.description || "No description"}</div><br>
        <div><strong>Progress:</strong> ${task.progress || 0}%</div><br>${task.submissionURL ? `<div><strong>Submission:</strong><br><a href="${task.submissionURL}" target="_blank">View Submitted File</a></div><br>` : `<div><strong>Submission:</strong> Not submitted</div><br>`}
        <div><strong>Doubts:</strong><div id="mentor-doubt-${taskId}" style="margin-top:8px;"></div></div></div>`;
      container.appendChild(wrapper);});});};
window.toggleMentorTaskDetail = function (taskId) {
  const el = document.getElementById(`mentor-task-detail-${taskId}`); if (el) el.style.display = el.style.display === "none" ? "block" : "none";};
window.closeStudentTaskModal = function () {
  const modal = document.getElementById("studentTaskModal"), container = document.getElementById("mentorTaskListContainer");
  if (modal) { modal.classList.add("hidden"); modal.style.display = "none"; }
  if (container) container.innerHTML = "";
  if (unsubscribeMentorTasks) { unsubscribeMentorTasks(); unsubscribeMentorTasks = null; }};
window.openMentorDetailPanel = async function (taskId) {
  const panel = document.getElementById("mentorDetailPanel"), titleEl = document.getElementById("mentorDetailTitle"), bodyEl = document.getElementById("mentorDetailBody");
  const snap = await getDoc(doc(db, "tasks", taskId)); if (!snap.exists()) return;
  const task = snap.data();
  titleEl.textContent = task.title;
  bodyEl.innerHTML = `<div><strong>Description:</strong><br>${task.description || "No description"}</div><br><div><strong>Due:</strong> ${task.dueDate}</div><div><strong>Status:</strong> ${task.status}</div><div><strong>Progress:</strong> ${task.progress || 0}%</div><br>
    ${task.submissionURL ? `<div><strong>Submission:</strong><br><a href="${task.submissionURL}" target="_blank">View Submitted File</a></div><br>` : `<div><strong>Submission:</strong> Not submitted</div><br>`}
    <div><strong>Doubts:</strong><div id="mentorPanelDoubts"></div></div>`;
  loadPanelDoubts(taskId); panel.classList.remove("hidden");};
let unsubscribePanelDoubts = null;
function loadPanelDoubts(taskId) {const container = document.getElementById("mentorPanelDoubts"); if (!container || !taskId) return;
  if (unsubscribePanelDoubts) { unsubscribePanelDoubts(); unsubscribePanelDoubts = null; }
  container.innerHTML = "<p>Loading doubts...</p>";
  try {unsubscribePanelDoubts = onSnapshot(query(collection(db, "tasks", taskId, "doubts"), orderBy("createdAt", "desc")), (snapshot) => {
      container.innerHTML = ""; if (snapshot.empty) { container.innerHTML = "<p>No doubts raised.</p>"; return; }
      snapshot.forEach((docSnap) => {
        const doubt = docSnap.data(), doubtBox = document.createElement("div"); doubtBox.className = "mentor-doubt-card";
        doubtBox.innerHTML = `<div class="mentor-doubt-text">${doubt.message || "No message"}</div><div class="mentor-doubt-date">${doubt.createdAt?.toDate ? doubt.createdAt.toDate().toLocaleString() : ""}</div>`;
        if (doubt.mentorReply) { doubtBox.innerHTML += `<div class="mentor-reply-box"><div class="mentor-reply-text">${doubt.mentorReply}</div><div class="mentor-reply-date">${doubt.replyAt?.toDate ? doubt.replyAt.toDate().toLocaleString() : ""}</div></div>`; }
        container.appendChild(doubtBox);});});
  } catch (err) { console.error("Error:", err); container.innerHTML = "<p style='color:red;'>Something went wrong.</p>"; }}
window.closeMentorDetailPanel = function () {
  const panel = document.getElementById("mentorDetailPanel"); if (!panel) return;
  panel.classList.add("closing"); panel.classList.remove("active");
  setTimeout(() => { panel.classList.remove("closing"); panel.classList.add("hidden"); }, 400);};
window.generateTaskWithAI = async function() {
  const ideaInput = document.getElementById("aiTaskIdea"), generateBtn = document.getElementById("aiGenerateBtn"), ideaText = ideaInput.value?.trim();
  if (!ideaText) { alert("Type an idea first!"); return; }
  generateBtn.innerHTML = "✨ Generating..."; generateBtn.disabled = true;
  try {
    const prompt = `Act as an ATL Mentor. Create a project task for: "${ideaText}". Return ONLY JSON: {"title": "String", "description": "String", "priority": "high/medium/low", "daysToComplete": 7}`;
    const response = await fetch('https://hamaralabs.vercel.app/api/generateTask', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ promptText: prompt }) });
    const data = await response.json(); if (!response.ok) throw new Error(data.message);
    const result = JSON.parse(data.candidates[0].content.parts[0].text.replace(/```json/g, "").replace(/```/g, ""));
    document.getElementById("taskTitle").value = result.title; document.getElementById("taskDescription").value = result.description; document.getElementById("taskPriority").value = (result.priority || "medium").toLowerCase();
    if (document.getElementById("taskDueDate")) { const d = new Date(); d.setDate(d.getDate() + (result.daysToComplete || 7)); document.getElementById("taskDueDate").value = d.toISOString().split('T')[0]; }
    generateBtn.innerHTML = "✅ Done!";
  } catch (error) { console.error("Error:", error); generateBtn.innerHTML = "❌ Error"; } 
  finally { generateBtn.disabled = false; setTimeout(() => { generateBtn.innerHTML = "Auto-Write"; }, 2000); }};
function loadTinkerLab() {
  contentArea.innerHTML = `<style>${tinkerCSS}</style><div id="tinker-premium-workspace"><div class="tinker-wrapper-card"><div class="tinker-header">✨ AI Activity Lab</div>
    <div class="tinker-subtitle">Design highly engaging, hands-on ATL projects tailored precisely to a student's unique interests.</div> 
    <div class="tinker-input-group"><input type="text" id="tinkerInterest" placeholder="What are they interested in? (e.g. Drones, Farming, AI)"><button id="tinkerGenBtn" onclick="generateTinkerActivity()">Generate</button></div>
    <div id="tinkerOutput"><h3 id="resTitle"></h3><div id="resSteps"></div><div class="tinker-badge-materials"><strong style="color: #4169e1; margin-right: 8px;">🛠️ Required Materials:</strong><span id="resMaterials"></span></div>
    <div class="tinker-badge-learning"><strong style="color: #ff9500; margin-right: 8px;">🧠 Learning Outcome:</strong><span id="resLearning"></span></div><div><button id="initAssignBtn" onclick="openTinkerAssignForm()"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>Assign to Student</button></div>
    <div id="tinkerAssignContainer"><h4 class="tinker-assign-title">Finalize Assignment</h4><div class="tinker-grid"><div class="tinker-input-col"><label class="tinker-label">Select School</label><select id="tinkerSchool" class="tinker-select" onchange="loadTinkerStudents(this.value)"></select></div><div class="tinker-input-col"><label class="tinker-label">Select Student</label><select id="tinkerStudent" class="tinker-select" disabled><option value="">Waiting for school...</option></select></div>
    <div class="tinker-input-col"><label class="tinker-label">Due Date</label><input type="date" id="tinkerDate" class="tinker-date"></div><div class="tinker-input-col"><label class="tinker-label">Priority Level</label><select id="tinkerPri" class="tinker-select"><option value="medium">🟡 Medium Priority</option><option value="high">🔴 High Priority</option><option value="low">🟢 Low Priority</option></select></div></div>
    <button id="finalAssignBtn" onclick="confirmTinkerAssignment()">Confirm & Deploy Task</button></div></div></div></div>`;}
window.currentTinkerActivity = null;
window.generateTinkerActivity = async function() {
  const interestInput = document.getElementById("tinkerInterest"), interest = interestInput.value?.trim(), btn = document.getElementById("tinkerGenBtn"), output = document.getElementById("tinkerOutput"), assignContainer = document.getElementById("tinkerAssignContainer");
  if (!interest) { alert("Please enter a student interest first!"); interestInput.focus(); return; }
  btn.innerText = "Designing..."; btn.classList.add("tinker-generating"); btn.disabled = true;
  if (assignContainer) assignContainer.style.display = "none";
  output.style.display = "none";
  const prompt = `Act as a creative Atal tinkering Lab Expert. Design an innovative, hands-on project for a student interested in "${interest}". Utilize standard ATL equipment. Return ONLY JSON: {"title": "Catchy Project Title", "steps": "3-4 detailed steps using HTML <br> tags.", "materials": "Comma separated list", "learning": "Core concept"}`;
  try {
    const response = await fetch('https://hamaralabs.vercel.app/api/generateTask', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ promptText: prompt }) });
    const data = await response.json(); if (!response.ok) throw new Error(data.message || "Failed to generate");
    const result = JSON.parse(data.candidates[0].content.parts[0].text.replace(/```json/g, "").replace(/```/g, "").trim());
    window.currentTinkerActivity = { title: result.title || "Tinker Project", description: `**Project Goal:** ${result.learning}\n\n**Action Plan:**\n${(result.steps || "Instructions not provided.").replace(/<br>/g, '\n')}\n\n**Materials Needed:** ${result.materials}` };
    document.getElementById("resTitle").innerText = window.currentTinkerActivity.title; document.getElementById("resSteps").innerHTML = `<strong>Action Plan:</strong><br><br>` + (result.steps || "Instructions not provided."); document.getElementById("resMaterials").innerText = result.materials || "Standard ATL components"; document.getElementById("resLearning").innerText = result.learning || "Hands-on engineering";
    output.style.display = "block"; btn.innerText = "Generate Another";
  } catch (error) { console.error("Error:", error); alert(`Generation Error: ${error.message}`); btn.innerText = "Try Again"; } 
  finally { btn.classList.remove("tinker-generating"); btn.disabled = false; }};
window.openTinkerAssignForm = async function() {
  const container = document.getElementById("tinkerAssignContainer"), schoolSelect = document.getElementById("tinkerSchool");
  container.style.display = "block"; schoolSelect.innerHTML = `<option value="">Loading schools...</option>`;
  try {
    const schoolSnap = await getDocs(query(collection(db, "mentorSchoolAssignments"), where("mentorId", "==", currentUID)));
    if (schoolSnap.empty) { schoolSelect.innerHTML = `<option value="">No Schools Assigned</option>`; return; }
    let html = `<option value="">-- Choose a School --</option>`;
    for (const docSnap of schoolSnap.docs) {
      const schoolId = docSnap.data().schoolId, schoolRef = await getDoc(doc(db, "schools", schoolId));
      html += `<option value="${schoolId}">${schoolRef.exists() ? (schoolRef.data().schoolName || schoolRef.data().name || schoolId) : schoolId}</option>`;}
    schoolSelect.innerHTML = html;
  } catch(e) { console.error(e); schoolSelect.innerHTML = `<option value="">Error loading schools</option>`; }};
window.loadTinkerStudents = async function(schoolId) {
  const studentSelect = document.getElementById("tinkerStudent");
  if (!schoolId) { studentSelect.innerHTML = `<option value="">Waiting for school...</option>`; studentSelect.disabled = true; return; }
  studentSelect.disabled = false; studentSelect.innerHTML = `<option value="">Loading students...</option>`;
  try {
    const studentSnap = await getDocs(query(collection(db, "users"), where("role", "==", "student"), where("schoolId", "==", schoolId)));
    if (studentSnap.empty) { studentSelect.innerHTML = `<option value="">No Students Found</option>`; return; }
    let html = `<option value="">-- Choose a Student --</option>`;
    studentSnap.forEach(docSnap => html += `<option value="${docSnap.id}">${docSnap.data().name}</option>`);
    studentSelect.innerHTML = html;
  } catch(e) { console.error(e); studentSelect.innerHTML = `<option value="">Error loading students</option>`; }};
window.confirmTinkerAssignment = async function() {
  if (!window.currentTinkerActivity) { alert("Generate an activity first!"); return; }
  const schoolId = document.getElementById("tinkerSchool").value, studentId = document.getElementById("tinkerStudent").value, dueDate = document.getElementById("tinkerDate").value, priority = document.getElementById("tinkerPri").value, btn = document.getElementById("finalAssignBtn");
  if (!schoolId || !studentId || !dueDate) { alert("Please select a school, student, and a due date."); return; }
  btn.innerHTML = "Deploying Task..."; btn.disabled = true;
  try {
    await addDoc(collection(db, "tasks"), { title: window.currentTinkerActivity.title, description: window.currentTinkerActivity.description, dueDate: dueDate, priority: priority, studentId: studentId, schoolId: schoolId, mentorId: currentUID, status: "assigned", progress: 0, assignedAt: serverTimestamp() });
    btn.innerHTML = "Assigned Successfully! ✓"; btn.style.background = "#27ae60";
    const rect = btn.getBoundingClientRect(); if (typeof confettiBurst === "function") confettiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    setTimeout(() => {
      btn.innerHTML = "Confirm & Deploy Task"; btn.style.background = ""; btn.disabled = false;
      document.getElementById("tinkerAssignContainer").style.display = "none";
      document.getElementById("tinkerSchool").value = ""; document.getElementById("tinkerStudent").value = ""; document.getElementById("tinkerStudent").disabled = true; document.getElementById("tinkerDate").value = "";
    }, 2500);
  } catch(e) { console.error("Assignment error:", e); alert("Failed to assign task."); btn.innerHTML = "Try Again"; btn.disabled = false; }};