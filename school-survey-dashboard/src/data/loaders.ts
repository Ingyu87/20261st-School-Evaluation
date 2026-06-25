import type { SurveyDataset } from "../types/survey";

export async function loadSurveyData(): Promise<SurveyDataset> {
  const res = await fetch("/data/survey-data.json");
  if (!res.ok) throw new Error("설문 데이터를 불러올 수 없습니다.");
  return res.json();
}
