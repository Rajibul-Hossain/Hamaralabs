export default async function handler(req, res) {
  // 1. Setup CORS so your frontend is allowed to talk to this backend
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // You can change '*' to your specific frontend URL later for extra security
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight requests (browsers do this automatically before a POST)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required in the request body.' });
    }

    // Grab the secret key from Vercel's Environment Variables
    const apiKey = process.env.gemikey;

    if (!apiKey) {
      console.error("Missing GEMINI_API_KEY in Vercel Environment Variables");
      return res.status(500).json({ error: 'Server configuration error.' });
    }

    // 2. Forward the request to Google Gemini
    const geminiEndpoint = `"https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
    
    const aiResponse = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
    });

    const aiData = await aiResponse.json();

    // 3. Send the raw Gemini response directly back to your frontend
    return res.status(200).json(aiData);

  } catch (error) {
    console.error("Backend Error:", error);
    return res.status(500).json({ error: 'Failed to generate mission data.' });
  }
}