# CringeIn

A chaotic LinkedIn parody web app made by someone who is clearly in on the joke. Simple screen, loud personality. Gen Z, not corporate.

---

## 🛠️ Setup

CringeIn requires two free API keys (both free tiers, no credit card required):

| Environment Variable | Provider | Purpose | Where to Get |
|---|---|---|---|
| `GEMINI_API_KEY` | Google AI Studio | Primary Model (`gemini-1.5-flash`) | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| `GROQ_API_KEY` | Groq Console | Fallback Model (`llama-3.3-70b-versatile`) | [console.groq.com](https://console.groq.com/keys) |

### 1. Local Development
Create a `.env` file in the root of the project (this file is ignored by Git and will never be committed):
```bash
cp .env.example .env
```
Fill in your own keys in `.env`:
```env
GEMINI_API_KEY=your_gemini_key_here
GROQ_API_KEY=your_groq_key_here
```

*(Optional)* For persistent serverless rate-limiting across cold starts:
```env
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token
```

### 2. Setting Keys on Hosting Platforms
- **Vercel**: Go to **Project Settings** > **Environment Variables** > Add `GEMINI_API_KEY` and `GROQ_API_KEY`.
- **Netlify**: Go to **Site Configuration** > **Environment variables** > Add `GEMINI_API_KEY` and `GROQ_API_KEY`.

---

## 🔒 Security & Abuse Protection

- **Hidden Keys**: Keys are only accessed on the server via `process.env`. They are never bundled into client JavaScript.
- **Per-IP Rate Limiting**: 10 requests per hour per IP (backed by Upstash Redis REST or sliding memory window).
- **Global Daily Cap**: Global cap of 300 LLM calls per day total. Once reached, requests seamlessly fall through to the offline template engine.
- **Input Sanitization**: Rejects payloads over 1000 characters and requires valid JSON POST requests.
- **Origin Checking**: Enforces same-origin CORS checks to block external scrapers.
- **Token Limits & Timeouts**: 300 max output tokens with an 8-second timeout per provider before falling through.

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

App runs at `http://localhost:5173`.
CringeIn works 100% offline out-of-the-box with its built-in parody engine if no API keys are present.

---

## 🚢 Production Deployment

```bash
# Deploy to Vercel:
vercel

# Or deploy to Netlify:
netlify deploy --build
```
