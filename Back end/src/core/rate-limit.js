// Pembatas percobaan sederhana di memori (cukup untuk satu proses server).
function createRateLimiter({ max, windowMs }) {
  const hits = new Map();

  function recent(key) {
    const cutoff = Date.now() - windowMs;
    const list = (hits.get(key) || []).filter((time) => time > cutoff);
    hits.set(key, list);
    return list;
  }

  return {
    isLimited: (key) => recent(key).length >= max,
    fail: (key) => { recent(key).push(Date.now()); },
    reset: (key) => { hits.delete(key); },
  };
}

module.exports = { createRateLimiter };
