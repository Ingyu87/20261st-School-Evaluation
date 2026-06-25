export interface DistributionItem {
  label: string;
  count: number;
  percentage: number;
}

export interface QuestionStatistics {
  positiveRate: number;
  averageScore: number;
  rank?: number;
}

export interface LikertQuestion {
  id: string;
  type: "likert";
  area: string;
  areaGroup: string;
  shortTitle: string;
  fullText: string;
  operationNote?: string | null;
  responseCount: number;
  validResponseCount: number;
  distribution: DistributionItem[];
  statistics: QuestionStatistics;
  interpretation?: string;
}

export interface RawResponse {
  index: number;
  text: string;
  isFiltered: boolean;
}

export interface WordFreq {
  text: string;
  value: number;
}

export interface SubjectiveQuestion {
  id: string;
  area: string;
  shortTitle: string;
  fullText: string;
  rawResponses: RawResponse[];
  filteredResponses: RawResponse[];
  summary: string[];
  wordFrequency: WordFreq[];
  interpretation: string;
}

export interface OverallStats {
  positiveRate: number;
  averageScore: number;
  bestQuestionId?: string;
  worstQuestionId?: string;
  highlights: string[];
}

export interface SurveyTab {
  id: "teacher" | "staff";
  label: string;
  responseCount: number;
  questions: LikertQuestion[];
  subjective: SubjectiveQuestion;
  overall: OverallStats;
}

export interface SurveyDataset {
  meta: {
    school: string;
    period: string;
    title: string;
    generatedAt: string;
    teacherResponseCount: number;
    staffResponseCount: number;
    audience: string;
  };
  likertScale: string[];
  likertScores: Record<string, number>;
  teacher: SurveyTab;
  staff: SurveyTab;
}

export type TabId = "teacher" | "staff";
