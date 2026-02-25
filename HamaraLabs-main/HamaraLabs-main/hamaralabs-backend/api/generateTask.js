// api/generateTask.js
const cors = require('cors')({ origin: true });
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const API_KEY = process.env.gemikey;
  if (!API_KEY) return res.status(500).json({ error: 'API Key missing on Vercel' });

  try {
    // 1. Professional Body Parsing check
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const promptText = body.promptText || body.prompt;

    if (!promptText) {
      return res.status(400).json({ error: 'Missing promptText in request body' });
    }

    // 2. Exact Gemini 1.5 Flash API Signature
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Gemini API Error', details: data });
    }

    res.status(200).json(data);
    
  } catch (error) {
    console.error("Internal Crash:", error);
    res.status(500).json({ error: 'INTERNAL_CRASH', message: error.message });
  }
}
