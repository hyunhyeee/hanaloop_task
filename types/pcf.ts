/**
 * 탄소 배출량의 전과정 단계 (Life Cycle Stages) - PCF 기준
 */
export type LifecycleStage = 
  | 'RAW_MATERIAL'   // 원소재 조달
  | 'PRODUCTION'     // 제조/생산 (전기 포함)
  | 'TRANSPORTATION' // 물류/운송
  | 'USE'            // 사용
  | 'DISPOSAL';      // 폐기

/**
 * GHG Protocol에 따른 배출 범위 (Scopes) - 조직 탄소 회계 기준
 */
export type GhgScope = 
  | 'SCOPE_1' // 직접 배출 (연료 연소 등)
  | 'SCOPE_2' // 간접 배출 (전기, 열 등)
  | 'SCOPE_3'; // 기타 간접 배출 (공급망 등)

/**
 * 제품 정보
 */
export interface Product {
  id: string;
  name: string;
  sku?: string | null;
  category?: string | null;
  unit?: string | null;
  companyId: string;
}

/**
 * 배출원 상세 데이터 (실무자용 상세 데이터)
 */
export interface EmissionSource {
  id: string;
  stage: LifecycleStage;
  name: string;
  value: number;
  unit: string;
  emissionFactor: number;
  totalCo2e: number;
}

/**
 * 제품별 PCF 결과 (경영자/실무자 공통)
 */
export interface ProductPCF {
  id: string;
  productName: string;
  sku?: string;
  category: string;
  unit: string;
  totalCo2e: number;
  lastUpdated: string;
  breakdown: {
    [key in LifecycleStage]: number;
  };
  sources: EmissionSource[];
}

/**
 * 대시보드 요약 데이터 (경영자용)
 */
export interface PCFDashboardSummary {
  totalAveragePcf: number;
  topEmissionProducts: {
    name: string;
    value: number;
  }[];
  monthlyTrend: {
    month: string;
    emissions: number;
  }[];
  reductionTarget: number;
  currentReduction: number;
}
