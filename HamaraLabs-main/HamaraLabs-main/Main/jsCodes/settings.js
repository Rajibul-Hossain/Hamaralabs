import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, updateEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "AIzaSyAPyLzaSXa1wMjD77wMi1-Z2bSvhAbFCBU",
  authDomain: "digital-atl.firebaseapp.com",
  projectId: "digital-atl",
  storageBucket: "digital-atl.firebasestorage.app",
  messagingSenderId: "428997443618",
  appId: "1:428997443618:web:0cb487a807a8ccd5ee0a7b",
  measurementId: "G-G0SYKW59P6"
};
initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();
const settingsBtn = document.getElementById("settingsBtn");
const modal = document.getElementById("settingsModal");
const closeModal = document.getElementById("closeModal");
const logoutBtn = document.getElementById("logoutBtn");
let currentUser = null;
let userDocRef = null;
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    userDocRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userDocRef);
    if (!docSnap.exists()) {await setDoc(userDocRef, { email: user.email, role: "Student" });}
    onSnapshot(userDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        let schoolName = "ADMIN";
        if (data.schoolId) {
        schoolName = await getSchoolName(data.schoolId);}
        document.getElementById("userEmail").textContent = data.email || "";
        document.getElementById("userUID").textContent = currentUser.uid || "";
        document.getElementById("schoolUSER").textContent = schoolName;
        document.getElementById("userRole").textContent = data.role || "";
        document.getElementById("editEmail").value = data.email || "";
        document.getElementById("editRole").value = data.role || "";}});}});
settingsBtn.addEventListener("click", () => {if (!currentUser) return;modal.classList.remove("hidden");});
closeModal.addEventListener("click", () => {modal.classList.add("hidden");});
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  modal.classList.add("hidden");});async function getSchoolName(schoolId) {
  const snap = await getDoc(doc(db, "schools", schoolId));
  return snap.exists() ? snap.data().name : "Unknown School";
}