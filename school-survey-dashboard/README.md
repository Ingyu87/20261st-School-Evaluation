# 학교교육과정 운영 평가 결과 분석 (서울가동초등학교)

2026학년도 1학기 학교교육과정 운영 평가 설문 결과를 시각화하는 교내 전용 대시보드입니다.

## 실행 방법

### 개발 모드
```bash
npm install
npm run data:build   # CSV JSON → survey-data.json
npm run dev          # http://localhost:5173
```

### 로컬 배포 (dist)
```bash
npm run build
npm run preview      # http://localhost:4173
```

또는 `dist` 폴더를 브라우저에서 직접 열기 (정적 파일 서버 권장).

## 데이터 갱신

1. 상위 폴더 `json_output/`에 CSV 추출 JSON 업데이트
2. `npm run data:build` 실행
3. `npm run build` 또는 `npm run dev`

## 해석 문구 수정

- `public/data/interpretations.json` — 전체·문항별·서술형 해석
- 수정 후 `data:build` 또는 수동으로 `survey-data.json` 재생성

## 프로젝트 구조

- `scripts/` — Python 데이터 파이프라인
- `public/data/` — 설문 통계 JSON
- `src/` — React UI (Clay 디자인 시스템)
