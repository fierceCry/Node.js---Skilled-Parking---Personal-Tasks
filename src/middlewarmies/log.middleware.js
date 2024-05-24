import winston from 'winston';

export default function (req, res, next) {
  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level}]: ${message}`;
      })
    ),
    transports: [new winston.transports.Console()],
  });

  const start = new Date().getTime();
  res.on('finish', () => {
    const duration = new Date().getTime() - start;
    logger.info(
      `Method: ${req.method}, URL: ${req.url}, Status: ${res.statusCode}, Duration: ${duration}ms`
    );
  });
  next();
}
