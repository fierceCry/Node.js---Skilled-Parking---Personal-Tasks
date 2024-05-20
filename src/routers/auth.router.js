import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { userCreateSchema, userLoginSchema } from '../middlewarmies/validation.middleware.js';
import { prisma } from "../utils/prisma.util.js";
import { catchAsync } from '../middlewarmies/error-handler.middleware.js';
import { AUTH_MESSAGES } from '../constants/auth.constant.js';
import { SECRET_KEY, JWT_EXPIRATION_TIME, REFRESH_SECRET_KEY, REFRESH_TOKEN_EXPIRATION_TIME} from '../constants/env.constant.js';

dotenv.config();
const authRouter = express.Router();

// 회원가입 라우트
authRouter.post('/sign-up', catchAsync(async (req, res) => {
  const createData = req.body;

  const { error } = userCreateSchema.validate(createData);
  if (error) return res.status(400).json({ message: error.message });

  const userData = await prisma.user.findFirst({ where: { email: createData.email } });
  if (userData) return res.status(409).json({ message: AUTH_MESSAGES.DUPLICATE_EMAIL });

  const hashPassword = await bcrypt.hash(createData.password, parseInt(SECRET_KEY));
  const { refreshToken, password, ...result } = await prisma.user.create({
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
  if(!userData) return res.status(401).json({ message: AUTH_MESSAGES.INVALID_CREDENTIALS });

  const isMatched = await bcrypt.compare(data.password, userData.password);
  if (!isMatched) return res.status(401).json({ message: AUTH_MESSAGES.INVALID_CREDENTIALS });

  const accessToken = jwt.sign(
    { id: userData.id,
      role: userData.role
     },
    SECRET_KEY,
    { expiresIn: JWT_EXPIRATION_TIME }
  );

    // RefreshToken 생성
    const refreshToken = jwt.sign(
      { id: userData.id, role: userData.role },
      REFRESH_SECRET_KEY,
      { expiresIn: REFRESH_TOKEN_EXPIRATION_TIME }
    );
  
    // DB에 리프레시 토큰 저장
    await prisma.user.update({
      where: { id: userData.id }, // Specify the user you want to update
      data: {
        refreshToken: refreshToken
      }
    });

  res.cookie('accessToken', `Bearer ${accessToken}`);
  return res.status(200).json({ accessToken, refreshToken});
}));

export default authRouter;
