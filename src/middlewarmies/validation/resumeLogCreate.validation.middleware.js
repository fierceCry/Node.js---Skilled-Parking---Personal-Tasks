import Joi from 'joi';

/** 이력서 로그 생성 joi**/
export const resumerLogSchema = async(req, res, next)=>{
  try{
    const resumerLogSchema = Joi.object({
      resumeStatus: Joi.string()
      .required()
      .empty('')
      .error(new Error('변경하고자 하는 지원 상태를 입력해 주세요.')),
    
      reason: Joi.string()
      .empty('')
      .required()
      .error(new Error('지원 상태 변경 사유를 입력해 주세요.'))
    });
    await resumerLogSchema.validateAsync(req.body)
    next();
  }catch(error){
    next(error)
  }
}