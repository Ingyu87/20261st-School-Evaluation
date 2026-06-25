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

## GitHub Pages

배포 URL: https://ingyu87.github.io/20261st-School-Evaluation/

`main` 브랜치 push 시 GitHub Actions가 자동 빌드·배포합니다.

## Vercel

배포 URL 예: `https://20261st-school-evaluation.vercel.app`

### Vercel 프로젝트 설정 (중요)

**방법 A — 저장소 루트 연결 (권장)**  
루트 `vercel.json`이 자동으로 빌드합니다. Vercel 대시보드에서 **Root Directory는 비워 두세요.**

**방법 B — 하위 폴더 연결**  
- Root Directory: `school-survey-dashboard`  
- Output Directory: `dist`  
- Build Command: `VITE_BASE=/ npm run build`

### 404가 나올 때

1. Vercel **Environment Variables**에 `VITE_BASE=/20261st-School-Evaluation/`가 있으면 **삭제** (GitHub Pages용)
2. **Deployments → Redeploy** (Use existing Build Cache **끄기**)
3. Root Directory와 Output Directory가 위 설정과 일치하는지 확인

## 데이터 보안 (중요)

**CSV 원본 및 `json_output/`은 Git에 올리지 않습니다.** 교내 설문 원본은 로컬에만 보관하세요.

로컬 데이터 파이프라인:
1. CSV → `../csv_to_json.py` → `../json_output/` (로컬)
2. `npm run data:build` → `public/data/survey-data.json`

## 데이터 갱신

1. 로컬 `json_output/`에 추출 JSON 업데이트 (CSV는 저장소 밖 로컬 전용)
2. `npm run data:build` 실행
3. `npm run build` 또는 `npm run dev`

## 해석 문구 수정

- `public/data/interpretations.json` — 전체·문항별·서술형 해석
- 수정 후 `data:build` 또는 수동으로 `survey-data.json` 재생성

## 프로젝트 구조

- `scripts/` — Python 데이터 파이프라인
- `public/data/` — 설문 통계 JSON
- `src/` — React UI (Clay 디자인 시스템)
