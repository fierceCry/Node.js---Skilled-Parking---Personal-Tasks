import express from 'express';
import { userCreateSchema, userLoginSchema } from '../middlewarmies/validation.middleware.js';
import { prisma } from "../utils/prisma.util.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { catchAsync } from '../middlewarmies/error-handler.middleware.js';
import { SECRET_KEY, JWT_EXPIRATION_TIME, AUTH_MESSAGES } from '../constants/auth.constant.js';
import dotenv from 'dotenv';

dotenv.config();
const authRouter = express.Router();

// 회원가입 라우트
authRouter.post('/sign-up', catchAsync(async (req, res) => {
  const createData = req.body;
  const { error } = userCreateSchema.validate(createData);
  if (error) return res.status(400).json({ message: error.message });
  const userData = await prisma.user.findFirst({ where: { email: createData.email } });

  if (userData) return res.status(400).json({ message: AUTH_MESSAGES.USER_EXISTS });

  const hashPassword = await bcrypt.hash(createData.password, parseInt(SECRET_KEY));
  const { password, ...result } = await prisma.user.create({
    data: {
      email: createData.email,
      password: hashPassword,
      nickname: createData.nickName
    }
  });

  res.status(201).json({ message: result });
}));

// 로그인 라우트
authRouter.post('/sign-in', catchAsync(async (req, res) => {
  const data = req.body;
  const { error } = userLoginSchema.validate(data);
  if (error) return res.status(400).json({ message: error.message });

  const userData = await prisma.user.findFirst({ where: { email: data.email } });
  if (!userData) return res.status(404).json({ message: AUTH_MESSAGES.INVALID_CREDENTIALS });
  
  const isMatched = await bcrypt.compare(data.password, userData.password);
  if (!isMatched) return res.status(404).json({ message: AUTH_MESSAGES.INVALID_CREDENTIALS });

  const userJwt = jwt.sign(
    { id: userData.id },
    SECRET_KEY,
    { expiresIn: JWT_EXPIRATION_TIME }
  );

  res.cookie('authToken', `Bearer ${userJwt}`);
  return res.status(200).json({ message: '로그인 성공' });
}));

export default authRouter;
