import { generateOfflineLinkedInPost, generateOfflineRealMeaning } from '../src/utils/offlineTranslator';

export interface TranslateRequestBody {
  text: string;
  mode: 'to-linkedin' | 'to-real';
}

// In-memory fallbacks when Upstash Redis is not configured
const memoryIpTimestamps = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_IP = 10;
const MAX_GLOBAL_DAILY_CAP = 300;

let memoryDailyCounter = {
  date: new Date().toISOString().slice(0, 10),
  count: 0,
};

// Check & increment per-IP rate limit (Persistent Upstash Redis or In-memory fallback)
async function checkIpRateLimit(ip: string): Promise<boolean> {
  const isLocal = ip === '127.0.0.1' || ip === '::1' || ip.startsWith('127.') || ip === 'localhost';
  const maxLimit = isLocal && process.env.NODE_ENV !== 'production' ? 100 : MAX_REQUESTS_PER_IP;

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (redisUrl && redisToken) {
    try {
      const key = `ratelimit:ip:${ip.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
      // Pipeline: INCR + EXPIRE (nx) in a single REST request
      const res = await fetch(`${redisUrl}/pipeline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${redisToken}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(3000),
        body: JSON.stringify([
          ['INCR', key],
          ['EXPIRE', key, 3600, 'NX'],
        ]),
      });

      if (res.ok) {
        const results = await res.json();
        const count = results?.[0]?.result;
        if (typeof count === 'number') {
          return count <= maxLimit;
        }
      }
    } catch {
      // Fall through to memory fallback on network/redis issue
    }
  }

  // Memory fallback
  const now = Date.now();
  const timestamps = memoryIpTimestamps.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= maxLimit) {
    memoryIpTimestamps.set(ip, validTimestamps);
    return false;
  }

  validTimestamps.push(now);
  memoryIpTimestamps.set(ip, validTimestamps);
  return true;
}

// Check & increment global daily cap (300 requests/day total across all users)
async function checkGlobalDailyCap(): Promise<boolean> {
  const today = new Date().toISOString().slice(0, 10);
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (redisUrl && redisToken) {
    try {
      const key = `cap:daily:${today}`;
      const res = await fetch(`${redisUrl}/pipeline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${redisToken}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(3000),
        body: JSON.stringify([
          ['INCR', key],
          ['EXPIRE', key, 86400 * 2, 'NX'],
        ]),
      });

      if (res.ok) {
        const results = await res.json();
        const count = results?.[0]?.result;
        if (typeof count === 'number') {
          return count <= MAX_GLOBAL_DAILY_CAP;
        }
      }
    } catch {
      // Fall through to memory fallback
    }
  }

  // Memory fallback
  if (memoryDailyCounter.date !== today) {
    memoryDailyCounter = { date: today, count: 0 };
  }

  memoryDailyCounter.count += 1;
  return memoryDailyCounter.count <= MAX_GLOBAL_DAILY_CAP;
}

// Verify origin matches host or is allowed
function isAllowedOrigin(originHeader?: string, hostHeader?: string): boolean {
  if (!originHeader) return true; // Direct same-origin or server-to-server

  try {
    const originUrl = new URL(originHeader);
    const originHost = originUrl.host;

    // Allow localhost and local IP in development
    if (
      originHost.startsWith('localhost') ||
      originHost.startsWith('127.0.0.1') ||
      originHost.startsWith('192.168.')
    ) {
      return true;
    }

    if (hostHeader && originHost === hostHeader) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

export async function handleTranslation(
  body: any,
  clientIp: string = '127.0.0.1',
  originHeader?: string,
  hostHeader?: string
): Promise<{
  status: number;
  data: { result?: string; source?: 'gemini' | 'groq' | 'offline'; error?: string };
}> {
  // 1. Origin verification
  if (!isAllowedOrigin(originHeader, hostHeader)) {
    return {
      status: 403,
      data: { error: 'Forbidden' },
    };
  }

  // 2. Input validation
  const text = typeof body?.text === 'string' ? body.text.trim() : '';
  const mode = body?.mode === 'to-real' ? 'to-real' : 'to-linkedin';

  if (!text) {
    return {
      status: 200,
      data: {
        result:
          mode === 'to-linkedin'
            ? 'Thrilled to announce that I am quietly ideating in absolute focus.\n\nAgree?'
            : 'Khali tha, kuch samajh nahi aaya.',
        source: 'offline',
      },
    };
  }

  // Enforce max 1000 characters limit
  if (text.length > 1000) {
    return {
      status: 400,
      data: { error: 'Input text must be under 1000 characters.' },
    };
  }

  // 3. Per-IP rate limiting (10 requests per hour)
  const isWithinRateLimit = await checkIpRateLimit(clientIp);
  if (!isWithinRateLimit) {
    return {
      status: 429,
      data: { error: 'Thoda ruk ke try karo.' },
    };
  }

  // 4. Global daily cap check (300 requests/day total)
  const isWithinDailyCap = await checkGlobalDailyCap();
  if (!isWithinDailyCap) {
    // If daily LLM budget is exhausted, gracefully use the offline template engine
    const offlineResult =
      mode === 'to-linkedin'
        ? generateOfflineLinkedInPost(text)
        : generateOfflineRealMeaning(text);

    return {
      status: 200,
      data: {
        result: offlineResult,
        source: 'offline',
      },
    };
  }

  const systemPrompt =
    mode === 'to-linkedin'
      ? `Rewrite the user's sentence as a LinkedIn post. Keep the user's actual fact. Use typical LinkedIn habits: "Thrilled to announce", "humbled", "journey", one-line paragraphs, a fake lesson, "Agree?" at the end, 3 to 5 hashtags. Exaggerated but readable.

FACT RULES:
- Use ONLY the facts in the user's text. Do not add names, numbers, dates, companies, job titles, achievements or results that the user did not write.
- Keep every number, name, date and place exactly as written.
- If the user's sentence is vague, keep the post vague. Add style, never facts.
- To LinkedIn: add only tone, filler phrases, a generic lesson, and hashtags. The lesson must not contain new facts.
- Output only the final text.`
      : `You are a close Indian friend reading a LinkedIn post over someone's shoulder and roasting the person who wrote it. Reply in casual Hinglish, like a WhatsApp message to a friend.

STYLE:
- Roast, don't translate. Be funny, sarcastic and a little dramatic, like a meme caption.
- 1 to 3 short sentences. Max about 40 words.
- Use desi friend slang naturally (bhai, yaar, abe, scene kya hai, kya hi, matlab). Not every line, don't force it.
- Call out the LinkedIn behavior: fake humility, humblebrag, forced lessons, "agree?" bait, begging for attention.
- Roast the post and the posting habit, never the person's body, caste, religion, gender, family, health or any real vulnerability. Keep it playful, not cruel. No abuse, no slurs, no heavy swearing.
- If the post is about a layoff, job search or a loss, tone it down: tease the corporate wording, not the person's situation.

CONTENT:
- Base the roast on what the post actually says. You may exaggerate the meaning for comedy, but do not invent specific facts (numbers, company names, real people).
- Do not repeat the post back. Say what they really mean, in the funniest honest way.
- Output only the roast. No quotes, no labels, no emoji spam (one emoji max, optional).

EXAMPLES (style reference only, never copy):
Post: "Thrilled to announce I have started a new journey."
Reply: "Bhai bol de naukri mili hai, 'journey' kya hota hai. Tu Himalaya nahi ja raha."

Post: "Humbled to share that I completed a 2 hour course."
Reply: "2 ghante ka course karke 'humbled'? Certificate ke liye itna drama, abe seekh bhi liya kuch?"

Post: "Grateful for my incredible team. Agree?"
Reply: "Team ko credit sirf isliye ki comments aa jaye. 'Agree?' likh ke bheek mang raha hai bhai."`;

  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const groqKey = process.env.GROQ_API_KEY?.trim();

  // 5. Primary Model: Google Gemini API (Timeout: 8 seconds, max tokens: 300)
  if (geminiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 300,
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const candidateText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText && candidateText.trim()) {
          return {
            status: 200,
            data: {
              result: candidateText.trim(),
              source: 'gemini',
            },
          };
        }
      }
    } catch {
      // Fall through to Groq on error or timeout
    }
  }

  // 6. Secondary Model: Groq API (Timeout: 8 seconds, max tokens: 300)
  if (groqKey) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`,
        },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text },
          ],
          temperature: 0.8,
          max_tokens: 300,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const reply = json?.choices?.[0]?.message?.content;
        if (reply && reply.trim()) {
          return {
            status: 200,
            data: {
              result: reply.trim(),
              source: 'groq',
            },
          };
        }
      }
    } catch {
      // Fall through to offline template engine
    }
  }

  // 7. Last Resort: Offline Template Engine
  const offlineResult =
    mode === 'to-linkedin'
      ? generateOfflineLinkedInPost(text)
      : generateOfflineRealMeaning(text);

  return {
    status: 200,
    data: {
      result: offlineResult,
      source: 'offline',
    },
  };
}

// Universal Serverless Handler (Vercel req/res & Netlify event/context)
export async function serverlessHandler(reqOrEvent: any, resOrContext?: any): Promise<any> {
  // 1. Detect Netlify / AWS Lambda event format:
  if (reqOrEvent && reqOrEvent.httpMethod && (!resOrContext || typeof resOrContext.status !== 'function')) {
    const event = reqOrEvent;
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Method Not Allowed' }),
      };
    }

    const contentType = event.headers?.['content-type'] || event.headers?.['Content-Type'] || '';
    if (!contentType.includes('application/json')) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Content-Type must be application/json' }),
      };
    }

    const clientIp =
      event.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
      event.headers?.['client-ip'] ||
      '127.0.0.1';
    const originHeader = event.headers?.['origin'] || event.headers?.['referer'];
    const hostHeader = event.headers?.['host'];

    try {
      const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
      const response = await handleTranslation(body, clientIp, originHeader, hostHeader);
      return {
        statusCode: response.status,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response.data),
      };
    } catch {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Try again' }),
      };
    }
  }

  // 2. Standard Vercel / Express format (req, res):
  const req = reqOrEvent;
  const res = resOrContext;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Validate JSON content-type
  const contentType = (req.headers?.['content-type'] as string) || '';
  if (!contentType.includes('application/json')) {
    return res.status(400).json({ error: 'Content-Type must be application/json' });
  }

  const clientIp =
    ((req.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim()) ||
    req.headers?.['x-real-ip'] ||
    req.socket?.remoteAddress ||
    '127.0.0.1';

  const originHeader = (req.headers?.['origin'] as string) || (req.headers?.['referer'] as string);
  const hostHeader = (req.headers?.['host'] as string) || undefined;

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const response = await handleTranslation(body, clientIp, originHeader, hostHeader);
    return res.status(response.status).json(response.data);
  } catch {
    // Return generic error message only (no stack traces, no internal details)
    return res.status(500).json({ error: 'Try again' });
  }
}

export default serverlessHandler;
export const handler = serverlessHandler;
