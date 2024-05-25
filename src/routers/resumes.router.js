import express from 'express';
import { authMiddleware } from '../middlewarmies/require-access-token.middleware.js';
import { catchAsync } from '../middlewarmies/error-handler.middleware.js';
import { resumerCreatesSchema } from '../middlewarmies/validation.middleware.js';
import prisma from '../utils/prisma.util.js';
import { resumerUpdateSchema, resumerLogSchema } from '../middlewarmies/validation.middleware.js';
import { RESUME_MESSAGES } from '../constants/resume.constant.js';
import { requireRoles } from '../middlewarmies/require-roles.middleware.js';

const resumesRouter = express.Router();

/** 이력서 생성 API **/
resumesRouter.post('/post', authMiddleware, catchAsync(async (req, res) => {
  const { id } = req.user;
  const resumerData = req.body;
  const { error } = resumerCreatesSchema.validate(resumerData);
  if (error) return res.status(400).json({ message: error.message });
  
  // 이력서 생성
  const result = await prisma.resume.create({
    data: {
      user_id: id,
      title: resumerData.title,
      content: resumerData.content,
    },
  });
  return res.status(200).json({ data: result });
}));

/** 이력서 목록 조회 API **/
resumesRouter.get('/list/get', authMiddleware, catchAsync(async (req, res) => {
  const { id, role } = req.user;
  let { sortBy = 'created_at', order = 'desc', status } = req.query;

  // 기본적으로 'desc'로 설정
  order = order === 'asc' ? 'asc' : 'desc';

  // whereClause 설정
  const whereClause = role === 'RECRUITER' ? {} : { user_id: id };
  if (status) {
    whereClause.support_status = status;
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

  return res.status(200).json({ data });
}));

/** 이력서 상세 조회 API **/
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

  return res.status(200).json({ data: data });
}));

/** 이력서 수정 API **/
resumesRouter.patch('/:resumeId', authMiddleware, catchAsync(async(req, res)=>{
  const data = req.body;
  const { id } = req.user;
  const { resumeId } = req.params;

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

/** 이력서 삭제 API **/
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

/** 이력서 지원자 이력서 수정 & 로그 생성 API **/
resumesRouter.patch('/resume/:resumeId/status', authMiddleware, requireRoles(['RECRUITER']), catchAsync(async (req, res) => {
  const userId = req.user.id;
  const data = req.body;
  const { resumeId } = req.params;
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
        old_support_status: resume.support_status,
        new_upport_status: data.resumeStatus,
        reason: data.reason,
      },
    });

    return resumeLog;
  });

  // 변경된 로그를 반환합니다.
  return res.status(200).json({ data: result });
}));

/** 이력서 로그 조회 API **/
resumesRouter.get('/get/log/:resumeId', authMiddleware, catchAsync(async (req, res) => {
  const { resumeId } = req.params;
  const data = await prisma.resumeLog.findMany({
    orderBy: {
      created_at: 'desc',
    },
    where: {
      resume_id: parseInt(resumeId) // 이력서 ID로 필터링
    },
    select: {
      id: true, 
      resume_id: true, 
      old_support_status: true,
      new_support_status: true,
      reason: true,
      created_at: true,
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
