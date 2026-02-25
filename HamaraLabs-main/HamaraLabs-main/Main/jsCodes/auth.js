import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const db = getFirestore(app);

const feedback = document.getElementById("feedback");
const dynamicFields = document.getElementById("dynamicFields");
const roleButtons = document.querySelectorAll(".role-btn");
const emailGroup = document.getElementById("emailGroup");
const phoneGroup = document.getElementById("phoneGroup");
const googleBtn = document.querySelector(".provider-btn.google");

let selectedRole = "student";

function showFeedback(message, isError = true) {
  if (!feedback) return;
  feedback.textContent = message;
  feedback.style.color = isError ? "#ff4d4d" : "#2ecc71";
}

function redirectToDashboard() {
  window.location.href = "Main/d.html";
}

// Standardized ID generation matching the registration form
function normalizeId(text) {
  return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

roleButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    roleButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedRole = btn.dataset.role.toLowerCase();
    renderFields(selectedRole);
  });
});

function renderFields(role) {
  const templates = {
    student: `
      <input placeholder="Full Name" type="text" id="name" />
      <input placeholder="School Name" type="text" id="schoolName" />`,
    mentor: `
      <input placeholder="Full Name" type="text" id="name" />
      <input placeholder="School Name" type="text" id="schoolName" />`,
    admin: `
      <input placeholder="Full Name" type="text" id="name" />`
  };
  dynamicFields.innerHTML = templates[role] || "";
}

renderFields("student");

// Target "schools" collection and use { merge: true }
async function ensureSchoolExists(schoolName) {
  const schoolId = normalizeId(schoolName);
  const schoolRef = doc(db, "schools", schoolId);
  await setDoc(schoolRef, { 
    schoolName: schoolName, 
    createdAt: serverTimestamp() 
  }, { merge: true });
  return schoolId;
}

async function createMentorAssignment(mentorId, schoolId) {
  const q = query(
    collection(db, "mentorSchoolAssignments"),
    where("mentorId", "==", mentorId),
    where("schoolId", "==", schoolId)
  );
  const snap = await getDocs(q);
  
  if (snap.empty) {
    await addDoc(collection(db, "mentorSchoolAssignments"), {
      mentorId: mentorId,
      schoolId: schoolId,
      createdAt: serverTimestamp()
    });
  }
}

async function createUserDocument(user, role, formData) {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) return;
  
  let payload = {
    name: formData.name || user.displayName || "",
    email: user.email || "",
    role: role,
    approvalStatus: role === "student" ? "approved" : "pending",
    createdAt: serverTimestamp()
  };
  
  if (role === "admin") {
    payload.approvalStatus = "approved";
  }
  
  if (role === "student" || role === "mentor") {
    const schoolId = await ensureSchoolExists(formData.schoolName);
    payload.schoolId = schoolId;
    if (role === "mentor") {
      await createMentorAssignment(user.uid, schoolId);
    }
  }
  
  await setDoc(userRef, payload);
}

if (emailGroup) {
  const registerBtn = emailGroup.querySelector(".primary-btn");
  registerBtn.addEventListener("click", async () => {
    const email = emailGroup.querySelector('input[type="email"]').value.trim();
    const password = emailGroup.querySelector('input[type="password"]').value;
    
    if (!email || !password) {
      return showFeedback("Enter email and password");
    }
    
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      let formData = {};
      dynamicFields.querySelectorAll("input").forEach(input => {
        formData[input.id] = input.value.trim();
      });
      
      await createUserDocument(user, selectedRole, formData);
      showFeedback("Registration Successful", false);
      setTimeout(() => redirectToDashboard(), 600);
    } catch (error) {
      showFeedback(error.message);
    }
  });
}

if (phoneGroup) {
  const loginBtn = phoneGroup.querySelector(".primary-btn");
  loginBtn.addEventListener("click", async () => {
    const email = phoneGroup.querySelector('input[type="email"]').value.trim();
    const password = phoneGroup.querySelector('input[type="password"]').value;
    
    if (!email || !password) {
      return showFeedback("Enter email and password");
    }
    
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const userSnap = await getDoc(doc(db, "users", user.uid));
      
      if (!userSnap.exists()) {
        return showFeedback("Profile not found");
      }
      
      const data = userSnap.data();
      if (data.approvalStatus === "pending") {
        return showFeedback("Account pending approval");
      }
      
      showFeedback("Login Successful", false);
      setTimeout(() => redirectToDashboard(), 600);
    } catch (error) {
      showFeedback(error.message);
    }
  });
}
if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await createUserDocument(user, selectedRole, {});
      showFeedback("Google Login Successful", false);
      setTimeout(() => redirectToDashboard(), 600);
    } catch (error) {
      showFeedback(error.message);
    }
  });
}