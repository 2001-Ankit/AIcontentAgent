import { Router } from 'express';
import schedule from 'node-schedule';
import {
  schedulePostDB,
  getScheduledPostsDB,
  updatePostStatusDB,
  deletePostDB,
} from '../db/database.js';

const router = Router();
const jobs = new Map();

router.post('/', (req, res) => {
  const { prompt, caption, imageUrl, platforms, scheduledAt, platformContent } = req.body;
  if (!caption || !platforms?.length) {
    return res.status(400).json({ error: 'caption and platforms required' });
  }

  const post = schedulePostDB({
    prompt: prompt || '',
    caption,
    imageUrl: imageUrl || '',
    platforms,
    scheduledAt: scheduledAt || new Date().toISOString(),
    platformContent: platformContent || {},
    status: 'pending',
  });

  const postTime = new Date(scheduledAt);
  if (postTime > new Date()) {
    const job = schedule.scheduleJob(postTime, () => {
      updatePostStatusDB(post.id, 'posted');
      jobs.delete(post.id);
      console.log(`[ripple] Post ${post.id} published at ${new Date().toISOString()}`);
    });
    jobs.set(post.id, job);
  }

  res.json(post);
});

router.get('/', (_req, res) => {
  res.json(getScheduledPostsDB());
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const job = jobs.get(id);
  if (job) { job.cancel(); jobs.delete(id); }
  deletePostDB(id);
  res.json({ ok: true });
});

export default router;
