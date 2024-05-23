import express from 'express';
import { authMiddleware } from '../middlewarmies/require-access-token.middleware.js';
import { catchAsync } from '../middlewarmies/error-handler.middleware.js';
import { resumerCreatesSchema } from '../middlewarmies/validation.middleware.js';
import prisma from '../utils/prisma.util.js';
import { resumerUpdateSchema, resumerLogSchema } from '../middlewarmies/validation.middleware.js';
import { RESUME_MESSAGES } from '../constants/resume.constant.js';
import { requireRoles } from '../middlewarmies/require-roles.middleware.js';

const resumesRouter = express.Router();

resumesRouter.post('/post', authMiddleware, catchAsync(async (req, res) => {
  const { id } = req.user;
  const resumerData = req.body;
  const { error } = resumerCreatesSchema.validate(resumerData);
  if (error) return res.status(400).json({ message: error.message });
  const result = await prisma.resume.create({
    data: {
      user_id: id,
      title: resumerData.title,
      content: resumerData.content,
    },
  });
  return res.status(200).json({ data: result });
}));

resumesRouter.get('/list/get', authMiddleware, catchAsync(async (req, res) => {
  const { id, role } = req.user;
  let { sortBy, order, status } = req.query;

  sortBy = sortBy || 'createdAt';
  order = order === 'asc' ? 'asc' : 'desc';
  let whereClause;
  
  if (role === 'RECRUITER') {
    // 채용 담당자인 경우
    whereClause = {};
    if (status) {
      whereClause.support_status = status;
    }
  } else {
    // 지원자인 경우
    whereClause = { userId: id };
    if (status) {
      whereClause.support_status = status;
    }
  }

  const data = await prisma.resume.findMany({
    where: whereClause,
    orderBy: {
      [sortBy]: order,
    },
    select: {
      id: true,
      user: { select: { nickname: true } },
      title: true,
      content: true,
      support_status: true,
      created_at: true,
      updated_at: true,
    },
  });

  return res.status(200).json({ data: data });
}));

resumesRouter.get('/get/:resumeId', authMiddleware, catchAsync(async (req, res) => {
  const { id, role } = req.user;
  const { resumeId } = req.params;

  // 이력서가 존재하는지 확인
  const result = await prisma.resume.findFirst({
    where: { id: parseInt(resumeId) }
  });

  if (!result) {
    return res.status(404).json({ message: RESUME_MESSAGES.RESUME_NOT_FOUND });
  }
  if (role === 'APPLICANT' && result.user_id !== id) {
    return res.status(403).json({ message: RESUME_MESSAGES.ACCESS_DENIED });
  }

  // 이력서 조회
  const data = await prisma.resume.findMany({
    where: { id: parseInt(resumeId) },
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
    created_at: resume.created_at,
    updated_at: resume.updated_at,
  }));

  return res.status(200).json({ data: transformedData });
}));

resumesRouter.patch('/:resumeId', authMiddleware, catchAsync(async(req, res)=>{
  const { id } = req.user;
  const { resumeId } = req.params;
  const data = req.body;

  const { error } = resumerUpdateSchema.validate(data)
  if (error) return res.status(400).json({ message: error.message });

  // 이력서 존재 여부 확인
  const existingResume = await prisma.resume.findUnique({
    where: {
        id: parseInt(resumeId),
        user_id: id
      }
  });
  
  if (!existingResume) {
    return res.status(404).json({ error: RESUME_MESSAGES.RESUME_NOT_FOUND });
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


resumesRouter.delete('/:deleteId', authMiddleware, catchAsync(async(req, res)=>{
  const { id } = req.user;
  const { deleteId } = req.params;

  const data = await prisma.resume.findFirst({
    where: {
      id: parseInt(deleteId),
      user_id : id
    }
  })
  if(!data) return res.status(400).json({ message: RESUME_MESSAGES.RESUME_NOT_FOUND})

    const deletedResume = await prisma.resume.delete({
      where: {
        id: parseInt(deleteId)
      }
    });
  
  return res.status(200).json({ data: deletedResume.id})
}));

resumesRouter.patch('/resume/:resumeId/status', authMiddleware, requireRoles(['RECRUITER']), catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { resumeId } = req.params;
  const data = req.body;
  // 이력서 변경 로그의 유효성을 검사합니다.
  const { error } = resumerLogSchema.validate(data);
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  // 이력서를 찾습니다.
  const resume = await prisma.resume.findUnique({
    where: { id: parseInt(resumeId) },
  });
  if (!resume) {
    return res.status(404).json({ message: '이력서가 존재하지 않습니다.' });
  }
  const result = await prisma.$transaction(async (prisma) => {
    // 이력서 정보 업데이트
    await prisma.resume.update({
      where: { id: parseInt(resumeId) },
      data: { support_status: data.resumeStatus },
    });

    // 채용 담당자 정보 조회
    const recruiter = await prisma.user.findUnique({
      where: { id: userId },
    });
    // 이력서 로그 생성
    const resumeLog = await prisma.resumeLog.create({
      data: {
        resume: { connect: { id: parseInt(resumeId) } },
        recruiter: { connect: { id: recruiter.id } },
        oldSupport_status: resume.support_status,
        newSupport_status: data.resumeStatus,
        reason: data.reason,
      },
    });

    return resumeLog;
  });

  // 변경된 로그를 반환합니다.
  return res.status(200).json({ data: result });
}));

resumesRouter.get('/get/log/:resumeId', authMiddleware, catchAsync(async (req, res) => {
  const { resumeId } = req.params;

  const data = await prisma.resumeLog.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    where: {
      resumeId: parseInt(resumeId) // 이력서 ID로 필터링
    },
    select: {
      id: true, 
      resumeId: true, 
      oldSupport_status: true,
      newSupport_status: true,
      reason: true,
      createdAt: true,
      recruiter: {
        select: {
          nickname: true
        }
      }
    }
  });

  // 조회한 이력서 로그 정보를 반환
  return res.status(200).json({ data: data });
}));

export default resumesRouter;
