import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.util.js';
import { ENV_KEY } from '../constants/env.constant.js';
import { AUTH_MESSAGES } from '../constants/user.constant.js';
import { catchAsync } from './error-handler.middleware.js';

/** accessToken 토큰 검증 API **/
const authMiddleware = catchAsync(async (req, res, next) => {
    const accessToken = req.headers.authorization;
    if (!accessToken) {
      return res.status(400).json({ message: AUTH_MESSAGES.NO_AUTH_INFO });
    }

    const token = accessToken.split('Bearer ')[1];
    if(!token){
      return res.status(401).json({ message: AUTH_MESSAGES.UNSUPPORTED_AUTH})
    }

    const payload = await validateToken(token, ENV_KEY.SECRET_KEY);
    if(payload === 'expired'){
      return res.status(401).json({ message: AUTH_MESSAGES.TOKEN_EXPIRED })
    } else if(payload === 'JsonWebTokenError'){
      return res.status(401).json({ message: AUTH_MESSAGES.INVALID_AUTH});
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id }
    });
    if (!user) {
      return res.status(404).json({ message: AUTH_MESSAGES.INVALID_AUTH });
    }
    req.user = user;
    next();
});

const validateToken = async (token, secretKey) => {
  try {
    const payload = jwt.verify(token, secretKey);
    return payload;
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
        return 'expired';
    }else{ 
      return 'JsonWebTokenError'
    }
}}

export { authMiddleware, validateToken };