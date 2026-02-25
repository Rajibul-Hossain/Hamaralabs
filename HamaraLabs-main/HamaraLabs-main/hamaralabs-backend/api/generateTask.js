// api/generateTask.js
const cors = require('cors')({ origin: true });
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check if API Key exists before doing anything
  const API_KEY = process.env.gemikey;
  if (!API_KEY) {
    return res.status(500).json({ 
      error: 'SERVER_ERROR', 
      details: 'GEMINI_SECURE_KEY is missing in Vercel Environment Variables.' 
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { promptText } = req.body;

    // Use a more robust fetch call
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    const data = await response.json();
    
    // Log the data to Vercel Logs for debugging
    console.log("Gemini Response:", JSON.stringify(data));

    if (data.error) {
      return res.status(400).json({ error: 'Gemini API Error', details: data.error });
    }

    res.status(200).json(data);
    
  } catch (error) {
    console.error("Internal Crash:", error.message);
    res.status(500).json({ error: 'INTERNAL_CRASH', message: error.message });
  }
}

