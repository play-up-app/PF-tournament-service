export const validateRequest = (schema, property = 'body') => (req, res, next) => {
  const { error } = schema.validate(req[property], { abortEarly: false, allowUnknown: true });
  if (error) {
    const errors = error.details.map(detail => detail.message);
    return res.status(400).json({ errors });
  }
  next();
};
