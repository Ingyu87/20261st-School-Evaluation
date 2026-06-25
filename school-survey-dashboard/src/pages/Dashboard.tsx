import { useEffect, useState } from "react";
import type { SurveyDataset, TabId, ViewId } from "../types/survey";
import { loadSurveyData } from "../data/loaders";
import { TopNav } from "../components/layout/TopNav";
import { Hero } from "../components/layout/Hero";
import { TabSwitcher } from "../components/layout/TabSwitcher";
import {
  ViewTabSwitcher,
  parseHash,
  buildHash,
} from "../components/layout/ViewTabSwitcher";
import { Footer } from "../components/layout/Footer";
import { OverallInsights } from "../components/insights/OverallInsights";
import { QuestionList } from "../components/questions/QuestionList";
import { SubjectiveSection } from "../components/subjective/SubjectiveSection";
import { RawDataSection } from "../components/rawdata/RawDataSection";

export function Dashboard() {
  const [data, setData] = useState<SurveyDataset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("teacher");
  const [activeView, setActiveView] = useState<ViewId>("insights");

  useEffect(() => {
    loadSurveyData()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "오류"));
  }, []);

  useEffect(() => {
    const parsed = parseHash();
    if (parsed) {
      setActiveTab(parsed.tab);
      setActiveView(parsed.view);
    }
  }, []);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setActiveView("insights");
    window.location.hash = buildHash(tab, "insights");
  };

  const handleViewChange = (view: ViewId) => {
    setActiveView(view);
    window.location.hash = buildHash(activeTab, view);
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
        <ViewTabSwitcher activeView={activeView} onViewChange={handleViewChange} />

        {activeView === "insights" && (
          <OverallInsights
            overall={tab.overall}
            questions={tab.questions}
            responseCount={tab.responseCount}
          />
        )}
        {activeView === "questions" && <QuestionList questions={tab.questions} />}
        {activeView === "subjective" && <SubjectiveSection subjective={tab.subjective} />}
        {activeView === "rawdata" && (
          <RawDataSection
            questions={tab.questions}
            subjective={tab.subjective}
            responseCount={tab.responseCount}
          />
        )}
      </main>
      <Footer />
    </>
  );
}
