import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dir, 'posts.json');

function load() {
  if (!existsSync(DB_PATH)) return { posts: [], nextId: 1 };
  try { return JSON.parse(readFileSync(DB_PATH, 'utf8')); }
  catch { return { posts: [], nextId: 1 }; }
}

function save(db) {
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export function schedulePostDB(data) {
  const db = load();
  const post = { id: db.nextId++, ...data, createdAt: new Date().toISOString() };
  db.posts.push(post);
  save(db);
  return post;
}

export function getScheduledPostsDB() {
  return load().posts.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
}

export function updatePostStatusDB(id, status) {
  const db = load();
  const post = db.posts.find(p => p.id === id);
  if (post) { post.status = status; save(db); }
}

export function deletePostDB(id) {
  const db = load();
  db.posts = db.posts.filter(p => p.id !== id);
  save(db);
}
