import type { LikertQuestion, OverallStats } from "../../types/survey";
import { InsightMascot } from "../illustrations/InsightMascot";
import { BRAND_COLORS } from "../../utils/colors";
import styles from "./OverallInsights.module.css";

interface OverallInsightsProps {
  overall: OverallStats;
  questions: LikertQuestion[];
  responseCount: number;
}

export function OverallInsights({ overall, questions, responseCount }: OverallInsightsProps) {
  const best = questions.find((q) => q.id === overall.bestQuestionId);
  const worst = questions.find((q) => q.id === overall.worstQuestionId);

  const cards = [
    {
      title: "응답 현황",
      value: `${responseCount}명`,
      desc: `평균 긍정률 ${overall.positiveRate}% · 평균 ${overall.averageScore}점`,
      color: BRAND_COLORS[0],
      dark: true,
    },
    {
      title: "최고 평가 문항",
      value: best?.shortTitle ?? "-",
      desc: best ? `긍정률 ${best.statistics.positiveRate}% · ${best.statistics.averageScore}점` : "",
      color: BRAND_COLORS[1],
      dark: true,
    },
    {
      title: "개선 검토 문항",
      value: worst?.shortTitle ?? "-",
      desc: worst ? `긍정률 ${worst.statistics.positiveRate}% · ${worst.statistics.averageScore}점` : "",
      color: BRAND_COLORS[2],
      dark: false,
    },
  ];

  return (
    <section id="insights" className="section">
      <div className="container">
        <p className="caption-uppercase">Overview</p>
        <h2 className="section-title">전체 인사이트</h2>
        <div className={styles.grid}>
          {cards.map((card, i) => (
            <div
              key={card.title}
              className={styles.card}
              style={{ background: card.color, color: card.dark ? "var(--color-on-dark)" : "var(--color-ink)" }}
            >
              <InsightMascot index={i} />
              <p className={styles.cardLabel}>{card.title}</p>
              <p className={styles.cardValue}>{card.value}</p>
              <p className={styles.cardDesc}>{card.desc}</p>
            </div>
          ))}
        </div>
        {overall.highlights.length > 0 && (
          <ul className={styles.highlights}>
            {overall.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
