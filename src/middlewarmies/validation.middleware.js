import Joi from 'joi';

// 유저 생성 joi
const userCreateSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } }) // 이메일 형식을 확인
    .required()
    .messages({
      'string.email': '이메일 형식이 올바르지 않습니다.',
      'any.required': '이메일을 입력해 주세요.'
    }),
  
  password: Joi.string()
    .min(6) // 최소 6자리 확인
    .required()
    .messages({
      'string.min': '비밀번호는 6자리 이상이어야 합니다.',
      'any.required': '비밀번호를 입력해 주세요.'
    }),
  
  checkPassword: Joi.string()
    .valid(Joi.ref('password')) // password 참고
    .required()
    .messages({
      'any.only': '입력 한 두 비밀번호가 일치하지 않습니다.',
      'any.required': '비밀번호 확인을 입력해 주세요.'
    }),
  
  nickName: Joi.string()
    .required()
    .messages({
      'any.required': '이름을 입력해 주세요.'
    }),
});

//유저 로그인 joi
const userLoginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } }) // 이메일 형식을 확인
    .required()
    .messages({
      'string.email': '이메일 형식이 올바르지 않습니다.',
      'any.required': '이메일을 입력해 주세요.'
    }),
  
  password: Joi.string()
    .min(6) // 최소 6자리 확인
    .required()
    .messages({
      'string.min': '비밀번호는 6자리 이상이어야 합니다.',
      'any.required': '비밀번호를 입력해 주세요.'
    })
});

// 이력서 생성 joi
const resumerCreatesSchema = Joi.object({
  title: Joi.string()
    .required()
    .messages({
      'any.required': '이력서 제목을 입력해주세요.'
    }),

  content: Joi.string()
    .min(150)
    .required()
    .messages({
      'string.min': '자기소개는 150자 이상 작성해야 합니다.',
      'any.required': '자기소개를 입력해 주세요.'
    })
});

// 이력서 업데이트 joi
const resumerUpdateSchema = Joi.object({
  title: Joi.string().required().messages({
    'any.required': '이력서 제목을 입력해주세요.'
  }),

  content: Joi.string().min(150).required().messages({
    'string.min': '자기소개는 150자 이상 작성해야 합니다.',
    'any.required': '자기소개를 입력해 주세요.'
  })
}).messages({
  'object.or': '수정할 정보를 입력해 주세요.'
});

const resumerLogSchema = Joi.object({
  status: Joi.string().required()
    .error(new Error('변경하고자 하는 지원 상태를 입력해 주세요.')),

  reason: Joi.string().required()
    .error(new Error('지원 상태 변경 사유를 입력해 주세요.'))
});

export { 
  userCreateSchema, 
  userLoginSchema, 
  resumerCreatesSchema,
  resumerUpdateSchema,
  resumerLogSchema
};
