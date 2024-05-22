import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.util.js';
import { ENV_KEY } from '../constants/env.constant.js';
import { AUTH_MESSAGES } from '../constants/user.constant.js';
import { catchAsync } from './error-handler.middleware.js';
import { validateToken } from './require-access-token.middleware.js';
/** 리프래시 토큰 검증 및 재발급 미들웨어 **/
const refreshTokenMiddleware = catchAsync(async (req, res, next) => {
  // 헤더에서 리프래시 토큰을 가져옴
  const refreshToken = req.headers.authorization;
  console.log(req.headers)

  if (!refreshToken) {
    return res
      .status(400)
      .json({ errorMessage: AUTH_MESSAGES.NO_REFRESH_TOKEN });
  }
  const token = refreshToken.split(' ')[1];
  // 리프래시 토큰 검증
  const payload = validateToken(token, ENV_KEY.REFRESH_SECRET_KEY);
  if (!payload) {
    return res
      .status(401)
      .json({ errorMessage: AUTH_MESSAGES.INVALID_REFRESH_TOKEN });
  }

  const data = await prisma.user.findFirst({
    where: {
      refresh_token: token,
    },
  });
  if (!data)
    return res.status(400).json({ errorMessage: AUTH_MESSAGES.TOKEN_END });

  // 사용자 조회
  const user = await prisma.user.findUnique({
    where: { id: payload.id },
  });
  if (!user) {
    return res.status(404).json({ errorMessage: AUTH_MESSAGES.USER_NOT_FOUND });
  }
  req.user = user;
  // 다음 미들웨어로 이동
  next();
});

export { refreshTokenMiddleware };
