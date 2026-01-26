# 전자제품 고장/하자 전용 마켓플레이스

Node.js, Express, TypeScript, PostgreSQL 기반의 하자/고장 전자제품 전문 거래 플랫폼

## 📋 프로젝트 개요

고장나거나 하자가 있는 전자제품을 투명하게 거래할 수 있는 전문 마켓플레이스입니다. 상세한 상태 등급 시스템과 하자 추적 기능을 제공합니다.

### 핵심 기능

- 🔐 **인증 시스템**: JWT 기반 회원가입/로그인, 역할 관리 (구매자/판매자/관리자)
- 📊 **상태 등급 시스템**: A/B/C/D/F 등급 + 기능/외관 별도 평가
- 🔍 **하자 추적**: 각 하자를 독립 항목으로 관리 (이미지 포함)
- 🛠️ **수리 정보**: 수리 가능 여부 및 예상 비용 제공
- 💳 **결제 시스템**: Stripe 통합
- 👨‍💼 **관리자 패널**: 제품 승인, 사용자 관리, 통계

## 🚀 시작하기

### 필수 요구사항

- Node.js v20+
- PostgreSQL 15+
- npm 또는 yarn

### 설치

1. **의존성 설치**
```bash
npm install
```

2. **환경변수 설정**

`.env.example` 파일을 `.env`로 복사하고 값을 설정하세요:

```bash
cp .env.example .env
```

필수 환경변수:
- `DATABASE_URL`: PostgreSQL 연결 문자열
- `JWT_SECRET`: JWT 비밀키
- `CLOUDINARY_*`: Cloudinary 설정 (이미지 업로드)
- `STRIPE_SECRET_KEY`: Stripe 비밀키

3. **데이터베이스 설정**

```bash
# Prisma 클라이언트 생성
npm run prisma:generate

# 마이그레이션 실행
npm run prisma:migrate

# 시드 데이터 삽입
npm run prisma:seed
```

4. **개발 서버 실행**

```bash
npm run dev
```

서버가 `http://localhost:5000`에서 실행됩니다.

## 📁 프로젝트 구조

```
src/
├── config/          # 설정 파일 (database, cloudinary, stripe)
├── controllers/     # 비즈니스 로직
├── middleware/      # 인증, 권한, 에러 처리
├── routes/          # API 라우트
├── types/           # TypeScript 타입 정의
├── utils/           # 유틸리티 함수 (JWT, 비밀번호, 로거)
├── app.ts           # Express 앱 설정
└── server.ts        # 서버 진입점
```

## 🔌 API 엔드포인트

### 인증 (`/api/auth`)
- `POST /register` - 회원가입
- `POST /login` - 로그인
- `GET /me` - 현재 사용자 정보
- `POST /become-seller` - 판매자 전환

### 제품 (`/api/products`)
- `GET /` - 제품 목록 (필터링, 페이지네이션)
- `GET /:id` - 제품 상세
- `POST /` - 제품 등록 (판매자, 관리자)
- `PUT /:id` - 제품 수정
- `DELETE /:id` - 제품 삭제
- `POST /:id/images` - 이미지 추가

### 카테고리 (`/api/categories`)
- `GET /` - 카테고리 목록
- `POST /` - 카테고리 생성 (관리자)

### 주문 (`/api/orders`)
- `POST /` - 주문 생성
- `GET /` - 주문 목록
- `GET /:id` - 주문 상세
- `PUT /:id/cancel` - 주문 취소

### 결제 (`/api/payments`)
- `POST /create-intent` - Stripe Payment Intent 생성
- `POST /confirm` - 결제 확인

### 관리자 (`/api/admin`)
- `GET /products/pending` - 승인 대기 제품
- `PUT /products/:id/approve` - 제품 승인
- `PUT /products/:id/reject` - 제품 거부
- `GET /users` - 전체 사용자
- `GET /orders` - 전체 주문
- `GET /statistics` - 플랫폼 통계

## 🗄️ 데이터베이스 스키마

### 주요 모델

- **User**: 사용자 (구매자/판매자/관리자)
- **SellerProfile**: 판매자 프로필
- **Product**: 제품 정보
- **ProductCondition**: 제품 상태 평가
- **DefectDetail**: 하자 상세 정보
- **Category**: 카테고리 (계층 구조)
- **Order**: 주문
- **OrderItem**: 주문 항목

### 상태 등급

- **Overall Grade**: A (거의 새것) ~ F (부품용)
- **Functional Status**: 완전 작동 / 부분 작동 / 작동 안 함
- **Cosmetic Grade**: Excellent / Good / Fair / Poor

## 🧪 테스트 계정

시드 데이터 실행 후 다음 계정으로 로그인 가능:

- **관리자**: `admin@marketplace.com` / `password123`
- **판매자 1**: `seller1@gmail.com` / `password123`
- **판매자 2**: `seller2@gmail.com` / `password123`
- **구매자**: `buyer@gmail.com` / `password123`

## 📜 스크립트

```bash
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm start            # 프로덕션 서버 실행
npm run prisma:studio    # Prisma Studio (DB GUI)
npm run prisma:generate  # Prisma 클라이언트 생성
npm run prisma:migrate   # DB 마이그레이션
npm run prisma:seed      # 시드 데이터 삽입
```

## 🔐 보안

- Helmet으로 HTTP 헤더 보안
- CORS 설정
- Rate limiting (15분당 100 요청)
- JWT 기반 인증
- bcryptjs 비밀번호 암호화
- 역할 기반 권한 관리

## 📝 로깅

Winston을 사용한 로깅:
- 개발: 콘솔 출력
- 프로덕션: 파일 저장 (`logs/`)

## 🌐 환경 변수

`.env.example` 참고:
- `NODE_ENV`: development | production
- `PORT`: 서버 포트 (기본: 5000)
- `DATABASE_URL`: PostgreSQL 연결 문자열
- `JWT_SECRET`: JWT 비밀키
- `CLOUDINARY_*`: 이미지 업로드 설정
- `STRIPE_SECRET_KEY`: 결제 설정
- `CORS_ORIGIN`: CORS 허용 출처

## 🚧 개발 로드맵

### 완료
- ✅ 인증 시스템
- ✅ 제품 관리 (상태/하자)
- ✅ 카테고리 관리
- ✅ 주문 시스템
- ✅ Stripe 결제
- ✅ 관리자 패널

### 예정
- ⏳ 프론트엔드 (React/Next.js)
- ⏳ 리뷰 시스템
- ⏳ 이미지 업로드 (Cloudinary)
- ⏳ 이메일 알림
- ⏳ 검색 최적화

## 📄 라이선스

MIT

## 👨‍💻 개발자

포트폴리오 프로젝트

## 테스트

GitHub Actions를 통한 자동 배포 테스트
