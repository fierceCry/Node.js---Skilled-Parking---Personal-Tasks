import express from 'express';
import { userCreateSchema } from '../middlewarmies/validation.middleware.js';
import { prisma } from "../utils/prisma.util.js";
import bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken';
import { catchAsync } from '../middlewarmies/error-handler.middleware.js';
import { authMiddleware } from '../middlewarmies/require-access-token.middleware.js'; // 수정된 authMiddleware import

const userRouter = express.Router();

userRouter.post('/sign-up', catchAsync(async(req, res)=>{
  const createData = req.body;
  const { error } = userCreateSchema.validate(createData);
  if (error) return res.status(400).json({ message: error.message });

  const userData = await prisma.user.findFirst({where: {email:createData.email}})
  if(userData) return res.status(400).json({ message : '이미 가입 된 사용자입니다.'});

  const hashPassword = await bcrypt.hash(createData.password, parseInt(process.env.SALT_ROUNDS));
  const {password, ...result} = await prisma.user.create({
    data: {
        email: createData.email,
        password: hashPassword,
        nickname: createData.nickName
      }
    }
  );
  res.status(201).json({message: result})
}))

userRouter.post('/sign-in', catchAsync(async(req, res)=>{
  const data = req.body;
  const userData = await prisma.user.findFirst({
    where: {email: data.email}
  })
  const isMatched = await bcrypt.compare(data.password, userData.password)
  if(!userData || !isMatched) return res.status(404).json({ message : '인증 정보가 유효하지 않습니다.'});
  const userJwt = JWT.sign(
    { id: userData.id }, // payload는 객체로 전달해야 합니다.
    process.env.SECRET_KEY,
    { expiresIn: '12h'},
  )
  res.cookie('authToken', `Bearer ${userJwt}`);
  return res.status(200).json({ message : '로그인 성공'});
}))

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