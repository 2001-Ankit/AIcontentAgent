const KEY = 'ripple_credits';
const EVENTS_KEY = 'ripple_events';
const INITIAL = 100;

// Cost per action in credits
export const COSTS = {
  autopilot: 10,   // full content generation
  caption: 3,      // caption lab generation
  image: 5,        // image regeneration
  video: 2,        // canvas video (cheap)
  hashtag: 1,      // hashtag-only request
};

// Bonus triggers (each fires once per session/day)
export const BONUSES = {
  signup: 50,
  referral: 25,
  share: 10,
  daily: 5,
};

function loadStore() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const store = { credits: INITIAL, totalEarned: INITIAL, totalSpent: 0, joinedAt: new Date().toISOString() };
      saveStore(store);
      return store;
    }
    return JSON.parse(raw);
  } catch {
    return { credits: INITIAL, totalEarned: INITIAL, totalSpent: 0, joinedAt: new Date().toISOString() };
  }
}

function saveStore(store) {
  localStorage.setItem(KEY, JSON.stringify(store));
}

function loadEvents() {
  try { return JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]'); }
  catch { return []; }
}

function saveEvents(events) {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events.slice(-100))); // keep last 100
}

export function getCredits() {
  return loadStore().credits;
}

export function getCreditStore() {
  return loadStore();
}

export function hasCredits(action) {
  return loadStore().credits >= (COSTS[action] || 0);
}

export function deductCredits(action, label = '') {
  const cost = COSTS[action] || 0;
  if (cost === 0) return true;
  const store = loadStore();
  if (store.credits < cost) return false;
  store.credits -= cost;
  store.totalSpent += cost;
  saveStore(store);

  const events = loadEvents();
  events.push({ type: 'spend', action, cost, label, ts: new Date().toISOString() });
  saveEvents(events);
  return true;
}

export function addCredits(amount, reason = '') {
  const store = loadStore();
  store.credits += amount;
  store.totalEarned += amount;
  saveStore(store);

  const events = loadEvents();
  events.push({ type: 'earn', amount, reason, ts: new Date().toISOString() });
  saveEvents(events);
}

// Check & grant daily bonus (once per calendar day)
export function claimDailyBonus() {
  const store = loadStore();
  const today = new Date().toDateString();
  if (store.lastDailyBonus === today) return 0;
  store.lastDailyBonus = today;
  store.credits += BONUSES.daily;
  store.totalEarned += BONUSES.daily;
  saveStore(store);
  return BONUSES.daily;
}

// One-time email signup bonus
export function claimSignupBonus(email) {
  const store = loadStore();
  if (store.signupBonusClaimed) return 0;
  store.signupBonusClaimed = true;
  store.email = email;
  store.credits += BONUSES.signup;
  store.totalEarned += BONUSES.signup;
  saveStore(store);
  return BONUSES.signup;
}

export function getUsageHistory() {
  return loadEvents();
}

// Analytics helpers
export function getUsageStats() {
  const events = loadEvents();
  const byAction = {};
  let totalSpent = 0;
  events.filter(e => e.type === 'spend').forEach(e => {
    byAction[e.action] = (byAction[e.action] || 0) + 1;
    totalSpent += e.cost;
  });
  return { byAction, totalSpent, totalEvents: events.length };
}
