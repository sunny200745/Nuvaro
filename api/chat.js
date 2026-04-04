export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    if (req.method === 'OPTIONS') return res.status(200).end();
  
    // Step 1 — check env var is loaded
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ debug: 'ANTHROPIC_API_KEY is missing' });
    }
    if (!apiKey.startsWith('sk-ant-')) {
      return res.status(500).json({ debug: 'Key loaded but looks wrong', preview: apiKey.slice(0, 10) });
    }
  
    // Step 2 — try reaching Anthropic (no streaming, simple call)
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 50,
          messages: [{ role: 'user', content: 'say hi' }],
        }),
      });
  
      const data = await response.json();
      return res.status(200).json({ debug: 'Anthropic reached', status: response.status, data });
  
    } catch (err) {
      return res.status(500).json({ debug: 'fetch to Anthropic failed', error: err.message });
    }
  }