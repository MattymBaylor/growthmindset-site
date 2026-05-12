// Vercel Serverless Function — handles HGE appointment confirmation submissions
// Logs to console for now; can wire to N8N/Sheets later

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = req.body || {};
  console.log('[HGE Confirmation]', JSON.stringify(payload));

  // TODO: Forward to N8N webhook or Google Sheet for tracking
  return res.status(200).json({ success: true, message: 'Confirmation received' });
}
