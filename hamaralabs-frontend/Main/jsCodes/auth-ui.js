// ============================================================================
// AUTHENTICATION UI & ANIMATION ENGINE
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
    
  // --- 1. ACCORDION TOGGLE LOGIC ---
  const expandTriggers = document.querySelectorAll(".expand-trigger");
  expandTriggers.forEach(trigger => {
    trigger.addEventListener("click", (e) => {
      const group = e.currentTarget.closest(".expand-group");
      
      // Close others
      document.querySelectorAll(".expand-group").forEach(g => {
        if (g !== group) {
          g.classList.remove("active");
          g.querySelector('.expand-trigger').setAttribute('aria-expanded', 'false');
        }
      });
      
      // Toggle current
      group.classList.toggle("active");
      const isActive = group.classList.contains("active");
      e.currentTarget.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    });
  });

  // --- 2. SNOW CANVAS ANIMATION ---
  const canvas = document.getElementById("snowCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let w, h;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    
    resize();
    window.addEventListener("resize", resize);
    
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.8 + 0.6,
      s: Math.random() * 0.6 + 0.2,
      o: Math.random() * 0.4 + 0.2
    }));
    
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(180,255,220,0.5)";
      particles.forEach(p => {
        ctx.globalAlpha = p.o;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        p.y += p.s;
        if (p.y > h) { 
          p.y = -10; 
          p.x = Math.random() * w; 
        }
      });
      requestAnimationFrame(draw);
    };
    
    requestAnimationFrame(draw);
  }

  // --- 3. PARALLAX LEAF EFFECT ---
  const leaves = document.querySelectorAll(".leaf");
  if (leaves.length > 0) {
    document.addEventListener("mousemove", (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 10;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      
      leaves.forEach((leaf, i) => {
        leaf.style.transform = `translate(${x * (i + 1)}px, ${y * (i + 1)}px) rotate(${x}deg)`;
      });
    });
  }
});