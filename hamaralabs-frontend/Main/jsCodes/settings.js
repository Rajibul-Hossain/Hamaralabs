import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, updateEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
const configResponse = await fetch("https://hamaralabs.vercel.app/api/config");
const firebaseConfig = await configResponse.json();
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
initializeApp(firebaseConfig);
const auth = getAuth(); const db = getFirestore();
const settingsBtn = document.getElementById("settingsBtn");
const modal = document.getElementById("settingsModal");
const closeModal = document.getElementById("closeModal");
const logoutBtn = document.getElementById("logoutBtn");
let currentUser = null; let userDocRef = null;
onAuthStateChanged(auth, async (user) => {if (user) {currentUser = user;
    userDocRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userDocRef);
    if (!docSnap.exists()) {await setDoc(userDocRef, { email: user.email, role: "Student" });}
    onSnapshot(userDocRef, async (docSnap) => {
      if (docSnap.exists()) {const data = docSnap.data();let schoolName = "";
        if (data.schoolId) {schoolName = await getSchoolName(data.schoolId);}
        if(document.getElementById("userEmail")) document.getElementById("userEmail").textContent = data.email || "";
        if(document.getElementById("userUID")) document.getElementById("userUID").textContent = currentUser.uid || "";
        if(document.getElementById("schoolUSER")) document.getElementById("schoolUSER").textContent = schoolName;
        if(document.getElementById("userRole")) document.getElementById("userRole").textContent = data.role || "";
        if(document.getElementById("editEmail")) document.getElementById("editEmail").value = data.email || "";
        if(document.getElementById("editRole")) document.getElementById("editRole").value = data.role || "";}});}});
if(settingsBtn) settingsBtn.addEventListener("click", () => {if (!currentUser) return;modal.classList.remove("hidden");});
if(closeModal) closeModal.addEventListener("click", () => {modal.classList.add("hidden");});
if(logoutBtn) logoutBtn.addEventListener("click", async () => {await signOut(auth);
  if(modal) modal.classList.add("hidden");});async function getSchoolName(schoolId) {
  const snap = await getDoc(doc(db, "schools", schoolId));
  return snap.exists() ? snap.data().name : "Unknown School";}