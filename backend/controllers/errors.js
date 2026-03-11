//backend\controllers\errors.js
exports.pageNotFound = (req, res, next) => {
  res.status(404).send("Page Not Found! Sorry");
};
