import { useEffect, useState } from "react";
import type { SurveyDataset, TabId } from "../types/survey";
import { loadSurveyData } from "../data/loaders";
import { TopNav } from "../components/layout/TopNav";
import { Hero } from "../components/layout/Hero";
import { TabSwitcher } from "../components/layout/TabSwitcher";
import { Footer } from "../components/layout/Footer";
import { OverallInsights } from "../components/insights/OverallInsights";
import { QuestionList } from "../components/questions/QuestionList";
import { SubjectiveSection } from "../components/subjective/SubjectiveSection";

export function Dashboard() {
  const [data, setData] = useState<SurveyDataset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("teacher");

  useEffect(() => {
    loadSurveyData()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "오류"));
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "staff" || hash === "teacher") {
      setActiveTab(hash);
    }
  }, []);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  if (error) {
    return (
      <div style={{ padding: 48, textAlign: "center" }}>
        <p>{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: 48, textAlign: "center", color: "var(--color-muted)" }}>
        데이터를 불러오는 중…
      </div>
    );
  }

  const tab = data[activeTab];

  return (
    <>
      <TopNav />
      <Hero
        school={data.meta.school}
        period={data.meta.period}
        title={data.meta.title}
        teacherCount={data.meta.teacherResponseCount}
        staffCount={data.meta.staffResponseCount}
      />
      <main className="container">
        <TabSwitcher
          activeTab={activeTab}
          onTabChange={handleTabChange}
          teacherCount={data.meta.teacherResponseCount}
          staffCount={data.meta.staffResponseCount}
        />
        <OverallInsights
          overall={tab.overall}
          questions={tab.questions}
          responseCount={tab.responseCount}
        />
        <QuestionList questions={tab.questions} />
        <SubjectiveSection subjective={tab.subjective} />
      </main>
      <Footer />
    </>
  );
}
