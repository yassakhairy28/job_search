const notFoundHandler = (req, res, next) => {
  return next(new Error("Page Not Found", { cause: 404 }));
};

export default notFoundHandler;
