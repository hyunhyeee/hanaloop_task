/**
 * 탄소 배출량의 전과정 단계 (Life Cycle Stages)
 */
export type LifecycleStage = 
  | 'RAW_MATERIAL'   // 원소재 조달
  | 'PRODUCTION'     // 제조/생산 (전기 포함)
  | 'TRANSPORTATION' // 물류/운송
  | 'USE'            // 사용
  | 'DISPOSAL';      // 폐기

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
