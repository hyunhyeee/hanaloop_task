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

- **Framework**: Next.js 15 (App Router)
- **Library**: React 19
- **Styling**: Tailwind CSS 4, Lucide React (Icons), Shadcn UI (Components)
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

### 2. 스마트 데이터 관리 및 직접 임포트 (Data Management & Import)

- **무가공 엑셀 임포트**: 제공된 시험용 엑셀 파일을 **별도 가공 없이 그대로** PostgreSQL에 임포트할 수 있는 지능형 인터페이스 구현.
- **헤더 자동 탐색 및 매핑**: 데이터가 B3 셀 등 중간에서 시작하거나, 상단에 제목 텍스트가 있는 경우에도 '진짜 데이터'의 시작점을 자동으로 찾아냅니다.
- **유연한 컬럼 인식**: '일자(원본)', '날짜', '량', '수량' 등 다양한 변종 컬럼명을 시스템 표준 항목으로 자동 매핑합니다.
- **구글 시트 연동**: 구글 시트 URL을 통해 실시간으로 데이터를 동기화하며, 공유 설정 및 URL 오류에 대한 상세 가이드를 제공합니다.

### 3. 탄소 예측 계산기 (Advanced Calculator)

- **실시간 예측**: 활동량을 입력하는 즉시 선택된 배출 계수와 연동하여 실시간 탄소 배출량(kgCO2e)을 계산 및 시각화합니다.
- **배출 계수 버전 관리**: 계수의 변경 이력을 추적하며, 특정 시점에 사용된 계수를 기반으로 계산의 정확성을 보장합니다.

### 4. 고도화된 에러 핸들링 (Error Handling)

- **필드별 상세 메시지**: 누락되거나 잘못된 입력 시, 전체 메시지 대신 해당 입력 필드 바로 아래에 구체적인 오류 내용과 경고 아이콘을 표시합니다.
- **파일 형식 검증**: 지원하지 않는 파일 형식(.xlsx, .xls, .csv 외) 업로드 시 즉각적인 차단 및 안내.
- **서버 에러 시각화**: API 호출 실패 시 서버에서 전달한 구체적인 에러 사유를 UI에 자연스럽게 노출합니다.

---

## 🏗 시스템 설계 (Functional Design)

### 데이터베이스 스키마 (ERD Logic)

- **Company & Product**: 기업 및 제품 단위의 계층 구조 관리.
- **GhgEmission**: 모든 탄소 배출 활동의 원천 데이터 저장.
- **EmissionFactor & Version**: 배출계수의 최신값과 히스토리를 분리 관리하여 계산의 정확성과 추적성 확보.

### 설계 의도 및 Trade-off

- **Robust Parsing Logic**: 사용자가 수동으로 엑셀을 수정하는 번거로움을 최소화하기 위해, 파싱 로직에 휴리스틱(Heuristic) 알고리즘을 도입하여 제목줄 위치를 자동 탐색하도록 설계했습니다.
- **Type-Safe Implementation**: Prisma와 TypeScript를 전 과정에 적용하여 런타임 에러를 최소화하고 데이터 정밀도를 확보했습니다.

---

## 🤖 AI 도구 사용 내역

- **Gemini CLI**: 프로젝트 아키텍처 설계, Prisma 스키마 최적화, 복잡한 데이터 파싱 로직 구현 및 UI 컴포넌트 개발 전 과정에 활용되었습니다. 특히 **지능형 헤더 탐색 알고리즘** 구현과 **필드 단위 에러 핸들링** 시스템 구축에 핵심적인 역할을 수행했습니다.

## 구현 체크리스트

| 구분       | 과제 항목                                | 상태 | 비고                                                         |
| :--------- | :--------------------------------------- | :--- | :----------------------------------------------------------- |
| **필수**   | PCF 계산 결과 시각화 및 직관적인 UI 구현 | ✅   | 대시보드 및 상세 차트 구현 완료                              |
| **필수**   | 데이터 정확성 및 단위 표시 적절성        | ✅   | kgCO2e 단위 및 자동 계산 로직 적용                           |
| **필수**   | 데이터 입력 오류 시 에러 메시지 표시     | ✅   | 필드별 상세 에러 메시지 및 유효성 검사 완료                  |
| **필수**   | README 실행 방법 명확성 (5단계 이내)     | ✅   | Docker Compose 기반 간편 실행 가이드 포함                    |
| **필수**   | AI 도구 사용 내역 기록                   | ✅   | Gemini CLI 활용 내역 명시                                    |
| **필수**   | 시스템 전체 설명 및 설계 내용 포함       | ✅   | 시스템 설계 및 설계 의도 섹션 추가                           |
| **필수**   | GitHub Public 저장소 및 커밋 히스토리    | ✅   | 완료                                                         |
| **권장**   | ERD 또는 스키마 다이어그램 포함          | ✅   | `prisma/schema.prisma` 및 설계 설명 포함                     |
| **권장**   | 설계 의도 및 Trade-off 설명              | ✅   | 시스템 설계 섹션 내 상세 기술                                |
| **보너스** | Docker Compose 즉시 실행 가능            | ✅   | `docker-compose.yaml` 및 환경 설정 완료                      |
| **보너스** | 과제용 엑셀 데이터 직접 임포트 가능      | ✅   | **무가공 직접 임포트 인터페이스 구현 완료 (추가 가점 항목)** |
| **보너스** | OpenAPI / Swagger 문서                   | ⏳   |                                                              |
