import express from 'express';
import userRouter from './users.router.js';

const route = express.Router();

route.use('/users', userRouter);

export default route;