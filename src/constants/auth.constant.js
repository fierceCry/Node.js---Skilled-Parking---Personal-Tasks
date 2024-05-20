// auth.constant.js

// JWT 관련 상수
export const SECRET_KEY = process.env.SECRET_KEY;
export const JWT_EXPIRATION_TIME = '12h';

// 인증 관련 메시지
export const AUTH_MESSAGES = {
  NO_AUTH_INFO: '인증 정보가 없습니다.',
  INVALID_AUTH: '인증 정보가 유효하지 않습니다.',
  UNSUPPORTED_AUTH: '지원하지 않는 인증 방식입니다.',
  TOKEN_EXPIRED: '인증 정보가 만료되었습니다.',
  USER_NOT_FOUND: '인증 정보와 일치하는 사용자가 없습니다.'
};
