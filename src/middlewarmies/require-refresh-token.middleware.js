import { prisma } from '../utils/prisma.util.js';
import { ENV_KEY } from '../constants/env.constant.js';
import { AUTH_MESSAGES } from '../constants/user.constant.js';
import { catchAsync } from './error-handler.middleware.js';
import { validateToken } from './require-access-token.middleware.js';

/** RefreshToken 토큰 검증 및 재발급 미들웨어 **/
const refreshTokenMiddleware = catchAsync(async (req, res, next) => {
  const refreshToken = req.headers.authorization;
  if (!refreshToken) {
    return res
      .status(400)
      .json({ errorMessage: AUTH_MESSAGES.NO_REFRESH_TOKEN });
  }

  const token = refreshToken.split(' ')[1];
  if(!token){
    return res.status(401).json({ message: AUTH_MESSAGES.UNSUPPORTED_AUTH})
  } 
  // 리프래시 토큰 검증
  const payload = await validateToken(token, ENV_KEY.REFRESH_SECRET_KEY);
  if(payload === 'expired'){
    return res.status(401).json({ message: AUTH_MESSAGES.TOKEN_EXPIRED })
  } else if(payload === 'JsonWebTokenError'){
    return res.status(401).json({ message: AUTH_MESSAGES.INVALID_AUTH});
  }

  const tokenData = await prisma.refreshToken.findFirst({
    where: {
      user_id: payload.id,
      refresh_token: token
    },
  });
  if (!tokenData){
    return res.status(400).json({ message: AUTH_MESSAGES.TOKEN_END });
  }
  // 사용자 조회  
  const user = await prisma.user.findUnique({
    where: { id: payload.id },
  });
  if (!user) {
    return res.status(404).json({ message: AUTH_MESSAGES.USER_NOT_FOUND });
  }
  req.user = user;
  next();
});

export { refreshTokenMiddleware };
