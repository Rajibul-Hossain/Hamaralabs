export async function withHyperCache({ cacheKey, container, loadingHtml, executeFetchAndBuild }) {
  const forceRefresh = window[`forceRefresh_${cacheKey}`] || false;
  window[`forceRefresh_${cacheKey}`] = false; // Reset immediately
  const cachedData = localStorage.getItem(cacheKey);
  if (cachedData && !forceRefresh) {
    try {const parsed = JSON.parse(cachedData);
      if (parsed.globals) Object.assign(window, parsed.globals);
      container.innerHTML = parsed.html;
      const header = container.querySelector('h1, h2, h3');
      if (header && !header.innerHTML.includes('Live Sync')) {
         header.innerHTML += `<span style="font-size:0.75rem; color:#007aff; background:rgba(0,122,255,0.1); padding:4px 8px; border-radius:8px; margin-left:12px; display:inline-flex; align-items:center; gap:6px;"><span style="width:6px; height:6px; background:#007aff; border-radius:50%; animation:pulse 1s infinite;"></span>Live Sync</span>`;}
    } catch(e) { console.warn("Cache read error, fetching fresh."); }} else {
    container.innerHTML = loadingHtml || `<div style="padding:40px; text-align:center; color:#8e8e93; font-weight:600;">Loading... ⏳</div>`;}
  try {const freshPayload = await executeFetchAndBuild();
    container.innerHTML = freshPayload.html;
    if (freshPayload.globals) Object.assign(window, freshPayload.globals);
    localStorage.setItem(cacheKey, JSON.stringify(freshPayload));
} catch (error) {console.error(`Global Engine Error [${cacheKey}]:`, error);
    if (!cachedData) container.innerHTML = `<div style="text-align:center; padding: 40px; color:#ff3b30; font-weight:600;">System Error. Sync failed.</div>`;}}