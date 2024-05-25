const catchAsync = (func) => {
  return (req, res, next) => {
    func(req, res, next).catch((error) => next(error));
  };
};

const globalErrorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if(err.name === 'ValidationError'){
    return res.status(400).json({message : err.message})
  }
  
  return res.status(500).json({ message : '예상치 못한 에러가 발생하였습니다.'})
};

export { catchAsync, globalErrorHandler };