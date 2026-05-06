# PCF Dashboard

제품 탄소 발자국(PCF) 관리 및 탄소 배출량 가시화를 위한 대시보드 솔루션

## 🚀 실행 방법

### 방법 1: Docker Compose + 로컬 실행 (추천)

이 방법은 데이터베이스는 Docker로, 애플리케이션은 로컬 Node.js 환경에서 실행하는 하이브리드 방식입니다.

```bash
# 1. 저장소 클론 및 이동
git clone https://github.com/hyunhyeee/hanaloop_task.git
cd hanaloop_task

# 2. 의존성 설치
(1) yarn instll, yarn build or (2) npm install

# 3. 데이터베이스 컨테이너 실행 및 .env 설정
docker-compose up -d

# 프로젝트 루트의 .env 파일 생성후 아래 내용 삽입
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres?schema=public"

# 4. 데이터베이스 초기화 및 초기 데이터 주입
npx prisma migrate dev
npx prisma db seed

# 5. 애플리케이션 실행
(1) yarn start or (2) npm run dev
```
---
## ⏳ 시연 영상

https://github.com/user-attachments/assets/f5733666-6070-4513-80de-6804083ed19d
---
## 🖥 화면 구성

<details>
<summary>실행 화면 보기</summary><br>
  
(1) **시작 페이지** <br><br>
<img width="2826" height="1296" alt="image" src="https://github.com/user-attachments/assets/de489368-8b76-4020-bf4d-b6b6d7f4bdde" />
<img width="2825" height="1031" alt="image" src="https://github.com/user-attachments/assets/23f7a707-1b3f-485f-af3d-4b4ac827456d" />
<img width="2822" height="1086" alt="image" src="https://github.com/user-attachments/assets/8bf286cc-3000-4e18-9b9e-79d160f53195" />
<img width="2833" height="775" alt="image" src="https://github.com/user-attachments/assets/1bfdf345-d614-48a8-ab77-677e1ae500be" /><br><br>


(2) **데이터 업로드 페이지**<br><br>
<img width="2830" height="1472" alt="image" src="https://github.com/user-attachments/assets/4713a9a3-d96d-4a69-a979-3e4c43180337" />
<br><br>

(3) **PCF 소개**<br><br>
<img width="2826" height="1494" alt="image" src="https://github.com/user-attachments/assets/0b7d65bd-f048-489e-8348-5e2937853e41" />
<br><br>

(4) **배출 계수 관리**<br><br>
<img width="2832" height="1500" alt="image" src="https://github.com/user-attachments/assets/5a404167-57e4-4f31-b066-cf25b60bc45f" />
<br><br>

(5) **탄소 예측 계산**<br><br>
<img width="2820" height="1490" alt="image" src="https://github.com/user-attachments/assets/353cb3d1-b6c6-4ccc-997c-e77302934495" />
<img width="2782" height="1385" alt="image" src="https://github.com/user-attachments/assets/0f5782fa-6be5-4f5d-ae36-09265bb10eb2" />




</details>
<br>


---

## 🛠 기술 스택

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

## ✨ 핵심 기능

### 1. 지능형 대시보드

- **실시간 요약**: 평균 제품 PCF, 감축 목표 대비 현재 감축률, 총 등록 제품 수 가시화.
- **다차원 분석**:
  - 제품별 PCF 비교 차트
  - 월별 배출량 트렌드
  - 전사적 배출원 비중 (Donut Chart - 원자재, 전기, 운송, 기타)
- **상태 관리**: 데이터가 없는 초기 상태에서도 레이아웃을 유지하며, 사용자에게 업로드 가이드를 제공합니다.

### 2. 스마트 데이터 관리 및 직접 임포트

- **무가공 엑셀 임포트**: 제공된 시험용 엑셀 파일을 **별도 가공 없이 그대로** PostgreSQL에 임포트할 수 있는 지능형 인터페이스 구현.
- **헤더 자동 탐색 및 매핑**: 데이터가 B3 셀 등 중간에서 시작하거나, 상단에 제목 텍스트가 있는 경우에도 '진짜 데이터'의 시작점을 자동으로 찾아냅니다.
- **유연한 컬럼 인식**: '일자(원본)', '날짜', '량', '수량' 등 다양한 변종 컬럼명을 시스템 표준 항목으로 자동 매핑합니다.
- **구글 시트 연동**: 구글 시트 URL을 통해 실시간으로 데이터를 동기화하며, 공유 설정 및 URL 오류에 대한 상세 가이드를 제공합니다.

### 3. 탄소 예측 계산기

- **실시간 예측**: 활동량을 입력하는 즉시 선택된 배출 계수와 연동하여 실시간 탄소 배출량(kgCO2e)을 계산 및 시각화합니다.
- **배출 계수 버전 관리**: 계수의 변경 이력을 추적하며, 특정 시점에 사용된 계수를 기반으로 계산의 정확성을 보장합니다.

### 4. 고도화된 에러 핸들링

- **필드별 상세 메시지**: 누락되거나 잘못된 입력 시, 전체 메시지 대신 해당 입력 필드 바로 아래에 구체적인 오류 내용과 경고 아이콘을 표시합니다.
- **파일 형식 검증**: 지원하지 않는 파일 형식(.xlsx, .xls, .csv 외) 업로드 시 즉각적인 차단 및 안내.
- **서버 에러 시각화**: API 호출 실패 시 서버에서 전달한 구체적인 에러 사유를 UI에 자연스럽게 노출합니다.

---

## 🏗 시스템 설계

### 데이터베이스 스키마

- **Company & Product**: 기업 및 제품 단위의 계층 구조 관리.
- **GhgEmission**: 모든 탄소 배출 활동의 원천 데이터 저장.
- **EmissionFactor & Version**: 배출계수의 최신값과 히스토리를 분리 관리하여 계산의 정확성과 추적성 확보.

### 설계 의도 및 Trade-off

- **Robust Parsing Logic**: 사용자가 수동으로 엑셀을 수정하는 번거로움을 최소화하기 위해, 제목줄 위치를 자동 탐색하도록 설계했습니다.
- **Type-Safe Implementation**: Prisma와 TypeScript를 전 과정에 적용하여 런타임 에러를 최소화하고 데이터 정밀도를 확보했습니다.

---

## 🤖 AI 도구 사용 내역

- **Gemini CLI**: 프로젝트 아키텍처 설계, Prisma 스키마 최적화, 복잡한 데이터 파싱 로직 구현 및 UI 컴포넌트 개발 전 과정에 활용되었습니다. 특히 **지능형 헤더 탐색 알고리즘** 구현과 **필드 단위 에러 핸들링** 시스템 구축에 핵심적인 역할을 수행했습니다.

---
### 작업 소요 시간
3일 (실제 작업 시간: 약 24시간)
<br/><br/>
### 시간이 많이 소요된 부분
PCF 대시보드 기획, 데이터베이스 연동 및 기초 값 산정, 데이터 값 불일치 해결 문제
