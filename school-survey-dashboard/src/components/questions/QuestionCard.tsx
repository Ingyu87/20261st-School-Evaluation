import { useState } from "react";
import type { LikertQuestion } from "../../types/survey";
import { DistributionChart } from "./DistributionChart";
import styles from "./QuestionCard.module.css";

interface QuestionCardProps {
  question: LikertQuestion;
}

export function QuestionCard({ question }: QuestionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const stats = question.statistics;

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <span className={styles.badge}>{question.area}</span>
        <span className={styles.id}>{question.id}</span>
      </div>
      <h3 className={styles.title}>{question.shortTitle}</h3>
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        {expanded ? "전문 닫기" : "전문 보기"}
      </button>
      {expanded && (
        <div className={styles.fullText}>
          <p>{question.fullText}</p>
          {question.operationNote && (
            <p className={styles.operation}>{question.operationNote}</p>
          )}
        </div>
      )}
      <div className={styles.stats}>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>평균 점수</span>
          <span className={styles.statValue}>{stats.averageScore}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>긍정률</span>
          <span className={styles.statValue}>{stats.positiveRate}%</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>응답</span>
          <span className={styles.statValue}>{question.validResponseCount}/{question.responseCount}</span>
        </div>
      </div>
      <DistributionChart data={question.distribution} />
      {question.interpretation && (
        <div className={styles.interpretation}>
          <strong>해석</strong>
          <p>{question.interpretation}</p>
        </div>
      )}
    </article>
  );
}
