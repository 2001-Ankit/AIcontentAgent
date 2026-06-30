# Ripple Autopilot — Start Guide

## 1. Add your Groq API key

Edit `backend/.env` and set:
```
GROQ_API_KEY=gsk_your_key_here
```
Get a free key at https://console.groq.com (free tier: 14,400 req/day)

## 2. Run the backend (Terminal 1)
```
cd ripple-autopilot/backend
npm run dev
```
Backend starts at http://localhost:3001

## 3. Run the frontend (Terminal 2)
```
cd ripple-autopilot/frontend
npm run dev
```
Frontend starts at http://localhost:5173

---

## Free services used (no cost to you)

| Service | What it does | Limit |
|---|---|---|
| **Groq** (LLaMA 3.3 70B) | Generates all captions + platform copy | 14,400 req/day free |
| **Pollinations.ai** | Generates images from prompts | Unlimited, no key needed |
| **Canvas API** | Records 8s Ken Burns video in browser | Completely free, no API |

## Optional: AI Video (HuggingFace)
Add `HF_TOKEN=hf_xxx` to `backend/.env` for real AI video via HuggingFace free tier.
Get token at https://huggingface.co/settings/tokens
