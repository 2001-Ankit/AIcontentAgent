import { Router } from 'express';
import Groq from 'groq-sdk';

const router = Router();

const SYSTEM_PROMPT = `You are a viral social media content strategist. Given a content idea, produce a JSON object with:

1. "captions": array of 3 objects { "tone": string, "text": string }
   - Tones must be exactly: "Bold hook", "Storytime", "Punchy CTA"
   - Each caption 60-150 chars, highly engaging, platform-agnostic base copy

2. "platforms": object with keys instagram, tiktok, facebook, youtube, x, linkedin
   - instagram: { "caption": string (≤2200 chars), "hashtags": string[] (20-30 tags) }
   - tiktok: { "caption": string (≤150 chars), "hashtags": string[] (5-10 tags) }
   - facebook: { "caption": string (conversational, 100-300 chars) }
   - youtube: { "title": string (≤70 chars, SEO), "description": string (200-400 chars), "tags": string[] }
   - x: { "tweet": string (≤280 chars, punchy) }
   - linkedin: { "post": string (professional, 150-400 chars) }

3. "imagePrompt": string — vivid, detailed prompt for Stable Diffusion / DALL-E.
   Style: photorealistic, high quality, social media-ready. NO text in image.

4. "videoPrompt": string — cinematic description for a 8-second social media reel.

5. "suggestedHashtags": string[] — 10 universal hashtags for cross-platform use.

Return ONLY valid JSON. Make all content viral, authentic, and platform-optimized with emojis where appropriate.`;

function makeGroq() {
  if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY not set in .env');
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

// SSE helper
function sseWrite(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

router.post('/text', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt?.trim()) return res.status(400).json({ error: 'Prompt is required' });

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  try {
    sseWrite(res, 'stage', { stage: 0, label: 'Understanding your idea...' });

    const groq = makeGroq();
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Create viral social media content for: "${prompt}"` },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2048,
      temperature: 0.85,
    });

    const raw = completion.choices[0].message.content;
    let content;
    try {
      content = JSON.parse(raw);
    } catch {
      throw new Error('AI returned invalid JSON — try again');
    }

    sseWrite(res, 'stage', { stage: 1, label: 'Writing caption styles...' });
    sseWrite(res, 'captions', { captions: content.captions });

    sseWrite(res, 'stage', { stage: 2, label: 'Generating your visual...' });

    // Pollinations.ai — free, no API key, returns image directly
    const imagePrompt = encodeURIComponent(
      (content.imagePrompt || prompt) + ', high quality, 4k, social media ready'
    );
    const imageUrl = `https://image.pollinations.ai/prompt/${imagePrompt}?width=1080&height=1080&nologo=true&seed=${Date.now() % 9999}`;

    sseWrite(res, 'image', { imageUrl });
    sseWrite(res, 'stage', { stage: 3, label: 'Adapting for all platforms...' });
    sseWrite(res, 'platforms', { platforms: content.platforms });

    sseWrite(res, 'complete', {
      captions: content.captions,
      platforms: content.platforms,
      imageUrl,
      imagePrompt: content.imagePrompt,
      videoPrompt: content.videoPrompt,
      suggestedHashtags: content.suggestedHashtags || [],
    });
  } catch (err) {
    sseWrite(res, 'error', { message: err.message });
  }

  res.end();
});

// Regenerate image with a different seed / custom prompt
router.post('/image', async (req, res) => {
  const { prompt, aspect = 'square' } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt required' });

  const [w, h] = aspect === 'vertical' ? [1080, 1920] : [1080, 1080];
  const encoded = encodeURIComponent(prompt + ', high quality, 4k, social media ready');
  const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=${w}&height=${h}&nologo=true&seed=${Date.now() % 9999}`;
  res.json({ imageUrl });
});

// HuggingFace video generation (free tier — can be slow)
router.post('/video', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt required' });

  const token = process.env.HF_TOKEN;
  if (!token) return res.status(400).json({ error: 'HF_TOKEN not set — add it to .env for AI video' });

  try {
    const hfRes = await fetch(
      'https://api-inference.huggingface.co/models/ali-vilab/text-to-video-ms-1.7b',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!hfRes.ok) {
      const err = await hfRes.json().catch(() => ({}));
      if (err.error?.includes('loading')) {
        return res.status(202).json({ status: 'loading', retryAfter: 20 });
      }
      throw new Error(err.error || `HuggingFace error ${hfRes.status}`);
    }

    const buffer = await hfRes.arrayBuffer();
    const b64 = Buffer.from(buffer).toString('base64');
    res.json({ videoData: `data:video/mp4;base64,${b64}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
