import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const auth = getAuth(); 
const db = getFirestore();

// auto-fill correspondent details if same as principal
document.addEventListener("change", e => {
  if (e.target?.id === "sameAsPrincipal" && e.target.checked) {
    document.getElementById("coFirst").value = document.getElementById("prFirst").value || "";
    document.getElementById("coLast").value = document.getElementById("prLast").value || "";
    document.getElementById("coEmail").value = document.getElementById("prEmail").value || "";
    document.getElementById("coPhone").value = document.getElementById("prPhone").value || "";
  }
});

// form submission handler
document.addEventListener("submit", async e => {
  if (e.target?.id !== "schoolForm") return;
  e.preventDefault(); 
  
  const form = e.target;
  const btn = form.querySelector('.submit-btn'); 
  const origTxt = btn?.innerText || "Register School";
  const uid = auth.currentUser?.uid; 
  
  if (!uid) return alert("Please log in again.");
  
  try {
    if (btn) { btn.disabled = true; btn.innerText = "Registering... ⏳"; }
    
    const name = document.getElementById("schoolName").value;
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'); 
    const checkedBoards = [...document.querySelectorAll(".multi input[type='checkbox']:checked")].map(c => c.value);
    
    const payload = {
      schoolName: name,
      isAtl: document.getElementById("isAtl").checked,
      address: {
        addressLine: document.getElementById("addressLine").value,
        city: document.getElementById("city").value,
        state: document.getElementById("state").value,
        pincode: document.getElementById("pincode").value
      },
      incharge: {
        firstName: document.getElementById("inFirst").value,
        lastName: document.getElementById("inLast").value,
        email: document.getElementById("inEmail").value,
        phone: document.getElementById("inPhone").value
      },
      principal: {
        firstName: document.getElementById("prFirst").value,
        lastName: document.getElementById("prLast").value,
        email: document.getElementById("prEmail").value,
        phone: document.getElementById("prPhone").value
      },
      correspondent: {
        firstName: document.getElementById("coFirst").value,
        lastName: document.getElementById("coLast").value,
        email: document.getElementById("coEmail").value,
        phone: document.getElementById("coPhone").value
      },
      boards: checkedBoards,
      website: document.getElementById("website").value || "",
      paidSubscription: document.getElementById("paidSubscription").checked,
      updatedAt: serverTimestamp(),
      createdBy: uid,
      createdByRole: localStorage.getItem("role") || "unknown"
    };
    
    await setDoc(doc(db, "schools", slug), payload, { merge: true });
    
    alert("School Registered Successfully 🚀"); 
    form.reset(); 
    
  } catch (err) {
    console.log("reg err:", err);
    alert("Failed to register school.");
  } finally {
    if (btn) { btn.disabled = false; btn.innerText = origTxt; }
  }
});