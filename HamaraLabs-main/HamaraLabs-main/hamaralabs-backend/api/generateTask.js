export default async function handler(req, res) {
  // 1. Force Essential Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const API_KEY = process.env.gemikey;
    if (!API_KEY) throw new Error("Missing API Key on Vercel Settings");

    // 2. Robust Body Parsing
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch(e) { throw new Error("Malformed JSON body"); }
    }
    
    const promptText = body.promptText || body.prompt;
    if (!promptText) throw new Error("No promptText provided in request");

    // 3. The Actual Call to Google
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: { 
          temperature: 0.7, 
          maxOutputTokens: 500,
          responseMimeType: "application/json" 
        }
      })
    });

    // 4. Safe Response Handling
    const textData = await response.text(); // Get raw text first to prevent "Unexpected end of JSON"
    let data;
    try {
      data = JSON.parse(textData);
    } catch (e) {
      console.error("Raw response was not JSON:", textData);
      return res.status(500).json({ error: "Google sent a non-JSON response", raw: textData });
    }

    res.status(200).json(data);

  } catch (err) {
    console.error("Backend Crash:", err.message);
    res.status(500).json({ error: 'BACKEND_CRASH', message: err.message });
  }
}
