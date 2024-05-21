import express from 'express';
import { catchAsync } from '../middlewarmies/error-handler.middleware.js';
import { authMiddleware } from '../middlewarmies/require-access-token.middleware.js';
import { prisma } from '../utils/prisma.util.js';
import { refreshTokenMiddleware } from '../middlewarmies/require-refresh-token.middleware.js';
import { ENV_KEY } from '../constants/env.constant.js';
import jwt from 'jsonwebtoken';

const userRouter = express.Router();

userRouter.get('/profile', authMiddleware, catchAsync(async (req, res) => {
    const user = req.user;
    res.status(200).json({
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
}));

userRouter.get('/token', refreshTokenMiddleware, catchAsync(async( req, res)=>{
  const { id, role } = req.user;

  const accessToken = jwt.sign(
    { id: id,
      role: role
     },
     ENV_KEY.SECRET_KEY,
    { expiresIn: ENV_KEY.JWT_EXPIRATION_TIME }
  );

    // RefreshToken 생성
    const refreshToken = jwt.sign(
      { id: id, role: role },
      ENV_KEY.REFRESH_SECRET_KEY,
      { expiresIn: ENV_KEY.REFRESH_TOKEN_EXPIRATION_TIME }
    );
  
    // DB에 리프레시 토큰 저장
    await prisma.user.update({
      where: { id: id },
      data: {
        refresh_token: refreshToken
      }
    });
    return  res.status(200).json({ accessToken, refreshToken})
}))

userRouter.get('/logout', authMiddleware, catchAsync(async(req, res)=>{
  const { id } = req.user;
  const updatedUser = await prisma.user.update({
    where: { id },
    // refreshToken 필드를 null로 설정하여 업데이트
    data: { refresh_token: null } 
  });

  return res.status(200).json({ data : updatedUser.id});
}));

export default userRouter;