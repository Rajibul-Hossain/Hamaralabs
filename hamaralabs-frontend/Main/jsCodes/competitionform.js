// ============================================================================
// 🏆 COMPETITION ARCHITECT (ONE UI 9 EDITION)
// ============================================================================
// ============================================================================
// 🏆 COMPETITION ARCHITECT (ONE UI 9 EDITION)
// ============================================================================

export async function loadCompetitionForm(db, contentArea, currentUID) {
  // ⚡ THE FIX: Bind this function to the global window so buttons and timeouts can trigger it
  window.loadCompetitionForm = loadCompetitionForm;

  const container = contentArea || document.getElementById("dashboardContent");
  if (!container) return;


  // 🎨 ONE UI 9 CSS ENGINE
  const injectOneUIForm = () => `
    <style>
      :root {
        --oui-bg: #f5f5f7;
        --oui-surface: #ffffff;
        --oui-text-main: #1d1d1f;
        --oui-text-sub: #86868b;
        --oui-accent: #007aff;
        --oui-accent-glow: rgba(0, 122, 255, 0.15);
        --oui-border: #e5e5ea;
        --oui-radius-input: 16px;
        --oui-radius-card: 28px;
        --oui-shadow: 0 8px 30px rgba(0,0,0,0.04);
      }

      .oui-form-wrapper { max-width: 900px; margin: 0 auto; padding: 40px 10px; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif; animation: ouiFadeIn 0.5s ease-out; }
      .oui-header-wrap { margin-bottom: 32px; }
      .oui-title { font-size: 2.2rem; font-weight: 800; color: var(--oui-text-main); letter-spacing: -0.03em; margin: 0 0 8px 0; }
      .oui-subtitle { font-size: 1.1rem; color: var(--oui-text-sub); font-weight: 500; margin: 0; }

      .oui-card { background: var(--oui-surface); border-radius: var(--oui-radius-card); padding: 40px; box-shadow: var(--oui-shadow); border: 1px solid rgba(0,0,0,0.02); margin-bottom: 24px; }
      
      .oui-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
      @media(max-width: 768px) { .oui-grid-2 { grid-template-columns: 1fr; } .oui-card { padding: 24px; } }

      .oui-field-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
      .oui-label { font-size: 0.9rem; font-weight: 700; color: var(--oui-text-main); margin-left: 4px; }
      
      .oui-input, .oui-select, .oui-textarea { width: 100%; box-sizing: border-box; background: #f2f2f7; border: 2px solid transparent; border-radius: var(--oui-radius-input); padding: 16px 20px; font-size: 1.05rem; font-weight: 500; color: var(--oui-text-main); outline: none; transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); font-family: inherit; }
      .oui-textarea { resize: vertical; min-height: 120px; border-radius: 20px; }
      .oui-select { appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2386868b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 16px center; background-size: 16px; }
      .oui-input:focus, .oui-select:focus, .oui-textarea:focus { background: var(--oui-surface); border-color: var(--oui-accent); box-shadow: 0 0 0 4px var(--oui-accent-glow); }

      /* Custom Premium Checkboxes */
      .oui-check-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 8px; }
      .oui-check-label { display: flex; align-items: center; gap: 12px; padding: 16px; background: #f2f2f7; border-radius: var(--oui-radius-input); cursor: pointer; transition: 0.2s; font-weight: 600; color: var(--oui-text-main); border: 2px solid transparent; }
      .oui-check-label:hover { background: #e5e5ea; }
      .oui-check-input { width: 20px; height: 20px; accent-color: var(--oui-accent); cursor: pointer; }
      .oui-check-input:checked + .oui-check-label { border-color: var(--oui-accent); background: var(--oui-accent-glow); }

      /* Dynamic Field Buttons */
      .oui-dyn-row { display: flex; gap: 12px; margin-bottom: 12px; }
      .oui-btn-icon { background: #e5e5ea; color: #1d1d1f; border: none; width: 54px; height: 54px; border-radius: 16px; font-size: 1.5rem; font-weight: 400; cursor: pointer; transition: 0.2s; display: flex; justify-content: center; align-items: center; }
      .oui-btn-icon:hover { background: #d1d1d6; }
      .oui-btn-icon.add { background: var(--oui-accent-glow); color: var(--oui-accent); }
      .oui-btn-icon.add:hover { background: rgba(0, 122, 255, 0.25); }
      .oui-btn-icon.remove { background: rgba(255, 59, 48, 0.1); color: #ff3b30; }
      .oui-btn-icon.remove:hover { background: rgba(255, 59, 48, 0.2); }

      /* The Submit Action */
      .oui-actions { display: flex; gap: 16px; margin-top: 40px; }
      .oui-btn-submit { flex: 2; background: linear-gradient(135deg, #007aff, #005bb5); color: #fff; border: none; border-radius: var(--oui-radius-input); padding: 20px; font-size: 1.15rem; font-weight: 800; cursor: pointer; box-shadow: 0 10px 24px rgba(0, 122, 255, 0.3); transition: all 0.3s ease; }
      .oui-btn-submit:hover { transform: translateY(-2px); box-shadow: 0 14px 32px rgba(0, 122, 255, 0.4); }
      .oui-btn-reset { flex: 1; background: #e5e5ea; color: var(--oui-text-main); border: none; border-radius: var(--oui-radius-input); padding: 20px; font-size: 1.1rem; font-weight: 700; cursor: pointer; transition: 0.2s; }
      .oui-btn-reset:hover { background: #d1d1d6; }

      @keyframes ouiFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    </style>
  `;

  // Dynamic Class Options
  let classOptions = `<option value="">Select...</option>`;
  for(let i=1; i<=12; i++) { classOptions += `<option value="Class ${i}">Class ${i}</option>`; }

  const formHTML = `
    ${injectOneUIForm()}
    <div class="oui-form-wrapper">
      <div class="oui-header-wrap">
        <h2 class="oui-title">Competition Form</h2>
        <p class="oui-subtitle">Design and deploy a new competition to your network.</p>
      </div>

      <div class="oui-card">
        <div class="oui-field-group">
          <label class="oui-label">Competition Name</label>
          <input type="text" id="compName" class="oui-input" placeholder="Enter the Competition Name">
        </div>

        <div class="oui-field-group">
          <label class="oui-label">Description</label>
          <textarea id="compDesc" class="oui-textarea" placeholder="Detailed description of the competition..."></textarea>
        </div>

        <div class="oui-field-group" style="max-width: 50%;">
          <label class="oui-label">Organized By</label>
          <select id="compOrganizer" class="oui-select">
            <option value="">Please Select...</option>
            <option value="AIM / NITI Aayog">AIM / NITI Aayog</option>
            <option value="Internal School">Internal School</option>
            <option value="External Organization">External Organization</option>
            <option value="Government">Government body</option>
          </select>
        </div>
      </div>

      <div class="oui-card">
        <h3 style="margin: 0 0 20px 0; font-size: 1.2rem; color: var(--oui-text-main);">Timeline Configurations</h3>
        <div class="oui-grid-2">
          <div class="oui-field-group">
            <label class="oui-label">Application Start Date</label>
            <input type="date" id="appStartDate" class="oui-input">
          </div>
          <div class="oui-field-group">
            <label class="oui-label">Application End Date</label>
            <input type="date" id="appEndDate" class="oui-input">
          </div>
          <div class="oui-field-group">
            <label class="oui-label">Competition Start Date</label>
            <input type="date" id="compStartDate" class="oui-input">
          </div>
          <div class="oui-field-group">
            <label class="oui-label">Competition End Date</label>
            <input type="date" id="compEndDate" class="oui-input">
          </div>
        </div>
      </div>

      <div class="oui-card">
        <h3 style="margin: 0 0 20px 0; font-size: 1.2rem; color: var(--oui-text-main);">Eligibility & Rules</h3>
        <div class="oui-grid-2">
          <div class="oui-field-group">
            <label class="oui-label">Class From:</label>
            <select id="classFrom" class="oui-select">${classOptions}</select>
          </div>
          <div class="oui-field-group">
            <label class="oui-label">Class To:</label>
            <select id="classTo" class="oui-select">${classOptions}</select>
          </div>
        </div>

        <div class="oui-check-grid">
          <label class="oui-check-label">
            <input type="checkbox" id="chkAtl" class="oui-check-input"> ATL Schools Allowed
          </label>
          <label class="oui-check-label">
            <input type="checkbox" id="chkNonAtl" class="oui-check-input"> Non-ATL Schools Allowed
          </label>
          <label class="oui-check-label">
            <input type="checkbox" id="chkIndiv" class="oui-check-input"> Individual Participation
          </label>
          <label class="oui-check-label">
            <input type="checkbox" id="chkTeam" class="oui-check-input"> Team Participation
          </label>
        </div></div>
      <div class="oui-card">
        <h3 style="margin: 0 0 20px 0; font-size: 1.2rem; color: var(--oui-text-main);">Dynamic Assets</h3>
    
        <div class="oui-grid-2">
          <div>
            <label class="oui-label" style="display:block; margin-bottom:12px;">Reference Links</label>
            <div id="refLinksContainer">
              <div class="oui-dyn-row">
                <input type="text" class="oui-input dyn-link" placeholder="https://...">
                <button type="button" class="oui-btn-icon add" onclick="window.addDynField('refLinksContainer', 'dyn-link', 'https://...')">+</button>
              </div>
            </div>
          </div>

          <div>
            <label class="oui-label" style="display:block; margin-bottom:12px;">Requirements</label>
            <div id="reqsContainer">
              <div class="oui-dyn-row">
                <input type="text" class="oui-input dyn-req" placeholder="e.g., 3D Printer">
                <button type="button" class="oui-btn-icon add" onclick="window.addDynField('reqsContainer', 'dyn-req', 'Requirement...')">+</button>
              </div></div></div> </div>

        <div class="oui-grid-2" style="margin-top: 24px; border-top: 1px solid var(--oui-border); padding-top: 24px;">
          <div class="oui-field-group">
            <label class="oui-label">Payment Type</label>
            <select id="paymentType" class="oui-select">
              <option value="Free">Free</option>
              <option value="Paid">Paid Registration</option>
            </select>
          </div>
          <div class="oui-field-group">
            <label class="oui-label">Competition File (Rulebook/PDF)</label>
            <input type="file" id="compFile" class="oui-input" style="padding: 13px 20px; background: #fff; border: 2px dashed #cbd5e1;">
          </div> </div></div>

      <div class="oui-actions">
        <button id="btnCompSubmit" class="oui-btn-submit" onclick="window.submitCompetition()">Save Competition 🚀</button>
        <button class="oui-btn-reset" onclick="window.loadCompetitionForm(window.snapshotDb, document.getElementById('dashboardContent'), '${currentUID}')">Reset Form</button>
      </div></div>`;
  container.innerHTML = formHTML;
  window.addDynField = function(containerId, className, placeholder) {
    const cont = document.getElementById(containerId);
    const row = document.createElement('div');
    row.className = 'oui-dyn-row';
    row.innerHTML = `
      <input type="text" class="oui-input ${className}" placeholder="${placeholder}">
      <button type="button" class="oui-btn-icon remove" onclick="this.parentElement.remove()">-</button>
    `;
    cont.appendChild(row);
  };

  // ========================================================================
  // 🚀 FIREBASE SUBMISSION LOGIC
  // ========================================================================
  window.submitCompetition = async function() {
    const btn = document.getElementById('btnCompSubmit');
    const name = document.getElementById('compName').value.trim();
    if (!name) return alert("Competition Name is required.");

    btn.innerHTML = "Deploying... ⏳";
    btn.disabled = true;

    // Extract dynamic fields
    const refLinks = Array.from(document.querySelectorAll('.dyn-link')).map(i => i.value.trim()).filter(v => v);
    const reqs = Array.from(document.querySelectorAll('.dyn-req')).map(i => i.value.trim()).filter(v => v);

    const payload = {
      name: name,
      description: document.getElementById('compDesc').value.trim(),
      organizedBy: document.getElementById('compOrganizer').value,
      timeline: {
        appStart: document.getElementById('appStartDate').value,
        appEnd: document.getElementById('appEndDate').value,
        compStart: document.getElementById('compStartDate').value,
        compEnd: document.getElementById('compEndDate').value,
      },
      eligibility: {
        classFrom: document.getElementById('classFrom').value,
        classTo: document.getElementById('classTo').value,
        atlAllowed: document.getElementById('chkAtl').checked,
        nonAtlAllowed: document.getElementById('chkNonAtl').checked,
        individual: document.getElementById('chkIndiv').checked,
        team: document.getElementById('chkTeam').checked,
      },
      assets: {
        referenceLinks: refLinks,
        requirements: reqs,
        paymentType: document.getElementById('paymentType').value,
        // File URL will go here later after Cloud Storage implementation
        fileURL: null 
      },
      status: "active", // active, archived
      createdBy: currentUID,
      createdAt: new Date().toISOString()
    };

    try {
      const { collection, addDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
      await addDoc(collection(db, "competitions"), payload);
      
      btn.innerHTML = "Deployed Successfully ✅";
      btn.style.background = "#34c759";
      btn.style.boxShadow = "0 10px 24px rgba(52, 199, 89, 0.3)";
      
      // Reset form after 1.5 seconds
      setTimeout(() => {
         window.loadCompetitionForm(db, contentArea, currentUID);
      }, 1500);

    } catch (error) {
      console.error("Deploy Error:", error);
      alert("Failed to deploy competition.");
      btn.innerHTML = "Deploy Competition 🚀";
      btn.disabled = false;
    }
  };
}
// ============================================================================
// 🏆 COMPETITION HUB (ONE UI 9 ARCHITECTURE - FULL DETAIL VIEW)
// ============================================================================

export async function loadCompetitionReports(db, contentArea, currentUID) {
  // Bind to global window for external calls
  window.loadCompetitionReports = loadCompetitionReports;

  const container = contentArea || document.getElementById("dashboardContent");
  if (!container) return;

  const safeStr = (str) => {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function(m) {
      return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[m];
    });
  };

  // 🚀 THE HARDWARE-ACCELERATED CSS ENGINE
  const injectProHubCSS = () => `
    <style>
      :root {
        --oui-bg: #f5f5f7;
        --oui-surface: rgba(255, 255, 255, 0.7); 
        --oui-surface-solid: #ffffff;
        --oui-text-main: #1d1d1f;
        --oui-text-sub: #86868b;
        --oui-accent: #007aff;
        --oui-accent-glow: rgba(0, 122, 255, 0.15);
        --oui-accent-gradient: linear-gradient(135deg, #007aff 0%, #005bb5 100%);
        --oui-warning: #ff9500;
        --oui-danger: #ff3b30;
        --oui-border: rgba(0, 0, 0, 0.05);
        --oui-radius-sm: 14px;
        --oui-radius-md: 22px;
        --oui-radius-lg: 32px; 
        --oui-spring: cubic-bezier(0.175, 0.885, 0.32, 1.15); 
        --oui-smooth: cubic-bezier(0.25, 1, 0.5, 1);
      }

      .oui-hub-wrapper { 
        max-width: 1100px; margin: 0 auto; padding: 40px 16px; 
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif; 
        animation: ouiFadeIn 0.6s var(--oui-smooth); 
      }
      
      .oui-header-flex { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; flex-wrap: wrap; gap: 20px; }
      .oui-title { font-size: 2.8rem; font-weight: 800; color: var(--oui-text-main); letter-spacing: -0.04em; margin: 0 0 4px 0; line-height: 1.1; }
      .oui-subtitle { font-size: 1.15rem; color: var(--oui-text-sub); font-weight: 500; margin: 0; }

      /* Hardware Accelerated Search */
      .oui-search-wrap { position: relative; flex: 1; min-width: 280px; max-width: 400px; }
      .oui-search-bar { 
        width: 100%; box-sizing: border-box; background: var(--oui-surface-solid); 
        border: 1px solid var(--oui-border); border-radius: var(--oui-radius-md); 
        padding: 16px 24px 16px 48px; font-size: 1.05rem; font-weight: 500; color: var(--oui-text-main); 
        box-shadow: 0 4px 16px rgba(0,0,0,0.03); outline: none; 
        transition: all 0.3s var(--oui-smooth); 
        will-change: transform, box-shadow; 
      }
      .oui-search-bar:focus { 
        border-color: var(--oui-accent); box-shadow: 0 8px 24px var(--oui-accent-glow); 
        transform: translateY(-2px) translateZ(0); 
      }
      .oui-search-icon { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); opacity: 0.4; pointer-events: none; }

      /* Segmented Control (Tabs) */
      .oui-segmented-control { 
        background: rgba(118, 118, 128, 0.12); padding: 4px; border-radius: 14px; 
        display: inline-flex; position: relative; margin-bottom: 32px; 
        backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      }
      .oui-segment-btn { 
        background: transparent; color: var(--oui-text-sub); border: none; 
        padding: 10px 24px; border-radius: 10px; font-size: 0.95rem; font-weight: 600; 
        cursor: pointer; position: relative; z-index: 2; transition: color 0.3s ease; 
      }
      .oui-segment-btn.active { color: var(--oui-text-main); font-weight: 700; }
      
      .oui-segment-pill {
        position: absolute; top: 4px; bottom: 4px; border-radius: 10px;
        background: var(--oui-surface-solid); box-shadow: 0 3px 8px rgba(0,0,0,0.12), 0 3px 1px rgba(0,0,0,0.04);
        transition: transform 0.4s var(--oui-spring), width 0.4s var(--oui-spring);
        z-index: 1; will-change: transform, width;
      }

      /* Premium Glass Cards */
      .oui-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 24px; }
      .oui-card { 
        background: var(--oui-surface); border-radius: var(--oui-radius-lg); padding: 28px; 
        backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.4), 0 10px 30px rgba(0,0,0,0.03); 
        display: flex; flex-direction: column; cursor: pointer; /* Shows it's clickable */
        transition: all 0.4s var(--oui-smooth);
        will-change: transform, box-shadow; 
        transform: translateZ(0); 
        animation: cardStagger 0.6s var(--oui-spring) both;
      }
      .oui-card:hover { 
        transform: translateY(-6px) scale(1.01) translateZ(0); 
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6), 0 20px 40px rgba(0, 122, 255, 0.08), 0 4px 12px rgba(0,0,0,0.04); 
      }
      
      .oui-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
      .oui-badge { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; padding: 6px 12px; border-radius: 10px; letter-spacing: 0.5px; }
      .oui-badge.live { background: var(--oui-accent-glow); color: var(--oui-accent); }
      .oui-badge.archived { background: rgba(142, 142, 147, 0.15); color: var(--oui-text-sub); }
      
      .oui-card-title { font-size: 1.4rem; font-weight: 800; color: var(--oui-text-main); margin: 0 0 6px 0; line-height: 1.2; letter-spacing: -0.02em; }
      .oui-card-org { font-size: 0.95rem; color: var(--oui-text-sub); font-weight: 600; margin-bottom: 20px; display:flex; align-items:center; gap:6px; }
      
      /* Bento Box inner grid */
      .oui-bento-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
      .oui-bento-item { background: rgba(0,0,0,0.02); border-radius: var(--oui-radius-sm); padding: 12px; }
      .oui-bento-label { font-size: 0.7rem; color: var(--oui-text-sub); text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; margin-bottom: 4px; }
      .oui-bento-val { font-size: 0.95rem; font-weight: 700; color: var(--oui-text-main); }

      /* Buttons */
      .oui-btn-group { display: flex; gap: 12px; margin-top: auto; }
      .oui-btn { 
        flex: 1; padding: 16px; border-radius: 16px; font-size: 1rem; font-weight: 700; 
        border: none; cursor: pointer; text-align: center; 
        transition: transform 0.2s var(--oui-smooth), box-shadow 0.2s var(--oui-smooth), filter 0.2s;
        will-change: transform; transform: translateZ(0);
      }
      .oui-btn:active { transform: scale(0.96) translateZ(0); } 
      
      .oui-btn-primary { background: var(--oui-accent-gradient); color: #fff; box-shadow: 0 4px 14px var(--oui-accent-glow); }
      .oui-btn-primary:hover { box-shadow: 0 8px 24px rgba(0, 122, 255, 0.3); filter: brightness(1.1); }
      
      .oui-btn-secondary { background: rgba(0,0,0,0.04); color: var(--oui-text-main); }
      .oui-btn-secondary:hover { background: rgba(0,0,0,0.08); }
      
      /* Smooth Modal Animation */
      .oui-modal-overlay { 
        position: fixed; inset: 0; background: rgba(0,0,0,0.4); 
        backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); 
        z-index: 9999; display: none; /* JS toggles this to flex */
        justify-content: center; align-items: center; 
        opacity: 0; transition: opacity 0.4s ease; 
      }
      .oui-modal-overlay.show { opacity: 1; }
      
      .oui-modal { 
        background: rgba(255,255,255,0.95); backdrop-filter: blur(60px) saturate(150%); -webkit-backdrop-filter: blur(60px) saturate(150%); 
        width: 90%; max-width: 520px; border-radius: 40px; padding: 40px; 
        box-shadow: 0 50px 100px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.8); 
        border: 1px solid rgba(255,255,255,0.5);
        transform: translateY(60px) scale(0.85); 
        opacity: 0;
        transition: transform 0.6s var(--oui-spring), opacity 0.4s ease; 
        will-change: transform, opacity;
      }
      
      /* Detail Modal specific modifiers */
      .oui-modal.detail-modal { max-width: 750px; padding: 0; display: flex; flex-direction: column; max-height: 85vh; }
      .oui-modal-header { padding: 32px 32px 24px 32px; border-bottom: 1px solid var(--oui-border); display: flex; justify-content: space-between; align-items: flex-start; }
      .oui-modal-body { padding: 32px; overflow-y: auto; }
      
      /* Custom Scrollbar for Modal */
      .oui-modal-body::-webkit-scrollbar { width: 8px; }
      .oui-modal-body::-webkit-scrollbar-track { background: transparent; }
      .oui-modal-body::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 10px; }
      .oui-modal-body::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.25); }

      .oui-modal-overlay.show .oui-modal { 
        transform: translateY(0) scale(1); 
        opacity: 1;
      }

      @keyframes ouiFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes cardStagger { from { opacity: 0; transform: translateY(30px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
    </style>
  `;

  // ⚡ SWR CACHE CHECK
  const cacheKey = `comp_hub_${currentUID}`;
  const savedData = localStorage.getItem(cacheKey);
  window.compHubState = window.compHubState || 'active'; 

  if (savedData && !window.forceCompHubRefresh) {
    try {
      const parsed = JSON.parse(savedData);
      window.competitionsData = parsed.comps;
      window.compStudentsList = parsed.students;
      container.innerHTML = parsed.html;
      setTimeout(() => window.switchCompTab(window.compHubState), 50); 
    } catch(e) { console.error("Cache corrupted, fetching fresh."); }
  } else {
    container.innerHTML = `<div style="text-align:center; padding: 100px; color: #86868b; font-family: 'SF Pro Display', sans-serif; font-weight:600;">Loading Hub...</div>`;
  }

  window.forceCompHubRefresh = false;

  try {
    const { collection, query, where, getDocs, doc, getDoc, updateDoc, addDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
    
    const userSnap = await getDoc(doc(db, "users", currentUID));
    if (!userSnap.exists()) return;
    const userData = userSnap.data();
    const userRole = userData.role;
    let schoolId = userData.schoolId;

    if ((userRole === "atl-incharge" || userRole === "school-admin") && !schoolId) {
      const assignmentSnap = await getDocs(query(collection(db, "inchargeSchoolAssignments"), where("inchargeId", "==", currentUID)));
      if (!assignmentSnap.empty) schoolId = assignmentSnap.docs[0].data().schoolId;
    }

    // 🚀 FETCH DATA 
    const compsSnap = await getDocs(collection(db, "competitions"));
    const studentQuery = schoolId ? query(collection(db, "users"), where("role", "==", "student"), where("schoolId", "==", schoolId)) : query(collection(db, "users"), where("role", "==", "student"));
    const studentsSnap = await getDocs(studentQuery);

    window.competitionsData = [];
    compsSnap.forEach(d => window.competitionsData.push({ id: d.id, ...d.data() }));
    
    window.compStudentsList = [];
    studentsSnap.forEach(d => window.compStudentsList.push({ id: d.id, name: d.data().name || "Unknown", email: d.data().email || "", class: d.data().class || "N/A" }));

    // Sort Newest First
    window.competitionsData.sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    // 🎨 BUILD HTML CARDS
    let activeHTML = '';
    let archivedHTML = '';
    let activeCount = 0;
    let archiveCount = 0;

    window.competitionsData.forEach((comp, index) => {
      const isArchived = comp.status === 'archived';
      if(isArchived) archiveCount++; else activeCount++;

      const tl = comp.timeline || {};
      const el = comp.eligibility || {};
      const searchStr = `${comp.name} ${comp.organizedBy}`.toLowerCase();
      const staggerDelay = `${(index % 10) * 0.05}s`; 

      const eligibilityString = el.classFrom && el.classTo ? `${el.classFrom} - ${el.classTo}` : 'All Classes';
      const typeString = el.team ? 'Team Event' : 'Individual';

      // 🚨 NOTICE: Added onclick to card, and event.stopPropagation() to buttons!
      const card = `
        <div class="oui-card comp-card" data-status="${comp.status}" data-search="${searchStr}" style="animation-delay: ${staggerDelay};" onclick="window.openCompDetailModal('${comp.id}')">
          <div class="oui-card-header">
            <span class="oui-badge ${isArchived ? 'archived' : 'live'}">${isArchived ? 'Archived' : '● Active'}</span>
            <span style="background:rgba(0,0,0,0.04); padding:6px 12px; border-radius:10px; font-size:0.75rem; font-weight:800; color:var(--oui-text-main);">${comp.assets?.paymentType || 'Free'}</span>
          </div>
          
          <h3 class="oui-card-title">${safeStr(comp.name)}</h3>
          <div class="oui-card-org">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            ${safeStr(comp.organizedBy)}
          </div>
          
          <div class="oui-bento-grid">
            <div class="oui-bento-item">
              <div class="oui-bento-label">Registration Ends</div>
              <div class="oui-bento-val">${safeStr(tl.appEnd || 'TBA')}</div>
            </div>
            <div class="oui-bento-item">
              <div class="oui-bento-label">Event Date</div>
              <div class="oui-bento-val">${safeStr(tl.compStart || 'TBA')}</div>
            </div>
            <div class="oui-bento-item">
              <div class="oui-bento-label">Eligibility</div>
              <div class="oui-bento-val">${eligibilityString}</div>
            </div>
            <div class="oui-bento-item">
              <div class="oui-bento-label">Format</div>
              <div class="oui-bento-val">${typeString}</div>
            </div>
          </div>

          <div class="oui-btn-group">
            ${isArchived 
              ? `<button class="oui-btn oui-btn-secondary" onclick="event.stopPropagation(); window.updateCompStatus('${comp.id}', 'active')">Restore</button>`
              : `
                <button class="oui-btn oui-btn-primary" onclick="event.stopPropagation(); window.openAssignModal('${comp.id}')">Assign </button>
                <button class="oui-btn oui-btn-secondary" onclick="event.stopPropagation(); window.updateCompStatus('${comp.id}', 'archived')">Archive</button>
              `}
          </div>
        </div>
      `;

      if (isArchived) archivedHTML += card;
      else activeHTML += card;
    });

    if (!activeHTML) activeHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 80px; color:var(--oui-text-sub); font-weight:600; font-size:1.1rem;">No active competitions found. Create one in the form.</div>`;
    if (!archivedHTML) archivedHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 80px; color:var(--oui-text-sub); font-weight:600; font-size:1.1rem;">The archive is empty.</div>`;

    // Build Dropdown
    let studentOptions = `<option value="">-- Select a Student --</option>`;
    window.compStudentsList.sort((a,b)=>a.name.localeCompare(b.name)).forEach(s => {
      studentOptions += `<option value="${s.id}">${safeStr(s.name)} (Class ${safeStr(s.class)})</option>`;
    });

    // 🎨 MASTER LAYOUT
    const finalHtmlPayload = `
      ${injectProHubCSS()}
      <div class="oui-hub-wrapper">
        
        <div class="oui-header-flex">
          <div>
            <h2 class="oui-title">Competition Report</h2>
            <p class="oui-subtitle">Manage active competitions, assign to students, and view archives.</p>
          </div>
          
          <div class="oui-search-wrap">
            <svg class="oui-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" id="compSearch" class="oui-search-bar" placeholder="Search competitions..." onkeyup="window.filterComps()">
          </div>
        </div>

        <div class="oui-segmented-control" id="compTabContainer">
          <div class="oui-segment-pill" id="compTabPill"></div>
          <button class="oui-segment-btn active" id="tab-btn-active" onclick="window.switchCompTab('active')">Active (${activeCount})</button>
          <button class="oui-segment-btn" id="tab-btn-archived" onclick="window.switchCompTab('archived')">Archived (${archiveCount})</button>
        </div>

        <div id="comp-grid-active" class="oui-grid" style="display:grid;">${activeHTML}</div>
        <div id="comp-grid-archived" class="oui-grid" style="display:none;">${archivedHTML}</div>
      </div>

      <div id="compAssignModal" class="oui-modal-overlay" onclick="if(event.target===this) window.closeAssignModal()">
        <div class="oui-modal">
          <div style="width: 60px; height: 60px; background: var(--oui-accent-glow); border-radius: 20px; display: flex; justify-content: center; align-items: center; margin-bottom: 24px;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--oui-accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <h3 style="margin: 0 0 8px 0; font-size: 1.8rem; color: var(--oui-text-main); letter-spacing: -0.03em; font-weight:800;">Assign Competition</h3>
          <p style="color: var(--oui-text-sub); margin: 0 0 32px 0; font-weight: 500; font-size:1.05rem; line-height:1.4;">Select a student to assign <span id="modalCompName" style="color:var(--oui-text-main); font-weight:800;"></span>.</p>
          
          <input type="hidden" id="modalCompId">
          
          <select id="modalStudentSelect" style="width: 100%; padding: 18px 24px; border-radius: 16px; border: 1px solid var(--oui-border); background: var(--oui-surface-solid); font-size: 1.05rem; font-weight: 600; outline: none; margin-bottom: 32px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); transition:0.3s; color:var(--oui-text-main);">
            ${studentOptions}
          </select>

          <div style="display:flex; gap: 16px;">
            <button onclick="window.executeCompAssignment()" id="btnExecuteDeploy" class="oui-btn oui-btn-primary" style="flex:2;">Confirm Assignment 🚀</button>
            <button onclick="window.closeAssignModal()" class="oui-btn oui-btn-secondary" style="flex:1;">Cancel</button>
          </div>
        </div>
      </div>

      <div id="compDetailModal" class="oui-modal-overlay" onclick="if(event.target===this) window.closeCompDetailModal()">
        <div class="oui-modal detail-modal">
          <div class="oui-modal-header">
            <div>
              <div id="detailCompBadge" class="oui-badge live" style="display:inline-block; margin-bottom:8px;">● Active</div>
              <h2 id="detailCompName" style="margin: 0; font-size: 2.2rem; font-weight: 800; color: var(--oui-text-main); letter-spacing: -0.03em; line-height: 1.1;">Loading...</h2>
              <div id="detailCompOrg" style="font-size: 1rem; color: var(--oui-text-sub); font-weight: 600; margin-top: 8px;"></div>
            </div>
            <button onclick="window.closeCompDetailModal()" style="background:var(--oui-border); border:none; width:40px; height:40px; border-radius:20px; color:var(--oui-text-main); font-size:1.2rem; cursor:pointer; display:flex; justify-content:center; align-items:center; transition:0.2s;">✕</button>
          </div>
          
          <div class="oui-modal-body" id="detailCompBody">
            </div>
        </div>
      </div>
    `;

    container.innerHTML = finalHtmlPayload;
    try { localStorage.setItem(cacheKey, JSON.stringify({ comps: window.competitionsData, students: window.compStudentsList, html: finalHtmlPayload })); } catch(e){}

    // ========================================================================
    // 🧠 HARDWARE ACCELERATED UI JAVASCRIPT
    // ========================================================================
    
    window.switchCompTab = function(tab) {
      window.compHubState = tab;
      
      const btnActive = document.getElementById('tab-btn-active');
      const btnArchived = document.getElementById('tab-btn-archived');
      const pill = document.getElementById('compTabPill');
      
      if(!btnActive || !pill) return;

      if(tab === 'active') {
        btnActive.classList.add('active'); btnArchived.classList.remove('active');
        pill.style.width = btnActive.offsetWidth + 'px';
        pill.style.transform = 'translateX(0)';
        document.getElementById('comp-grid-active').style.display = 'grid';
        document.getElementById('comp-grid-archived').style.display = 'none';
      } else {
        btnArchived.classList.add('active'); btnActive.classList.remove('active');
        pill.style.width = btnArchived.offsetWidth + 'px';
        pill.style.transform = `translateX(${btnActive.offsetWidth}px)`;
        document.getElementById('comp-grid-active').style.display = 'none';
        document.getElementById('comp-grid-archived').style.display = 'grid';
      }
    };
    
    setTimeout(() => window.switchCompTab(window.compHubState), 10);

    window.filterComps = function() {
      const q = document.getElementById('compSearch').value.toLowerCase();
      document.querySelectorAll('.comp-card').forEach(card => {
        card.style.display = card.getAttribute('data-search').includes(q) ? 'flex' : 'none';
      });
    };

    window.updateCompStatus = async function(compId, newStatus) {
      const action = newStatus === 'archived' ? "archive" : "restore";
      if (!confirm(`Are you sure you want to ${action} this competition?`)) return;
      try {
        await updateDoc(doc(db, "competitions", compId), { status: newStatus });
        window.forceCompHubRefresh = true;
        window.compHubState = newStatus; 
        window.loadCompetitionReports(db, contentArea, currentUID); 
      } catch (e) { alert("Action failed."); }
    };

    // ========================================================================
    // 🔍 DETAIL DOSSIER MODAL LOGIC
    // ========================================================================
    window.openCompDetailModal = function(compId) {
      const comp = window.competitionsData.find(c => c.id === compId);
      if (!comp) return;
      
      const tl = comp.timeline || {};
      const el = comp.eligibility || {};
      const assets = comp.assets || {};
      const isArchived = comp.status === 'archived';

      // Populate Header
      document.getElementById('detailCompName').innerText = comp.name || "Unnamed Competition";
      document.getElementById('detailCompOrg').innerText = `Organized by: ${comp.organizedBy || "Unknown"}`;
      
      const badge = document.getElementById('detailCompBadge');
      if (isArchived) { badge.className = 'oui-badge archived'; badge.innerText = 'Archived'; } 
      else { badge.className = 'oui-badge live'; badge.innerText = '● Active'; }

      // Generate Lists
      let reqHTML = assets.requirements && assets.requirements.length > 0 
        ? assets.requirements.map(req => `<li style="margin-bottom:8px; padding-left:8px; position:relative;">• ${safeStr(req)}</li>`).join('') 
        : '<div style="color:var(--oui-text-sub); font-style:italic;">No specific requirements listed.</div>';

      let linksHTML = assets.referenceLinks && assets.referenceLinks.length > 0 
        ? assets.referenceLinks.map(link => `<a href="${link}" target="_blank" style="display:block; margin-bottom:8px; color:var(--oui-accent); text-decoration:none; font-weight:600; padding:12px; background:var(--oui-bg); border-radius:12px; transition:0.2s;" onmouseover="this.style.background='#e5e5ea'" onmouseout="this.style.background='var(--oui-bg)'">🔗 ${safeStr(link)}</a>`).join('') 
        : '<div style="color:var(--oui-text-sub); font-style:italic;">No reference links provided.</div>';

      // Populate Body
      document.getElementById('detailCompBody').innerHTML = `
        <div style="margin-bottom: 32px;">
          <h4 style="font-size:1.1rem; color:var(--oui-text-main); margin:0 0 12px 0;">Description</h4>
          <div style="background:var(--oui-bg); padding:24px; border-radius:20px; font-size:1.05rem; line-height:1.6; color:var(--oui-text-main); font-weight:500; white-space:pre-wrap;">${safeStr(comp.description) || "No description provided."}</div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:24px; margin-bottom: 32px;">
          <div>
            <h4 style="font-size:1.1rem; color:var(--oui-text-main); margin:0 0 12px 0;">Timeline</h4>
            <div style="background:var(--oui-bg); padding:16px; border-radius:20px;">
              <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(0,0,0,0.05); padding-bottom:8px; margin-bottom:8px;">
                <span style="color:var(--oui-text-sub); font-size:0.9rem; font-weight:600;">Application Opens</span>
                <span style="font-weight:700; color:var(--oui-text-main);">${safeStr(tl.appStart) || 'TBA'}</span>
              </div>
              <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(0,0,0,0.05); padding-bottom:8px; margin-bottom:8px;">
                <span style="color:var(--oui-text-sub); font-size:0.9rem; font-weight:600;">Application Closes</span>
                <span style="font-weight:700; color:var(--oui-danger);">${safeStr(tl.appEnd) || 'TBA'}</span>
              </div>
              <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(0,0,0,0.05); padding-bottom:8px; margin-bottom:8px;">
                <span style="color:var(--oui-text-sub); font-size:0.9rem; font-weight:600;">Event Start</span>
                <span style="font-weight:700; color:var(--oui-accent);">${safeStr(tl.compStart) || 'TBA'}</span>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span style="color:var(--oui-text-sub); font-size:0.9rem; font-weight:600;">Event End</span>
                <span style="font-weight:700; color:var(--oui-text-main);">${safeStr(tl.compEnd) || 'TBA'}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 style="font-size:1.1rem; color:var(--oui-text-main); margin:0 0 12px 0;">Eligibility Rules</h4>
            <div style="background:var(--oui-bg); padding:16px; border-radius:20px;">
              <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(0,0,0,0.05); padding-bottom:8px; margin-bottom:8px;">
                <span style="color:var(--oui-text-sub); font-size:0.9rem; font-weight:600;">Classes</span>
                <span style="font-weight:700; color:var(--oui-text-main);">${el.classFrom && el.classTo ? `${el.classFrom} to ${el.classTo}` : 'Any'}</span>
              </div>
              <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(0,0,0,0.05); padding-bottom:8px; margin-bottom:8px;">
                <span style="color:var(--oui-text-sub); font-size:0.9rem; font-weight:600;">ATL Schools</span>
                <span style="font-weight:700; color:${el.atlAllowed ? 'var(--oui-accent)' : 'var(--oui-text-main)'};">${el.atlAllowed ? 'Allowed' : 'Not Allowed'}</span>
              </div>
              <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(0,0,0,0.05); padding-bottom:8px; margin-bottom:8px;">
                <span style="color:var(--oui-text-sub); font-size:0.9rem; font-weight:600;">Non-ATL</span>
                <span style="font-weight:700; color:${el.nonAtlAllowed ? 'var(--oui-accent)' : 'var(--oui-text-main)'};">${el.nonAtlAllowed ? 'Allowed' : 'Not Allowed'}</span>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span style="color:var(--oui-text-sub); font-size:0.9rem; font-weight:600;">Format</span>
                <span style="font-weight:700; color:var(--oui-text-main);">${el.individual ? 'Individual' : ''} ${el.team ? (el.individual ? '& Team' : 'Team') : ''}</span>
              </div>
            </div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:24px;">
          <div>
            <h4 style="font-size:1.1rem; color:var(--oui-text-main); margin:0 0 12px 0;">Requirements</h4>
            <ul style="margin:0; padding:0; list-style-type:none; font-size:1.05rem; color:var(--oui-text-main); font-weight:500;">
              ${reqHTML}
            </ul>
          </div>
          <div>
             <h4 style="font-size:1.1rem; color:var(--oui-text-main); margin:0 0 12px 0;">Reference Links</h4>
             ${linksHTML}
          </div>
        </div>
      `;

      const overlay = document.getElementById('compDetailModal');
      overlay.style.display = 'flex';
      void overlay.offsetWidth; 
      overlay.classList.add('show');
    };

    window.closeCompDetailModal = function() {
      const overlay = document.getElementById('compDetailModal');
      overlay.classList.remove('show');
      setTimeout(() => { overlay.style.display = 'none'; }, 400); 
    };

    // ========================================================================
    // 🎯 ASSIGNMENT MODAL LOGIC
    // ========================================================================
    window.openAssignModal = function(compId) {
      const comp = window.competitionsData.find(c => c.id === compId);
      if (!comp) return;
      document.getElementById('modalCompId').value = compId;
      document.getElementById('modalCompName').innerText = comp.name;
      
      const overlay = document.getElementById('compAssignModal');
      overlay.style.display = 'flex';
      void overlay.offsetWidth; 
      overlay.classList.add('show');
    };

    window.closeAssignModal = function() {
      const overlay = document.getElementById('compAssignModal');
      overlay.classList.remove('show');
      setTimeout(() => { overlay.style.display = 'none'; }, 400); 
    };

    window.executeCompAssignment = async function() {
      const studentId = document.getElementById('modalStudentSelect').value;
      const compId = document.getElementById('modalCompId').value;
      const btn = document.getElementById('btnExecuteDeploy');

      if (!studentId) return alert("Please select a student.");

      btn.innerHTML = "Assigning... ⏳";
      btn.style.transform = "scale(0.96)"; 
      btn.disabled = true;

      try {
        const comp = window.competitionsData.find(c => c.id === compId);
        
        await addDoc(collection(db, "competition_assignments"), {
          competitionId: compId,
          studentId: studentId,
          competitionName: comp.name,
          assignedBy: currentUID,
          assignedAt: serverTimestamp(),
          status: "registered"
        });

        btn.style.transform = "scale(1)";
        btn.innerHTML = "Assigned Successfully ✅";
        btn.style.background = "#34c759";
        btn.style.boxShadow = "0 8px 24px rgba(52,199,89,0.3)";
        
        setTimeout(() => {
          window.closeAssignModal();
          btn.innerHTML = "Confirm Assignment 🚀";
          btn.style.background = "var(--oui-accent-gradient)";
          btn.style.boxShadow = "0 4px 14px var(--oui-accent-glow)";
          btn.disabled = false;
        }, 1500);

      } catch (e) {
        alert("Assignment failed.");
        btn.style.transform = "scale(1)";
        btn.innerHTML = "Confirm Assignment 🚀";
        btn.disabled = false;
      }
    };

  } catch (error) {
    console.error(error);
    container.innerHTML = `<div style="text-align:center; padding: 60px; color: #ff3b30; font-weight:800; font-size:1.2rem;">System Error loading Hub.</div>`;
  }
}
// ============================================================================
// 📊 COMPETITION SNAPSHOT (DEFERRED LOAD & FILTERING ENGINE)
// ============================================================================

export async function loadCompetitionSnapshot(db, contentArea, currentUID) {
  window.loadCompetitionSnapshot = loadCompetitionSnapshot; 
  window.snapshotDb = db; // Cache DB for sub-functions

  const container = contentArea || document.getElementById("dashboardContent");
  if (!container) return;

  const safeStr = (str) => {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function(m) {
      return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[m];
    });
  };

  // 🚀 HARDWARE ACCELERATED CSS
  const injectSnapshotCSS = () => `
    <style>
      :root {
        --oui-bg: #f5f5f7;
        --oui-surface: rgba(255, 255, 255, 0.7); 
        --oui-surface-solid: #ffffff;
        --oui-text-main: #1d1d1f;
        --oui-text-sub: #86868b;
        --oui-accent: #007aff;
        --oui-accent-glow: rgba(0, 122, 255, 0.15);
        --oui-success: #34c759;
        --oui-success-bg: rgba(52, 199, 89, 0.15);
        --oui-border: rgba(0, 0, 0, 0.06);
        --oui-radius-sm: 14px;
        --oui-radius-md: 20px;
        --oui-radius-lg: 28px; 
        --oui-smooth: cubic-bezier(0.25, 1, 0.5, 1);
      }

      .oui-snap-wrapper { max-width: 1200px; margin: 0 auto; padding: 40px 16px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; animation: ouiFadeIn 0.5s var(--oui-smooth); }
      .oui-header { margin-bottom: 32px; }
      .oui-title { font-size: 2.6rem; font-weight: 800; color: var(--oui-text-main); letter-spacing: -0.04em; margin: 0 0 8px 0; }
      .oui-subtitle { font-size: 1.15rem; color: var(--oui-text-sub); font-weight: 500; margin: 0; }

      /* Target Parameters Card */
      .oui-target-card {
        background: var(--oui-surface-solid); border-radius: var(--oui-radius-lg); 
        padding: 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.03); border: 1px solid var(--oui-border);
        margin-bottom: 40px;
      }

      .oui-filter-grid { 
        display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;
      }
      
      .oui-filter-group { display: flex; flex-direction: column; gap: 8px; }
      .oui-filter-label { font-size: 0.85rem; font-weight: 700; color: var(--oui-text-sub); text-transform: uppercase; letter-spacing: 0.5px; padding-left: 4px; }
      
      .oui-select { 
        width: 100%; appearance: none; background: #f2f2f7 url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2386868b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e") no-repeat right 16px center; 
        background-size: 16px; border: 2px solid transparent; border-radius: 16px; padding: 16px 40px 16px 20px; 
        font-size: 1.05rem; font-weight: 600; color: var(--oui-text-main); outline: none; transition: 0.2s; cursor:pointer;
      }
      .oui-select:focus { background: var(--oui-surface-solid); border-color: var(--oui-accent); box-shadow: 0 0 0 4px var(--oui-accent-glow); }

      .oui-btn-retrieve { 
        background: linear-gradient(135deg, #1d1d1f, #434345); color: #fff; border: none; 
        padding: 18px 32px; border-radius: 16px; font-size: 1.1rem; font-weight: 800; 
        cursor: pointer; transition: 0.3s var(--oui-smooth); display:inline-flex; align-items:center; gap:10px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.15); width: 100%; justify-content: center;
      }
      .oui-btn-retrieve:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,0,0,0.2); background: linear-gradient(135deg, #000, #2c2c2e); }
      .oui-btn-retrieve:active { transform: translateY(0); }

      /* Stats Ribbon */
      .oui-stats-ribbon { display: flex; gap: 24px; margin-bottom: 24px; flex-wrap: wrap; }
      .oui-stat-card { background: var(--oui-surface-solid); padding: 24px; border-radius: 20px; border: 1px solid var(--oui-border); display: flex; align-items: center; gap: 20px; min-width: 220px; flex: 1; box-shadow: 0 8px 24px rgba(0,0,0,0.02); animation: ouiFadeIn 0.5s ease; }
      .oui-stat-val { font-size: 2.5rem; font-weight: 800; color: var(--oui-text-main); line-height: 1; letter-spacing:-0.03em;}
      .oui-stat-lbl { font-size: 0.9rem; color: var(--oui-text-sub); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; line-height:1.3; }

      /* Participant Cards */
      .oui-part-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
      .oui-part-card { 
        background: var(--oui-surface-solid); border-radius: var(--oui-radius-md); padding: 24px; 
        border: 1px solid var(--oui-border); box-shadow: 0 8px 24px rgba(0,0,0,0.02); 
        transition: transform 0.3s var(--oui-smooth), box-shadow 0.3s;
        display: flex; flex-direction: column; justify-content: space-between;
        animation: ouiFadeIn 0.5s ease both;
      }
      .oui-part-card:hover { transform: translateY(-4px); box-shadow: 0 16px 32px rgba(0,0,0,0.06); }
      
      .oui-part-head { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
      .oui-avatar { width: 48px; height: 48px; border-radius: 50%; background: var(--oui-accent-glow); color: var(--oui-accent); display: flex; justify-content: center; align-items: center; font-weight: 800; font-size: 1.3rem; flex-shrink:0; }
      
      .oui-badge-status { padding: 8px 14px; border-radius: 12px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
      .oui-badge-status.registered { background: #f2f2f7; color: var(--oui-text-sub); }
      .oui-badge-status.submitted { background: var(--oui-accent-glow); color: var(--oui-accent); }
      .oui-badge-status.won { background: var(--oui-success-bg); color: var(--oui-success); }

      @keyframes ouiFadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
    </style>
  `;

  container.innerHTML = `<div style="text-align:center; padding: 100px; color: #86868b; font-weight:600;">Initializing Telemetry Modules... ⏳</div>`;

  try {
    const { collection, query, where, getDocs, doc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
    
    // RBAC Scoping
    const userSnap = await getDoc(doc(db, "users", currentUID));
    if (!userSnap.exists()) return;
    const userData = userSnap.data();
    const userRole = userData.role;
    let actualSchoolId = userData.schoolId;

    const isAdmin = (userRole === 'admin' || userRole === 'platform-admin' || userRole === 'super-admin');

    if (!isAdmin && (userRole === "atl-incharge" || userRole === "school-admin") && !actualSchoolId) {
      const assignmentSnap = await getDocs(query(collection(db, "inchargeSchoolAssignments"), where("inchargeId", "==", currentUID)));
      if (!assignmentSnap.empty) actualSchoolId = assignmentSnap.docs[0].data().schoolId;
    }

    // ⚡ STEP 1: FETCH ONLY METADATA (Schools & Competitions) - Zero load on Users/Tasks
    const [compsSnap, schoolsSnap] = await Promise.all([
      getDocs(collection(db, "competitions")),
      getDocs(collection(db, "schools"))
    ]);

    window.snapMeta = { comps: [], schools: {} };
    const uniqueStates = new Set();
    const uniqueCities = new Set();

    compsSnap.forEach(d => window.snapMeta.comps.push({ id: d.id, ...d.data() }));
    
    schoolsSnap.forEach(d => {
      const s = d.data();
      window.snapMeta.schools[d.id] = { id: d.id, name: s.schoolName || s.name || "Unknown", state: s.state || "", city: s.city || "" };
      if(s.state) uniqueStates.add(s.state);
      if(s.city) uniqueCities.add(s.city);
    });

    window.snapMeta.comps.sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    // Build Dropdowns
    let compOpts = `<option value="">-- All Competitions --</option>`;
    window.snapMeta.comps.forEach(c => compOpts += `<option value="${c.id}">${safeStr(c.name)}</option>`);

    let stateOpts = `<option value="">All States</option>`;
    Array.from(uniqueStates).sort().forEach(s => stateOpts += `<option value="${s}">${safeStr(s)}</option>`);

    let cityOpts = `<option value="">All Cities</option>`;
    Array.from(uniqueCities).sort().forEach(c => cityOpts += `<option value="${c}">${safeStr(c)}</option>`);

    let schoolOpts = `<option value="">All Schools</option>`;
    Object.values(window.snapMeta.schools).sort((a,b)=>a.name.localeCompare(b.name)).forEach(s => {
      schoolOpts += `<option value="${s.id}">${safeStr(s.name)}</option>`;
    });

    // 🎨 Render UI with Empty State
    container.innerHTML = `
      ${injectSnapshotCSS()}
      <div class="oui-snap-wrapper">
        <div class="oui-header">
          <h2 class="oui-title">Tournament Telemetry</h2>
          <p class="oui-subtitle">Target specific parameters to retrieve active competition data.</p>
        </div>

        <div class="oui-target-card">
          <h3 style="margin: 0 0 20px 0; font-size: 1.25rem; color: var(--oui-text-main); font-weight:800;">Target Parameters</h3>
          
          <div class="oui-filter-grid">
            <div class="oui-filter-group">
              <label class="oui-filter-label">Competition</label>
              <select id="fsComp" class="oui-select">${compOpts}</select>
            </div>
            
            <div class="oui-filter-group" style="display: ${isAdmin ? 'flex' : 'none'};">
              <label class="oui-filter-label">State</label>
              <select id="fsState" class="oui-select" onchange="window.cascadeSnapFilters('state')">${stateOpts}</select>
            </div>
            
            <div class="oui-filter-group" style="display: ${isAdmin ? 'flex' : 'none'};">
              <label class="oui-filter-label">City</label>
              <select id="fsCity" class="oui-select" onchange="window.cascadeSnapFilters('city')">${cityOpts}</select>
            </div>
            
            <div class="oui-filter-group" style="display: ${isAdmin ? 'flex' : 'none'};">
              <label class="oui-filter-label">School</label>
              <select id="fsSchool" class="oui-select">${schoolOpts}</select>
            </div>
          </div>

          <button class="oui-btn-retrieve" onclick="window.executeCompSnapshotFetch()">
            Retrieve Telemetry Records
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>

        <div id="snapResultsContainer">
           <div style="text-align:center; padding: 60px; color:var(--oui-text-sub); font-style:italic; font-weight:600; font-size:1.1rem;">Awaiting target selection...</div>
        </div>
      </div>
    `;

    window.snapActualSchoolId = isAdmin ? null : actualSchoolId;

    // ========================================================================
    // 🧠 CASCADING LOGIC (Metadata Only)
    // ========================================================================
    window.cascadeSnapFilters = function(trigger) {
      const selectedState = document.getElementById('fsState').value;
      const selectedCity = document.getElementById('fsCity').value;
      
      const citySelect = document.getElementById('fsCity');
      const schoolSelect = document.getElementById('fsSchool');

      let validCities = new Set();
      let newSchoolOpts = `<option value="">All Schools</option>`;

      Object.values(window.snapMeta.schools).forEach(s => {
        const stateMatch = !selectedState || s.state === selectedState;
        const cityMatch = !selectedCity || s.city === selectedCity;

        if (trigger === 'state' && stateMatch && s.city) validCities.add(s.city);
        if (stateMatch && cityMatch) {
          newSchoolOpts += `<option value="${s.id}">${safeStr(s.name)}</option>`;
        }
      });

      if (trigger === 'state') {
        let newCityOpts = `<option value="">All Cities</option>`;
        Array.from(validCities).sort().forEach(c => newCityOpts += `<option value="${c}">${safeStr(c)}</option>`);
        citySelect.innerHTML = newCityOpts;
      }
      schoolSelect.innerHTML = newSchoolOpts;
    };

    // ========================================================================
    // ⚡ ON-DEMAND FETCH ENGINE (The Magic)
    // ========================================================================
    window.executeCompSnapshotFetch = async function() {
      const targetComp = document.getElementById('fsComp').value;
      const targetSchool = window.snapActualSchoolId || (isAdmin ? document.getElementById('fsSchool').value : null);
      const targetState = isAdmin ? document.getElementById('fsState').value : null;
      const targetCity = isAdmin ? document.getElementById('fsCity').value : null;

      const resultArea = document.getElementById('snapResultsContainer');
      resultArea.innerHTML = `<div style="text-align:center; padding:80px; color:var(--oui-accent); font-weight:700; font-size:1.1rem; display:flex; flex-direction:column; align-items:center; gap:16px;"><div style="width:24px; height:24px; border:3px solid var(--oui-accent-glow); border-top-color:var(--oui-accent); border-radius:50%; animation:spin 1s linear infinite;"></div> Decrypting targeted telemetry...</div><style>@keyframes spin { 100% { transform:rotate(360deg); } }</style>`;

      try {
        const { collection, query, where, getDocs } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");

        // OPTIMIZATION: Only fetch exactly what the filters dictate!
        let assignQuery = collection(window.snapshotDb, "competition_assignments");
        if (targetComp) assignQuery = query(assignQuery, where("competitionId", "==", targetComp));

        let studentQuery = query(collection(window.snapshotDb, "users"), where("role", "==", "student"));
        if (targetSchool) studentQuery = query(studentQuery, where("schoolId", "==", targetSchool));

        const [assignSnap, studentsSnap] = await Promise.all([
          getDocs(assignQuery),
          getDocs(studentQuery)
        ]);

        const studentDataMap = {};
        studentsSnap.forEach(d => {
          const u = d.data();
          studentDataMap[d.id] = { id: d.id, name: u.name || "Unknown", class: u.class || "N/A", schoolId: u.schoolId };
        });

        let resultsHtml = '';
        let totalAssigned = 0;
        let totalSubmitted = 0;

        assignSnap.forEach((doc, index) => {
          const assign = doc.data();
          const student = studentDataMap[assign.studentId];
          if (!student) return; // Student deleted or filtered out by School query
          
          const school = window.snapMeta.schools[student.schoolId];
          if (!school && (targetState || targetCity || targetSchool)) return;

          // Local secondary filters for State/City if applicable
          if (school) {
            if (targetState && school.state !== targetState) return;
            if (targetCity && school.city !== targetCity) return;
            if (targetSchool && school.id !== targetSchool) return;
          }

          totalAssigned++;
          const status = (assign.status || 'registered').toLowerCase();
          if (status === 'submitted' || status === 'won') totalSubmitted++;

          const compObj = window.snapMeta.comps.find(c => c.id === assign.competitionId);
          const compName = compObj ? compObj.name : assign.competitionName;
          const initial = safeStr(student.name).charAt(0).toUpperCase();
          const staggerDelay = `${(index % 12) * 0.05}s`; 

          resultsHtml += `
            <div class="oui-part-card" style="animation-delay: ${staggerDelay};">
              <div>
                <div class="oui-part-head">
                  <div class="oui-avatar">${initial}</div>
                  <div>
                    <div style="font-size:1.15rem; font-weight:800; color:var(--oui-text-main); margin-bottom:4px; letter-spacing:-0.02em;">${safeStr(student.name)}</div>
                    <div style="font-size:0.85rem; color:var(--oui-text-sub); font-weight:600;">Class ${safeStr(student.class)}</div>
                  </div>
                </div>
                <div style="font-size:0.95rem; color:var(--oui-text-main); font-weight:700; margin-bottom:8px;">🏆 ${safeStr(compName)}</div>
                <div style="font-size:0.85rem; color:var(--oui-text-sub); font-weight:600; margin-bottom:20px; display:flex; align-items:center; gap:6px;">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                   ${school ? safeStr(school.name) : 'Independent'}
                </div>
              </div>
              
              <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--oui-border); padding-top:16px;">
                <span class="oui-badge-status ${status}">${status}</span>
                ${assign.submissionURL ? `<a href="${assign.submissionURL}" target="_blank" style="color:var(--oui-accent); font-weight:800; font-size:0.9rem; text-decoration:none;">View Evidence ↗</a>` : `<span style="color:var(--oui-text-sub); font-size:0.85rem; font-style:italic; font-weight:500;">No File</span>`}
              </div>
            </div>
          `;
        });

        if (totalAssigned === 0) {
          resultArea.innerHTML = `<div style="text-align:center; padding: 60px; color:var(--oui-text-sub); font-weight:600; font-size:1.1rem; background:var(--oui-surface-solid); border-radius:var(--oui-radius-lg); border:1px solid var(--oui-border);">No participants match these parameters.</div>`;
          return;
        }

        const subRate = totalAssigned > 0 ? Math.round((totalSubmitted / totalAssigned) * 100) : 0;
        
        resultArea.innerHTML = `
          <div class="oui-stats-ribbon">
            <div class="oui-stat-card">
              <div class="oui-stat-val">${totalAssigned}</div>
              <div class="oui-stat-lbl">Active<br>Deployments</div>
            </div>
            <div class="oui-stat-card">
              <div class="oui-stat-val" style="color:var(--oui-accent);">${totalSubmitted}</div>
              <div class="oui-stat-lbl">Evidence<br>Received</div>
            </div>
            <div class="oui-stat-card">
              <div class="oui-stat-val" style="color:var(--oui-success);">${subRate}%</div>
              <div class="oui-stat-lbl">Global<br>Submission Rate</div>
            </div>
          </div>
          <div class="oui-part-grid">${resultsHtml}</div>
        `;

      } catch (err) {
        console.error(err);
        resultArea.innerHTML = `<div style="text-align:center; padding: 40px; color: var(--oui-danger); font-weight:700; background:rgba(255,59,48,0.1); border-radius:16px;">Failed to retrieve records.</div>`;
      }
    };

  } catch (err) {
    console.error(err);
    container.innerHTML = `<div style="text-align:center; padding: 60px; color: var(--oui-danger); font-weight:800;">System Error loading Telemetry Dashboard.</div>`;
  }
}