import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(), 
  transports: [
    new winston.transports.Console(),
  ],
});

export default function (req, res, next) {
  // 클라이언트의 요청이 시작된 시간을 기록합니다.
  const start = new Date().getTime();

  // 응답이 완료되면 로그를 기록합니다.
  res.on('finish', () => {
    const duration = new Date().getTime() - start;
    logger.info(
      `Method: ${req.method}, URL: ${req.url}, Status: ${res.statusCode}, Duration: ${duration}ms`,
    );
  });

  next();
}