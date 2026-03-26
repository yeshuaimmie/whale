module.exports = function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.redirect('/login');
    if (!roles.includes(req.user.role)) return res.status(403).render('pages/error', { title: 'Access denied', message: 'You do not have permission to view this page.' });
    next();
  };
};
