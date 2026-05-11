// Vercel Serverless Function — mints a LiveAvatar session token
// API key is stored in Vercel env var LIVEAVATAR_API_KEY (never exposed to client)

export default async function handler(req, res) {
  // CORS — same-origin is fine, but allow preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const API_KEY = process.env.LIVEAVATAR_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'Server misconfigured: LIVEAVATAR_API_KEY not set' });
  }

  // Defaults: Dani (growthmindset.ai/intake). HGE's Jessica lives on a separate backend.
  //   avatar_id  eb0f7572… → mmartelli v2 (ACTIVE, IMAGE-type, Matt's updated cleaner Dani avatar)
  //   voice_id   6b986a0f… → "Elise – Warm, Natural and Engaging" (paired with Dani in LiveAvatar)
  //   context_id 47e60dd1… → "Dani - Personal AI Agent for Business" (GM-specific instructions)
  const body = req.body || {};
  const payload = {
    mode: 'FULL',
    avatar_id: body.avatar_id || 'eb0f7572-e556-464b-ad95-aeb3485e5c06',
    avatar_persona: {
      voice_id: body.voice_id || '6b986a0f-4969-45da-93ee-b03baa0e9904',
      context_id: body.context_id || '47e60dd1-e828-412a-b00a-e29e86db0484',
      language: body.language || 'en',
      // 🔒 Lock STT to English so Dani doesn't code-switch to French/Spanish mid-session
      stt_config: body.stt_config || { provider: 'deepgram', language: 'en', model: 'nova-2' },
    },
    video_settings: {
      quality: body.quality || 'high',  // 720p — downgraded from very_high; 1080p requires Business/Enterprise plan
      encoding: body.encoding || 'H264',
    },
  };

  try {
    // Step 1: create session token
    const tokenRes = await fetch('https://api.liveavatar.com/v1/sessions/token', {
      method: 'POST',
      headers: {
        'X-API-KEY': API_KEY,
        'accept': 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const tokenJson = await tokenRes.json();
    if (tokenJson.code !== 1000) {
      console.error('LiveAvatar token error:', tokenJson);
      return res.status(502).json({ error: 'Failed to create session token', details: tokenJson });
    }

    const { session_id, session_token } = tokenJson.data;

    // Step 2: start the session (returns LiveKit URL + client token)
    const startRes = await fetch('https://api.liveavatar.com/v1/sessions/start', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'authorization': `Bearer ${session_token}`,
      },
    });
    const startJson = await startRes.json();
    if (startJson.code !== 1000) {
      console.error('LiveAvatar start error:', startJson);
      return res.status(502).json({ error: 'Failed to start session', details: startJson });
    }

    // Return LiveKit connection info to the browser
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      session_id,
      session_token,
      livekit_url: startJson.data.livekit_url,
      livekit_client_token: startJson.data.livekit_client_token,
    });
  } catch (err) {
    console.error('liveavatar-token error:', err);
    return res.status(500).json({ error: 'Internal error', message: err.message });
  }
}
