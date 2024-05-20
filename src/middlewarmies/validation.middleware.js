import Joi from 'joi';

// 유저 생성 joi
const userCreateSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } }) // 이메일 형식을 확인
    .required()
    .error(new Error('이메일 형식이 올바르지 않습니다.')),
  
  password: Joi.string()
    .min(6) // 최소 6자리 확인
    .required()
    .error(new Error('비밀번호는 6자리 이상이어야 합니다.')),
  
  checkPassword: Joi.string()
    .valid(Joi.ref('password')) // checkPassword가 password와 같은지 확인
    .required()
    .error(new Error('입력 한 두 비밀번호가 일치하지 않습니다.')),
  
  nickName: Joi.string()
    .required()
    .error(new Error('이름을 입력해주세요.')),
});

//유저 로그인 joi
const userLoginSchema = Joi.object({
  email: Joi.string()
  .email({ tlds: { allow: false } }) // 이메일 형식을 확인
  .required().
  error(new Error('이메일을 입력해주세요.')),

  password: Joi.string()
    .required()
    .error(new Error('비밀번호를 입력해주세요.'))
});

// // 패스워드 joi
// const passwordSchema = Joi.object({
//   password: Joi.string()
//     .required()
//     .error(new Error('비밀번호를 입력해주세요.')),
// });

export { userCreateSchema, userLoginSchema};
