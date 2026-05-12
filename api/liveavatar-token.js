const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    return res.end();
  }

  // Method check
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.LIVEAVATAR_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'LIVEAVATAR_API_KEY not configured' });
  }

  // Set CORS headers on all responses
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};

    // ----- Step 1: Get session token -----
    const tokenPayload = {
      mode: 'FULL',
      avatar_id: body.avatar_id || 'eb0f7572-e556-464b-ad95-aeb3485e5c06',
      avatar_persona: {
        voice_id: body.voice_id || '6b986a0f-4969-45da-93ee-b03baa0e9904',
        context_id: body.context_id || '47e60dd1-e828-412a-b00a-e29e86db0484',
        language: body.language || 'en',
        stt_config: body.stt_config || {
          provider: 'deepgram',
          language: 'en',
          model: 'nova-2',
        },
      },
      video_settings: {
        quality: body.quality || 'high',
        encoding: body.encoding || 'H264',
      },
    };

    const tokenRes = await fetch('https://api.liveavatar.com/v1/sessions/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
      body: JSON.stringify(tokenPayload),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('Token endpoint error:', tokenRes.status, errText);
      return res.status(tokenRes.status).json({
        error: 'Failed to get session token',
        detail: errText,
      });
    }

    const tokenJson = await tokenRes.json();
    if (tokenJson.code !== 1000) {
      console.error('LiveAvatar token error:', tokenJson);
      return res.status(502).json({ error: 'Failed to create session token', details: tokenJson });
    }
    const { session_id, session_token } = tokenJson.data;

    // ----- SDK mode: return early (SDK calls /v1/sessions/start itself) -----
    if (body.sdk) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ session_id, session_token });
    }

    // ----- Legacy mode: Step 2 — start session (for raw LiveKit pages) -----
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

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      session_id,
      session_token,
      livekit_url: startJson.data.livekit_url,
      livekit_client_token: startJson.data.livekit_client_token,
    });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
}
