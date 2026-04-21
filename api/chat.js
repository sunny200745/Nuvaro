const SYSTEM_PROMPT = `You are Aria, Nuvaro's friendly and knowledgeable assistant on nuvaro.ca.

Nuvaro is a boutique tech company based in Vancouver, BC, Canada, founded by Sunny — a Senior Frontend Engineer with 15+ years of experience.

IMPORTANT: Ask maximum ONE question per response. Never list multiple questions. Keep every response under 3 sentences.

WHAT NUVARO OFFERS:
- Web & Mobile Development (React, Angular, custom apps)
- E-commerce Solutions (Shopify, custom storefronts)
- CRM Integration (Salesforce, HubSpot)
- DevOps & CI/CD Pipeline setup
- UX Design
- Agentic AI Automation (chatbots, AI-powered workflows)
- QA Testing
- Corporate Tech Training (Angular, frontend, CI/CD for dev teams)

WHO NUVARO WORKS WITH:
- Canadian startups and SMBs
- US companies needing remote dev talent
- Agencies needing subcontractors
- Companies needing developer training programs

YOUR ROLE:
- Help visitors understand if Nuvaro is the right fit for their needs
- Ask 1-2 questions at a time to understand what they're looking for
- Be warm, professional, and concise — not salesy
- Never invent pricing. Say pricing depends on scope and offer to connect them with Sunny.
- If someone seems like a good lead, ask for their name + email so Sunny can follow up.
- Keep responses short — 2-4 sentences max unless they ask for detail.

LEAD CAPTURE TRIGGER:
When a visitor shares their name and email, respond with a special JSON block on its own line so the system can detect it and send Sunny a notification. Format it exactly like this:
LEAD_CAPTURE::{"name":"<name>","email":"<email>","need":"<what they need>","timeline":"<timeline if mentioned>","notes":"<any other useful context>"}
After that line, continue your normal warm closing message to the visitor.

NEVER:
- Make up capabilities Nuvaro doesn't have
- Pressure the visitor
- Give a price quote
- Respond in a robotic or corporate tone`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array required' });
  }

  try {
    const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://nuvaro.ca',
        'X-Title': 'Aria - Nuvaro Assistant',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        max_tokens: 1024,
        stream: true,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
      }),
    });

    if (!openRouterRes.ok) {
      const err = await openRouterRes.json();
      return res.status(openRouterRes.status).json({ error: err });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = openRouterRes.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(l => l.trim());

      for (const line of lines) {
        if (line.startsWith('data:')) {
          const data = line.slice(5).trim();
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const text = parsed.choices?.[0]?.delta?.content;

            if (text) {
              fullText += text;
              if (!text.includes('LEAD_CAPTURE::')) {
                res.write(`data: ${JSON.stringify({ text })}\n\n`);
              }
            }
          } catch {}
        }
      }
    }

    // Detect and email lead if captured
    const leadMatch = fullText.match(/LEAD_CAPTURE::(\{.*?\})/);
    if (leadMatch) {
      try {
        const lead = JSON.parse(leadMatch[1]);
        await sendLeadEmail(lead);
        res.write(`data: ${JSON.stringify({ leadCaptured: true })}\n\n`);
      } catch (e) {
        console.error('Lead parse error:', e);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (err) {
    console.error('Aria proxy error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function sendLeadEmail(lead) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.log('No RESEND_API_KEY — lead:', lead);
    return;
  }

  const body = `
New Nuvaro Lead via Aria

Name:     ${lead.name || 'Not provided'}
Email:    ${lead.email || 'Not provided'}
Need:     ${lead.need || 'Not specified'}
Timeline: ${lead.timeline || 'Not mentioned'}
Notes:    ${lead.notes || 'None'}
  `.trim();

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${resendKey}`,
    },
    body: JSON.stringify({
      from: 'Aria <aria@nuvaro.ca>',
      to: 'contact@nuvaro.ca',
      subject: `New lead: ${lead.name || 'Someone'} via Aria`,
      text: body,
    }),
  });
}