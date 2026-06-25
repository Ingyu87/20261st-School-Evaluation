import type { SubjectiveQuestion } from "../../types/survey";
import { CtaIllustration } from "../illustrations/CtaIllustration";
import { WordCloud } from "./WordCloud";
import styles from "./SubjectiveSection.module.css";

interface SubjectiveSectionProps {
  subjective: SubjectiveQuestion;
}

export function SubjectiveSection({ subjective }: SubjectiveSectionProps) {
  const filteredCount = subjective.filteredResponses.length;
  const showLowSample = filteredCount <= 5;

  return (
    <section id="subjective" className="section">
      <div className="container">
        <p className="caption-uppercase">Subjective</p>
        <h2 className="section-title">서술형 주관식 분석</h2>

        <div className={styles.ctaBand}>
          <div>
            <h3 className={styles.ctaTitle}>{subjective.shortTitle}</h3>
            <p className={styles.ctaSub}>
              유효 응답 {filteredCount}건 · 전체 {subjective.rawResponses.length}건
            </p>
          </div>
          <CtaIllustration />
        </div>

        {showLowSample && (
          <p className={styles.lowSample}>
            응답 수가 적어 참고용으로 활용해 주세요.
          </p>
        )}

        <div className={styles.block}>
          <h3 className={styles.blockTitle}>원본 데이터</h3>
          <ul className={styles.rawList}>
            {subjective.rawResponses.map((r) => (
              <li key={r.index} className={styles.rawItem}>
                <span className={styles.rawIndex}>#{r.index}</span>
                {r.isFiltered && <span className={styles.filteredBadge}>무의미 응답</span>}
                <p className={styles.rawText}>{r.text.trim() || "(빈 응답)"}</p>
              </li>
            ))}
          </ul>
        </div>

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
