import express from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.util.js';
import { catchAsync } from '../middlewarmies/error-handler.middleware.js';
import { authMiddleware } from '../middlewarmies/require-access-token.middleware.js';
import { refreshTokenMiddleware } from '../middlewarmies/require-refresh-token.middleware.js';
import { ENV_KEY } from '../constants/env.constant.js';

const userRouter = express.Router();

/** 사용자 정보 조회 API **/
userRouter.get('/profile', authMiddleware, catchAsync(async (req, res) => {
    const user = req.user;
    res.status(200).json({data: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
  }});
}));

/** 사용자 RefreshToken 토큰 재발급 API **/
userRouter.post('/token/refresh', refreshTokenMiddleware, catchAsync(async( req, res)=>{
  const { id } = req.user;
  console.log(req.user)
  const accessToken = jwt.sign(
    { id: id
     },
     ENV_KEY.SECRET_KEY,
    { expiresIn: ENV_KEY.JWT_EXPIRATION_TIME }
  );
  const tokenRecord = await prisma.refreshToken.findFirst({
    where: { userId: id }
  });
    // RefreshToken 생성
    const refreshToken = jwt.sign(
      { id: id},
      ENV_KEY.REFRESH_SECRET_KEY,
      { expiresIn: ENV_KEY.REFRESH_TOKEN_EXPIRATION_TIME }
    );
  
    // DB에 리프레시 토큰 저장
    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: {
        refreshToken: refreshToken
      }});
    return  res.status(200).json({ data: {accessToken, refreshToken}})
}))

/**  사용자 로그아웃 API **/
userRouter.get('/logout', refreshTokenMiddleware, catchAsync(async(req, res)=>{
  const { id } = req.user;

  const tokenRecord = await prisma.refreshToken.findFirst({
    where: { userId: id }
  });

  const updatedUser = await prisma.refreshToken.delete({
    where: { id: tokenRecord.id },
  });

  return res.status(200).json({ data : updatedUser.id});
}));

export default userRouter;