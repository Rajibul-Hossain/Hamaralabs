export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();}
  if (req.method === 'GET') {
    return res.status(200).json({ 
      status: "Online", 
      message: "HamaraLabs TA Generation Engine is Active! 🚀",
      model: "Gemini 2.5 Flash"});}
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Please use POST.' });}
  try {
    const { promptText } = req.body;
    const API_KEY = process.env.gemikey;
    if (!API_KEY) {
      console.error("CRITICAL: Missing 'gemikey' in Vercel Environment Variables");
      return res.status(500).json({ error: 'Server configuration error.' });
    }
    if (!promptText) {
      return res.status(400).json({ error: 'Missing promptText in request payload.' });
    }
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
    const googleResponse = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: { 
          temperature: 0.7,
          response_mime_type: "application/json" }}),});
    const data = await googleResponse.json();
    if (!googleResponse.ok) {
      console.error("Gemini API Error:", data);
      return res.status(googleResponse.status).json({ error: 'Gemini API Error', details: data });}
    return res.status(200).json(data);
  } catch (error) {
    console.error("Backend Execution Error:", error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message }); }}
