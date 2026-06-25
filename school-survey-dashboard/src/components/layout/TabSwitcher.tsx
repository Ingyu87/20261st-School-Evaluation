import type { TabId } from "../../types/survey";
import styles from "./TabSwitcher.module.css";

interface TabSwitcherProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  teacherCount: number;
  staffCount: number;
}

export function TabSwitcher({ activeTab, onTabChange, teacherCount, staffCount }: TabSwitcherProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.tabs}>
        <button
          type="button"
          className={activeTab === "teacher" ? styles.active : styles.tab}
          onClick={() => onTabChange("teacher")}
        >
          교원용 ({teacherCount}명)
        </button>
        <button
          type="button"
          className={activeTab === "staff" ? styles.active : styles.tab}
          onClick={() => onTabChange("staff")}
        >
          교직원용 ({staffCount}명)
        </button>
      </div>
    </div>
  );
}
