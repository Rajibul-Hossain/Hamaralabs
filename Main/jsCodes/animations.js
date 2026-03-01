export function addCheckmarkAnimation(button) {
  if (button.querySelector("svg")) return;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 52 52");svg.style.width = "18px";svg.style.marginLeft = "8px";svg.style.verticalAlign = "middle";
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M14 27 L22 35 L38 18");path.setAttribute("fill", "none");
  path.setAttribute("stroke", "#0a5c2f");path.setAttribute("stroke-width", "4");path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");path.style.strokeDasharray = "50";
  path.style.strokeDashoffset = "50";path.style.transition = "stroke-dashoffset 0.6s ease";
  svg.appendChild(path);button.appendChild(svg);
  requestAnimationFrame(() => {path.style.strokeDashoffset = "0";});}
export function confettiBurst(x, y) {
  const canvas = document.createElement("canvas");canvas.style.position = "fixed";canvas.style.pointerEvents = "none";canvas.style.top = "0";
  canvas.style.left = "0";canvas.width = window.innerWidth;canvas.height = window.innerHeight;
  canvas.style.zIndex = "9999";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const particles = [];
  for (let i = 0; i < 80; i++) {
    particles.push({x, y,size: Math.random() * 6 + 4, speedX: (Math.random() - 0.5) * 10,speedY: (Math.random() - 0.5) * 10,
  color: `hsl(${Math.random()*360}, 80%, 60%)`,life: 60});}
  function animate() {ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {p.x += p.speedX; p.y += p.speedY;
      p.life--; ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);});
    if (particles.some(p => p.life > 0)) {requestAnimationFrame(animate);} else {canvas.remove();}}animate();}
export function startPremiumSparkle() {
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.pointerEvents = "none";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.zIndex = "1";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const stars = [];
  for (let i = 0; i < 40; i++) {
    stars.push({x: Math.random() * canvas.width,y: Math.random() * canvas.height,radius: Math.random() * 2,alpha: Math.random()});}
  function animate() {ctx.clearRect(0,0,canvas.width,canvas.height);stars.forEach(s => {s.alpha += (Math.random() - 0.5) * 0.02;
      ctx.globalAlpha = s.alpha;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI*2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();});
    requestAnimationFrame(animate);}animate();}
startPremiumSparkle();export const regformCSS = `
/* --- Ultra Premium Base & Variables --- */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

:root {
  --app-bg-1: #f8fafc;
  --app-bg-2: #eef2ff;
  --app-bg-3: #f1f5f9;
  --surface: rgba(255, 255, 255, 0.85);
  --surface-border: rgba(255, 255, 255, 0.6);
  --text-main: #0f172a;
  --text-muted: #64748b;
  --accent-primary: #0084ff;
  --accent-hover: #5fc2f7;
  --accent-glow: rgba(79, 70, 229, 0.2);
  --success: #10b981;
  --radius-xl: 24px;
  --radius-lg: 16px;
  --radius-md: 12px;
  --shadow-base: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
  --shadow-float: 0 20px 40px -10px rgba(79, 70, 229, 0.12), 0 10px 20px -5px rgba(0, 0, 0, 0.04);
  --spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

body {
  margin: 0;
  /* Soft, animated pearlescent background */
  background: linear-gradient(-45deg, var(--app-bg-1), var(--app-bg-2), var(--app-bg-3), #e0e7ff);
  background-size: 400% 400%;
  animation: bgShift 15s ease infinite;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
  color: var(--text-main);
}

@keyframes bgShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* --- Layout & Glassmorphism Card --- */
.page-wrapper {
  padding: 60px 20px;
  display: flex;
  justify-content: center;
  perspective: 1000px;
}

.card {
  background: var(--surface);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--surface-border);
  border-radius: var(--radius-xl);
  padding: 56px; 
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.9);
  width: 100%;
  max-width: 900px;
  animation: formReveal 0.8s var(--spring) forwards;
  transform-origin: top center;
  opacity: 0;
}

@keyframes formReveal {
  from { opacity: 0; transform: translateY(30px) scale(0.98) rotateX(-5deg); }
  to { opacity: 1; transform: translateY(0) scale(1) rotateX(0); }
}

/* --- Typography --- */
.card h2 {
  font-size: 2.25rem;
  font-weight: 800;
  margin: 0 0 40px;
  letter-spacing: -0.04em;
  /* Premium gradient text */
  background: linear-gradient(135deg, #0f172a 0%, #334155 50%, #4f46e5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
}

/* --- Interactive Sections (Focus-Within Magentism) --- */
#schoolForm .section { 
  background: #ffffff;
  border: 1.5px solid #f1f5f9;
  border-radius: var(--radius-lg);
  padding: 32px;
  margin-bottom: 28px; 
  transition: all 0.4s var(--spring);
  box-shadow: var(--shadow-base);
}

/* When a user clicks inside a section, it physically lifts and glows */
#schoolForm .section:focus-within {
  transform: translateY(-4px) scale(1.005);
  box-shadow: var(--shadow-float);
  border-color: #c7d2fe;
}

#schoolForm .section h3 {
  margin: 0 0 28px;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Animated Title Dot */
#schoolForm .section h3::before {
  content: '';
  display: block;
  width: 8px;
  height: 8px;
  background: var(--accent-primary);
  border-radius: 50%;
  box-shadow: 0 0 0 0 var(--accent-glow);
  transition: box-shadow 0.3s ease;
}

#schoolForm .section:focus-within h3::before {
  animation: pulseDot 1.5s infinite;
}

@keyframes pulseDot {
  0% { box-shadow: 0 0 0 0 var(--accent-glow); }
  70% { box-shadow: 0 0 0 8px rgba(79, 70, 229, 0); }
  100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
}

/* --- Grids --- */
#schoolForm .grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 24px;
  align-items: start;
}

/* --- True Floating Label Inputs --- */
#schoolForm .input-group {
  position: relative;
  display: flex;
  width: 100%;
  margin-bottom: 8px;
}
.align-full { grid-column: 1 / -1; }

#schoolForm .input-group input {
  width: 100%;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: var(--radius-md);
  /* Extra top padding to make room for the floating label */
  padding: 24px 16px 8px 16px; 
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-main);
  transition: all 0.3s ease;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.01);
}

#schoolForm .input-group input:hover {
  background: #ffffff;
  border-color: #cbd5e1;
}

#schoolForm .input-group input:focus {
  background: #ffffff;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 4px var(--accent-glow);
  outline: none;
}

/* Floating Label Logic */
#schoolForm .input-group label {
  position: absolute;
  left: 16px;
  top: 16px; /* Starts in the middle of the input */
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-muted);
  pointer-events: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: left top;
}

/* When input is focused, OR when it has text (not showing placeholder) -> Float it! */
#schoolForm .input-group input:focus + label,
#schoolForm .input-group input:not(:placeholder-shown) + label {
  top: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--accent-primary);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* Keep label muted if filled but not actively focused */
#schoolForm .input-group input:not(:focus):not(:placeholder-shown) + label {
  color: var(--text-muted);
}

/* --- Toggles & Checkboxes --- */
.toggle-align {
  display: flex;
  height: 100%;
  align-items: center; 
  padding-top: 6px; 
}

#schoolForm .checkbox-group label {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-main);
  user-select: none;
  transition: opacity 0.2s;
}

#schoolForm .checkbox-group label:hover { opacity: 0.8; }

/* Liquid Toggle Switch */
#schoolForm .checkbox-group input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  width: 48px;
  height: 26px;
  background: #e2e8f0;
  border-radius: 20px;
  position: relative;
  cursor: pointer;
  outline: none;
  flex-shrink: 0;
  transition: all 0.4s var(--spring);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.06);
}

#schoolForm .checkbox-group input[type="checkbox"]::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  transition: all 0.4s var(--spring);
}

#schoolForm .checkbox-group input[type="checkbox"]:checked {
  background: var(--success);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1), 0 0 0 4px rgba(16, 185, 129, 0.2);
}

#schoolForm .checkbox-group input[type="checkbox"]:checked::after {
  transform: translateX(22px);}
#schoolForm .checkbox-group.multi {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 10px;
}

#schoolForm .checkbox-group.multi input[type="checkbox"] {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 2px solid #cbd5e1;
  background: #ffffff;
  box-shadow: none;
  transition: all 0.2s ease;
}

#schoolForm .checkbox-group.multi input[type="checkbox"]::after { display: none; }

#schoolForm .checkbox-group.multi input[type="checkbox"]:checked {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E");
  background-size: 14px;
  background-position: center;
  background-repeat: no-repeat;
  animation: popIn 0.3s var(--spring);
}

@keyframes popIn {
  0% { transform: scale(0.8); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

/* --- The Shimmer Submit Button --- */
#schoolForm .submit-btn {
  position: relative;
  overflow: hidden;
  width: 100%;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #ffffff;
  border: none;
  padding: 20px;
  border-radius: var(--radius-md);
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  margin-top: 16px;
  transition: all 0.3s var(--spring);
  box-shadow: 0 10px 20px -5px rgba(15, 23, 42, 0.3);
}

/* Continuous Metallic Shimmer */
#schoolForm .submit-btn::before {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
  animation: shimmer 2.5s infinite;
  transform: skewX(-20deg);
}

@keyframes shimmer {
  100% { left: 200%; }
}

#schoolForm .submit-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px -5px rgba(15, 23, 42, 0.4);
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
}

#schoolForm .submit-btn:active {
  transform: translateY(1px) scale(0.98);
  box-shadow: 0 5px 10px -5px rgba(15, 23, 42, 0.3);
}

/* --- Responsive Adjustments --- */
@media (max-width: 768px) {
  .card { padding: 40px 24px; border-radius: 20px; }
  #schoolForm .section { padding: 24px 20px; }
  #schoolForm .grid-2 { grid-template-columns: 1fr; gap: 16px; }
  .toggle-align { padding-top: 0; margin-top: 4px; }
}`;
export const regHTML= `<div class="page-wrapper">
  <div class="card">
    <h2>School Registration</h2>
    <form id="schoolForm">
      
      <div class="section">
        <h3>School Details</h3>
        <div class="grid-2">
          <div class="input-group">
            <input type="text" id="schoolName" placeholder=" " required>
            <label>School Name *</label>
          </div>
          <div class="checkbox-group toggle-align">
            <label>
              <input type="checkbox" id="isAtl"> Is ATL School
            </label>
          </div>
        </div>
        
        <div class="grid-2">
          <div class="input-group align-full">
            <input type="text" id="addressLine" placeholder=" " required>
            <label>Address Line</label>
          </div>
          <div class="input-group align-full">
            <input type="text" id="city" placeholder=" " required>
            <label>City / District</label>
          </div>
        </div>
        
        <div class="grid-2">
          <div class="input-group">
            <input type="text" id="state" placeholder=" " required>
            <label>State / Province</label>
          </div>
          <div class="input-group">
            <input type="number" id="pincode" placeholder=" " required>
            <label>Pincode</label>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>Incharge Details</h3>
        <div class="grid-2">
          <div class="input-group">
            <input type="text" id="inFirst" placeholder=" " required>
            <label>First Name</label>
          </div>
          <div class="input-group">
            <input type="text" id="inLast" placeholder=" " required>
            <label>Last Name</label>
          </div>
          <div class="input-group">
            <input type="email" id="inEmail" placeholder=" " required>
            <label>Email</label>
          </div>
          <div class="input-group">
            <input type="text" id="inPhone" placeholder=" " required>
            <label>WhatsApp Contact</label>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>Principal Details</h3>
        <div class="grid-2">
          <div class="input-group">
            <input type="text" id="prFirst" placeholder=" " required>
            <label>First Name</label>
          </div>
          <div class="input-group">
            <input type="text" id="prLast" placeholder=" " required>
            <label>Last Name</label>
          </div>
          <div class="input-group">
            <input type="email" id="prEmail" placeholder=" " required>
            <label>Email</label>
          </div>
          <div class="input-group">
            <input type="text" id="prPhone" placeholder=" " required>
            <label>WhatsApp Contact</label>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>Correspondent Details</h3>
        <div class="checkbox-group toggle-align" style="margin-bottom: 16px;">
          <label>
            <input type="checkbox" id="sameAsPrincipal"> Same As Principal
          </label>
        </div>
        <div class="grid-2">
          <div class="input-group">
            <input type="text" id="coFirst" placeholder=" ">
            <label>First Name</label>
          </div>
          <div class="input-group">
            <input type="text" id="coLast" placeholder=" ">
            <label>Last Name</label>
          </div>
          <div class="input-group">
            <input type="email" id="coEmail" placeholder=" ">
            <label>Email</label>
          </div>
          <div class="input-group">
            <input type="text" id="coPhone" placeholder=" ">
            <label>WhatsApp Contact</label>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>Additional Details</h3>
        <div class="checkbox-group multi">
          <label><input type="checkbox" value="CBSE"> CBSE</label>
          <label><input type="checkbox" value="State"> State</label>
          <label><input type="checkbox" value="ICSE"> ICSE</label>
          <label><input type="checkbox" value="IGCSE"> IGCSE</label>
          <label><input type="checkbox" value="IB"> IB</label>
        </div>
        
        <div class="grid-2">
          <div class="input-group">
            <input type="url" id="website" placeholder=" ">
            <label>Website URL</label>
          </div>
          <div class="checkbox-group toggle-align">
            <label>
              <input type="checkbox" id="paidSubscription"> Paid Subscription
            </label>
          </div>
        </div>
      </div>

      <button type="submit" class="submit-btn">Register School</button>
    </form>
  </div>
</div>`
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
  --dur-fast: 150ms; --dur-med: 350ms; --dur-slow: 600ms;}
@media (prefers-color-scheme: dark) {
  :root {
    --bg-app: oklch(0.15 0.02 250); --surface-base: rgba(30, 30, 35, 0.6); --surface-solid: #1e1e23;
    --surface-muted: rgba(40, 40, 45, 0.4); --surface-elevated: rgba(45, 45, 50, 0.8);
    --text-main: oklch(0.95 0.01 250); --text-muted: oklch(0.7 0.02 250);
    --border-subtle: rgba(255, 255, 255, 0.05); --border-default: rgba(255, 255, 255, 0.1); --border-strong: rgba(255, 255, 255, 0.15);
    --brand-glow: oklch(0.55 0.22 260 / 0.3);
    --shadow-md: 0 8px 16px -4px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.05);
    --shadow-lg: 0 24px 48px -12px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05);
    --shadow-float: 0 32px 64px -16px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.1);}}
*, *::before, *::after { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
body { margin: 0; min-height: 100vh; background-color: var(--bg-app); color: var(--text-main); font-family: 'Inter', -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; overflow-x: hidden; background-image: radial-gradient(circle at 15% 50%, rgba(79, 70, 229, 0.04), transparent 25%), radial-gradient(circle at 85% 30%, rgba(147, 51, 234, 0.04), transparent 25%); background-attachment: fixed; }
::selection { background: var(--brand-glow); color: var(--brand-primary); }
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: var(--radius-pill); border: 3px solid var(--bg-app); background-clip: padding-box; }
::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }
.saas-workspace { max-width: 1040px; margin: 0 auto; padding: 40px 24px 160px 24px; perspective: 1200px; animation: workspaceEnter var(--dur-slow) var(--spring-smooth) backwards; }
.saas-header { margin-bottom: 48px; position: relative; z-index: 10; animation: fadeSlideDown var(--dur-med) var(--spring-smooth) backwards 0.1s; }
.saas-header h2 { font-size: clamp(2rem, 4vw, 2.75rem); font-weight: 800; letter-spacing: -0.04em; line-height: 1.1; margin: 0 0 12px 0; background: var(--brand-gradient); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: textShine 6s linear infinite; }
.saas-header p { color: var(--text-muted); font-size: 1.125rem; font-weight: 500; letter-spacing: -0.01em; margin: 0; max-width: 600px; }
.saas-dropzone { position: relative; background: var(--surface-muted); border-radius: var(--radius-xl); padding: 48px 32px; text-align: center; cursor: pointer; margin-bottom: 48px; overflow: hidden; background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='24' ry='24' stroke='%2300000015' stroke-width='4' stroke-dasharray='8%2c 12' stroke-dashoffset='0' stroke-linecap='round'/%3e%3c/svg%3e"); transition: all var(--dur-med) var(--spring-smooth); animation: fadeSlideUp var(--dur-med) var(--spring-smooth) backwards 0.2s; will-change: transform, background; }
.saas-dropzone::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at center, var(--brand-glow) 0%, transparent 60%); opacity: 0; transition: opacity var(--dur-med) ease; z-index: 0; pointer-events: none; }
.saas-dropzone > * { position: relative; z-index: 1; }
.saas-dropzone:hover { transform: translateY(-4px) scale(1.01); background-color: var(--brand-surface); box-shadow: 0 16px 32px -8px var(--brand-glow); }
.saas-dropzone:hover::before { opacity: 1; animation: pulseGlow 3s ease-in-out infinite alternate; }
.saas-dropzone svg { width: 48px; height: 48px; stroke: var(--brand-primary); stroke-width: 1.5; margin-bottom: 16px; transition: transform var(--dur-med) var(--spring-bouncy); }
.saas-dropzone:hover svg { transform: translateY(-8px) scale(1.1); }
.saas-dropzone-title { font-weight: 700; color: var(--text-main); font-size: 1.25rem; letter-spacing: -0.02em; margin-bottom: 8px; }
.saas-dropzone-subtitle { color: var(--text-muted); font-size: 0.95rem; font-weight: 500; margin: 0; }
.saas-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px; position: relative; }
.saas-col-span-2 { grid-column: span 2; }
.saas-grid:has(.saas-card:hover) .saas-card:not(:hover) { opacity: 0.6; transform: scale(0.98); filter: blur(1px); }
.saas-card { background: var(--surface-base); backdrop-filter: blur(40px) saturate(150%); -webkit-backdrop-filter: blur(40px) saturate(150%); border-radius: var(--radius-xl); padding: 32px; border: 1px solid var(--border-default); box-shadow: var(--shadow-sm); position: relative; display: flex; flex-direction: column; gap: 24px; transform-origin: center; transition: transform var(--dur-slow) var(--spring-bouncy), box-shadow var(--dur-slow) var(--spring-smooth), opacity var(--dur-slow) var(--spring-smooth), filter var(--dur-slow) var(--spring-smooth); animation: fadeSlideUp var(--dur-med) var(--spring-smooth) backwards; }
.saas-card:nth-child(1) { animation-delay: 0.3s; } .saas-card:nth-child(2) { animation-delay: 0.4s; } .saas-card:nth-child(3) { animation-delay: 0.5s; }
.saas-card::after { content: ''; position: absolute; inset: 0; border-radius: inherit; border: 1px solid rgba(255, 255, 255, 0.4); pointer-events: none; }
.saas-card::before { content: ''; position: absolute; top: 0; left: 10%; right: 10%; height: 2px; background: var(--brand-gradient); border-radius: 2px 2px 0 0; opacity: 0; transform: translateY(-2px) scaleX(0.5); transition: all var(--dur-med) var(--spring-bouncy); }
.saas-card:hover { transform: translateY(-6px) translateZ(20px); box-shadow: var(--shadow-lg); background: var(--surface-solid); border-color: var(--border-strong); z-index: 10; }
.saas-card:hover::before { opacity: 1; transform: translateY(0) scaleX(1); }
.saas-card-header { display: flex; align-items: center; gap: 16px; padding-bottom: 20px; border-bottom: 1px solid var(--border-subtle); }
.saas-card-icon { width: 32px; height: 32px; padding: 6px; background: var(--brand-surface); color: var(--brand-primary); border-radius: 8px; box-shadow: inset 0 0 0 1px var(--brand-glow); }
.saas-card-title { font-size: 1.2rem; font-weight: 700; letter-spacing: -0.02em; color: var(--text-main); margin: 0; }
.saas-field { display: flex; flex-direction: column; gap: 10px; position: relative; }
.saas-label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); transition: color var(--dur-fast) ease; }
.saas-field:focus-within .saas-label { color: var(--brand-primary); }
.saas-input { appearance: none; -webkit-appearance: none; width: 100%; padding: 14px 16px; font-size: 1rem; font-family: inherit; font-weight: 500; color: var(--text-main); background: var(--surface-muted); border: 1px solid var(--border-default); border-radius: var(--radius-md); box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); transition: all var(--dur-med) var(--spring-smooth); }
.saas-input::placeholder { color: oklch(0.7 0.02 250); font-weight: 400; }
.saas-input:hover { background: var(--surface-base); border-color: var(--border-strong); }
.saas-input:focus { outline: none; background: var(--surface-solid); border-color: var(--brand-primary); box-shadow: 0 0 0 4px var(--brand-glow), 0 4px 12px -2px rgba(0,0,0,0.05); transform: translateY(-2px); }
select.saas-input { cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' viewBox='0 0 24 24' stroke='rgba(113, 113, 122, 1)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M8 9l4-4 4 4m0 6l-4 4-4-4'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 16px center; padding-right: 48px; }
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
.saas-chip { background: var(--brand-surface); color: var(--brand-hover); padding: 8px 16px; border-radius: var(--radius-pill); font-size: 0.85rem; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; border: 1px solid var(--brand-glow); animation: springPop var(--dur-slow) var(--spring-bouncy) forwards; transition: all var(--dur-fast) var(--spring-smooth); }
.saas-chip:hover { background: var(--brand-primary); color: #ffffff; transform: translateY(-2px); box-shadow: 0 4px 12px var(--brand-glow); }
.saas-chip span { cursor: pointer; opacity: 0.6; transition: opacity 0.2s; display: flex; align-items: center; }
.saas-chip:hover span { opacity: 1; }
.guardian-block { background: var(--surface-muted); border: 1px solid var(--border-default); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 20px; position: relative; transition: all var(--dur-med) var(--spring-smooth); animation: fadeSlideDown var(--dur-med) var(--spring-smooth) forwards; }
.guardian-block:hover { background: var(--surface-base); border-color: var(--border-strong); }
.guardian-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; font-weight: 700; font-size: 1.05rem; color: var(--text-main); }
.btn-remove-g { background: var(--danger-surface); color: var(--danger-base); border: 1px solid transparent; padding: 6px 14px; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all var(--dur-fast) var(--spring-smooth); }
.btn-remove-g:hover { background: var(--danger-base); color: #ffffff; transform: scale(1.05); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2); }
.btn-add-g { background: transparent; border: 2px dashed var(--border-strong); color: var(--text-muted); width: 100%; padding: 20px; border-radius: var(--radius-lg); font-weight: 600; font-size: 1rem; cursor: pointer; transition: all var(--dur-med) var(--spring-smooth); display: flex; align-items: center; justify-content: center; gap: 12px; }
.btn-add-g:hover { background: var(--brand-surface); border-color: var(--brand-primary); border-style: solid; color: var(--brand-primary); transform: translateY(-2px); }
.btn-add-g:active { transform: translateY(1px) scale(0.98); }
.saas-command-bar { position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%) translateY(100px); background: rgba(255, 255, 255, 0.65); backdrop-filter: blur(48px) saturate(200%); -webkit-backdrop-filter: blur(48px) saturate(200%); border: 1px solid rgba(255, 255, 255, 0.8); box-shadow: var(--shadow-float); padding: 16px 24px; border-radius: var(--radius-pill); display: flex; gap: 16px; align-items: center; z-index: 1000; animation: commandBarRise 0.8s var(--spring-bouncy) forwards 0.8s; }
.saas-command-bar::after { content: ''; position: absolute; inset: 0; border-radius: inherit; box-shadow: inset 0 1px 1px rgba(255, 255, 255, 1); pointer-events: none; }
.btn-outline { background: rgba(255, 255, 255, 0.5); border: 1px solid var(--border-default); color: var(--text-main); padding: 14px 28px; border-radius: var(--radius-pill); font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: all var(--dur-fast) var(--spring-smooth); }
.btn-outline:hover { background: var(--surface-solid); border-color: var(--border-strong); transform: translateY(-2px); box-shadow: var(--shadow-sm); }
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
@media (max-width: 768px) { .saas-workspace { padding: 24px 16px 140px 16px; } .saas-grid { grid-template-columns: 1fr; gap: 24px; } .saas-col-span-2 { grid-column: span 1; } .saas-header { margin-bottom: 32px; } .saas-dropzone { padding: 32px 20px; } .saas-card { padding: 24px; } .saas-command-bar { width: calc(100% - 32px); justify-content: space-between; padding: 12px 16px; } .btn-outline, .btn-solid { padding: 12px 20px; font-size: 0.9rem; } }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; } .saas-card:hover { transform: none; } .btn-solid:hover { transform: none; } }
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) { .saas-card, .saas-dropzone, .guardian-block, .saas-command-bar, .saas-input, .saas-toggle-wrapper { border-width: 0.5px; } }`