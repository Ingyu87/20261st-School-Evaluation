# Implementation Spec: 학교교육과정 운영 평가 결과 분석 웹사이트

> **문서 상태**: 확정 (v0.3) — 검토 체크리스트 전항목 승인  
> **연관 문서**: `PRD.md`, `DESIGN-clay.md`  
> **구현 전 사용자 검토 필수**

---

## 1. 기술 스택 (제안)

> **🔴 검토 요청 #9**: 아래 스택을 승인·수정해 주세요.

| 계층 | 선택 | 사유 |
|------|------|------|
| **프레임워크** | React 18 + Vite ✅ | 빠른 빌드, 컴포넌트 구조, 차트·WC 통합 용이 |
| **언어** | TypeScript | 문항·통계 타입 안정성 |
| **스타일** | CSS Modules + CSS Variables | DESIGN-clay 토큰 직접 매핑, 런타임 의존 최소 |
| **차트** | Recharts | React 친화, 커스텀 색상·반응형 |
| **워드클라우드** | `@isoterik/react-wordcloud` 또는 Canvas + 사전 생성 이미지 | 한국어 처리 방식에 따라 결정 |
| **한국어 NLP** | Python `kiwipiepy` (빌드 전처리) | 런타임 부담·품질 |
| **데이터** | 정적 JSON | CSV 실시간 파싱 없음, 빌드 파이프라인으로 통합 |
| **배포** | Vite `build` → 로컬 `dist/` ✅ | GitHub Pages 옵션은 추후 |

**대안 (단순화)**:
- 순수 HTML + Vanilla JS + Chart.js — 의존성 최소, 유지보수 어려움
- Next.js — SSR 불필요 시 과한 스택

**권장**: React + Vite + TypeScript (PRD 기능 규모에 적합)

---

## 2. 프로젝트 구조

```
school-survey-dashboard/
├── public/
│   └── data/
│       ├── survey-data.json          # 통합 설문·통계 데이터
│       ├── interpretations.json      # 해석 텍스트 (수동·검토)
│       └── wordcloud/
│           ├── teacher.json          # T19 키워드 빈도
│           └── staff.json            # S02 키워드 빈도
├── scripts/
│   ├── build-survey-data.py          # JSON → survey-data.json
│   ├── build-wordcloud.py            # 형태소 분석 → WC 데이터
│   └── validate-data.py              # CSV↔JSON 정합성 검증
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── styles/
│   │   ├── tokens.css                # DESIGN-clay CSS 변수
│   │   └── global.css
│   ├── types/
│   │   └── survey.ts
│   ├── data/
│   │   └── loaders.ts                # JSON fetch/parse
│   ├── components/
│   │   ├── layout/
│   │   │   ├── TopNav.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── TabSwitcher.tsx
│   │   ├── illustrations/
│   │   │   ├── HeroIllustration.tsx      # 히어로 3D 클레이 스타일 SVG
│   │   │   ├── FooterMountains.tsx       # 푸터 산 일러스트
│   │   │   ├── CtaIllustration.tsx       # 서술형 CTA 밴드
│   │   │   └── InsightMascot.tsx         # 인사이트 카드 마스코트
│   │   ├── insights/
│   │   │   ├── OverallInsights.tsx
│   │   │   └── InsightCard.tsx
│   │   ├── questions/
│   │   │   ├── QuestionCard.tsx
│   │   │   ├── QuestionList.tsx
│   │   │   ├── DistributionChart.tsx
│   │   │   ├── QuestionInterpretation.tsx
│   │   │   └── CollapsibleQuestionText.tsx  # 짧은 제목 + 전문 보기
│   │   ├── subjective/
│   │   │   ├── SubjectiveSection.tsx
│   │   │   ├── RawResponsesList.tsx
│   │   │   ├── SummaryBullets.tsx
│   │   │   ├── WordCloud.tsx
│   │   │   └── SubjectiveInterpretation.tsx
│   │   └── ui/
│   │       ├── Badge.tsx
│   │       ├── Card.tsx
│   │       └── Collapsible.tsx
│   ├── pages/
│   │   └── Dashboard.tsx
│   └── utils/
│       ├── statistics.ts             # 긍정률·평균·순위
│       ├── likert.ts                 # 척도 매핑
│       └── filters.ts                # 서술형 필터
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 3. 데이터 스키마

### 3.1 `survey-data.json` (통합)

```typescript
interface SurveyDataset {
  meta: {
    school: string;
    period: string;           // "2026학년도 1학기"
    generatedAt: string;
    teacherResponseCount: number;
    staffResponseCount: number;
  };
  likertScale: LikertOption[];  // 순서 정의
  teacher: SurveyTab;
  staff: SurveyTab;
}

interface SurveyTab {
  id: "teacher" | "staff";
  label: string;
  responseCount: number;
  questions: Question[];
  subjective: SubjectiveQuestion;
  overallInsights: OverallInsight;  // interpretations.json에서 병합 가능
}

interface Question {
  id: string;                    // "T01", "S01"
  type: "likert";
  area: string;                  // "Ⅰ-1", "Ⅲ-2", "기타"
  shortTitle: string;            // UI용 짧은 제목
  fullText: string;              // 원문 전체
  operationNote?: string;        // (1학기 운영 내용 ...) 추출
  responseCount: number;
  validResponseCount: number;
  distribution: DistributionItem[];
  statistics: {
    positiveRate: number;        // 0~100
    averageScore?: number;         // 점수화 방식 확정 후
    rank?: number;                 // 전체 순위
  };
}

interface DistributionItem {
  label: string;                 // "매우 그렇다"
  count: number;
  percentage: number;
}

interface SubjectiveQuestion {
  id: string;                    // "T19", "S02"
  fullText: string;
  rawResponses: RawResponse[];
  filteredResponses: RawResponse[];
  summary: string[];             // bullet 요약
  wordFrequency: WordFreq[];     // 워드클라우드용
  interpretation: string;
}

interface RawResponse {
  index: number;
  timestamp?: string;            // 표시 여부는 PRD #7
  text: string;
  isFiltered: boolean;           // 무의미 응답 여부
}

interface WordFreq {
  text: string;
  value: number;
}
```

### 3.2 `interpretations.json` (수동·검토)

```typescript
interface Interpretations {
  teacher: {
    overall: string[];           // 전체 인사이트 bullet
    questions: Record<string, string>;  // T01~T18
    subjective: {
      summary: string[];
      interpretation: string;
    };
  };
  staff: {
    overall: string[];
    questions: Record<string, string>;
    subjective: {
      summary: string[];
      interpretation: string;
    };
  };
}
```

> 해석 문구는 **구현 시 빈 템플릿** 제공 → 사용자 검토 후 채움. 또는 v0.1에 통계 기반 초안 자동 생성 후 수정.

### 3.3 문항 메타데이터 (`question-meta.json`)

CSV 헤더 파싱 결과를 고정 메타로 저장 (짧은 제목·영역 추출):

```json
{
  "T01": {
    "area": "Ⅰ-1",
    "shortTitle": "학교 회의 문화 활성화",
    "areaGroup": "소통과 협력"
  }
}
```

---

## 4. 데이터 파이프라인

### 4.1 빌드 흐름

```
json_output/*.json (기존)
        │
        ▼
scripts/build-survey-data.py
        │
        ├── question-meta.json (수동 보완)
        ├── interpretations.json (수동·검토)
        │
        ▼
public/data/survey-data.json
        │
scripts/build-wordcloud.py (kiwipiepy)
        │
        ▼
public/data/wordcloud/*.json
```

### 4.2 `build-survey-data.py` 로직

1. `json_output/`에서 교원·교직원 JSON 로드
2. 헤더 → `question-meta` 매칭 (없으면 자동 추출 + 경고)
3. 각 척도 문항:
   - `Counter`로 분포 산출
   - `percentage = count / validCount * 100`
   - `positiveRate` = (매우 그렇다 + 그렇다) / validCount
4. 서술형:
   - `filters.py` 규칙 적용 → `filteredResponses`
   - 원본 전체는 `rawResponses`에 보존
5. `validate-data.py`: 셀 수·행 수 CSV 원본과 대조

### 4.3 척도 매핑 (`likert.ts`)

```typescript
// PRD #2 확정 후 하나만 활성화
const LIKERT_SCORE_5 = {
  "매우 그렇다": 5,
  "그렇다": 4,
  "보통이다": 3,
  "그렇지 않다": 2,
  "전혀 그렇지 않다": 1,
} as const;

const LIKERT_ORDER = [
  "매우 그렇다",
  "그렇다",
  "보통이다",
  "그렇지 않다",
  "전혀 그렇지 않다",
];
```

차트는 **항상 LIKERT_ORDER 순서**로 표시 (없는 옵션은 0건).

### 4.4 서술형 필터 (`filters.ts`)

```typescript
const MEANINGLESS_PATTERNS = [
  /^\.+$/,
  /^없음\.?$/,
  /^없습니다\.?$/,
  /^\s*$/,
];

function isMeaningfulResponse(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  return !MEANINGLESS_PATTERNS.some(p => p.test(trimmed));
}
```

> PRD #4 확정 후 패턴 목록 조정.

### 4.5 워드클라우드 빌드 (`build-wordcloud.py`)

```python
# 의사코드
from kiwipiepy import Kiwi
kiwi = Kiwi()

def extract_keywords(texts: list[str]) -> list[dict]:
    freqs = {}
    stopwords = {"없음", "합니다", "있습니다", "것", "수", ...}
    for text in texts:
        for token in kiwi.tokenize(text):
            if token.tag.startswith("NN") or token.tag.startswith("VA"):
                w = token.form
                if w not in stopwords and len(w) >= 2:
                    freqs[w] = freqs.get(w, 0) + 1
    return [{"text": k, "value": v} for k, v in sorted(freqs.items(), key=lambda x: -x[1])]
```

출력: `public/data/wordcloud/teacher.json`, `staff.json`

---

## 5. UI 구현 상세

### 5.1 CSS 토큰 (`tokens.css`)

```css
:root {
  --color-canvas: #fffaf0;
  --color-ink: #0a0a0a;
  --color-body: #3a3a3a;
  --color-muted: #6a6a6a;
  --color-hairline: #e5e5e5;
  --color-surface-card: #f5f0e0;
  --color-surface-soft: #faf5e8;
  --color-brand-pink: #ff4d8b;
  --color-brand-teal: #1a3a3a;
  --color-brand-lavender: #b8a4ed;
  --color-brand-peach: #ffb084;
  --color-brand-ochre: #e8b94a;
  --color-brand-mint: #a4d4c5;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-pill: 9999px;
  --spacing-section: 96px;
  --font-display: "Inter", sans-serif;
}
```

### 5.2 페이지 섹션 ID (앵커 네비게이션)

| ID | 섹션 |
|----|------|
| `#insights` | 전체 인사이트 |
| `#questions` | 문항별 분석 |
| `#subjective` | 서술형 분석 |

TopNav에 스크롤 앵커 링크 (선택).

### 5.3 `TabSwitcher`

- Clay `category-tab` / `category-tab-active` 스타일
- 상태: `activeTab: "teacher" | "staff"`
- 탭 전환 시 URL hash: `#teacher` / `#staff` (공유·북마크용)

### 5.4 `OverallInsights`

- 3~4개 `InsightCard` (feature-card 색 순환)
- 카드 내용 예시:
  - "교원 34명 응답, 전체 긍정률 94.2%"
  - "최고: 생태전환교육 (100% 매우 그렇다)"
  - "개선 필요: 교내 체험 현장학습 (긍정률 90.9%)"
  - 서술형: "학부모 공개수업 일정 의견 수렴 요구"

### 5.5 `QuestionCard` ✅ #10 확정

- **기본 표시**: 영역 배지 + `shortTitle`만 노출
- **"전문 보기" 토글**: `CollapsibleQuestionText` → `fullText` + `operationNote` 펼침

```
┌─────────────────────────────────────────────┐
│ [Ⅲ-2] 학교예술교육                    T08   │
│ ─────────────────────────────────────────── │
│ (문항 전문 — Collapsible)                    │
│ ─────────────────────────────────────────── │
│  [막대 차트]          긍정률 100%           │
│  매우그렇다 33 ████████████ 97.1%          │
│  그렇다      0                              │
│  ...                                        │
│ ─────────────────────────────────────────── │
│ 💡 해석: "학년별 예술 교육활동에 대해..."   │
└─────────────────────────────────────────────┘
```

- 문항 18개: 세로 스크롤, 영역별 그룹 헤더 (선택)
- 저점수 문항: `warning` 색 배지

### 5.6 `DistributionChart` (Recharts)

```typescript
<BarChart data={distribution} layout="vertical">
  <Bar dataKey="count" fill={brandColor} radius={[0, 8, 8, 0]} />
  <XAxis type="number" />
  <YAxis type="category" dataKey="label" width={100} />
  <Tooltip formatter={(v, n, p) => [`${v}건 (${p.payload.percentage}%)`, n]} />
</BarChart>
```

- 색상: 응답 옵션별 고정 (매우 그렇다=teal, 그렇다=mint, 보통=ochre, 그렇지 않다=coral)
- 모바일: 차트 높이 동적, Y축 폰트 축소

### 5.7 `SubjectiveSection`

순서 (PRD 요구):

1. **원본 데이터** (`RawResponsesList`)
   - 번호 + 전문 (타임스탬프 숨김 ✅)
   - 필터된 항목은 "무의미 응답" 뱃지

2. **요약** (`SummaryBullets`)
   - `interpretations.json`의 `summary` 배열

3. **워드클라우드** (`WordCloud`)
   - `wordFrequency` 또는 `@isoterik/react-wordcloud`
   - 크기: min 400×300, 반응형

4. **해석** (`SubjectiveInterpretation`)
   - cream 카드, 1단락

표본 수 ≤ 5일 때 상단에 "응답 수가 적어 참고용으로 활용해 주세요" 캡션.

### 5.8 일러스트 컴포넌트 ✅ #6 확정

| 컴포넌트 | 위치 | 구현 |
|----------|------|------|
| `HeroIllustration` | Hero 우측 `hero-illustration-card` | SVG: 학교·어린이·책 클레이 스타일 (brand 6색) |
| `InsightMascot` | 각 `InsightCard` | 영역별 작은 마스코트 SVG (pink/teal/lavender…) |
| `CtaIllustration` | `SubjectiveSection` 상단 `cta-band-illustrated` | 말풍선·의견 테마 장식 |
| `FooterMountains` | Footer 하단 | 지평선형 산 SVG (ochre·peach·lavender 그라데이션) |

- 에셋 경로: `src/assets/illustrations/*.svg` 또는 inline SVG 컴포넌트
- Clay 원본 3D 에셋 없음 → CSS/SVG로 클레이 질감·둥근 형태 재현
- `surface-soft` 배경 + `rounded-xl` 카드 안에 배치

---

## 6. 통계 계산 명세

### 6.1 긍정률

```
positiveRate = (count("매우 그렇다") + count("그렇다")) / validResponseCount * 100
```

`validResponseCount` = 빈 응답 제외 건수.

### 6.2 평균 점수 (점수화 확정 시)

```
averageScore = sum(score[label] * count) / validResponseCount
```

### 6.3 전체 인사이트 자동 산출

| 항목 | 계산 |
|------|------|
| 전체 긍정률 | 18문항 긍정률의 평균 (또는 전 응답 합산) |
| 최고 문항 | positiveRate 최대 (동점 시 averageScore) |
| 최저 문항 | positiveRate 최소 |
| 영역별 평균 | areaGroup별 문항 긍정률 평균 |

> **🔴 검토 요청**: 전체 긍정률을 "문항 평균" vs "전 응답 합산" 중 어떤 방식으로 할지.

---

## 7. 반응형 브레이크포인트

DESIGN-clay.md 준수:

| Breakpoint | 변경 |
|------------|------|
| < 768px | 탭 full-width, 차트 세로 확대, 인사이트 1열 |
| 768–1024px | 인사이트 2열, 문항 카드 1열 |
| > 1024px | 인사이트 3~4열, max-width 1280px |

---

## 8. 빌드·실행·배포

### 8.1 개발

```bash
# 1. 데이터 빌드
python scripts/build-survey-data.py
python scripts/build-wordcloud.py

# 2. 프론트엔드
npm install
npm run dev        # http://localhost:5173
```

### 8.2 프로덕션

```bash
python scripts/build-survey-data.py
python scripts/build-wordcloud.py
npm run build      # dist/
```

### 8.3 GitHub Pages

`vite.config.ts`:
```typescript
export default defineConfig({
  base: '/school-survey-dashboard/',  // repo 이름에 맞게
});
```

---

## 9. 테스트 계획

| 유형 | 내용 |
|------|------|
| **데이터 정합성** | CSV 행/셀 수 = JSON records 수 |
| **통계 검증** | Python 수동 계산 vs `survey-data.json` 대조 |
| **UI** | 교원/교직원 탭 전환, 18+1 문항 렌더 |
| **서술형** | 7건 원문 전부 표시, 필터 4건 WC 반영 |
| **반응형** | 375px, 768px, 1280px 스크린샷 |
| **접근성** | 차트 색상 대비, 키보드 탭 전환 |

---

## 10. 구현 단계 (검토 후 착수)

### Phase 1 — 기반 (예상 1일)
- [ ] Vite + React + TS 프로젝트 생성
- [ ] `tokens.css`, 레이아웃 컴포넌트
- [ ] `build-survey-data.py` + `survey-data.json` 생성
- [ ] TabSwitcher + 빈 Dashboard

### Phase 2 — 척도 분석 (예상 1~2일)
- [ ] QuestionCard, DistributionChart
- [ ] OverallInsights 자동 통계
- [ ] 교원 18문항 + 교직원 1문항

### Phase 3 — 서술형 (예상 1일)
- [ ] RawResponsesList, SummaryBullets
- [ ] `build-wordcloud.py` + WordCloud 컴포넌트
- [ ] SubjectiveInterpretation

### Phase 4 — 해석·마무리 (예상 1일)
- [ ] `interpretations.json` 템플릿 + 사용자 검토
- [ ] Footer, 반응형 QA
- [ ] 배포

**총 예상**: 4~5일 (해석 문구 검토 시간 별도)

---

## 11. 오픈 이슈 — 전항목 확정 ✅

| # | 이슈 | 결정 |
|---|------|------|
| 1 | 공개 범위 | ✅ 교내 전용 |
| 2 | 점수화 | ✅ 5점 척도 + 긍정률 병행 |
| 3 | 해석 | ✅ JSON 사전 작성 + 검토 |
| 4 | 서술 필터 | ✅ 제안 규칙 (원본 전체 + WC 제외) |
| 5 | WC | ✅ kiwipiepy + Clay 색상 |
| 6 | 일러스트 | ✅ 전부 (히어로·카드·CTA·푸터) |
| 7 | 타임스탬프 | ✅ 숨김 |
| 8 | 배포 | ✅ 로컬 `dist` |
| 9 | 기술 스택 | ✅ React + Vite + TS |
| 10 | 문항 표시 | ✅ 짧은 제목 + 전문 보기 토글 |

---

## 12. 변경 이력

| 버전 | 일자 | 변경 |
|------|------|------|
| v0.1 | 2026-06-25 | 초안 작성 |
| v0.2 | 2026-06-25 | #2,#3,#7,#8,#9 사용자 확정 반영 |
| v0.3 | 2026-06-25 | #1,#4,#5,#6,#10 확정 — 구현 착수 가능 |
