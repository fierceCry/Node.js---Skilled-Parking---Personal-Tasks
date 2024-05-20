import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.util.js';
import { REFRESH_SECRET_KEY } from '../constants/env.constant.js';
import { AUTH_MESSAGES } from '../constants/user.constant.js';
import { catchAsync } from './error-handler.middleware.js';
import { validateToken } from './require-access-token.middleware.js';

/** 리프래시 토큰 검증 및 재발급 미들웨어 **/
const refreshTokenMiddleware = catchAsync(async (req, res, next) => {
  // 쿠키에서 리프래시 토큰을 가져옴
  const refreshToken = req.headers.authorization;
  console.log(refreshToken);
  if (!refreshToken) {
    return res
      .status(400)
      .json({ errorMessage: AUTH_MESSAGES.NO_REFRESH_TOKEN });
  }

  // 리프래시 토큰 검증
  const payload = jwt.verify(refreshToken, REFRESH_SECRET_KEY);
  if (!payload) {
    return res
      .status(401)
      .json({ errorMessage: AUTH_MESSAGES.INVALID_REFRESH_TOKEN });
  }

  const data = await prisma.user.findFirst({
    where: {
      refreshToken: refreshToken,
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

  // 액세스 토큰 발급 (새로고침)
  const newAccessToken = jwt.sign({ id: user.id }, REFRESH_SECRET_KEY, {
    expiresIn: '15m',
  });

  // 새로운 액세스 토큰을 쿠키에 설정
  // 12시간을 밀리초로 변환
  const maxAge = 12 * 60 * 60 * 1000;

  res.cookie('accessToken', newAccessToken, { httpOnly: true, maxAge: maxAge });

  // 요청에서 사용자 정보를 전달
  req.user = user;

  // 다음 미들웨어로 이동
  next();
});

export { refreshTokenMiddleware };
