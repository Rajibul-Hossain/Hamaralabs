/** * UI Animations & Styles 
 */
export function addCheckmarkAnimation(button) {
  if (button.querySelector("svg")) return;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 52 52");
  Object.assign(svg.style, { width: "18px", marginLeft: "8px", verticalAlign: "middle" });
  
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M14 27 L22 35 L38 18");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "#0a5c2f");
  path.setAttribute("stroke-width", "4");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");
  Object.assign(path.style, { strokeDasharray: "50", strokeDashoffset: "50", transition: "stroke-dashoffset 0.6s ease" });
  
  svg.appendChild(path);
  button.appendChild(svg);
  requestAnimationFrame(() => { path.style.strokeDashoffset = "0"; });
}

export function confettiBurst(x, y) {
  const canvas = document.createElement("canvas");
  Object.assign(canvas.style, { position: "fixed", pointerEvents: "none", top: "0", left: "0", width: "100%", height: "100%", zIndex: "9999" });
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d"), particles = [];
  for (let i = 0; i < 80; i++) {
    particles.push({ x, y, size: Math.random() * 6 + 4, speedX: (Math.random() - 0.5) * 10, speedY: (Math.random() - 0.5) * 10, color: `hsl(${Math.random()*360}, 80%, 60%)`, life: 60 });
  }

  (function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.x += p.speedX; p.y += p.speedY; p.life--; ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, p.size, p.size); });
    if (particles.some(p => p.life > 0)) requestAnimationFrame(animate); else canvas.remove();
  })();
}

export function startPremiumSparkle() {
  const canvas = document.createElement("canvas");
  Object.assign(canvas.style, { position: "fixed", pointerEvents: "none", top: "0", left: "0", width: "100%", height: "100%", zIndex: "1" });
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d"), stars = [];
  for (let i = 0; i < 40; i++) stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, radius: Math.random() * 2, alpha: Math.random() });

  (function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => { s.alpha += (Math.random() - 0.5) * 0.02; ctx.globalAlpha = Math.max(0, s.alpha); ctx.beginPath(); ctx.arc(s.x, s.y, s.radius, 0, Math.PI*2); ctx.fillStyle = "#ffffff"; ctx.fill(); });
    requestAnimationFrame(animate);
  })();
}

startPremiumSparkle();

export const regformCSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
:root {
  --app-bg-1: #f8fafc; --app-bg-2: #eef2ff; --app-bg-3: #f1f5f9; --surface: rgba(255, 255, 255, 0.85);
  --text-main: #0f172a; --text-muted: #64748b; --accent-primary: #0084ff; --success: #10b981;
  --radius-xl: 24px; --radius-lg: 16px; --radius-md: 12px; --spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
body { margin: 0; background: linear-gradient(-45deg, var(--app-bg-1), var(--app-bg-2), var(--app-bg-3), #e0e7ff); background-size: 400% 400%; animation: bgShift 15s ease infinite; font-family: 'Plus Jakarta Sans', sans-serif; color: var(--text-main); }
@keyframes bgShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
.page-wrapper { padding: 60px 20px; display: flex; justify-content: center; perspective: 1000px; }
.card { background: var(--surface); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.6); border-radius: var(--radius-xl); padding: 56px; width: 100%; max-width: 900px; animation: formReveal 0.8s var(--spring) forwards; opacity: 0; }
@keyframes formReveal { from { opacity: 0; transform: translateY(30px) scale(0.98) rotateX(-5deg); } to { opacity: 1; transform: translateY(0) scale(1) rotateX(0); } }
.card h2 { font-size: 2.25rem; font-weight: 800; margin: 0 0 40px; text-align: center; background: linear-gradient(135deg, #0f172a, #4f46e5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
#schoolForm .section { background: #fff; border: 1.5px solid #f1f5f9; border-radius: var(--radius-lg); padding: 32px; margin-bottom: 28px; transition: all 0.4s var(--spring); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
#schoolForm .section:focus-within { transform: translateY(-4px); border-color: #c7d2fe; box-shadow: 0 20px 40px -10px rgba(79,70,229,0.12); }
#schoolForm .section h3 { margin: 0 0 28px; font-size: 1.25rem; font-weight: 700; display: flex; align-items: center; gap: 12px; }
#schoolForm .section h3::before { content: ''; width: 8px; height: 8px; background: var(--accent-primary); border-radius: 50%; }
#schoolForm .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px 24px; }
#schoolForm .input-group { position: relative; width: 100%; margin-bottom: 8px; }
.align-full { grid-column: 1 / -1; }
#schoolForm .input-group input { width: 100%; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: var(--radius-md); padding: 24px 16px 8px; font-size: 1rem; transition: 0.3s; }
#schoolForm .input-group input:focus { background: #fff; border-color: var(--accent-primary); box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.2); outline: none; }
#schoolForm .input-group label { position: absolute; left: 16px; top: 16px; color: var(--text-muted); transition: 0.25s; pointer-events: none; transform-origin: left top; }
#schoolForm .input-group input:focus+label, #schoolForm .input-group input:not(:placeholder-shown)+label { top: 6px; font-size: 0.75rem; font-weight: 700; color: var(--accent-primary); text-transform: uppercase; }
.toggle-align { display: flex; align-items: center; padding-top: 6px; }
#schoolForm .checkbox-group label { display: inline-flex; align-items: center; gap: 12px; cursor: pointer; font-weight: 600; }
#schoolForm .checkbox-group input[type="checkbox"] { appearance: none; width: 48px; height: 26px; background: #e2e8f0; border-radius: 20px; position: relative; cursor: pointer; transition: 0.4s var(--spring); }
#schoolForm .checkbox-group input[type="checkbox"]::after { content: ''; position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; background: #fff; border-radius: 50%; transition: 0.4s var(--spring); }
#schoolForm .checkbox-group input[type="checkbox"]:checked { background: var(--success); }
#schoolForm .checkbox-group input[type="checkbox"]:checked::after { transform: translateX(22px); }
#schoolForm .checkbox-group.multi { display: flex; flex-wrap: wrap; gap: 20px; margin-top: 10px; }
#schoolForm .checkbox-group.multi input[type="checkbox"] { width: 22px; height: 22px; border-radius: 6px; border: 2px solid #cbd5e1; }
#schoolForm .checkbox-group.multi input[type="checkbox"]:checked { background: var(--accent-primary); border-color: var(--accent-primary); background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='4'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E"); background-size: 14px; background-position: center; background-repeat: no-repeat; }
#schoolForm .submit-btn { position: relative; overflow: hidden; width: 100%; background: linear-gradient(135deg, #0f172a, #1e293b); color: #fff; border: none; padding: 20px; border-radius: var(--radius-md); font-size: 1.15rem; font-weight: 700; cursor: pointer; margin-top: 16px; transition: 0.3s var(--spring); }
#schoolForm .submit-btn::before { content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent); animation: shimmer 2.5s infinite; transform: skewX(-20deg); }
@keyframes shimmer { 100% { left: 200%; } }
#schoolForm .submit-btn:hover { transform: translateY(-3px); box-shadow: 0 15px 30px -5px rgba(15, 23, 42, 0.4); }
@media (max-width: 768px) { .card { padding: 40px 24px; } #schoolForm .grid-2 { grid-template-columns: 1fr; } }
`;

export const regHTML = `
<div class="page-wrapper">
  <div class="card">
    <h2>School Registration</h2>
    <form id="schoolForm">
      <div class="section">
        <h3>School Details</h3>
        <div class="grid-2">
          <div class="input-group"><input type="text" id="schoolName" placeholder=" " required><label>School Name *</label></div>
          <div class="checkbox-group toggle-align"><label><input type="checkbox" id="isAtl"> Is ATL School</label></div>
          <div class="input-group align-full"><input type="text" id="addressLine" placeholder=" " required><label>Address Line</label></div>
          <div class="input-group align-full"><input type="text" id="city" placeholder=" " required><label>City / District</label></div>
          <div class="input-group"><input type="text" id="state" placeholder=" " required><label>State / Province</label></div>
          <div class="input-group"><input type="number" id="pincode" placeholder=" " required><label>Pincode</label></div>
        </div>
      </div>
      <div class="section">
        <h3>Incharge Details</h3>
        <div class="grid-2">
          <div class="input-group"><input type="text" id="inFirst" placeholder=" " required><label>First Name</label></div>
          <div class="input-group"><input type="text" id="inLast" placeholder=" " required><label>Last Name</label></div>
          <div class="input-group"><input type="email" id="inEmail" placeholder=" " required><label>Email</label></div>
          <div class="input-group"><input type="text" id="inPhone" placeholder=" " required><label>WhatsApp Contact</label></div>
        </div>
      </div>
      <div class="section">
        <h3>Principal Details</h3>
        <div class="grid-2">
          <div class="input-group"><input type="text" id="prFirst" placeholder=" " required><label>First Name</label></div>
          <div class="input-group"><input type="text" id="prLast" placeholder=" " required><label>Last Name</label></div>
          <div class="input-group"><input type="email" id="prEmail" placeholder=" " required><label>Email</label></div>
          <div class="input-group"><input type="text" id="prPhone" placeholder=" " required><label>WhatsApp Contact</label></div>
        </div>
      </div>
      <div class="section">
        <h3>Correspondent Details</h3>
        <div class="checkbox-group toggle-align" style="margin-bottom: 16px;"><label><input type="checkbox" id="sameAsPrincipal"> Same As Principal</label></div>
        <div class="grid-2">
          <div class="input-group"><input type="text" id="coFirst" placeholder=" "><label>First Name</label></div>
          <div class="input-group"><input type="text" id="coLast" placeholder=" "><label>Last Name</label></div>
          <div class="input-group"><input type="email" id="coEmail" placeholder=" "><label>Email</label></div>
          <div class="input-group"><input type="text" id="coPhone" placeholder=" "><label>WhatsApp Contact</label></div>
        </div>
      </div>
      <div class="section">
        <h3>Additional Details</h3>
        <div class="checkbox-group multi">
          <label><input type="checkbox" value="CBSE"> CBSE</label><label><input type="checkbox" value="State"> State</label>
          <label><input type="checkbox" value="ICSE"> ICSE</label><label><input type="checkbox" value="IGCSE"> IGCSE</label>
          <label><input type="checkbox" value="IB"> IB</label>
        </div>
        <div class="grid-2" style="margin-top: 24px;">
          <div class="input-group"><input type="url" id="website" placeholder=" "><label>Website URL</label></div>
          <div class="checkbox-group toggle-align"><label><input type="checkbox" id="paidSubscription"> Paid Subscription</label></div>
        </div>
      </div>
      <button type="submit" class="submit-btn">Register School</button>
    </form>
  </div>
</div>`;
export const tinkerCSS = `
    #tinker-premium-workspace {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      animation: tinkerFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);}
    @keyframes tinkerFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    #tinker-premium-workspace .tinker-wrapper-card {
      background: #ffffff; border-radius: 20px; padding: 40px;
      box-shadow: 0 10px 40px -10px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.04);}
    #tinker-premium-workspace .tinker-header { font-size: 1.8rem; font-weight: 800; letter-spacing: -0.5px; color: #111; margin-bottom: 8px; }
  #tinker-premium-workspace .tinker-subtitle { color: #666; font-size: 1.05rem; margin-bottom: 32px; font-weight: 400; }
    #tinker-premium-workspace .tinker-input-group {
      display: flex; gap: 12px; background: #f8f9fa; padding: 8px; border-radius: 16px; 
      border: 1px solid #eee; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);}
    #tinker-premium-workspace .tinker-input-group:focus-within {
      background: #fff; border-color: #8a2be2; box-shadow: 0 8px 24px rgba(138, 43, 226, 0.12);}
    #tinker-premium-workspace #tinkerInterest {
      flex: 1; border: none; background: transparent; padding: 14px 20px; font-size: 1.1rem; color: #222; outline: none; width: 100%;}
    #tinker-premium-workspace #tinkerInterest::placeholder { color: #aaa; font-weight: 400; }
    #tinker-premium-workspace #tinkerGenBtn {
      background: linear-gradient(135deg, #8a2be2, #4169e1); color: #fff; border: none; padding: 0 32px; 
      border-radius: 12px; font-weight: 700; font-size: 1.05rem; cursor: pointer; white-space: nowrap;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); box-shadow: 0 4px 14px rgba(138, 43, 226, 0.3);}
    #tinker-premium-workspace #tinkerGenBtn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(138, 43, 226, 0.4); filter: brightness(1.1); }
    #tinker-premium-workspace #tinkerGenBtn:active:not(:disabled) { transform: scale(0.97); }
    @keyframes tinkerShimmer { 0% { background-position: -100% 0; } 100% { background-position: 200% 0; } }
    #tinker-premium-workspace .tinker-generating {
      background: linear-gradient(90deg, #8a2be2 25%, #b185fa 50%, #8a2be2 75%);
      background-size: 200% 100%; animation: tinkerShimmer 1.5s infinite linear; pointer-events: none; opacity: 0.9;}
    #tinker-premium-workspace #tinkerOutput {
      margin-top: 36px; padding: 36px; background: #fff; border-radius: 20px;
      box-shadow: 0 20px 50px -15px rgba(0,0,0,0.08); border: 1px solid rgba(138,43,226,0.15);
      position: relative; overflow: hidden; display: none; animation: tinkerFadeIn 0.6s ease forwards;}
    #tinker-premium-workspace #tinkerOutput::before { /* Subtle Glowing Orb */
      content: ""; position: absolute; top: -50px; right: -50px; width: 200px; height: 200px;
      background: radial-gradient(circle, rgba(65,105,225,0.08) 0%, transparent 70%); border-radius: 50%; pointer-events: none;}
    #tinker-premium-workspace #resTitle { font-size: 1.5rem; font-weight: 800; color: #111; margin: 0 0 24px 0; }
    #tinker-premium-workspace #resSteps { color: #444; line-height: 1.8; font-size: 1.05rem; margin-bottom: 28px; }
    #tinker-premium-workspace .tinker-badge-materials {
      background: rgba(65, 105, 225, 0.05); border-left: 4px solid #4169e1; padding: 18px 24px; 
      border-radius: 0 12px 12px 0; margin-bottom: 20px; font-size: 0.95rem; color: #333;}
    #tinker-premium-workspace .tinker-badge-learning {
      background: rgba(255, 149, 0, 0.05); border-left: 4px solid #ff9500; padding: 18px 24px; 
      border-radius: 0 12px 12px 0; font-size: 0.95rem; color: #333; margin-bottom: 32px;}
    #tinker-premium-workspace #initAssignBtn {
      background: #111; color: #fff; border: none; padding: 14px 28px; border-radius: 12px; font-weight: 700;
      font-size: 1rem; cursor: pointer; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); display: inline-flex; align-items: center; gap: 8px;}
    #tinker-premium-workspace #initAssignBtn:hover { background: #333; transform: translateY(-2px); box-shadow: 0 8px 16px rgba(0,0,0,0.15); }
    #tinker-premium-workspace #tinkerAssignContainer {
      background: #fafafa; border: 1px solid #eaeaea; border-radius: 16px; padding: 28px; margin-top: 24px;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); display: none; animation: tinkerFadeIn 0.4s ease forwards;}
    #tinker-premium-workspace .tinker-assign-title { font-size: 1.2rem; font-weight: 700; color: #222; margin: 0 0 20px 0; }
    #tinker-premium-workspace .tinker-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    #tinker-premium-workspace .tinker-input-col { display: flex; flex-direction: column; gap: 8px; }
    #tinker-premium-workspace .tinker-label { font-size: 0.8rem; font-weight: 700; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
    #tinker-premium-workspace .tinker-select, #tinker-premium-workspace .tinker-date {
      width: 100%; padding: 14px 16px; border: 1px solid #ddd; border-radius: 10px; background: #fff; font-size: 1rem;
      color: #222; transition: all 0.2s; box-sizing: border-box; outline: none; appearance: none;}
    #tinker-premium-workspace .tinker-select:focus, #tinker-premium-workspace .tinker-date:focus {
      border-color: #4169e1; box-shadow: 0 0 0 3px rgba(65, 105, 225, 0.15);}
    #tinker-premium-workspace .tinker-select { /* Custom dropdown arrow */
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
      background-repeat: no-repeat; background-position: right 16px center; background-size: 16px; padding-right: 40px; cursor: pointer;}
    #tinker-premium-workspace .tinker-select:disabled { background-color: #f5f5f5; cursor: not-allowed; opacity: 0.7; }
    #tinker-premium-workspace #finalAssignBtn {
      background: #2ecc71; color: white; border: none; padding: 16px; border-radius: 12px; font-weight: 700;
      font-size: 1.05rem; cursor: pointer; width: 100%; transition: all 0.3s; box-shadow: 0 6px 16px rgba(46, 204, 113, 0.2);}
    #tinker-premium-workspace #finalAssignBtn:hover:not(:disabled) { background: #27ae60; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(46, 204, 113, 0.3); }`; 
export const stCss=`@charset "UTF-8";
@import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&display=swap');

:root {
  --brand-primary: oklch(0.55 0.16 245); --brand-hover: oklch(0.48 0.18 245); --brand-active: oklch(0.42 0.16 245);
  --brand-surface: oklch(0.96 0.04 245); --brand-glow: oklch(0.55 0.16 245 / 0.2);
  --brand-gradient: linear-gradient(135deg, oklch(0.55 0.16 245), oklch(0.50 0.18 255));
  --brand-gradient-hover: linear-gradient(135deg, oklch(0.48 0.18 245), oklch(0.45 0.20 255));
  --bg-app: oklch(0.98 0.01 250); --surface-base: rgba(255, 255, 255, 0.75); --surface-solid: #ffffff;
  --surface-muted: rgba(244, 244, 245, 0.6); --surface-elevated: rgba(255, 255, 255, 0.9);
  --text-main: oklch(0.2 0.02 250); --text-muted: oklch(0.55 0.02 250); --text-inverse: #ffffff;
  --border-subtle: rgba(0, 0, 0, 0.04); --border-default: rgba(0, 0, 0, 0.08);
  --border-strong: rgba(0, 0, 0, 0.12); --border-focus: var(--brand-primary);
  --danger-base: oklch(0.6 0.2 25); --danger-hover: oklch(0.55 0.2 25); --danger-surface: oklch(0.95 0.05 25);
  --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px; --radius-xl: 24px; --radius-pill: 9999px;
  --shadow-sm: 0 2px 4px -1px rgba(0, 0, 0, 0.03), 0 1px 2px -1px rgba(0, 0, 0, 0.02);
  --shadow-md: 0 8px 16px -4px rgba(0, 0, 0, 0.04), 0 4px 8px -2px rgba(0, 0, 0, 0.02), inset 0 1px 1px rgba(255, 255, 255, 1);
  --shadow-lg: 0 24px 48px -12px rgba(0, 0, 0, 0.08), 0 12px 24px -6px rgba(0, 0, 0, 0.04), inset 0 1px 1px rgba(255, 255, 255, 1);
  --shadow-float: 0 32px 64px -16px rgba(0, 0, 0, 0.12), 0 16px 32px -8px rgba(0, 0, 0, 0.06), inset 0 1px 1px rgba(255, 255, 255, 1);
  --spring-bouncy: cubic-bezier(0.34, 1.56, 0.64, 1); --spring-smooth: cubic-bezier(0.2, 0.8, 0.2, 1);
  --ease-fluid: cubic-bezier(0.25, 1, 0.5, 1); --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-fast: 150ms; --dur-med: 350ms; --dur-slow: 600ms;
}

/* 🛑 DARK MODE REMOVED - FORCED LIGHT MODE */

*, *::before, *::after { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
body { margin: 0; min-height: 100vh; background-color: var(--bg-app); color: var(--text-main); font-family: 'Inter', -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; overflow-x: hidden; background-image: radial-gradient(circle at 15% 50%, rgba(79, 70, 229, 0.04), transparent 25%), radial-gradient(circle at 85% 30%, rgba(147, 51, 234, 0.04), transparent 25%); background-attachment: fixed; }
::selection { background: var(--brand-glow); color: var(--brand-primary); }

/* Scrollbar */
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: var(--radius-pill); border: 3px solid var(--bg-app); background-clip: padding-box; transition: background 0.3s ease; }
::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }

.saas-workspace { max-width: 1040px; margin: 0 auto; padding: 40px 24px 160px 24px; perspective: 1200px; animation: workspaceEnter var(--dur-slow) var(--spring-smooth) backwards; transform: translateZ(0); }

.saas-header { margin-bottom: 48px; position: relative; z-index: 10; animation: fadeSlideDown var(--dur-med) var(--spring-smooth) backwards 0.1s; }
.saas-header h2 { font-size: clamp(2rem, 4vw, 2.75rem); font-weight: 800; letter-spacing: -0.04em; line-height: 1.1; margin: 0 0 12px 0; background: var(--brand-gradient); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: textShine 6s linear infinite; }
.saas-header p { color: var(--text-muted); font-size: 1.125rem; font-weight: 500; letter-spacing: -0.01em; margin: 0; max-width: 600px; }

/* Enhanced Dropzone with Squish Physics */
.saas-dropzone { position: relative; background: var(--surface-muted); border-radius: var(--radius-xl); padding: 48px 32px; text-align: center; cursor: pointer; margin-bottom: 48px; overflow: hidden; background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='24' ry='24' stroke='%2300000015' stroke-width='4' stroke-dasharray='8%2c 12' stroke-dashoffset='0' stroke-linecap='round'/%3e%3c/svg%3e"); transition: all var(--dur-med) var(--spring-smooth); animation: fadeSlideUp var(--dur-med) var(--spring-smooth) backwards 0.2s; will-change: transform, background; transform: translateZ(0); }
.saas-dropzone::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at center, var(--brand-glow) 0%, transparent 60%); opacity: 0; transition: opacity var(--dur-med) ease; z-index: 0; pointer-events: none; }
.saas-dropzone > * { position: relative; z-index: 1; }
.saas-dropzone:hover { transform: translateY(-4px) scale(1.01); background-color: var(--brand-surface); box-shadow: 0 16px 32px -8px var(--brand-glow); }
.saas-dropzone:active { transform: translateY(0) scale(0.98); } /* New: Tactile click */
.saas-dropzone:hover::before { opacity: 1; animation: pulseGlow 3s ease-in-out infinite alternate; }
.saas-dropzone svg { width: 48px; height: 48px; stroke: var(--brand-primary); stroke-width: 1.5; margin-bottom: 16px; transition: transform var(--dur-med) var(--spring-bouncy); }
.saas-dropzone:hover svg { transform: translateY(-8px) scale(1.1); }
.saas-dropzone-title { font-weight: 700; color: var(--text-main); font-size: 1.25rem; letter-spacing: -0.02em; margin-bottom: 8px; }
.saas-dropzone-subtitle { color: var(--text-muted); font-size: 0.95rem; font-weight: 500; margin: 0; }

.saas-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px; position: relative; }
.saas-col-span-2 { grid-column: span 2; }
.saas-grid:has(.saas-card:hover) .saas-card:not(:hover) { opacity: 0.6; transform: scale(0.98); filter: blur(1.5px); } /* Increased blur slightly for better depth */

.saas-card { background: var(--surface-base); backdrop-filter: blur(40px) saturate(150%); -webkit-backdrop-filter: blur(40px) saturate(150%); border-radius: var(--radius-xl); padding: 32px; border: 1px solid var(--border-default); box-shadow: var(--shadow-sm); position: relative; display: flex; flex-direction: column; gap: 24px; transform-origin: center; transition: transform var(--dur-slow) var(--spring-bouncy), box-shadow var(--dur-slow) var(--spring-smooth), opacity var(--dur-slow) var(--spring-smooth), filter var(--dur-slow) var(--spring-smooth); animation: fadeSlideUp var(--dur-med) var(--spring-smooth) backwards; will-change: transform, opacity; }
.saas-card:nth-child(1) { animation-delay: 0.3s; } .saas-card:nth-child(2) { animation-delay: 0.4s; } .saas-card:nth-child(3) { animation-delay: 0.5s; }
.saas-card::after { content: ''; position: absolute; inset: 0; border-radius: inherit; border: 1px solid rgba(255, 255, 255, 0.4); pointer-events: none; }
.saas-card::before { content: ''; position: absolute; top: 0; left: 10%; right: 10%; height: 2px; background: var(--brand-gradient); border-radius: 2px 2px 0 0; opacity: 0; transform: translateY(-2px) scaleX(0.5); transition: all var(--dur-med) var(--spring-bouncy); }
.saas-card:hover { transform: translateY(-6px) translateZ(20px); box-shadow: var(--shadow-lg); background: var(--surface-solid); border-color: var(--border-strong); z-index: 10; }
.saas-card:hover::before { opacity: 1; transform: translateY(0) scaleX(1); }

.saas-card-header { display: flex; align-items: center; gap: 16px; padding-bottom: 20px; border-bottom: 1px solid var(--border-subtle); }
.saas-card-icon { width: 32px; height: 32px; padding: 6px; background: var(--brand-surface); color: var(--brand-primary); border-radius: 8px; box-shadow: inset 0 0 0 1px var(--brand-glow); transition: transform var(--dur-med) var(--spring-bouncy); }
.saas-card:hover .saas-card-icon { transform: scale(1.15) rotate(-5deg); } /* New: Magnetic tilt animation on card hover */
.saas-card-title { font-size: 1.2rem; font-weight: 700; letter-spacing: -0.02em; color: var(--text-main); margin: 0; }

.saas-field { display: flex; flex-direction: column; gap: 10px; position: relative; }
.saas-label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); transition: color var(--dur-fast) var(--spring-smooth), transform var(--dur-fast) var(--spring-smooth); transform-origin: left; }
.saas-field:focus-within .saas-label { color: var(--brand-primary); transform: translateY(-2px); } /* Added tiny label bounce */

.saas-input { appearance: none; -webkit-appearance: none; width: 100%; padding: 14px 16px; font-size: 1rem; font-family: inherit; font-weight: 500; color: var(--text-main); background: var(--surface-muted); border: 1px solid var(--border-default); border-radius: var(--radius-md); box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); transition: all var(--dur-med) var(--spring-smooth); }
.saas-input::placeholder { color: oklch(0.7 0.02 250); font-weight: 400; }
.saas-input:hover { background: var(--surface-base); border-color: var(--border-strong); }
.saas-input:focus { outline: none; background: var(--surface-solid); border-color: var(--brand-primary); box-shadow: 0 0 0 4px var(--brand-glow), 0 4px 12px -2px rgba(0,0,0,0.05); transform: translateY(-2px); }
select.saas-input { cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' viewBox='0 0 24 24' stroke='rgba(113, 113, 122, 1)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M8 9l4-4 4 4m0 6l-4 4-4-4'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 16px center; padding-right: 48px; transition: all var(--dur-med) var(--spring-bouncy); }
select.saas-input:active { transform: scale(0.98); } /* Squish dropdowns */

.saas-toggle-wrapper { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border: 1px solid var(--border-default); border-radius: var(--radius-md); background: var(--surface-muted); transition: all var(--dur-med) ease; }
.saas-toggle-wrapper:hover { background: var(--surface-base); }
.saas-toggle { appearance: none; -webkit-appearance: none; width: 52px; height: 32px; background: var(--border-strong); border-radius: var(--radius-pill); position: relative; cursor: pointer; outline: none; transition: background var(--dur-med) var(--ease-fluid); box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); }
.saas-toggle::after { content: ''; position: absolute; top: 2px; left: 2px; width: 28px; height: 28px; background: #ffffff; border-radius: 50%; box-shadow: 0 4px 8px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.1), inset 0 -1px 1px rgba(0,0,0,0.05); transition: all 0.5s var(--spring-bouncy); }
.saas-toggle:active::after { width: 36px; }
.saas-toggle:checked { background: var(--brand-primary); }
.saas-toggle:checked::after { transform: translateX(20px); }
.saas-toggle:checked:active::after { transform: translateX(12px); }

.saas-tag-input-group { display: flex; gap: 12px; }
.saas-tag-btn { background: var(--surface-muted); border: 1px solid var(--border-default); color: var(--text-main); font-weight: 600; font-size: 0.95rem; padding: 0 24px; border-radius: var(--radius-md); cursor: pointer; transition: all var(--dur-fast) var(--spring-smooth); }
.saas-tag-btn:hover { background: var(--surface-elevated); border-color: var(--border-strong); transform: translateY(-2px); box-shadow: var(--shadow-sm); }
.saas-tag-btn:active { transform: translateY(0) scale(0.96); }
.saas-tags-area { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }

/* Enhanced Chips */
.saas-chip { background: var(--brand-surface); color: var(--brand-hover); padding: 8px 16px; border-radius: var(--radius-pill); font-size: 0.85rem; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; border: 1px solid var(--brand-glow); animation: springPop var(--dur-slow) var(--spring-bouncy) forwards; transition: all var(--dur-fast) var(--spring-smooth); cursor: default; }
.saas-chip:hover { background: var(--brand-primary); color: #ffffff; transform: translateY(-2px); box-shadow: 0 4px 12px var(--brand-glow); }
.saas-chip:active { transform: translateY(0) scale(0.95); } /* New: Squish physics */
.saas-chip span { cursor: pointer; opacity: 0.6; transition: opacity 0.2s, transform 0.2s; display: flex; align-items: center; }
.saas-chip:hover span { opacity: 1; }
.saas-chip span:active { transform: scale(0.8); } /* Cross icon squish */

.guardian-block { background: var(--surface-muted); border: 1px solid var(--border-default); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 20px; position: relative; transition: all var(--dur-med) var(--spring-smooth); animation: fadeSlideDown var(--dur-med) var(--spring-smooth) forwards; }
.guardian-block:hover { background: var(--surface-base); border-color: var(--border-strong); transform: translateY(-2px); box-shadow: var(--shadow-sm); } /* Lift effect */
.guardian-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; font-weight: 700; font-size: 1.05rem; color: var(--text-main); }
.btn-remove-g { background: var(--danger-surface); color: var(--danger-base); border: 1px solid transparent; padding: 6px 14px; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all var(--dur-fast) var(--spring-smooth); }
.btn-remove-g:hover { background: var(--danger-base); color: #ffffff; transform: scale(1.05); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2); }
.btn-remove-g:active { transform: scale(0.95); }
.btn-add-g { background: transparent; border: 2px dashed var(--border-strong); color: var(--text-muted); width: 100%; padding: 20px; border-radius: var(--radius-lg); font-weight: 600; font-size: 1rem; cursor: pointer; transition: all var(--dur-med) var(--spring-smooth); display: flex; align-items: center; justify-content: center; gap: 12px; }
.btn-add-g:hover { background: var(--brand-surface); border-color: var(--brand-primary); border-style: solid; color: var(--brand-primary); transform: translateY(-2px); }
.btn-add-g:active { transform: translateY(1px) scale(0.98); }

.saas-command-bar { position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%) translateY(100px); background: rgba(255, 255, 255, 0.65); backdrop-filter: blur(48px) saturate(200%); -webkit-backdrop-filter: blur(48px) saturate(200%); border: 1px solid rgba(255, 255, 255, 0.8); box-shadow: var(--shadow-float); padding: 16px 24px; border-radius: var(--radius-pill); display: flex; gap: 16px; align-items: center; z-index: 1000; animation: commandBarRise 0.8s var(--spring-bouncy) forwards 0.8s; will-change: transform; }
.saas-command-bar::after { content: ''; position: absolute; inset: 0; border-radius: inherit; box-shadow: inset 0 1px 1px rgba(255, 255, 255, 1); pointer-events: none; }

.btn-outline { background: rgba(255, 255, 255, 0.5); border: 1px solid var(--border-default); color: var(--text-main); padding: 14px 28px; border-radius: var(--radius-pill); font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: all var(--dur-fast) var(--spring-smooth); }
.btn-outline:hover { background: var(--surface-solid); border-color: var(--border-strong); transform: translateY(-2px); box-shadow: var(--shadow-sm); }
.btn-outline:active { transform: translateY(0) scale(0.96); }

.btn-solid { position: relative; background: var(--brand-primary); color: #ffffff; border: none; padding: 14px 36px; border-radius: var(--radius-pill); font-weight: 700; font-size: 1rem; cursor: pointer; overflow: hidden; box-shadow: 0 8px 16px -4px var(--brand-glow), inset 0 1px 1px rgba(255, 255, 255, 0.3); transition: all var(--dur-fast) var(--spring-smooth); display: flex; align-items: center; gap: 10px; }
.btn-solid::before { content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent); transform: skewX(-20deg); transition: none; }
.btn-solid:hover { background: var(--brand-hover); transform: translateY(-3px) scale(1.02); box-shadow: 0 16px 32px -8px rgba(79, 70, 229, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.4); }
.btn-solid:hover::before { animation: shimmerSwipe 0.8s ease forwards; }
.btn-solid:active { transform: translateY(1px) scale(0.96); box-shadow: 0 2px 4px -1px var(--brand-glow), inset 0 2px 4px rgba(0, 0, 0, 0.2); }

@keyframes workspaceEnter { 0% { opacity: 0; transform: scale(0.98) translateY(20px); filter: blur(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); } }
@keyframes fadeSlideUp { 0% { opacity: 0; transform: translateY(30px); filter: blur(4px); } 100% { opacity: 1; transform: translateY(0); filter: blur(0); } }
@keyframes fadeSlideDown { 0% { opacity: 0; transform: translateY(-20px); filter: blur(4px); } 100% { opacity: 1; transform: translateY(0); filter: blur(0); } }
@keyframes textShine { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }
@keyframes pulseGlow { 0% { transform: scale(0.95); opacity: 0.5; } 100% { transform: scale(1.05); opacity: 1; } }
@keyframes springPop { 0% { opacity: 0; transform: scale(0.5); } 70% { transform: scale(1.1); } 100% { opacity: 1; transform: scale(1); } }
@keyframes commandBarRise { 0% { opacity: 0; transform: translateX(-50%) translateY(100px); } 100% { opacity: 1; transform: translateX(-50%) translateY(0); } }
@keyframes shimmerSwipe { 0% { left: -100%; } 100% { left: 200%; } }

@media (max-width: 768px) { .saas-workspace { padding: 24px 16px 140px 16px; } .saas-grid { grid-template-columns: 1fr; gap: 24px; } .saas-col-span-2 { grid-column: span 1; } .saas-header { margin-bottom: 32px; } .saas-dropzone { padding: 32px 20px; } .saas-card { padding: 24px; } .saas-command-bar { width: calc(100% - 32px), position: fixed; right: 100px justify-content: space-between; padding: 12px 16px; } .btn-outline, .btn-solid { padding: 12px 20px; font-size: 0.9rem; } }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; } .saas-card:hover { transform: none; } .btn-solid:hover { transform: none; } }
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) { .saas-card, .saas-dropzone, .guardian-block, .saas-command-bar, .saas-input, .saas-toggle-wrapper { border-width: 0.5px; } 
}
      @import url('https://fonts.googleapis.com/css?family=Poppins');
      body.modal-active-body .saas-workspace {
        transform: scale(0.96) translateY(10px); filter: blur(4px); opacity: 0.6; pointer-events: none;}
      .saas-workspace {
        transition: transform 0.6s cubic-bezier(0.32, 0.72, 0, 1), filter 0.6s ease, opacity 0.6s ease;
        transform-origin: top center;
        max-width: 1000px; margin: 0 auto;}
      .bulk-trigger-card {
        background: linear-gradient(135deg, #f8fafc, #f1f5f9);
        border-radius: 24px; padding: 32px; text-align: center; border: 1px solid rgba(0,0,0,0.05);
        cursor: pointer; transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        margin-bottom: 32px; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);}
      .bulk-trigger-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px -12px rgba(67, 97, 238, 0.15); border-color: rgba(67, 97, 238, 0.2); }
      .bulk-icon { font-size: 3.5rem; display: block; margin-bottom: 12px; transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
      .bulk-trigger-card:hover .bulk-icon { transform: scale(1.1) translateY(-5px) rotate(5deg); }
      .bulk-trigger-title { font-size: 1.4rem;font-family:Poppins; font-weight: 700; color: #0f172a; margin-bottom: 8px; font-family: 'Plus Jakarta Sans', sans-serif;}
      .bulk-trigger-desc { color: #64748b; font-size: 0.95rem; margin-bottom: 0; }
      .bulk-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.0); backdrop-filter: blur(0px); -webkit-backdrop-filter: blur(0px);
        z-index: 100000; opacity: 0; pointer-events: none; transition: all 0.5s cubic-bezier(0.32, 0.72, 0, 1); 
        display: flex; justify-content: center; align-items: center; perspective: 1000px; font-family: 'Plus Jakarta Sans', sans-serif;}
      .bulk-overlay.active { opacity: 1; pointer-events: auto; background: rgba(0,0,0,0.4); backdrop-filter: blur(24px) saturate(180%); -webkit-backdrop-filter: blur(24px); }
      .bulk-modal { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px);
        width: 90%; max-width: 600px; border-radius: 36px; 
        box-shadow: 0 50px 100px -20px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,1); 
        display: flex; flex-direction: column; overflow: hidden; border: 1px solid rgba(255,255,255,0.6);
        transform: scale(0.85) translateY(60px) rotateX(10deg); opacity: 0; 
        transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); transform-origin: center bottom;
      }
      .bulk-overlay.active .bulk-modal { transform: scale(1) translateY(0) rotateX(0deg); opacity: 1; }
      
      .bulk-header { padding: 32px 40px; border-bottom: 1px solid rgba(0,0,0,0.05); background: rgba(255,255,255,0.4); display: flex; justify-content: space-between; align-items: center; }
      .bulk-close { background: #f1f5f9; border: none; width: 40px; height: 40px; border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; color: #475569; font-size: 1.2rem; transition: 0.2s; }
      .bulk-close:hover { background: #e2e8f0; transform: scale(1.1) rotate(90deg); color: #0f172a;}
      .bulk-body { padding: 32px 40px; }

      .bulk-drop-zone { 
        border: 2px dashed #cbd5e1; border-radius: 28px; padding: 50px 20px; text-align: center; 
        background: #f8fafc; cursor: pointer; transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); 
        position: relative; margin-bottom: 24px; overflow: hidden;
      }
      .bulk-drop-zone:hover { border-color: var(--brand-primary, #4361ee); background: #eef2ff; transform: scale(1.01); }
      .bulk-drop-zone input[type="file"] { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; z-index: 10; }
      
      .bulk-status-box { display: none; margin-top: 12px; text-align: center; background: #f8fafc; padding: 32px; border-radius: 28px; border: 1px solid #e2e8f0; }
      .bulk-prog-wrap { width: 100%; height: 12px; background: #e2e8f0; border-radius: 6px; overflow: hidden; margin: 20px 0; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05); }
      .bulk-prog-fill { height: 100%; width: 0%; background: linear-gradient(135deg, #10b981, #059669); transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); border-radius: 6px; }
      .bulk-btn { width: 100%; padding: 18px; border-radius: 100px; border: none; background: linear-gradient(135deg, #10b981, #059669); color: white; font-weight: 800; font-size: 1.05rem; cursor: pointer; transition: 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3); font-family: inherit;}
      .bulk-btn:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(16, 185, 129, 0.4); }
    
`;
export  const csss = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        /* 💎 One UI / VisionOS Premium Styling */
        .snap-theme-container { 
          --brand-primary: #4361ee; 
          --brand-gradient: linear-gradient(135deg, #4361ee, #3a0ca3);
          --surface-glass: rgba(255, 255, 255, 0.65);
          --surface-solid: #ffffff;
          --surface-hover: rgba(255, 255, 255, 0.85);
          --border-glass: rgba(255, 255, 255, 0.6);
          --text-main: #0f172a; 
          --text-muted: #64748b; 
          --shadow-soft: 0 10px 40px -10px rgba(0,0,0,0.06);
          --shadow-float: 0 24px 48px -12px rgba(0,0,0,0.12);
          --spring-bouncy: cubic-bezier(0.34, 1.56, 0.64, 1);
          --spring-smooth: cubic-bezier(0.16, 1, 0.3, 1);
          
          max-width: 1140px; margin: 0 auto; padding: 30px 20px 100px 20px; 
          font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; 
          color-scheme: light !important; color: var(--text-main); 
          animation: slideUpFade 0.8s var(--spring-smooth) forwards;
          
          /* 3D Depth Setup */
          transition: transform 0.6s var(--spring-smooth), filter 0.6s ease, opacity 0.6s ease;
          transform-origin: top center;
        }

        /* 💎 3D Push-Back Effect Triggered by Body Class */
        body.modal-active-body .snap-theme-container {
          transform: scale(0.96) translateY(10px);
          filter: blur(4px);
          opacity: 0.6;
          pointer-events: none;
        }

        @keyframes slideUpFade { 
          from { opacity: 0; transform: translateY(30px) scale(0.98); } 
          to { opacity: 1; transform: translateY(0) scale(1); } 
        }

        .snap-header { margin-bottom: 32px; padding-left: 8px; }
        .snap-header h2 { font-size: 2.5rem; font-weight: 800; margin: 0 0 4px 0; letter-spacing: -0.04em; color: #020617; }
        .snap-header p { font-size: 1.05rem; font-weight: 500; color: var(--text-muted); margin: 0; }
        
        .snap-controls { 
          display: flex; gap: 16px; margin-bottom: 40px; flex-wrap: wrap; 
          background: var(--surface-glass); backdrop-filter: blur(24px) saturate(180%); -webkit-backdrop-filter: blur(24px);
          padding: 12px; border-radius: 100px; border: 1px solid var(--border-glass); 
          box-shadow: var(--shadow-soft); align-items: center;
        }
        .snap-search-wrap { position: relative; flex: 2; min-width: 250px; }
        .snap-search-wrap svg { position: absolute; left: 20px; top: 50%; transform: translateY(-50%); width: 20px; color: #94a3b8; transition: 0.3s; }
        .snap-search { 
          width: 100%; padding: 16px 20px 16px 48px; border: none; border-radius: 50px; 
          font-family: inherit; font-size: 0.95rem; font-weight: 500; background: rgba(255,255,255,0.5); 
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); transition: all 0.3s var(--spring-bouncy); box-sizing: border-box; 
        }
        .snap-search:focus { outline: none; background: #fff; box-shadow: 0 0 0 4px rgba(67, 97, 238, 0.15); }
        .snap-search-wrap:focus-within svg { color: var(--brand-primary); }
        .snap-filter { 
          flex: 1; min-width: 180px; padding: 16px 24px; border: none; border-radius: 50px; 
          font-family: inherit; font-size: 0.95rem; font-weight: 600; 
          background: rgba(255,255,255,0.5); color: var(--text-main); cursor: pointer; transition: all 0.3s var(--spring-bouncy); appearance: none;
        }
        .snap-filter:hover, .snap-filter:focus { outline: none; background: #fff; box-shadow: 0 0 0 4px rgba(67, 97, 238, 0.15); }

        .snap-school-block { 
          background: var(--surface-glass); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--border-glass); border-radius: 32px; margin-bottom: 24px; overflow: hidden; 
          box-shadow: var(--shadow-soft); transition: all 0.4s var(--spring-smooth); 
        }
        .snap-school-trigger { padding: 24px 32px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: background 0.3s ease; }
        .snap-school-trigger:hover { background: var(--surface-hover); }
        .snap-school-info h3 { margin: 0 0 8px 0; font-size: 1.25rem; font-weight: 800; color: var(--text-main); letter-spacing: -0.02em; }
        .snap-school-badge { display: inline-block; padding: 6px 14px; background: rgba(67, 97, 238, 0.1); color: var(--brand-primary); border-radius: 20px; font-size: 0.8rem; font-weight: 700; }
        .snap-school-metrics { display: flex; align-items: center; gap: 32px; }
        .snap-metric { text-align: right; }
        .snap-metric-val { display: block; font-size: 1.4rem; font-weight: 800; color: var(--text-main); letter-spacing: -0.02em; }
        .snap-metric-lbl { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }
        .snap-arrow { color: #94a3b8; transition: transform 0.5s var(--spring-bouncy); background: #f1f5f9; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .snap-school-block.active .snap-arrow { transform: rotate(180deg); background: var(--brand-primary); color: white; box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3); }
        
        .snap-school-content { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.5s var(--spring-smooth); background: rgba(248, 250, 252, 0.5); }
        .snap-school-block.active .snap-school-content { grid-template-rows: 1fr; border-top: 1px solid var(--border-glass); }
        .snap-school-content-inner { overflow: hidden; }
        
        .snap-student-grid { padding: 32px; display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
        .snap-student-card { 
          background: var(--surface-solid); border: 1px solid #f1f5f9; border-radius: 24px; padding: 20px; 
          cursor: pointer; transition: all 0.4s var(--spring-bouncy); box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }
        .snap-student-card:hover { transform: translateY(-6px) scale(1.02); box-shadow: var(--shadow-float); border-color: rgba(67, 97, 238, 0.2); }
        .snap-student-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .snap-avatar { width: 48px; height: 48px; border-radius: 16px; background: var(--brand-gradient); color: white; display: flex; justify-content: center; align-items: center; font-weight: 800; font-size: 1.2rem; flex-shrink: 0; box-shadow: 0 4px 12px rgba(67, 97, 238, 0.25); }
        .snap-student-name { font-weight: 800; font-size: 1.1rem; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px;}
        .snap-student-meta { font-size: 0.85rem; color: var(--text-muted); font-weight: 600; }
        .snap-progress-track { height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; margin-bottom: 20px; }
        .snap-progress-fill { height: 100%; background: var(--brand-gradient); border-radius: 4px; transition: width 1s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .snap-task-list { max-height: 130px; overflow-y: auto; padding-right: 8px; }
        .snap-task-list::-webkit-scrollbar { width: 4px; }
        .snap-task-list::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .snap-task-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f8fafc; }
        .snap-task-item:last-child { border-bottom: none; }
        .snap-task-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .snap-task-title { font-size: 0.9rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #334155; }
        
        /* 💎 EXTRAORDINARY MODAL ANIMATIONS (3D Depth & Spring) */
        .tm-backdrop, .td-overlay { 
          position: fixed; inset: 0; background: rgba(0,0,0,0.0); 
          backdrop-filter: blur(0px); -webkit-backdrop-filter: blur(0px); 
          z-index: 100000; opacity: 0; pointer-events: none; 
          transition: all 0.5s cubic-bezier(0.32, 0.72, 0, 1); 
          display: flex; justify-content: center; align-items: center; 
          perspective: 1000px; /* Enables 3D space */
        }
        .tm-backdrop.active, .td-overlay.active { 
          opacity: 1; pointer-events: auto; 
          background: rgba(0,0,0,0.3);
          backdrop-filter: blur(24px) saturate(180%); -webkit-backdrop-filter: blur(24px) saturate(180%);
        }
        
        .tm-modal, .td-modal { 
          background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px);
          width: 90%; max-height: 85vh; border-radius: 36px; 
          box-shadow: 0 50px 100px -20px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,1); 
          display: flex; flex-direction: column; overflow: hidden; 
          border: 1px solid var(--border-glass);
          transform: scale(0.85) translateY(60px) rotateX(10deg); 
          opacity: 0; 
          transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-origin: center bottom;
        }
        .tm-backdrop.active .tm-modal, .td-overlay.active .td-modal { 
          transform: scale(1) translateY(0) rotateX(0deg); 
          opacity: 1; 
        }
        .tm-modal { max-width: 850px; }
        .td-modal { max-width: 650px; }
        
        .tm-header, .td-header { padding: 32px 40px; border-bottom: 1px solid rgba(0,0,0,0.05); background: rgba(255,255,255,0.4); display: flex; justify-content: space-between; align-items: center; }
        .tm-header h3, .td-header h3 { margin: 0; font-size: 1.6rem; font-weight: 800; color: var(--text-main); letter-spacing: -0.03em;}
        .tm-close { background: #f1f5f9; border: none; width: 40px; height: 40px; border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; color: #475569; font-size: 1.2rem; transition: 0.2s; }
        .tm-close:hover { background: #e2e8f0; transform: scale(1.1) rotate(90deg); color: #0f172a;}
        
        .tm-body, .td-body { padding: 32px 40px; overflow-y: auto; flex: 1; }
        
        /* Modal Inner Rows */
        .tm-task-row { background: var(--surface-solid); border: 1px solid #f1f5f9; border-radius: 20px; padding: 20px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; transition: 0.3s var(--spring-bouncy); box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
        .tm-task-row:hover { border-color: #cbd5e1; box-shadow: 0 10px 24px rgba(0,0,0,0.06); transform: translateY(-2px); }
        .tm-task-info h4 { margin: 0 0 8px 0; font-size: 1.15rem; font-weight: 800; color: var(--text-main); cursor: pointer; display: inline-block; transition: color 0.2s; }
        .tm-task-info h4:hover { color: var(--brand-primary); text-decoration: underline; }
        .tm-badge { padding: 6px 12px; border-radius: 100px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        .badge-assigned { background: #f1f5f9; color: #475569; }
        .badge-progress { background: #e0e7ff; color: #4361ee; }
        .badge-completed { background: #dcfce7; color: #059669; }
        .badge-diff { background: #fef9c3; color: #a16207; margin-left: 8px; }
        
        .tm-actions { display: flex; gap: 12px; }
        .tm-btn { padding: 10px 20px; border-radius: 12px; font-size: 0.85rem; font-weight: 700; cursor: pointer; border: none; transition: 0.2s; }
        .tm-btn-edit { background: #f1f5f9; color: #334155; }
        .tm-btn-edit:hover { background: var(--text-main); color: white; }
        .tm-btn-del { background: #fee2e2; color: #dc2626; }
        .tm-btn-del:hover { background: #ef4444; color: white; }
        
        .tm-edit-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr auto; gap: 12px; width: 100%; align-items: center; }
        .tm-input { padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 12px; font-family: inherit; font-size: 0.95rem; font-weight: 600; width: 100%; box-sizing: border-box; background: #f8fafc; transition: 0.2s; outline: none;}
        .tm-input:focus { border-color: var(--brand-primary); background: #fff; box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15); }
        .td-progress-wrap { height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; margin: 12px 0 24px 0; }
        /* 💎 Hardcoded gradient so it works outside the parent container */
        .td-progress-fill { height: 100%; background: linear-gradient(135deg, #4361ee, #3a0ca3); width: 0%; transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1); border-radius: 5px; }
        @media (max-width: 900px) { .tm-edit-grid { grid-template-columns: 1fr; } }
      </style>
    `;