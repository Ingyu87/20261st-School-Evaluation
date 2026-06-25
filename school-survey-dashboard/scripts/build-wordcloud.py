# -*- coding: utf-8 -*-
"""서술형 응답 워드클라우드 빈도 데이터 생성"""

import json
import re
from collections import Counter
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
ROOT = SCRIPT_DIR.parent
DATA_PATH = ROOT / "public" / "data" / "survey-data.json"
OUT_DIR = ROOT / "public" / "data" / "wordcloud"

STOPWORDS = {
    "없음", "없습니다", "합니다", "있습니다", "것", "수", "등", "및", "이", "가", "을", "를",
    "에", "의", "로", "과", "와", "도", "은", "는", "다", "고", "서", "한", "하", "되",
    "않", "없", "있", "겠", "주", "시", "면", "좋", "것이", "것을", "것은", "때", "더",
    "모두", "많", "점", "등이", "생각", "우리", "학교", "학생", "교육", "활동",
}


def simple_tokenize(text: str) -> list[str]:
    """kiwipiepy 없을 때 한글 2글자 이상 연속 추출 + 공백 분리"""
    words = []
    # 한글 2+ 연속
    for m in re.finditer(r"[가-힣]{2,}", text):
        w = m.group()
        if w not in STOPWORDS and len(w) >= 2:
            words.append(w)
    return words


def extract_keywords(texts: list[str]) -> list[dict]:
    try:
        from kiwipiepy import Kiwi
        kiwi = Kiwi()
        freqs: Counter = Counter()
        for text in texts:
            for token in kiwi.tokenize(text):
                if token.tag.startswith("NN") or token.tag.startswith("VA") or token.tag.startswith("VV"):
                    w = token.form
                    if len(w) >= 2 and w not in STOPWORDS:
                        freqs[w] += 1
    except ImportError:
        freqs = Counter()
        for text in texts:
            for w in simple_tokenize(text):
                freqs[w] += 1

    return [{"text": k, "value": v} for k, v in freqs.most_common(40)]


def main():
    with open(DATA_PATH, encoding="utf-8") as f:
        data = json.load(f)

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    for key in ("teacher", "staff"):
        texts = [r["text"] for r in data[key]["subjective"]["filteredResponses"]]
        wf = extract_keywords(texts)
        data[key]["subjective"]["wordFrequency"] = wf
        out_path = OUT_DIR / f"{key}.json"
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(wf, f, ensure_ascii=False, indent=2)
        print(f"{key}: {len(texts)} texts -> {len(wf)} keywords -> {out_path}")

    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
