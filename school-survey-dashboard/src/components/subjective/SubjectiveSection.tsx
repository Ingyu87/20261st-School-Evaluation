import type { SubjectiveQuestion } from "../../types/survey";
import { CtaIllustration } from "../illustrations/CtaIllustration";
import { WordCloud } from "./WordCloud";
import styles from "./SubjectiveSection.module.css";

interface SubjectiveSectionProps {
  subjective: SubjectiveQuestion;
}

export function SubjectiveSection({ subjective }: SubjectiveSectionProps) {
  const meaningful = subjective.filteredResponses;
  const showLowSample = meaningful.length <= 5;

  return (
    <section className="section">
      <div className="container">
        <p className="caption-uppercase">Subjective</p>
        <h2 className="section-title">서술형 주관식 분석</h2>

        <div className={styles.ctaBand}>
          <div>
            <h3 className={styles.ctaTitle}>{subjective.shortTitle}</h3>
            <p className={styles.ctaSub}>유효 응답 {meaningful.length}건</p>
          </div>
          <CtaIllustration />
        </div>

        {showLowSample && meaningful.length > 0 && (
          <p className={styles.lowSample}>응답 수가 적어 참고용으로 활용해 주세요.</p>
        )}

        {meaningful.length > 0 && (
          <div className={styles.block}>
            <h3 className={styles.blockTitle}>응답 원문</h3>
            <ul className={styles.rawList}>
              {meaningful.map((r) => (
                <li key={r.index} className={styles.rawItem}>
                  <span className={styles.rawIndex}>#{r.index}</span>
                  <p className={styles.rawText}>{r.text.trim()}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {meaningful.length === 0 && (
          <p className={styles.empty}>유효한 서술형 응답이 없습니다.</p>
        )}

        {subjective.summary.length > 0 && (
          <div className={styles.block}>
            <h3 className={styles.blockTitle}>요약</h3>
            <ul className={styles.summaryList}>
              {subjective.summary.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.block}>
          <h3 className={styles.blockTitle}>워드클라우드</h3>
          <WordCloud words={subjective.wordFrequency} />
        </div>

        {subjective.interpretation && (
          <div className={styles.interpretation}>
            <h3 className={styles.blockTitle}>해석</h3>
            <p>{subjective.interpretation}</p>
          </div>
        )}
      </div>
    </section>
  );
}
