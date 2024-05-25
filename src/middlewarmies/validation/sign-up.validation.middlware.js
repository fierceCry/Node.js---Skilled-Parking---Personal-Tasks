import Joi from 'joi';

/** 유저 회원가입 joi **/
export const userCreateSchema = async(req, res, next) => {
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

      checkPassword: Joi.string()
        .valid(Joi.ref('password')) // password 참고
        .required()
        .empty('')
        .messages({
          'any.only': '입력 한 두 비밀번호가 일치하지 않습니다.',
          'any.required': '비밀번호 확인을 입력해 주세요.',
        }),

      nickName: Joi.string().required().empty('').messages({
        'any.required': '이름을 입력해 주세요.',
      }),

      role: Joi.string().optional().messages({
        'string.base': '역할은 문자열이어야 합니다.',
      }),
    });
    await userSchema.validateAsync(req.body);
    next();
  } catch (error) {
    next(error);
  }
};
