import express from 'express';
import dotenv from 'dotenv';
import { globalErrorHandler } from './src/middlewarmies/error-handler.middleware.js';
import { prisma } from './src/utils/prisma.util.js';
import route from './src/routers/index.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

app.use(express.json())
app.use(cookieParser()); // 쿠키 파서 미들웨어 추가
app.use(globalErrorHandler);
app.use(route)

app.get('/api', async (req, res) => {
    res.status(200).json({ message: '테스트 성공'});
})

app.listen(process.env.PORT, async()=>{
  await prisma.$connect();
  console.log(process.env.PORT, '포트로 서버가 열렸습니다!');
})