import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.util.js'; // Prisma client import

/** 엑세스 토큰 검증 API **/
const authMiddleware = async (req, res, next) => {
  try {
    console.log(req.cookies)
    const accessToken = req.cookies.authToken;
    if (!accessToken || !accessToken.startsWith('Bearer ')) {
      return res.status(400).json({ errorMessage: '인증 정보가 없습니다.' });
    }

    const token = accessToken.split(' ')[1];

    const payload = await validateToken(token, process.env.SECRET_KEY);
    if (!payload) {
      return res.status(401).json({ errorMessage: 'Access Token이 유효하지 않습니다.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id }
    });

    if (!user) {
      return res.status(404).json({ errorMessage: '인증 정보와 일치하는 사용자가 없습니다.' });
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
