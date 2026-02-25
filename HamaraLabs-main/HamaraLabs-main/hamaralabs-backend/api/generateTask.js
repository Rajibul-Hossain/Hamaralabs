// api/generateTask.js
const cors = require('cors')({ origin: true });
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const API_KEY = process.env.gemikey;
    const { promptText } = req.body;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateConten?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        // 🛡️ DISABLE SAFETY FILTERS TO PREVENT SILENT ERRORS
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ],
        generationConfig: { 
            maxOutputTokens: 600,
            temperature: 0.7,
            responseMimeType: "application/json" // 💎 FORCE JSON OUTPUT
        }
      })
    });

    const data = await response.json();
    console.log("Gemini Output:", JSON.stringify(data));
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

