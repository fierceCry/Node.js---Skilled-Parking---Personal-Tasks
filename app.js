import express from 'express';
import dotenv from 'dotenv';
import { globalErrorHandler } from './src/middlewarmies/error-handler.middleware.js';
import route from './src/routers/index.js';
import cookieParser from 'cookie-parser';
import LogMiddleware from './src/middlewarmies/log.middleware.js';
import { ENV_KEY } from './src/constants/env.constant.js';
dotenv.config();

const app = express();

app.use(LogMiddleware)
app.use(express.json())
app.use(cookieParser());
app.use(globalErrorHandler);
app.use(route)

app.get('/api', async (req, res) => {
    res.status(200).json({ message: '테스트 성공'});
})

app.listen(ENV_KEY.PORT, async()=>{
  console.log(ENV_KEY.PORT, '포트로 서버가 열렸습니다!');
})