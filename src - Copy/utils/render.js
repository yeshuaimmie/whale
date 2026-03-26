module.exports = function render(res, view, payload = {}) {
  return res.render(view, payload);
};
