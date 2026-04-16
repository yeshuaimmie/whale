const normalizeAppUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return null;

  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  // Common typo seen in manually configured env values.
  const corrected = trimmed.replace(/^hhtps:\/\//i, 'https://');

  try {
    const parsed = new URL(corrected);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return parsed.origin;
  } catch (_error) {
    return null;
  }
};

module.exports = (req) => {
  const fromEnv = normalizeAppUrl(process.env.APP_URL);
  if (fromEnv) return fromEnv;
  return `${req.protocol}://${req.get('host')}`;
};
