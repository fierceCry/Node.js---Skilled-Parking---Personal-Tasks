import express from 'express';
import { catchAsync } from '../middlewarmies/error-handler.middleware.js';
import { authMiddleware } from '../middlewarmies/require-access-token.middleware.js';
import { refreshTokenMiddleware } from '../middlewarmies/require-refresh-token.middleware.js';
import { prisma } from '../utils/prisma.util.js';

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

userRouter.get('/logout', refreshTokenMiddleware, catchAsync(async(req, res)=>{
  const { id } = req.user;
  console.log(id)
  // 사용자의 refreshToken 필드를 null로 업데이트하여 로그아웃 처리
  const updatedUser = await prisma.user.update({
    where: { id },
    data: { refreshToken: null } // refreshToken 필드를 null로 설정하여 삭제
  });


  return res.status(200).json({ data : updatedUser.id});
}));

export default userRouter;