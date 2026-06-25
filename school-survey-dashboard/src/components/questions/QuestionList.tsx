import type { LikertQuestion } from "../../types/survey";
import { QuestionCard } from "./QuestionCard";
import styles from "./QuestionList.module.css";

interface QuestionListProps {
  questions: LikertQuestion[];
}

export function QuestionList({ questions }: QuestionListProps) {
  return (
    <section className="section">
      <div className="container">
        <p className="caption-uppercase">Questions</p>
        <h2 className="section-title">문항별 분석</h2>
        <div className={styles.list}>
          {questions.map((q) => (
            <QuestionCard key={q.id} question={q} />
          ))}
        </div>
      </div>
    </section>
  );
}
