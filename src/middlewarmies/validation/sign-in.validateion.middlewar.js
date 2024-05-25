import Joi from 'joi';

/** 유저 로그인 joi **/
export const userLoginSchema = async (req, res, next) => {
  try {
    const userSchema = Joi.object({
      email: Joi.string()
        .email({ tlds: { allow: false } }) // 이메일 형식을 확인
        .required()
        .empty('')
        .messages({
          'string.email': '이메일 형식이 올바르지 않습니다.',
          'any.required': '이메일을 입력해 주세요.',
        }),

      password: Joi.string()
        .min(6) // 최소 6자리 확인
        .required()
        .empty('')
        .messages({
          'string.min': '비밀번호는 6자리 이상이어야 합니다.',
          'any.required': '비밀번호를 입력해 주세요.',
        }),
    });
    await userSchema.validateAsync(req.body);
    next();
  } catch (error) {
    next(error);
  }
};
