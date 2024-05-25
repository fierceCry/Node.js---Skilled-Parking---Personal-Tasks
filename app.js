import express from 'express';
import logMiddleware from './src/middlewarmies/log.middleware.js';
import route from './src/routers/index.js';
import { globalErrorHandler } from './src/middlewarmies/error-handler.middleware.js';
import { ENV_KEY } from './src/constants/env.constant.js';

const app = express();

app.use(logMiddleware)
app.use(express.json())
app.use(route)
app.use(globalErrorHandler);

app.get('/api', async (req, res) => {
    res.status(200).json({ message: '테스트 성공'});
})

app.listen(ENV_KEY.PORT, async()=>{
  console.log(ENV_KEY.PORT, '포트로 서버가 열렸습니다!');
});