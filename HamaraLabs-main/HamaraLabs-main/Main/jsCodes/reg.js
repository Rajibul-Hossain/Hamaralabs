import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const auth = getAuth(); 
const db = getFirestore();

document.addEventListener("change", (e) => {
  if (e.target && e.target.id === "sameAsPrincipal") {
    if (e.target.checked) {
      document.getElementById("coFirst").value = document.getElementById("prFirst").value || "";
      document.getElementById("coLast").value = document.getElementById("prLast").value || "";
      document.getElementById("coEmail").value = document.getElementById("prEmail").value || "";
      document.getElementById("coPhone").value = document.getElementById("prPhone").value || "";
    }
  }
});

document.addEventListener("submit", async (e) => {
  if (e.target && e.target.id === "schoolForm") {
    e.preventDefault(); 
    const form = e.target;
    const submitBtn = form.querySelector('.submit-btn');
    const originalBtnText = submitBtn ? submitBtn.innerText : "Register School";
    
    const user = auth.currentUser;
    if (!user) {
      alert("User not authenticated. Please log in again.");
      return;
    }
    
    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Registering... ⏳";
      }
      
      const rawSchoolName = document.getElementById("schoolName").value;
      
      // Standardized ID generation
      const schoolDocId = rawSchoolName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'); 
      
      const boards = Array.from(document.querySelectorAll(".multi input[type='checkbox']:checked")).map(cb => cb.value);
      
      const schoolData = {
        schoolName: rawSchoolName,
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
        boards: boards,
        website: document.getElementById("website").value || "",
        paidSubscription: document.getElementById("paidSubscription").checked,
        updatedAt: serverTimestamp(),
        createdBy: user.uid,
        createdByRole: localStorage.getItem("role") || "unknown"
      };
      
      // Target "schools" collection and use { merge: true }
      await setDoc(doc(db, "schools", schoolDocId), schoolData, { merge: true });
      
      alert("School Registered Successfully 🚀");
      form.reset();
      
    } catch (error) {
      console.error("Error adding school:", error);
      alert("Something went wrong. Check your console for details.");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = originalBtnText;
      }
    }
  }
});