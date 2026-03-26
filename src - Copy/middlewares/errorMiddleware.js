module.exports = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  console.error(err);
  if (req.accepts('html')) {
    return res.status(statusCode).render('pages/error', {
      title: statusCode === 500 ? 'Server error' : 'Error',
      message: err.message || 'Something went wrong',
    });
  }
  return res.status(statusCode).json({ message: err.message || 'Something went wrong' });
};
