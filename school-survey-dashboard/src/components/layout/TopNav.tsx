import styles from "./TopNav.module.css";

export function TopNav() {
  return (
    <header className={styles.nav}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>가동</span>
          <span className={styles.logoText}>서울가동초등학교</span>
        </div>
        <nav className={styles.links}>
          <a href="#insights">인사이트</a>
          <a href="#questions">문항별 분석</a>
          <a href="#subjective">서술형</a>
        </nav>
        <span className={styles.badge}>교내 전용</span>
      </div>
    </header>
  );
}
