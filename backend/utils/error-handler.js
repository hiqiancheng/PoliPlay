/**
 * 自定义错误类
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 创建自定义错误
 * @param {String} message 错误信息
 * @param {Number} statusCode HTTP状态码
 * @returns {AppError} 自定义错误对象
 */
exports.createError = (message, statusCode) => {
  return new AppError(message, statusCode);
};

/**
 * 全局错误处理中间件
 */
exports.errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // 开发环境返回详细错误信息
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } 
  // 生产环境只返回简要错误信息
  else {
    // 操作性错误（可预期的错误）
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } 
    // 程序错误（意外错误）
    else {
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: '服务器内部错误'
      });
    }
  }
}; 