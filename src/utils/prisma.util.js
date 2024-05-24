import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
});

prisma.$connect()
  .then(() => console.log('DB 연결에 성공했습니다.'))
  .catch((error) => console.error('DB 연결에 실패했습니다.', error));

export default prisma;