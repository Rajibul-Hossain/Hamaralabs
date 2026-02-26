export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const API_KEY = process.env.gemikey;
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const promptText = body.promptText || body.prompt;

    // Direct fetch to the most stable Google AI endpoint
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    const data = await response.json();

    // If Google sends a 400/403/500, we pass that specific info to the frontend
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: "GOOGLE_API_ERROR", 
        message: data.error?.message || "Unknown Google Error",
        status: response.status 
      });
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'BACKEND_CRASH', message: err.message });
  }
}
