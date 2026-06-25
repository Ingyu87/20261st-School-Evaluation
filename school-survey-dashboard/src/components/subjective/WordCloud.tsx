import type { WordFreq } from "../../types/survey";
import { BRAND_COLORS } from "../../utils/colors";
import styles from "./WordCloud.module.css";

interface WordCloudProps {
  words: WordFreq[];
}

export function WordCloud({ words }: WordCloudProps) {
  if (!words.length) {
    return (
      <div className={styles.empty}>
        워드클라우드를 생성할 유효 응답이 부족합니다.
      </div>
    );
  }

  const max = Math.max(...words.map((w) => w.value));

  return (
    <div className={styles.cloud}>
      {words.map((word, i) => {
        const scale = 0.7 + (word.value / max) * 1.3;
        const color = BRAND_COLORS[i % BRAND_COLORS.length];
        return (
          <span
            key={word.text}
            className={styles.word}
            style={{
              fontSize: `${scale}rem`,
              color,
              opacity: 0.7 + (word.value / max) * 0.3,
            }}
          >
            {word.text}
          </span>
        );
      })}
    </div>
  );
}
