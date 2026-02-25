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
    particles.push({
      x, y,size: Math.random() * 6 + 4,
      speedX: (Math.random() - 0.5) * 10,speedY: (Math.random() - 0.5) * 10,
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
    requestAnimationFrame(animate);}
  animate();}
startPremiumSparkle();
export const regformCSS = `@charset "UTF-8";
:root {--theme-bg: oklch(0.98 0.01 250);--theme-surface: rgba(255, 255, 255, 0.65);--theme-surface-solid: oklch(1 0 0);--text-main: oklch(0.2 0.01 250);--text-muted: oklch(0.6 0.02 250);
  --text-inverse: oklch(1 0 0);--accent-primary: oklch(0.55 0.2 250); --accent-primary-hover: oklch(0.5 0.2 250);--accent-success: oklch(0.65 0.2 150);--accent-error: oklch(0.6 0.2 20);--glass-border: rgba(255, 255, 255, 0.8);--glass-highlight: inset 0 1px 1px rgba(255, 255, 255, 1), 
    inset 0 -1px 1px rgba(255, 255, 255, 0.2);
  --input-border: rgba(0, 0, 0, 0.06);
  --input-glow: oklch(0.55 0.2 250 / 0.15);
  --spring-entrance: cubic-bezier(0.175, 0.885, 0.32, 1.15);
  --spring-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --spring-snappy: cubic-bezier(0.2, 0.8, 0.2, 1);
  --ease-fluid: cubic-bezier(0.25, 1, 0.5, 1);
  --radius-sm: 12px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-xl: 36px;
}

/* --- Form Container Styles --- */
.page-wrapper {
  width: 100%;

  perspective: 1500px;
}.card {
  position: relative;
  background: var(--theme-surface);
  backdrop-filter: blur(48px) saturate(200%);
  -webkit-backdrop-filter: blur(48px) saturate(200%);
  border-radius: var(--radius-xl);
  padding: 64px;
  box-shadow: 
    0 40px 80px -24px rgba(0, 0, 0, 0.15),
    0 16px 32px -12px rgba(0, 0, 0, 0.1),
    0 4px 8px -4px rgba(0, 0, 0, 0.05),
    var(--glass-highlight);
  border: 1px solid var(--glass-border);
  transform-style: preserve-3d;
  animation: floatIn 1.2s var(--spring-entrance) forwards;
  will-change: transform, opacity;
}

.card h2 {
  font-size: 2.5rem;
  font-weight: 800;
  letter-spacing: -0.05em;
  text-align: center;
  margin: 0 0 56px 0;
  color: transparent;
  background: linear-gradient(180deg, oklch(0.1 0 0) 0%, oklch(0.4 0.02 250) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  position: relative;
}

.card h2::after {
  content: '';
  position: absolute;
  bottom: -16px;
  left: 50%;
  transform: translateX(-50%);
  width: 48px;
  height: 4px;
  border-radius: 4px;
  background: var(--accent-primary);
  box-shadow: 0 2px 12px var(--input-glow);
}
#schoolForm {
  display: flex;
  flex-direction: column;
  gap: 32px;}
#schoolForm:has(input:focus, select:focus, textarea:focus) .section:not(:focus-within) {
  opacity: 0.35;
  transform: scale(0.97) translateZ(-20px);
  filter: blur(2px) grayscale(40%);
  pointer-events: none;}
.section {
  position: relative;
  background: rgba(255, 255, 255, 0.4);
  border-radius: var(--radius-lg);
  padding: 40px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 8px 24px -8px rgba(0, 0, 0, 0.04);
  transition: all 0.5s var(--spring-snappy);
  opacity: 0;
  animation: sectionReveal 0.8s var(--spring-snappy) forwards;}
.section:nth-child(1) { animation-delay: 0.1s; }
.section:nth-child(2) { animation-delay: 0.2s; }
.section:nth-child(3) { animation-delay: 0.3s; }
.section:nth-child(4) { animation-delay: 0.4s; }
.section:nth-child(5) { animation-delay: 0.5s; }
.section:focus-within {
  background: var(--theme-surface-solid);
  transform: scale(1.02) translateZ(20px);
  box-shadow: 
    0 32px 64px -16px rgba(0, 0, 0, 0.12),
    0 0 0 1px rgba(0, 113, 227, 0.1);
  z-index: 10;}
.section h3 {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-main);
  margin: 0 0 32px 0;
  display: flex;
  align-items: center;
  gap: 16px;}
.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px 32px;}
.input-group {
  position: relative;
  display: flex;
  flex-direction: column-reverse;}
.input-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 8px;
  margin-left: 4px;
  transition: color 0.3s var(--ease-fluid), transform 0.3s var(--spring-bounce);
  transform-origin: left bottom;}
#schoolForm input[type="text"],#schoolForm input[type="email"],#schoolForm input[type="number"],#schoolForm input[type="url"] {
  all: unset;
  box-sizing: border-box;
  width: 100%;
  height: 52px;
  padding: 0 20px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid var(--input-border);
  border-radius: var(--radius-md);
  font-size: 1.05rem;
  color: var(--text-main);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
  transition: all 0.4s var(--spring-bounce);}
#schoolForm input:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(0, 0, 0, 0.1);}
#schoolForm input:focus {
  background: var(--theme-surface-solid);
  border-color: var(--accent-primary);
  transform: translateY(-2px);
  box-shadow: 
    0 16px 32px -8px var(--input-glow),
    0 0 0 4px oklch(0.55 0.2 250 / 0.1),
    inset 0 1px 1px rgba(255, 255, 255, 1);}
#schoolForm input:focus + label {
  color: var(--accent-primary);
  transform: translateY(-4px) scale(1.05);}
#schoolForm label:contains('*') { 
  color: var(--text-muted); }
#schoolForm input[required] + label::after {
  content: ' *';
  color: var(--accent-error);}
.checkbox-group {
  display: flex;
  align-items: center;
  height: 52px;}
.checkbox-group:not(.multi) label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.05rem;
  user-select: none;}
.checkbox-group:not(.multi) input[type="checkbox"] {
  appearance: none;
  width: 56px;
  height: 34px;
  background: oklch(0.9 0 0);
  border-radius: 34px;
  position: relative;
  cursor: pointer;
  outline: none;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background 0.4s var(--ease-fluid);}
.checkbox-group:not(.multi) input[type="checkbox"]::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 30px;
  height: 30px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.15), 
    0 1px 2px rgba(0, 0, 0, 0.1);
  transition: all 0.5s var(--spring-bounce);}
.checkbox-group:not(.multi) input[type="checkbox"]:active::after {
  width: 40px; }
.checkbox-group:not(.multi) input[type="checkbox"]:checked {
  background: var(--accent-success);}
.checkbox-group:not(.multi) input[type="checkbox"]:checked::after {
  transform: translateX(22px);}
.checkbox-group:not(.multi) input[type="checkbox"]:checked:active::after {
  transform: translateX(12px); }
.checkbox-group.multi {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  height: auto;}
.checkbox-group.multi label {
  position: relative;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid var(--input-border);
  border-radius: var(--radius-xl);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.4s var(--spring-bounce);
  user-select: none;
  backdrop-filter: blur(8px);}
.checkbox-group.multi input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);}
.checkbox-group.multi label:hover {
  background: var(--theme-surface-solid);
  color: var(--text-main);
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.1);}
.checkbox-group.multi label:has(input[type="checkbox"]:checked) {
  background: var(--text-main);
  color: #ffffff;
  border-color: var(--text-main);
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 16px 32px -8px rgba(0, 0, 0, 0.25);}
.checkbox-group.multi label:has(input[type="checkbox"]:focus-visible) {
  outline: 3px solid var(--accent-primary);
  outline-offset: 2px;}
.submit-btn {
  all: unset;
  box-sizing: border-box;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 40px;
  padding: 24px 32px;
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #ffffff;
  background: var(--text-main);
  border-radius: var(--radius-lg);
  cursor: pointer;
  z-index: 1;
  box-shadow: 
    0 24px 48px -12px rgba(0, 0, 0, 0.3),
    inset 0 1px 1px rgba(255, 255, 255, 0.2);
  transition: all 0.5s var(--spring-bounce);}
.submit-btn::before {
  content: '';
  position: absolute;
  inset: -2px; 
  border-radius: calc(var(--radius-lg) + 2px);
  background: conic-gradient(
    from 0deg, 
    transparent 0%, 
    transparent 40%, 
    var(--accent-primary) 50%, 
    transparent 60%, 
    transparent 100%);
  z-index: -2;
  animation: spinBorder 4s linear infinite;
  opacity: 0;
  transition: opacity 0.4s ease;}
.submit-btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--text-main);
  border-radius: var(--radius-lg);
  z-index: -1;
  transition: background 0.4s ease;}
.submit-btn:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 
    0 32px 64px -16px rgba(0, 113, 227, 0.4),
    inset 0 1px 1px rgba(255, 255, 255, 0.3);}
.submit-btn:hover::before {
  opacity: 1;}
.submit-btn:hover::after {
  background: oklch(0.15 0.01 250);}
.submit-btn:active {
  transform: translateY(2px) scale(0.97);
  box-shadow: 0 8px 16px -8px rgba(0, 0, 0, 0.4);
  transition: transform 0.1s var(--spring-snappy), box-shadow 0.1s var(--spring-snappy);}
@keyframes floatIn {
  0% { 
    opacity: 0; 
    transform: rotateX(10deg) translateY(80px) scale(0.9); 
    filter: blur(12px);}
  100% { 
    opacity: 1; 
    transform: rotateX(0) translateY(0) scale(1); 
    filter: blur(0);}}
@keyframes sectionReveal {
  0% { 
    opacity: 0; 
    transform: translateY(40px) scale(0.95); 
  }
  100% { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
  }
}

@keyframes spinBorder {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .page-wrapper { padding: 16px; }
  .card { padding: 32px 24px; border-radius: var(--radius-lg); }
  .card h2 { font-size: 2rem; margin-bottom: 40px; }
  .grid-2 { grid-template-columns: 1fr; gap: 24px; }
  .section { padding: 24px; }
  .checkbox-group.multi label { flex: 1 1 calc(50% - 12px); text-align: center; }
  #schoolForm:has(input:focus, select:focus, textarea:focus) .section:not(:focus-within) {
    transform: scale(0.98); 
  }
  .section:focus-within {
    transform: scale(1.01);
  }
}`

export const regHTML= `<div class="page-wrapper">
  <div class="card">
    <h2>School Registration</h2>
    <form id="schoolForm">
      <div class="section">
        <h3>School Details</h3>
        <div class="grid-2">
          <div class="input-group">
            <input type="text" id="schoolName" required>
            <label>School Name *</label></div>
          <div class="checkbox-group">
            <label><input type="checkbox" id="isAtl">
              Is ATL School</label></div></div>
        <div class="grid-2">
          <div class="input-group">
            <input type="text" id="addressLine" required>
            <label>Address Line</label></div>
          <div class="input-group">
            <input type="text" id="city" required>
            <label>City / District</label>
          </div></div>
        <div class="grid-2">
          <div class="input-group">
            <input type="text" id="state" required>
            <label>State / Province</label></div>
          <div class="input-group">
            <input type="number" id="pincode" required>
            <label>Pincode</label></div></div></div>
      <div class="section">
        <h3>Incharge Details</h3><div class="grid-2">
          <div class="input-group"><input type="text" id="inFirst" required><label>First Name</label></div>
          <div class="input-group"><input type="text" id="inLast" required><label>Last Name</label></div>
          <div class="input-group"><input type="email" id="inEmail" required><label>Email</label></div>
          <div class="input-group"><input type="text" id="inPhone" required><label>WhatsApp Contact</label></div></div></div>
      <div class="section">
        <h3>Principal Details</h3>
        <div class="grid-2">
          <div class="input-group"><input type="text" id="prFirst" required><label>First Name</label></div>
          <div class="input-group"><input type="text" id="prLast" required><label>Last Name</label></div>
          <div class="input-group"><input type="email" id="prEmail" required><label>Email</label></div>
          <div class="input-group"><input type="text" id="prPhone" required><label>WhatsApp Contact</label></div>
        </div></div><div class="section">
        <h3>Correspondent Details</h3>
        <div class="checkbox-group"><label>
            <input type="checkbox" id="sameAsPrincipal">
            Same As Principal
          </label></div>
        <div class="grid-2">
          <div class="input-group"><input type="text" id="coFirst"><label>First Name</label></div>
          <div class="input-group"><input type="text" id="coLast"><label>Last Name</label></div>
          <div class="input-group"><input type="email" id="coEmail"><label>Email</label></div>
          <div class="input-group"><input type="text" id="coPhone"><label>WhatsApp Contact</label></div>
        </div></div>
      <div class="section">
        <h3>Additional Details</h3>
        <div class="checkbox-group multi">
          <label><input type="checkbox" value="CBSE"> CBSE</label>
          <label><input type="checkbox" value="State"> State</label>
          <label><input type="checkbox" value="ICSE"> ICSE</label>
          <label><input type="checkbox" value="IGCSE"> IGCSE</label>
          <label><input type="checkbox" value="IB"> IB</label></div>
        <div class="input-group">
          <input type="url" id="website">
          <label>Website URL</label>
        </div><div class="checkbox-group"><label>
            <input type="checkbox" id="paidSubscription">
            Paid Subscription</label></div></div>
      <button type="submit" class="submit-btn">Register School</button></form></div></div>
`