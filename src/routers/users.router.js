import express from 'express';
import { catchAsync } from '../middlewarmies/error-handler.middleware.js';
import { authMiddleware } from '../middlewarmies/require-access-token.middleware.js'; // 수정된 authMiddleware import

const userRouter = express.Router();

userRouter.get('/jwt', authMiddleware, catchAsync(async (req, res) => {
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

export default userRouter;