// SSE parser: yields { event, data } from a fetch response with text/event-stream
async function* parseSSE(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';

    for (const part of parts) {
      if (!part.trim()) continue;
      let event = 'message';
      let data = '';
      for (const line of part.split('\n')) {
        if (line.startsWith('event: ')) event = line.slice(7).trim();
        if (line.startsWith('data: ')) data = line.slice(6).trim();
      }
      if (data) {
        try { yield { event, data: JSON.parse(data) }; }
        catch { /* skip malformed */ }
      }
    }
  }
}

export async function generateContent(prompt, onEvent) {
  const response = await fetch('/api/generate/text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Server error ${response.status}`);
  }

  for await (const { event, data } of parseSSE(response)) {
    onEvent(event, data);
    if (event === 'complete' || event === 'error') break;
  }
}

export async function regenerateImage(prompt, aspect = 'square') {
  const res = await fetch('/api/generate/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, aspect }),
  });
  if (!res.ok) throw new Error('Image regeneration failed');
  return res.json();
}

export async function generateAIVideo(prompt) {
  const res = await fetch('/api/generate/video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Video generation failed');
  return data;
}

export async function schedulePost(payload) {
  const res = await fetch('/api/schedule', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to schedule post');
  return res.json();
}

export async function getScheduledPosts() {
  const res = await fetch('/api/schedule');
  if (!res.ok) throw new Error('Failed to load posts');
  return res.json();
}

export async function deleteScheduledPost(id) {
  await fetch(`/api/schedule/${id}`, { method: 'DELETE' });
}
