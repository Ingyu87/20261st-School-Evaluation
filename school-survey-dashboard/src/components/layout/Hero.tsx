import { HeroIllustration } from "../illustrations/HeroIllustration";
import styles from "./Hero.module.css";

interface HeroProps {
  school: string;
  period: string;
  title: string;
  teacherCount: number;
  staffCount: number;
}

export function Hero({ school, period, title, teacherCount, staffCount }: HeroProps) {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.content}>
          <p className="caption-uppercase">{school} · {period}</p>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.sub}>
            교원 {teacherCount}명 · 교직원 {staffCount}명의 응답을 바탕으로
            학교교육과정 운영 평가 결과를 분석합니다.
          </p>
        </div>
        <div className={styles.illustration}>
          <HeroIllustration />
        </div>
      </div>
    </section>
  );
}
