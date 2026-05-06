# Hanaloop Sustainability PCF Dashboard

하나루프(Hanaloop)의 제품 탄소 발자국(PCF) 관리 및 탄소 배출량 가시화를 위한 엔터프라이즈급 대시보드 솔루션입니다.

## 🚀 실행 방법 (Getting Started)

가장 빠르고 간편한 실행을 위해 **Docker** 환경을 권장합니다.

### 방법 1: Docker Compose 사용 (권장)

```bash
# 1. 저장소 클론
git clone https://github.com/hyunhyeee/hanaloop_task.git
cd hanaloop_task/hanaloop

# 2. 컨테이너 빌드 및 실행 (DB 포함)
docker-compose up -d

# 3. 데이터베이스 초기화 및 기초 수치(Seed) 주입
npx prisma migrate dev --name init
npx prisma db seed

# 4. 접속
# http://localhost:3000
```

### 방법 2: 로컬 환경 실행

_필요 조건: Node.js 20+, PostgreSQL_

```bash
# 1. 의존성 설치
npm install

# 2. .env 설정 (DATABASE_URL 입력)
# 예: DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres?schema=public"

# 3. Prisma 설정
npx prisma migrate dev
npx prisma db seed

# 4. 앱 실행
npm run dev
```

---

## 🛠 기술 스택 (Tech Stack)

### Frontend

- **Framework**: Next.js 16 (App Router)
- **Library**: React 19
- **Styling**: Tailwind CSS 4, Lucide React (Icons)
- **Charts**: Recharts (데이터 시각화)
- **Language**: TypeScript

### Backend & Database

- **ORM**: Prisma (Type-safe Database Access)
- **Database**: PostgreSQL 15
- **Data Parsing**: XLSX (Excel/CSV 처리)

### Infrastructure

- **Container**: Docker, Docker Compose

---

## ✨ 핵심 기능 (Features)

### 1. 지능형 대시보드 (Sustainability Overview)

- **실시간 요약**: 평균 제품 PCF, 감축 목표 대비 현재 감축률, 총 등록 제품 수 가시화.
- **다차원 분석**:
  - 제품별 PCF 비교 차트 (Top Emission Products)
  - 월별 배출량 트렌드 (Stacked Area Chart)
  - 전사적 배출원 비중 (Donut Chart - 원자재, 전기, 운송, 기타)
- **상태 관리**: 데이터가 없는 초기 상태에서도 레이아웃을 유지하며, 사용자에게 업로드 가이드를 제공합니다.

### 2. 스마트 데이터 관리 (Data Management)

- **엑셀/CSV 업로드**: 사용자가 보유한 활동량 데이터를 드래그 앤 드롭으로 간편하게 업로드.
- **동적 매핑**: 엑셀의 다양한 헤더 명칭(예: '일자', '날짜', 'Date')을 지능적으로 인식하여 시스템 데이터와 매핑.
- **전용 데이터 삭제**: 기초 수치(배출계수)는 보존하면서 사용자가 테스트로 업로드한 데이터만 원클릭으로 초기화하는 기능 제공.

### 3. 탄소 배출량 계산 로직 (PCF Calculation)

- **배출계수 버전 관리**: 고시된 배출계수의 변경 이력을 관리하여, 과거 시점의 배출량도 정확하게 추적 가능.
- **카테고리 자동 분류**: 입력된 활동 유형을 시스템 표준 카테고리(전기, 원자재, 운송 등)로 자동 분류 및 배출량 계산.

---

## 🏗 시스템 설계 (Functional Design)

### 데이터베이스 스키마 (ERD Logic)

- **Company & Product**: 기업 및 제품 단위의 계층 구조 관리.
- **GhgEmission**: 모든 탄소 배출 활동의 원천 데이터 저장.
- **EmissionFactor & Version**: 배출계수의 최신값과 히스토리를 분리 관리하여 계산의 정확성과 추적성 확보.

### 설계 의도 및 Trade-off

- **Data Persistence**: Docker 볼륨 바인딩을 통해 컨테이너 재시작 시에도 데이터를 유지하도록 설계하되, 개발 및 테스트 편의를 위해 UI 내에서 데이터 초기화 기능을 별도로 구현했습니다.
- **Empty State UX**: 데이터가 전혀 없는 'Cold Start' 상황에서도 대시보드의 기본 구조를 노출하여 사용자가 서비스의 가치를 즉시 파악하고 행동(업로드)을 유도하도록 설계했습니다.

---

## 🤖 AI 도구 사용 내역

- **Gemini CLI**: 프로젝트 아키텍처 설계, Prisma 스키마 최적화, 복잡한 데이터 파싱 로직 구현 및 UI 컴포넌트 개발 전 과정에 활용되었습니다. 특히 데이터 초기화 기능 구현 시 발생할 수 있는 외래 키 참조 오류 해결 및 README 자동화에 기여했습니다.

## 구현 체크리스트

| 구분       | 과제 항목                                | 상태 | 비고                          |
| :--------- | :--------------------------------------- | :--- | :---------------------------- |
| **필수**   | PCF 계산 결과 시각화 및 직관적인 UI 구현 | ✅   | 대시보드 및 상세 차트 구현    |
| **필수**   | 데이터 정확성 및 단위 표시 적절성        | ✅   | kgCO2e 단위 및 자동 계산 적용 |
| **필수**   | 데이터 입력 오류 시 에러 메시지 표시     | ⏳   | 업로드 및 입력 폼 유효성 검사 |
| **필수**   | README 실행 방법 명확성 (5단계 이내)     | ⏳   | 상단 가이드 참조              |
| **필수**   | AI 도구 사용 내역 기록                   | ⏳   | AI 도구 사용 내역 섹션 참조   |
| **필수**   | 시스템 전체 설명 및 설계 내용 포함       | ⏳   | 시스템 설계 섹션 참조         |
| **필수**   | GitHub Public 저장소 및 커밋 히스토리    | ✅   |                               |
| **권장**   | ERD 또는 스키마 다이어그램 포함          | ⏳   | `prisma/schema.prisma` 참조   |
| **권장**   | 설계 의도 및 Trade-off 설명              | ⏳   | 시스템 설계 섹션 참조         |
| **보너스** | Docker Compose 즉시 실행 가능            | ✅   | `docker-compose.yaml` 포함    |
| **보너스** | 과제용 엑셀 데이터 직접 임포트 가능      | ✅   | 데이터 매핑 로직 구현 완료    |
| **보너스** | OpenAPI / Swagger 문서                   | ⏳   |                               |
