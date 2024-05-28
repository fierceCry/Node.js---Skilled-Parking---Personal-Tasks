import dotenv from 'dotenv';
dotenv.config();

export const ENV_KEY = {
  SECRET_KEY: process.env.SECRET_KEY,
  JWT_EXPIRATION_TIME: process.env.JWT_EXPIRATION_TIME,
  REFRESH_SECRET_KEY: process.env.REFRESH_TOKEN_EXPIRATION_TIME,
  REFRESH_TOKEN_EXPIRATION_TIME: process.env.REFRESH_TOKEN_EXPIRATION_TIME,
  PORT: process.env.PORT,
  SALT_ROUNDS: process.env.SALT_ROUNDS
};
