# -*- coding: utf-8 -*-
"""JSON 소스에서 survey-data.json 및 interpretations 템플릿 생성"""

import json
import re
from collections import Counter
from datetime import datetime
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
ROOT = SCRIPT_DIR.parent
PARENT = ROOT.parent
JSON_INPUT = PARENT / "json_output"
OUT_DATA = ROOT / "public" / "data"
META_PATH = SCRIPT_DIR / "question-meta.json"

LIKERT_ORDER = ["매우 그렇다", "그렇다", "보통이다", "그렇지 않다", "전혀 그렇지 않다"]
LIKERT_SCORE = {
    "매우 그렇다": 5,
    "그렇다": 4,
    "보통이다": 3,
    "그렇지 않다": 2,
    "전혀 그렇지 않다": 1,
}
POSITIVE_LABELS = {"매우 그렇다", "그렇다"}

MEANINGLESS_PATTERNS = [
    re.compile(r"^\s*$"),
    re.compile(r"^\.+$"),
    re.compile(r"^없음\.?$"),
    re.compile(r"^없습니다\.?$"),
]


def is_meaningful(text: str) -> bool:
    t = text.strip()
    if not t:
        return False
    return not any(p.match(t) for p in MEANINGLESS_PATTERNS)


def extract_operation_note(full_text: str) -> str | None:
    m = re.search(r"\(1학기 운영 내용[^)]*\)", full_text)
    if m:
        return m.group(0)
    m = re.search(r"（1학기 운영 내용[^）]*）", full_text)
    if m:
        return m.group(0)
    return None


def load_json_files():
    teacher_path = list(JSON_INPUT.glob("*교원용*시트1.json"))
    staff_path = list(JSON_INPUT.glob("*교직원용*Form*Responses*.json"))
    if not teacher_path or not staff_path:
        raise FileNotFoundError("json_output에서 CSV JSON 파일을 찾을 수 없습니다.")
    with open(teacher_path[0], encoding="utf-8") as f:
        teacher = json.load(f)
    with open(staff_path[0], encoding="utf-8") as f:
        staff = json.load(f)
    return teacher, staff


def build_distribution(values: list[str]) -> dict:
    valid = [v.strip() for v in values if v.strip()]
    valid_count = len(valid)
    counts = Counter(valid)
    distribution = []
    for label in LIKERT_ORDER:
        count = counts.get(label, 0)
        pct = round(count / valid_count * 100, 1) if valid_count else 0
        distribution.append({"label": label, "count": count, "percentage": pct})
    # 비표준 응답
    for label, count in counts.items():
        if label not in LIKERT_ORDER:
            pct = round(count / valid_count * 100, 1) if valid_count else 0
            distribution.append({"label": label, "count": count, "percentage": pct})

    positive_count = sum(counts.get(l, 0) for l in POSITIVE_LABELS)
    positive_rate = round(positive_count / valid_count * 100, 1) if valid_count else 0
    score_sum = sum(LIKERT_SCORE.get(v, 0) * counts[v] for v in counts if v in LIKERT_SCORE)
    avg_score = round(score_sum / valid_count, 2) if valid_count else 0

    return {
        "validResponseCount": valid_count,
        "distribution": distribution,
        "statistics": {
            "positiveRate": positive_rate,
            "averageScore": avg_score,
        },
    }


def build_likert_question(qid: str, header: str, records: list, meta: dict) -> dict:
    values = [r.get(header, "") for r in records]
    dist_data = build_distribution(values)
    full_text = header
    return {
        "id": qid,
        "type": "likert",
        "area": meta.get("area", ""),
        "areaGroup": meta.get("areaGroup", ""),
        "shortTitle": meta.get("shortTitle", header[:50]),
        "fullText": full_text,
        "operationNote": extract_operation_note(full_text),
        "responseCount": len(records),
        "validResponseCount": dist_data["validResponseCount"],
        "distribution": dist_data["distribution"],
        "statistics": dist_data["statistics"],
    }


def build_subjective(qid: str, header: str, records: list, meta: dict) -> dict:
    raw = []
    filtered = []
    for i, r in enumerate(records):
        text = r.get(header, "")
        meaningful = is_meaningful(text)
        item = {"index": i + 1, "text": text, "isFiltered": not meaningful}
        raw.append(item)
        if meaningful:
            filtered.append(item)
    return {
        "id": qid,
        "area": meta.get("area", ""),
        "shortTitle": meta.get("shortTitle", ""),
        "fullText": header,
        "rawResponses": raw,
        "filteredResponses": filtered,
        "summary": [],
        "wordFrequency": [],
        "interpretation": "",
    }


def rank_questions(questions: list[dict]) -> list[dict]:
    sorted_q = sorted(questions, key=lambda q: q["statistics"]["positiveRate"])
    for i, q in enumerate(sorted_q):
        q["statistics"]["rank"] = i + 1
    id_to_rank = {q["id"]: q["statistics"]["rank"] for q in sorted_q}
    for q in questions:
        q["statistics"]["rank"] = id_to_rank[q["id"]]
    return questions


def compute_overall(questions: list[dict]) -> dict:
    if not questions:
        return {"positiveRate": 0, "averageScore": 0, "highlights": []}
    avg_positive = round(sum(q["statistics"]["positiveRate"] for q in questions) / len(questions), 1)
    avg_score = round(sum(q["statistics"]["averageScore"] for q in questions) / len(questions), 2)
    best = max(questions, key=lambda q: (q["statistics"]["positiveRate"], q["statistics"]["averageScore"]))
    worst = min(questions, key=lambda q: (q["statistics"]["positiveRate"], q["statistics"]["averageScore"]))
    return {
        "positiveRate": avg_positive,
        "averageScore": avg_score,
        "bestQuestionId": best["id"],
        "worstQuestionId": worst["id"],
        "highlights": [],
    }


def build_tab(tab_id: str, label: str, source: dict, meta_section: dict, likert_ids: list, subjective_id: str) -> dict:
    headers = source["headers"]
    records = source["records"]
    questions = []
    for qid in likert_ids:
        idx = int(qid.replace("T", "").replace("S", ""))
        header = headers[idx]
        questions.append(build_likert_question(qid, header, records, meta_section[qid]))
    questions = rank_questions(questions)
    sub_idx = int(subjective_id.replace("T", "").replace("S", ""))
    subjective = build_subjective(subjective_id, headers[sub_idx], records, meta_section[subjective_id])
    return {
        "id": tab_id,
        "label": label,
        "responseCount": len(records),
        "questions": questions,
        "subjective": subjective,
        "overall": compute_overall(questions),
    }


def build_interpretations_template(teacher_tab: dict, staff_tab: dict) -> dict:
    teacher_q_interp = {}
    for q in teacher_tab["questions"]:
        s = q["statistics"]
        teacher_q_interp[q["id"]] = (
            f"{q['shortTitle']} 문항의 평균 점수는 {s['averageScore']}점(5점 만점), "
            f"긍정률은 {s['positiveRate']}%입니다. "
            f"응답 {q['validResponseCount']}건 중 "
            f"「매우 그렇다」 {next(d['count'] for d in q['distribution'] if d['label']=='매우 그렇다')}건, "
            f"「그렇다」 {next(d['count'] for d in q['distribution'] if d['label']=='그렇다')}건입니다."
        )

    staff_q_interp = {}
    for q in staff_tab["questions"]:
        s = q["statistics"]
        staff_q_interp[q["id"]] = (
            f"{q['shortTitle']} 문항의 평균 점수는 {s['averageScore']}점, 긍정률 {s['positiveRate']}%입니다."
        )

    return {
        "teacher": {
            "overall": [
                f"교원 {teacher_tab['responseCount']}명이 응답했습니다.",
                f"18개 문항 전체 평균 긍정률 {teacher_tab['overall']['positiveRate']}%, 평균 점수 {teacher_tab['overall']['averageScore']}점입니다.",
                "대부분의 영역에서 높은 만족도를 보이며, 서술형 의견에서는 의사결정 참여와 예산·행사 운영 관련 제안이 있었습니다.",
            ],
            "questions": teacher_q_interp,
            "subjective": {
                "summary": [
                    "학부모 공개수업·학부모총회 일정에 대한 교원 의견 수렴 요구",
                    "교내 체험학습 전용 예산 편성 필요",
                    "행사 과다로 인한 참여 기회 불균형 개선 요청",
                    "외부 연계 프로그램 및 교육과정 운영에 대한 감사 표현",
                ],
                "interpretation": (
                    "서술형 응답은 의사결정 과정의 참여 확대, 예산·행사 운영의 실질적 개선, "
                    "그리고 현장 교육활동에 대한 긍정적 인식이 함께 나타났습니다. "
                    "특히 학부모 공개수업 시기와 교내 체험학습 예산은 향후 학교 운영 개선 논의 시 "
                    "교원 의견을 수렴하는 것이 필요합니다."
                ),
            },
        },
        "staff": {
            "overall": [
                f"교직원 {staff_tab['responseCount']}명이 응답했습니다.",
                f"업무 효율성 문항 평균 점수 {staff_tab['overall']['averageScore']}점, 긍정률 {staff_tab['overall']['positiveRate']}%입니다.",
            ],
            "questions": staff_q_interp,
            "subjective": {
                "summary": ["행복가동 등 긍정적 학교 문화에 대한 짧은 의견"],
                "interpretation": (
                    "교직원 서술형 응답은 표본 수가 적지만, 학교 교육활동에 대한 "
                    "긍정적 인식이 나타났습니다."
                ),
            },
        },
    }


def main():
    with open(META_PATH, encoding="utf-8") as f:
        meta = json.load(f)

    teacher_src, staff_src = load_json_files()

    teacher_tab = build_tab(
        "teacher",
        "교원용",
        teacher_src,
        meta["teacher"],
        [f"T{i:02d}" for i in range(1, 19)],
        "T19",
    )
    staff_tab = build_tab(
        "staff",
        "교직원용",
        staff_src,
        meta["staff"],
        ["S01"],
        "S02",
    )

    interpretations = build_interpretations_template(teacher_tab, staff_tab)

    # Merge interpretations into subjective summary/interpretation
    teacher_tab["subjective"]["summary"] = interpretations["teacher"]["subjective"]["summary"]
    teacher_tab["subjective"]["interpretation"] = interpretations["teacher"]["subjective"]["interpretation"]
    staff_tab["subjective"]["summary"] = interpretations["staff"]["subjective"]["summary"]
    staff_tab["subjective"]["interpretation"] = interpretations["staff"]["subjective"]["interpretation"]

    teacher_tab["overall"]["highlights"] = interpretations["teacher"]["overall"]
    staff_tab["overall"]["highlights"] = interpretations["staff"]["overall"]

    for q in teacher_tab["questions"]:
        q["interpretation"] = interpretations["teacher"]["questions"][q["id"]]
    for q in staff_tab["questions"]:
        q["interpretation"] = interpretations["staff"]["questions"][q["id"]]

    dataset = {
        "meta": {
            "school": "서울가동초등학교",
            "period": "2026학년도 1학기",
            "title": "학교교육과정 운영 평가 결과 분석",
            "generatedAt": datetime.now().isoformat(),
            "teacherResponseCount": teacher_tab["responseCount"],
            "staffResponseCount": staff_tab["responseCount"],
            "audience": "교내 전용",
        },
        "likertScale": LIKERT_ORDER,
        "likertScores": LIKERT_SCORE,
        "teacher": teacher_tab,
        "staff": staff_tab,
    }

    OUT_DATA.mkdir(parents=True, exist_ok=True)
    with open(OUT_DATA / "survey-data.json", "w", encoding="utf-8") as f:
        json.dump(dataset, f, ensure_ascii=False, indent=2)
    with open(OUT_DATA / "interpretations.json", "w", encoding="utf-8") as f:
        json.dump(interpretations, f, ensure_ascii=False, indent=2)

    print(f"Generated: {OUT_DATA / 'survey-data.json'}")
    print(f"Generated: {OUT_DATA / 'interpretations.json'}")
    print(f"Teacher: {teacher_tab['responseCount']} responses, {len(teacher_tab['questions'])} likert questions")
    print(f"Staff: {staff_tab['responseCount']} responses")


if __name__ == "__main__":
    main()
