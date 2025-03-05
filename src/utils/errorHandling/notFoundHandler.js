export const notFoundHandler = (req, res, next) => {
  // return res.status(404).send("Not Found Handler !!!");
  return next(new Error("Not Found Handler !!!", { cause: 404 }));
};
