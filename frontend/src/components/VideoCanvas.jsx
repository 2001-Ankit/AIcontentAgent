import { useState, useCallback, useRef } from 'react';

const DURATION_MS = 8000;

export function useVideoGeneration() {
  const [videoUrl, setVideoUrl] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle'); // idle | recording | done | error
  const rafRef = useRef(null);

  const generate = useCallback(async ({ imageUrl, caption, platform = 'instagram' }) => {
    if (!imageUrl) return;
    setStatus('recording');
    setProgress(0);
    setVideoUrl(null);

    const isVertical = ['tiktok', 'youtube'].includes(platform);
    const W = 1080;
    const H = isVertical ? 1920 : 1080;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Load image (CORS proxy via Pollinations already sets headers)
    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => {
        // Fallback: draw a gradient if image fails to load cross-origin
        resolve();
      };
      // Add timestamp to bust cache for CORS
      img.src = imageUrl.includes('?') ? imageUrl + '&_=' + Date.now() : imageUrl + '?_=' + Date.now();
    });

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';

    const stream = canvas.captureStream(30);
    const chunks = [];
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4_000_000 });

    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      setVideoUrl(URL.createObjectURL(blob));
      setStatus('done');
    };

    recorder.start(100); // collect data every 100ms

    const startTime = performance.now();

    function drawFrame(now) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / DURATION_MS, 1);
      setProgress(Math.round(t * 100));

      ctx.clearRect(0, 0, W, H);

      // Ken Burns: slow zoom 1x → 1.15x
      const scale = 1 + 0.15 * t;
      const panX = W * 0.03 * t; // subtle rightward pan

      ctx.save();
      ctx.translate(-panX, 0);
      ctx.scale(scale, scale);

      if (img.complete && img.naturalWidth > 0) {
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const canvasAspect = W / H;
        let dW, dH, dX, dY;
        if (imgAspect > canvasAspect) {
          dH = H / scale;
          dW = dH * imgAspect;
          dX = (W / scale - dW) / 2;
          dY = 0;
        } else {
          dW = W / scale;
          dH = dW / imgAspect;
          dX = 0;
          dY = (H / scale - dH) / 2;
        }
        ctx.drawImage(img, dX, dY, dW, dH);
      } else {
        // Gradient placeholder
        const g = ctx.createLinearGradient(0, 0, W / scale, H / scale);
        g.addColorStop(0, '#FF3D81');
        g.addColorStop(0.55, '#A855F7');
        g.addColorStop(1, '#6366F1');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W / scale, H / scale);
      }
      ctx.restore();

      // Bottom gradient overlay
      const overlay = ctx.createLinearGradient(0, H * 0.45, 0, H);
      overlay.addColorStop(0, 'rgba(0,0,0,0)');
      overlay.addColorStop(1, 'rgba(0,0,0,0.82)');
      ctx.fillStyle = overlay;
      ctx.fillRect(0, H * 0.45, W, H * 0.55);

      // Caption text — fade in after 1 second
      const textOpacity = t > 0.125 ? Math.min(1, (t - 0.125) / 0.125) : 0;
      if (textOpacity > 0 && caption) {
        ctx.globalAlpha = textOpacity;
        ctx.fillStyle = '#ffffff';
        const fontSize = Math.round(W * 0.038);
        ctx.font = `700 ${fontSize}px "DM Sans", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        // Word wrap
        const maxW = W * 0.82;
        const words = caption.split(' ');
        const lines = [];
        let line = '';
        for (const word of words) {
          const test = line ? `${line} ${word}` : word;
          if (ctx.measureText(test).width > maxW && line) {
            lines.push(line);
            line = word;
          } else {
            line = test;
          }
        }
        if (line) lines.push(line);

        const lineH = fontSize * 1.45;
        const totalH = lines.length * lineH;
        const bottomY = H - H * 0.075;

        // Shadow for readability
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 12;

        lines.forEach((l, i) => {
          ctx.fillText(l, W / 2, bottomY - totalH + (i + 1) * lineH);
        });

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      // Ripple logo badge (top-right)
      const badgeOpacity = t > 0.5 ? Math.min(1, (t - 0.5) / 0.15) : 0;
      if (badgeOpacity > 0) {
        ctx.globalAlpha = badgeOpacity * 0.9;
        const bx = W - 120, by = 32, bw = 100, bh = 30, br = 15;
        ctx.beginPath();
        ctx.moveTo(bx + br, by);
        ctx.lineTo(bx + bw - br, by);
        ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + br);
        ctx.lineTo(bx + bw, by + bh - br);
        ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - br, by + bh);
        ctx.lineTo(bx + br, by + bh);
        ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - br);
        ctx.lineTo(bx, by + br);
        ctx.quadraticCurveTo(bx, by, bx + br, by);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = `600 ${Math.round(W * 0.018)}px "DM Sans", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Ripple Auto', bx + bw / 2, by + bh / 2);
        ctx.globalAlpha = 1;
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(drawFrame);
      } else {
        setTimeout(() => recorder.stop(), 150);
      }
    }

    rafRef.current = requestAnimationFrame(drawFrame);
  }, []);

  const cancel = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setStatus('idle');
    setProgress(0);
  }, []);

  return { videoUrl, progress, status, generate, cancel };
}

export default function VideoPreview({ imageUrl, caption, platform }) {
  const { videoUrl, progress, status, generate, cancel } = useVideoGeneration();

  return (
    <div className="space-y-3">
      {status === 'idle' && (
        <button
          onClick={() => generate({ imageUrl, caption, platform })}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border text-muted text-[13px] font-semibold hover:border-purple-300 hover:text-purple-600 transition-all"
          disabled={!imageUrl}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Generate Canvas Video (free, ~8s)
        </button>
      )}

      {status === 'recording' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[12px] text-muted font-semibold">
            <span>Recording… {progress}%</span>
            <button onClick={cancel} className="text-red-400 hover:text-red-600">Cancel</button>
          </div>
          <div className="h-2 bg-light rounded-full overflow-hidden">
            <div
              className="h-full rounded-full gradient-bg transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[11px] text-muted">Ken Burns effect • 1080p • WebM</p>
        </div>
      )}

      {status === 'done' && videoUrl && (
        <div className="space-y-2">
          <video
            src={videoUrl}
            controls
            loop
            className="w-full rounded-xl border border-border shadow-sm"
            style={{ maxHeight: 320 }}
          />
          <div className="flex gap-2">
            <a
              href={videoUrl}
              download="ripple-post.webm"
              className="btn-primary flex-1 text-center"
            >
              ↓ Download Video
            </a>
            <button
              onClick={() => generate({ imageUrl, caption, platform })}
              className="btn-ghost px-3"
            >
              ↺
            </button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <p className="text-red-500 text-[12px]">Video generation failed — try again.</p>
      )}
    </div>
  );
}
