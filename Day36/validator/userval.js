const validator = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);
  console.log(result);

  if (result.success) {
    console.log(result.data);
    req.body = result.data;
    next();
  } else {
    const err = result.error?.flatten().fieldErrors;
    console.error(err);
    next(err);
  }
};

export default validator
