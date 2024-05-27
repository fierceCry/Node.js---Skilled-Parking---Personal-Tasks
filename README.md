
## 프로젝트 설명
이 프로젝트는 사용자가 회원가입 및 로그인을 통해 이력서를 생성하여, 채용자가 이를 검토하여 상태를 수정할 수 있는 이력서 관리 시스템의 백엔드입니다.

## 기능
이 프로젝트는 다음과 같은 주요 기능을 제공합니다:
- **사용자 회원가입 및 로그인**: 사용자는 회원가입을 통해 계정을 생성하고, 로그인하여 시스템에 접근할 수 있습니다.
- **사용자 인증**: 사용자는 본인의 데이터를 조회할 수 있습니다.
- **이력서 생성**: 사용자는 이력서를 생성할 수 있습니다.
- **이력서 목록 조회**: 사용자가 작성한 이력서를 목록 형태로 조회할 수 있습니다.
- **이력서 상세 조회**: 사용자가 작성한 이력서를 상세히 조회할 수 있습니다.
- **이력서 수정**: 사용자는 이력서를 수정할 수 있습니다.
- **이력서 삭제**: 사용자가 이력서를 삭제할 수 있습니다.
- **토큰 재발급**: 사용자가 액세스 토큰이 만료되었을 때 리프레시 토큰을 통해 액세스 토큰을 재발급 받을 수 있습니다.
- **로그아웃**: 사용자가 로그아웃할 때 리프레시 토큰을 데이터베이스에서 삭제합니다.
- **이력서 상태 관리**: 채용자는 제출된 이력서를 검토하고, 불합격, 합격, 1차 패스 등의 상태로 변경할 수 있습니다.
- **이력서 로그 조회**: 채용자가 이력서를 검토하고 상태를 변경했을 때 로그 정보를 생성합니다.

### 기술 스택
- **백엔드 프레임워크**: Node.js, Express
- **데이터베이스**: MySQL
- **인증 및 보안**: JSON Web Token (JWT), bcrypt, Joi

## 목차

1. [소개](#프로젝트-설명)
2. [설치](#프로젝트-설치-및-실행-방법)
3. [사용법](#프로젝트-사용-방법)
4. [참고 자료](#참고-자료)

## 프로젝트 설치 및 실행 방법

이 프로젝트를 로컬 환경에 설치하고 실행하는 방법은 다음과 같습니다:

1. 저장소를 클론합니다:
    ```bash
    git clone https://github.com/fierceCry/Node.js-Skilled-Parking-Personal-Tasks.git
    ```

2. 프로젝트 디렉토리로 이동합니다:
    ```bash
    cd Node.js-Skilled-Parking-Personal-Tasks
    ```

3. 필요한 패키지를 설치합니다:
    ```bash
    npm install
    ```

4. 환경 변수를 설정합니다. `.env` 파일을 생성하고 다음과 같은 설정을 추가합니다:
    ```
    PORT=3000
    DATABASE_URL="mysql://<name>:<password>@127.0.0.1:3306/myDatabase"
    SALT_ROUNDS=10
    SECRET_KEY=your_secret_key-JWT-KEY
    JWT_EXPIRATION_TIME=12h
    REFRESH_SECRET_KEY=your_secret_key
    REFRESH_TOKEN_EXPIRATION_TIME=7d
    ```

5. 애플리케이션을 실행합니다:
    ```bash
    npm run dev
    ```

6. 서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

## 프로젝트 사용 방법

### API 엔드포인트

#### 사용자 회원가입
- **Method**: `POST`
- **URL**: `/auth/sign-up`

#### 사용자 로그인
- **Method**: `POST`
- **URL**: `/auth/sign-in`

#### 사용자 인증
- **Method**: `GET`
- **URL**: `/users/profile`

#### 이력서 생성
- **Method**: `POST`
- **URL**: `/resumes/create`

#### 이력서 목록 조회
- **Method**: `GET`
- **URL**: `/resumes/list`

#### 이력서 상세 조회
- **Method**: `GET`
- **URL**: `/resumes/:resumeId/detail`

#### 이력서 수정
- **Method**: `PATCH`
- **URL**: `/resumes/:resumeId`

#### 이력서 삭제
- **Method**: `DELETE`
- **URL**: `/resumes/:deleteId/resume`

#### 토큰 재발급
- **Method**: `POST`
- **URL**: `/users/token/refresh`

#### 로그아웃
- **Method**: `GET`
- **URL**: `/users/logout`

#### 이력서 상태 관리
- **Method**: `PATCH`
- **URL**: `/resumes/resume/:resumeId/status`

#### 이력서 로그 조회
- **Method**: `GET`
- **URL**: `/resumes.resume/log/:resumeId`


### 참고 자료
- [Node.js Express 튜토리얼](https://expressjs.com/en/starter/installing.html)
- [MySQL 공식 문서](https://dev.mysql.com/doc/refman/8.0/en/select.html)
- [JSON Web Token (JWT) 공식 문서](https://jwt.io/introduction/)
- [Joi 공식 문서](https://joi.dev/api/?v=17.13.0)
