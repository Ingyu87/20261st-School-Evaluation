import { FooterMountains } from "../illustrations/FooterMountains";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.content}>
          <p className={styles.school}>서울가동초등학교</p>
          <p className={styles.meta}>2026학년도 1학기 학교교육과정 운영 평가 · 교내 전용</p>
          <p className={styles.note}>본 자료는 교내 구성원 열람용으로 제작되었습니다.</p>
        </div>
        <FooterMountains />
      </div>
    </footer>
  );
}
