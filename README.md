# Hanaloop Project

## Tech Stack

### Frontend

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/), [Styled-components](https://styled-components.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

### Backend & Database

- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Infrastructure**: [Docker](https://www.docker.com/) (Docker Compose)

## 프로젝트 실행 방법 (Getting Started)

1. **저장소 클론**

   ```bash
   git clone https://github.com/hyunhyeee/hanaloop_task.git
   cd hanaloop_task/hanaloop
   ```

2. **환경 변수 설정**
   `.env` 파일을 생성하고 데이터베이스 연결 정보를 입력합니다.

   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres?schema=public"
   ```

3. **의존성 설치**

   ```bash
   npm install
   ```

4. **데이터베이스 마이그레이션 및 시딩**

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **애플리케이션 실행**
   ```bash
   npm run dev
   ```
   접속 주소: [http://localhost:3000](http://localhost:3000)

## 시스템 설계 및 설명

### 설계 의도

- **버전 관리 중심 설계**: 탄소 배출계수는 고시 기준에 따라 수시로 변할 수 있습니다. 이를 단순히 업데이트하는 것이 아니라 `EmissionFactorVersion` 테이블을 통해 이력을 관리함으로써, 과거 시점의 배출량 계산 근거를 언제든지 추적할 수 있도록 설계했습니다.
- **확장 가능한 데이터 매핑**: 사용자가 제공하는 엑셀의 다양한 헤더 명칭을 유연하게 처리할 수 있도록 동적 매핑 로직을 구현했습니다. 이는 기업마다 다른 데이터 포맷에 신속하게 대응하기 위함입니다.

### 설계 Trade-off

- **Client vs Server Calculation**: 대시보드의 실시간 응답성을 위해 일부 계산 로직을 클라이언트 사이드에서 처리하도록 설계했습니다. 이는 서버 부하를 줄이지만, 데이터 무결성 보장을 위해 최종 저장은 서버 API에서 배출계수를 재검증한 후 처리하는 이중 검증 구조를 채택했습니다.

## AI 도구 사용 내역

- **Gemini CLI**: 프로젝트 초기 환경 세팅, Prisma 스키마 설계, 데이터 임포트 로직 구현, UI 컴포넌트 개발 및 README 문서화 전 과정에서 페어 프로그래밍 도구로 활용되었습니다. 특히 복잡한 정규표현식을 활용한 엑셀 데이터 파싱 로직 최적화에 기여했습니다.

## 구현 체크리스트

| 구분       | 과제 항목                                | 상태 | 비고                          |
| :--------- | :--------------------------------------- | :--- | :---------------------------- |
| **필수**   | PCF 계산 결과 시각화 및 직관적인 UI 구현 | ⏳   | 대시보드 및 상세 차트 구현    |
| **필수**   | 데이터 정확성 및 단위 표시 적절성        | ⏳   | kgCO2e 단위 및 자동 계산 적용 |
| **필수**   | 데이터 입력 오류 시 에러 메시지 표시     | ⏳   | 업로드 및 입력 폼 유효성 검사 |
| **필수**   | README 실행 방법 명확성 (5단계 이내)     | ⏳   | 상단 가이드 참조              |
| **필수**   | AI 도구 사용 내역 기록                   | ⏳   | AI 도구 사용 내역 섹션 참조   |
| **필수**   | 시스템 전체 설명 및 설계 내용 포함       | ⏳   | 시스템 설계 섹션 참조         |
| **필수**   | GitHub Public 저장소 및 커밋 히스토리    | ⏳   |                               |
| **권장**   | ERD 또는 스키마 다이어그램 포함          | ⏳   | `prisma/schema.prisma` 참조   |
| **권장**   | 설계 의도 및 Trade-off 설명              | ⏳   | 시스템 설계 섹션 참조         |
| **보너스** | Docker Compose 즉시 실행 가능            | ⏳   | `docker-compose.yaml` 포함    |
| **보너스** | 과제용 엑셀 데이터 직접 임포트 가능      | ⏳   | 데이터 매핑 로직 구현 완료    |
| **보너스** | OpenAPI / Swagger 문서                   | ⏳   |                               |
