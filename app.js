import express from 'express';
import dotenv from 'dotenv';
import { globalErrorHandler } from './src/middlewarmies/error-handler.middleware.js';

dotenv.config();

const app = express();

app.use(express.json())
app.use(globalErrorHandler);

app.get('/api', (req, res)=>{
  res.status(200).json('테스트 성공')
})
app.listen(process.env.PORT, ()=>{
  console.log(process.env.PORT, '포트로 서버가 열렸습니다!');
})