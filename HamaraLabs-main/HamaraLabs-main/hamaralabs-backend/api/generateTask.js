// api/generateTask.js
const cors = require('cors')({ origin: true });
export default async function handler(req, res) {
  // 1. Manually set CORS Headers (The bulletproof Vercel way)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allows your frontend to connect
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // 2. Handle the "Pre-flight" request the browser sends before a POST
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 3. Block anything that isn't a POST request (like typing the link in a browser)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use the HamaraLabs App to access this endpoint.' });
  }

  try {
    // Grab the securely hidden key from Vercel Environment Variables
    const API_KEY = process.env.GEMINI_SECURE_KEY;
    const { promptText } = req.body;

    if (!API_KEY) {
      return res.status(500).json({ error: 'API Key is missing on the server.' });
    }

    // Call Google Gemini safely from the backend
    const googleResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: { temperature: 0.7 }
      })
    });

    const data = await googleResponse.json();
    
    // Send the AI magic back to the frontend
    res.status(200).json(data);
    
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ error: 'Failed to generate task' });
  }
}
