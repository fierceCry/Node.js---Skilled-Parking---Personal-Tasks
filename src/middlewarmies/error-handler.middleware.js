const catchAsync = (func) => {
  return (req, res, next) => {
    func(req, res, next).catch((error) => next(error));
  };
};

const globalErrorHandler = (err, req, res, next) => {
  console.error(err.stack);
  err.statusCode = err.statusCode || 500;

  if (err.statusCode === 500) {
    res.status(500).json({ message: '예상치 못한 에러가 발생했습니다. 관리자에게 문의해 주세요.' });
  } else {
    res.status(err.statusCode).json({ message: err.message });
  }
};


export { catchAsync, globalErrorHandler };
