import styles from "./TopNav.module.css";

export function TopNav() {
  return (
    <header className={styles.nav}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>가동</span>
          <span className={styles.logoText}>서울가동초등학교</span>
        </div>
        <span className={styles.badge}>교내 전용</span>
      </div>
    </header>
  );
}
