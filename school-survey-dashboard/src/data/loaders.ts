import type { SurveyDataset } from "../types/survey";

export async function loadSurveyData(): Promise<SurveyDataset> {
  const url = `${import.meta.env.BASE_URL}data/survey-data.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("설문 데이터를 불러올 수 없습니다.");
  return res.json();
}
