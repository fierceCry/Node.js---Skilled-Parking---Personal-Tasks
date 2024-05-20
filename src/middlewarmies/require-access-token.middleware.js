import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.util.js';
import { SECRET_KEY, AUTH_MESSAGES } from '../constants/auth.constant.js';

/** 엑세스 토큰 검증 API **/
const authMiddleware = async (req, res, next) => {
  try {
    const accessToken = req.cookies.authToken;
    console.log(accessToken)
    if (!accessToken || !accessToken.startsWith('Bearer ')) {
      return res.status(400).json({ errorMessage: AUTH_MESSAGES.NO_AUTH_INFO });
    }

    const token = accessToken.split(' ')[1];

    const payload = await validateToken(token, SECRET_KEY);
    if (!payload) {
      return res.status(401).json({ errorMessage: AUTH_MESSAGES.INVALID_AUTH });
    }
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });
    if (!user) {
      return res.status(404).json({ errorMessage: AUTH_MESSAGES.USER_NOT_FOUND });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errorMessage: '서버 에러가 발생했습니다.' });
  }
};

// Token을 검증하고 Payload를 반환합니다.
const validateToken = async (token, secretKey) => {
  try {
    const payload = jwt.verify(token, secretKey);
    return payload;
  } catch (error) {
    return null;
  }
}

export { authMiddleware };
