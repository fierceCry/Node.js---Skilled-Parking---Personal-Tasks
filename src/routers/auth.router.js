import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from "../utils/prisma.util.js";
import { userCreateSchema } from  '../middlewarmies/validation/sign-up.validation.middlware.js';
import { userLoginSchema } from '../middlewarmies/validation/sign-in.validateion.middlewar.js';
import { catchAsync } from '../middlewarmies/error-handler.middleware.js';
import { AUTH_MESSAGES } from '../constants/auth.constant.js';
import { ENV_KEY } from '../constants/env.constant.js';

const authRouter = express.Router();

// 회원가입 라우트
authRouter.post('/sign-up', userCreateSchema, catchAsync(async (req, res) => {
  const createData = req.body;
  console.log(createData)
  // 유저 조회
  const userData = await prisma.user.findFirst({ 
    where: { 
      email: createData.email 
    } 
  });
  if (userData){
     return res.status(409).json({ message: AUTH_MESSAGES.DUPLICATE_EMAIL });
  }

  // 암호화
  const hashPassword = await bcrypt.hash(createData.password, parseInt( ENV_KEY.SECRET_KEY ));
  const { password, ...result } = await prisma.user.create({
    data: {
      email: createData.email,
      password: hashPassword,
      nickname: createData.nickName,
      role: createData.role
    }
  });
  res.status(201).json({ data : result });
}));

// 로그인 라우트
authRouter.post('/sign-in', userLoginSchema, catchAsync(async (req, res) => {
    const data = req.body;

    // 유저 조회
    const userData = await prisma.user.findFirst({
      where: {
        email: data.email,
      },
    });
    if (!userData) {
      return res.status(401).json({ message: AUTH_MESSAGES.INVALID_AUTH });
    }

    // 패스워드 비교
    const isMatched = await bcrypt.compare(data.password, userData.password);
    if (!isMatched) {
      return res.status(401).json({ message: AUTH_MESSAGES.INVALID_AUTH });
    }

    // 토큰 생성
    const accessToken = jwt.sign(
      {
        id: userData.id,
      },
      ENV_KEY.SECRET_KEY,
      { expiresIn: ENV_KEY.JWT_EXPIRATION_TIME }
    );

    const refreshToken = jwt.sign(
      {
        id: userData.id,
      },
      ENV_KEY.REFRESH_SECRET_KEY,
      {
        expiresIn: ENV_KEY.REFRESH_TOKEN_EXPIRATION_TIME,
      }
    );
    await prisma.refreshToken.create({
      data: {
        userId: userData.id,
        refreshToken: refreshToken,
      },
    });
    return res.status(200).json({ accessToken, refreshToken });
  })
);

export default authRouter;