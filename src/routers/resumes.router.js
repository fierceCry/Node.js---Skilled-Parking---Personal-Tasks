import express from 'express';
import { authMiddleware } from '../middlewarmies/require-access-token.middleware.js';
import { catchAsync } from '../middlewarmies/error-handler.middleware.js';
import { resumerCreatesSchema } from '../middlewarmies/validation.middleware.js';
import { prisma } from '../utils/prisma.util.js';
import { resumerUpdateSchema } from '../middlewarmies/validation.middleware.js';
const resumesRouter = express.Router();

resumesRouter.post('/resumes/post', authMiddleware, catchAsync(async (req, res) => {
  const  { id } = req.user;
  const resumerData = req.body;
  const { error } = resumerCreatesSchema.validate(resumerData);
  if (error) return res.status(400).json({ message: error.message });

  const result = await prisma.resume.create({
    data: {
      userId: id,
      title: resumerData.title,
      content: resumerData.content,
    },
  });
  return res.status(201).json({ data: result });
}));

// 추후 코드 리팩토링
resumesRouter.get('/resumes/get', authMiddleware, catchAsync(async(req, res) => {
  const { id } = req.user;
  let { sortBy, order } = req.query;

  sortBy = sortBy || 'createdAt';
  order = order === 'asc' ? 'asc' : 'desc';

  const data = await prisma.resume.findMany({
    where: { userId: id },
    orderBy: {
      [sortBy]: order,
    },
    include: {
      user: {
        select: {
          nickname: true
        }
      }
    }
  });
    // 데이터 변환
    const transformedData = data.map(resume => ({
      id: resume.id,
      nickname: resume.user.nickname,
      title: resume.title,
      content: resume.content,
      support_status: resume.support_status,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
    }));
  
  return res.status(201).json({ data: transformedData });
}));

  
resumesRouter.get('/resumes/get/:resumeId', authMiddleware, catchAsync(async (req, res) => {
    const { id } = req.user;
    const { resumeId } = req.params;

    const data = await prisma.resume.findMany({
      where: {
        id: parseInt(resumeId),
        userId: id,
      }, 
      include: {
        user: {
          select: {
            nickname: true
          }
        }
      }
    });
    // 데이터 변환
    const transformedData = data.map((resume) => ({
      id: resume.id,
      nickname: resume.user.nickname,
      title: resume.title,
      content: resume.content,
      support_status: resume.support_status,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
    }));

    return res.status(201).json({ data: transformedData });
  }),
);
  
resumesRouter.patch('/resumes/:resumeId', authMiddleware, catchAsync(async(req, res)=>{
  const { id } = req.user;
  const { resumeId } = req.params;
  const data = req.body;

  const { error } = resumerUpdateSchema.validate(data)
  if (error) return res.status(400).json({ message: error.message });

    // 이력서 존재 여부 확인
    const existingResume = await prisma.resume.findUnique({
      where: {
          id: parseInt(resumeId),
          userId: id
        }
    });
  
    if (!existingResume) {
      return res.status(404).json({ error: "이력서가 존재하지 않습니다." });
    }

  // 데이터 업데이트
  const updatedResume = await prisma.resume.update({
    where: {
      id: parseInt(resumeId)
    },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.content && { content: data.content })
    }
  });
  return res.status(200).json({ data: updatedResume });
}));


resumesRouter.delete('/post/:deleteId', authMiddleware, catchAsync(async(req, res)=>{
  const { id } = req.user;
  const { deleteId } = req.params;

  const data = await prisma.resume.findFirst({
    where: {
      id: parseInt(deleteId),
      userId : id
    }
  })
  if(!data) return res.status(400).json({ message: '이력서가 존재하지 않습니다.'})

    const deletedResume = await prisma.resume.delete({
      where: {
        id: parseInt(deleteId)
      }
    });
  
  return res.status(200).json({ data: deletedResume.id})
}));
  
  export default resumesRouter;