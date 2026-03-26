function sanitizeValue(value) {
  if (typeof value === 'string') {
    return value.replace(/\u0000/g, '').trim();
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === 'object') {
    const sanitizedObject = {};

    for (const [key, nestedValue] of Object.entries(value)) {
      const safeKey = key.replace(/^\$+/, '').replace(/\./g, '');
      sanitizedObject[safeKey] = sanitizeValue(nestedValue);
    }

    return sanitizedObject;
  }

  return value;
}

exports.sanitizeRequest = (req, _res, next) => {
  req.body = sanitizeValue(req.body || {});
  req.query = sanitizeValue(req.query || {});
  req.params = sanitizeValue(req.params || {});
  next();
};
