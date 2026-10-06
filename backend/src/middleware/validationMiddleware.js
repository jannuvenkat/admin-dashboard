const validateRequiredFields = (fields) => {
  return (req, res, next) => {
    const missing = [];
    for (const field of fields) {
      if (
        req.body[field] === undefined ||
        req.body[field] === null ||
        (typeof req.body[field] === 'string' && req.body[field].trim() === '')
      ) {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missing.join(', ')}`
      });
    }

    next();
  };
};

module.exports = { validateRequiredFields };
