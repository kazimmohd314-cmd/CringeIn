# CringeIn

A chaotic LinkedIn parody made by someone who is clearly in on the joke. Simple screen, loud personality. Gen Z, not corporate.

---

## ✨ Features & Design Direction

- **Dark Mode by Default**: `#0E0E0E` background with `#F2F0E8` off-white text (follows system light mode when enabled).
- **Two Accent Colors**:
  - **LinkedIn Blue** (`#0A66C2`): Used for the "cringe" side (To LinkedIn).
  - **Acid Lime** (`#C8FF3D`): Used for the "real" side (To Real).
- **Reactive Background Tint**: Soft radial tint behind the input that smoothly cross-fades between blue and lime.
- **Header Wordmark**: Huge (56px) `Bricolage Grotesque` display typography with letter-by-letter bounce-in stagger. The `"In"` sits in a rotated 3° blue logo box.
- **Slow Marquee Strip**: Scrolling LinkedIn clichés in low-contrast uppercase (*"THRILLED TO ANNOUNCE ★ HUMBLED ★ JOURNEY ★ AGREE? ★"*).
- **Chunky Mode Toggle**: 2px bordered pill buttons with spring physics.
- **Physical Key Button**: 56px tall with a hard offset shadow (`4px 4px 0`) that collapses on press as the button travels 4px down-right.
- **Two Distinct Output Cards**:
  - **To LinkedIn**: Fake LinkedIn feed post with avatar blob, `"Rahul S. • 1st"`, timestamp, clean sans body text, line-art reaction icons, and live reaction counter ticking up from 0.
  - **To Real**: Acid lime sticky note titled 1° with handwriting typography (`Caveat`) that slaps down with a bounce.
- **Film Grain**: Subtle 4% SVG noise texture across the whole page.
- **Tap Reaction**: Tapping anywhere on the card pops a tiny decorative heart.
- **Microcopy with Attitude**:
  - Buttons: *"Make it LinkedIn"* / *"What do they mean"*
  - Empty input: *"Kuch likh toh pehle"*
  - Loading: *"Rahul is typing a humble post..."*
  - Copy: *"Copied. Go post it, coward."*
- **Haptics**: `navigator.vibrate(10)` on button press and output arrival.

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Provide Gemini or Groq API Keys in .env:
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key

# 3. Start development server
npm run dev
```

Server runs at `http://localhost:5173`.
CringeIn works 100% offline out-of-the-box with its built-in satire engine if no API keys are configured.

---

## 🚢 Deployment

### Vercel
```bash
vercel
```

### Netlify
```bash
netlify deploy --build
```
Configuration is pre-set in `vercel.json` and `netlify.toml`.
