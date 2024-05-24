import express from 'express';
import authRouter from './auth.router.js';
import userRouter from './users.router.js';
import resumesRouter from './resumes.router.js';

const route = express.Router();

route.use('/auth', authRouter);
route.use('/resumes', resumesRouter)
route.use('/users', userRouter);

export default route;