import type { TabId, ViewId } from "../../types/survey";
import styles from "./ViewTabSwitcher.module.css";

interface ViewTabSwitcherProps {
  activeView: ViewId;
  onViewChange: (view: ViewId) => void;
}

const VIEWS: { id: ViewId; label: string }[] = [
  { id: "insights", label: "전체 인사이트" },
  { id: "questions", label: "문항별 분석" },
  { id: "subjective", label: "서술형 분석" },
  { id: "rawdata", label: "로우 데이터" },
];

export function ViewTabSwitcher({ activeView, onViewChange }: ViewTabSwitcherProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.tabs}>
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            className={activeView === v.id ? styles.active : styles.tab}
            onClick={() => onViewChange(v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function parseHash(): { tab: TabId; view: ViewId } | null {
  const hash = window.location.hash.replace("#", "");
  const match = hash.match(/^(teacher|staff)-(insights|questions|subjective|rawdata)$/);
  if (match) {
    return { tab: match[1] as TabId, view: match[2] as ViewId };
  }
  if (hash === "teacher" || hash === "staff") {
    return { tab: hash, view: "insights" };
  }
  return null;
}

export function buildHash(tab: TabId, view: ViewId) {
  return `${tab}-${view}`;
}
