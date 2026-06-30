import { Router } from 'express';
import Groq from 'groq-sdk';

const router = Router();

function makeGroq() {
  if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY not set in .env');
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

function sseWrite(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

// Hashtag volume tiers for each platform
const HASHTAG_RULES = {
  instagram: `Generate exactly 30 hashtags in this mix:
    - 5 mega tags (10M+ posts, max reach): very broad e.g. #motivation #entrepreneur
    - 8 large tags (1M-10M posts): industry-wide
    - 10 medium tags (100K-1M posts): your niche
    - 7 small tags (10K-100K posts): hyper-targeted, less competition
    Order: medium → small → large → mega (best algorithm performance)`,
  tiktok: `Generate exactly 8 hashtags:
    - 2 trending/viral tags (currently popular on TikTok)
    - 3 niche tags (specific to the topic)
    - 2 medium volume tags
    - 1 branded/campaign tag
    Short, punchy, no spaces`,
  facebook: `Generate 5-8 hashtags. Facebook uses fewer hashtags. Mix of broad and niche.`,
  youtube: `Generate 15 tags (not hashtags, YouTube video tags):
    - Mix of short (1-2 words) and long-tail (3-5 words)
    - Include topic + related topics + audience intent terms`,
  x: `Generate 2-3 hashtags maximum. X (Twitter) performs best with 1-2 highly relevant tags.
    Pick trending/popular ones only.`,
  linkedin: `Generate 5 professional hashtags. LinkedIn favors:
    - Industry hashtags (#marketing #entrepreneurship)
    - Skill hashtags (#leadership #growthhacking)
    - Topic hashtags specific to the post`,
};

const TONE_PROMPTS = {
  professional: 'Authoritative, data-driven, industry expert voice. No slang.',
  casual: 'Friendly, conversational, like texting a friend. Use contractions.',
  humorous: 'Witty, clever wordplay, light sarcasm where appropriate. Make them smile.',
  inspirational: 'Uplifting, motivational, paint a vivid future. Big claims, emotional.',
  educational: 'Clear, structured, teach something valuable. Hook with a surprising fact.',
  storytelling: 'Narrative arc: setup → tension → resolution. Personal and relatable.',
};

router.post('/generate', async (req, res) => {
  const {
    topic,
    platform = 'instagram',
    audience = 'general audience',
    websiteUrl = '',
    tone = 'casual',
    captionCount = 5,
  } = req.body;

  if (!topic?.trim()) return res.status(400).json({ error: 'topic required' });

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  try {
    sseWrite(res, 'stage', { stage: 0, label: 'Analysing topic & audience...' });

    const groq = makeGroq();

    const systemPrompt = `You are a top-tier social media growth strategist. Your job is to generate viral captions, optimised hashtag sets, and link copy for ${platform}.

Platform: ${platform.toUpperCase()}
Target audience: ${audience}
Tone: ${tone} — ${TONE_PROMPTS[tone] || TONE_PROMPTS.casual}
Website URL: ${websiteUrl || '(none provided)'}

HASHTAG STRATEGY FOR ${platform.toUpperCase()}:
${HASHTAG_RULES[platform] || HASHTAG_RULES.instagram}

Return a JSON object with EXACTLY this structure:
{
  "captions": [
    {
      "id": 1,
      "caption": "full caption text with natural link placement if URL provided",
      "hook": "first line only (the scroll-stopper)",
      "cta": "the call-to-action line",
      "characterCount": 0,
      "estimatedReach": "high|medium|low",
      "whyItWorks": "one sentence explanation"
    }
    // ... repeat for ${captionCount} captions
  ],
  "hashtags": {
    "primary": ["top 5 most important hashtags"],
    "secondary": ["next tier hashtags"],
    "niche": ["long-tail, targeted hashtags"],
    "all": ["complete ordered list as per strategy above"]
  },
  "linkStrategy": {
    "linkInBioText": "short compelling text to add above link in bio (max 60 chars)",
    "utmParams": {
      "source": "${platform}",
      "medium": "social",
      "campaign": "inferred from topic (snake_case)",
      "content": "ripple_auto"
    },
    "anchorSuggestions": [
      { "anchorText": "clickable text for posts that support links", "context": "use when..." }
    ],
    "bioLinkCopy": "optimised bio line with CTA pointing to link"
  },
  "audienceInsights": {
    "bestTimeToPost": "platform-specific optimal time",
    "contentPillar": "Education|Entertainment|Inspiration|Promotion",
    "engagementTip": "one specific tactic to boost engagement"
  }
}

Make all captions platform-native. ${platform === 'instagram' ? 'Use line breaks for readability. Emojis at natural pause points.' : ''}
${platform === 'tiktok' ? 'Keep captions under 150 chars. Hook must be under 5 words.' : ''}
${platform === 'x' ? 'Under 280 chars total. Punchy opener. Strong opinion.' : ''}
${platform === 'linkedin' ? 'Start with a bold statement. Use line breaks. End with a question to drive comments.' : ''}`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate ${captionCount} ${tone} captions for ${platform} about: "${topic}"\n\nWebsite: ${websiteUrl || 'not provided'}` },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 3000,
      temperature: 0.88,
    });

    const raw = completion.choices[0].message.content;
    let data;
    try { data = JSON.parse(raw); }
    catch { throw new Error('AI returned invalid JSON — please try again'); }

    sseWrite(res, 'stage', { stage: 1, label: 'Building hashtag strategy...' });
    sseWrite(res, 'hashtags', { hashtags: data.hashtags });

    sseWrite(res, 'stage', { stage: 2, label: 'Crafting captions...' });
    sseWrite(res, 'captions', { captions: data.captions });

    sseWrite(res, 'stage', { stage: 3, label: 'Generating link strategy...' });

    // Build full UTM URLs server-side
    const utmLinks = [];
    if (websiteUrl) {
      const base = websiteUrl.replace(/\/$/, '');
      const { utmParams } = data.linkStrategy || {};
      (data.captions || []).forEach((cap, i) => {
        const params = new URLSearchParams({
          utm_source: utmParams?.source || platform,
          utm_medium: utmParams?.medium || 'social',
          utm_campaign: utmParams?.campaign || 'ripple',
          utm_content: `caption_${i + 1}`,
        });
        utmLinks.push({
          captionId: cap.id || i + 1,
          url: `${base}?${params.toString()}`,
          shortLabel: `Caption ${i + 1} link`,
        });
      });
    }

    sseWrite(res, 'complete', {
      captions: data.captions,
      hashtags: data.hashtags,
      linkStrategy: { ...data.linkStrategy, utmLinks },
      audienceInsights: data.audienceInsights,
      platform,
      topic,
    });
  } catch (err) {
    sseWrite(res, 'error', { message: err.message });
  }

  res.end();
});

export default router;
