const { validationResult } = require("express-validator");

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error(errors.array()[0].msg)
    err.status = 400
    next(err)
  } else {
    next();
  }
}

module.exports = { validateRequest }