import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.util.js';
import { SECRET_KEY } from '../constants/env.constant.js';
import { AUTH_MESSAGES } from '../constants/user.constant.js';
import { catchAsync } from './error-handler.middleware.js';

/** 엑세스 토큰 검증 API **/
const authMiddleware = catchAsync(async (req, res, next) => {
    const accessToken = req.cookies.authToken;
    if (!accessToken || !accessToken.startsWith('Bearer ')) {
      return res.status(400).json({ errorMessage: AUTH_MESSAGES.NO_AUTH_INFO });
    }

    const token = accessToken.split(' ')[1];

    const payload = await validateToken(token, SECRET_KEY);
    if (!payload) {
      return res.status(401).json({ errorMessage: AUTH_MESSAGES.INVALID_AUTH });
    }
    const user = await prisma.user.findUnique({
      where: { id: payload.id }
    });
    if (!user) {
      return res.status(404).json({ errorMessage: AUTH_MESSAGES.USER_NOT_FOUND });
    }
    req.user = user;
    next();
});

const validateToken = async (token, secretKey) => {
  try {
    const payload = jwt.verify(token, secretKey);
    return payload;
  } catch (error) {
    return null;
  }
}

export { authMiddleware, validateToken };
