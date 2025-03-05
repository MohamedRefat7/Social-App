export const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((error) => {
      if (Object.keys(error).length === 0) {
        return next(new Error(error.message, { cause: 500 }));
      }
      return next(error);
    });
  };
};
