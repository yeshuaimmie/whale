module.exports = (_req, res) => {
  return res.status(404).render('pages/error', {
    title: 'Page not found',
    message: 'The page you requested could not be found.',
  });
};
