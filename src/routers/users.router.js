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
    res.status(200).json({
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    });
}));

/** 사용자 RefreshToken 토큰 재발급 API **/
userRouter.post('/token', refreshTokenMiddleware, catchAsync(async( req, res)=>{
  const { id, role } = req.user;

  const accessToken = jwt.sign(
    { id: id,
      role: role
     },
     ENV_KEY.SECRET_KEY,
    { expiresIn: ENV_KEY.JWT_EXPIRATION_TIME }
  );
  const tokenRecord = await prisma.refreshToken.findFirst({
    where: { user_id: id }
  });
    // RefreshToken 생성
    const refreshToken = jwt.sign(
      { id: id, role: role },
      ENV_KEY.REFRESH_SECRET_KEY,
      { expiresIn: ENV_KEY.REFRESH_TOKEN_EXPIRATION_TIME }
    );
  
    // DB에 리프레시 토큰 저장
    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: {
        refresh_token: refreshToken
      }});
    // 토큰 생성하여 다시 cookie로 전달
    res.cookie('authorization', `Bearer ${accessToken}`, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
    });
    return  res.status(200).json({ accessToken, refreshToken})
}))

/**  사용자 로그아웃 API **/
userRouter.get('/logout', authMiddleware, catchAsync(async(req, res)=>{
  const { id } = req.user;

  const tokenRecord = await prisma.refreshToken.findFirst({
    where: { user_id: id }
  });

  const updatedUser = await prisma.refreshToken.delete({
    where: { id: tokenRecord.id },
  });

  return res.status(200).json({ data : updatedUser.id});
}));

export default userRouter;