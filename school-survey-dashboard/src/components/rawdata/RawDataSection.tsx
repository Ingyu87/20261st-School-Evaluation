import type { LikertQuestion, SubjectiveQuestion } from "../../types/survey";
import styles from "./RawDataSection.module.css";

interface RawDataSectionProps {
  questions: LikertQuestion[];
  subjective: SubjectiveQuestion;
  responseCount: number;
}

export function RawDataSection({ questions, subjective, responseCount }: RawDataSectionProps) {
  return (
    <section className="section">
      <div className="container">
        <p className="caption-uppercase">Raw Data</p>
        <h2 className="section-title">로우 데이터</h2>
        <p className={styles.notice}>
          분석·보고용 화면과 별도로, 원본 응답 데이터를 확인할 수 있습니다. (응답 {responseCount}건)
        </p>

        <div className={styles.block}>
          <h3 className={styles.blockTitle}>서술형 원본 (전체)</h3>
          <ul className={styles.list}>
            {subjective.rawResponses.map((r) => (
              <li key={r.index} className={styles.item}>
                <span className={styles.index}>#{r.index}</span>
                {r.isFiltered && <span className={styles.badge}>무의미</span>}
                {!r.text.trim() && <span className={styles.badge}>빈 응답</span>}
                <p className={styles.text}>{r.text.trim() || "(빈 응답)"}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.block}>
          <h3 className={styles.blockTitle}>척도형 문항 응답 분포 (건수)</h3>
          {questions.map((q) => (
            <div key={q.id} className={styles.questionBlock}>
              <p className={styles.qTitle}>
                <span className={styles.qId}>{q.id}</span> {q.shortTitle}
              </p>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>응답</th>
                    <th>건수</th>
                    <th>비율</th>
                  </tr>
                </thead>
                <tbody>
                  {q.distribution
                    .filter((d) => d.count > 0)
                    .map((d) => (
                      <tr key={d.label}>
                        <td>{d.label}</td>
                        <td>{d.count}</td>
                        <td>{d.percentage}%</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
