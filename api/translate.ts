import { generateOfflineLinkedInPost, generateOfflineRealMeaning } from '../src/utils/offlineTranslator';

export interface TranslateRequestBody {
  text: string;
  mode: 'to-linkedin' | 'to-real';
}

// In-memory per-IP rate limiter (10 requests per hour in production)
const ipRequestTimestamps = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const isLocalhost = ip === '127.0.0.1' || ip === '::1' || ip === 'localhost';
  const maxRequests = isLocalhost ? 60 : 10;

  const now = Date.now();
  const timestamps = ipRequestTimestamps.get(ip) || [];

  // Filter timestamps within the last 1 hour
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= maxRequests) {
    ipRequestTimestamps.set(ip, validTimestamps);
    return false; // Rate limit exceeded
  }

  validTimestamps.push(now);
  ipRequestTimestamps.set(ip, validTimestamps);
  return true;
}

export async function handleTranslation(
  body: TranslateRequestBody,
  clientIp: string = '127.0.0.1'
): Promise<{
  status: number;
  data: { result?: string; source?: 'gemini' | 'groq' | 'offline'; error?: string };
}> {
  // 1. Check rate limit
  if (!checkRateLimit(clientIp)) {
    return {
      status: 429,
      data: { error: 'Thoda ruk ke try karo.' }
    };
  }

  const { text, mode } = body;
  const cleanText = (text || '').trim();

  if (!cleanText) {
    return {
      status: 200,
      data: {
        result: mode === 'to-linkedin'
          ? "Thrilled to announce that I am quietly ideating in absolute focus.\n\nAgree?"
          : "Khali tha, kuch samajh nahi aaya.",
        source: 'offline'
      }
    };
  }

  const systemPrompt =
    mode === 'to-linkedin'
      ? `Rewrite the user's sentence as a LinkedIn post. Keep the user's actual fact. Use typical LinkedIn habits: "Thrilled to announce", "humbled", "journey", one-line paragraphs, a fake lesson, "Agree?" at the end, 3 to 5 hashtags. Exaggerated but readable. Output only the post.`
      : `The user pastes a LinkedIn post. Reply with what the person actually means, in one or two blunt, funny sentences in Hinglish. Not cruel. Output only that.`;

  const userPrompt = cleanText;

  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const groqKey = process.env.GROQ_API_KEY?.trim();

  // 2. Primary: Google Gemini API (free tier)
  if (geminiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(4000),
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 500,
          }
        })
      });

      if (res.ok) {
        const json = await res.json();
        const candidateText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText && candidateText.trim()) {
          return {
            status: 200,
            data: {
              result: candidateText.trim(),
              source: 'gemini'
            }
          };
        }
      }
    } catch (geminiErr) {
      console.warn("Primary Gemini call failed, attempting fallback:", geminiErr);
    }
  }

  // 3. Secondary Fallback: Groq API (OpenAI-compatible)
  if (groqKey) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        signal: AbortSignal.timeout(4000),
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.8,
          max_tokens: 500
        })
      });

      if (res.ok) {
        const json = await res.json();
        const reply = json?.choices?.[0]?.message?.content;
        if (reply && reply.trim()) {
          return {
            status: 200,
            data: {
              result: reply.trim(),
              source: 'groq'
            }
          };
        }
      }
    } catch (groqErr) {
      console.warn("Groq fallback failed, falling back to offline engine:", groqErr);
    }
  }

  // 4. Last Resort: Offline Template Engine
  const offlineResult =
    mode === 'to-linkedin'
      ? generateOfflineLinkedInPost(cleanText)
      : generateOfflineRealMeaning(cleanText);

  return {
    status: 200,
    data: {
      result: offlineResult,
      source: 'offline'
    }
  };
}

// Serverless Handler for Vercel / Netlify
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const clientIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    '127.0.0.1';

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const response = await handleTranslation(body, clientIp);
    return res.status(response.status).json(response.data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
