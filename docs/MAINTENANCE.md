# SiteplanAI 유지보수 가이드

> 작성일: 2025-04 / 작성: Claude (Anthropic)
> 이 문서는 Claude에게 "유지보수해줘" 요청 시 참조 기준입니다.

---

## 1. 프로젝트 기본 정보

| 항목 | 내용 |
|---|---|
| 서비스명 | SiteplanAI |
| 레포지토리 | baekhyunyeob-rgb/siteplan-AI |
| 배포 URL | https://siteplan-ai.vercel.app |
| 스택 | React + Vite + Vercel (서버리스) |
| AI 엔진 | Google Gemini 3 Flash Preview (무료 등급) |

---

## 2. API 키 및 환경변수

모두 **Vercel 환경변수**에 등록. 코드에 직접 입력 금지.

| 변수명 | 용도 | 발급처 | 갱신 주기 |
|---|---|---|---|
| `GEMINI_API_KEY` | Gemini AI 분석 | Google AI Studio (aistudio.google.com) | 필요 시 |
| `DATA_GO_KR_KEY` | 건축물대장 + 나라장터 API | data.go.kr | 필요 시 |
| `VWORLD_API_KEY` | 공간정보 (필지경계, 지형) | vworld.kr | 필요 시 |
| `VITE_KAKAO_JS_KEY` | 카카오맵 (지도 표시) | developers.kakao.com | 필요 시 |
| `VITE_KAKAO_REST_KEY` | 카카오 주소 → 좌표 변환 | developers.kakao.com | 필요 시 |

### 키 재발급 시 처리 방법
1. 해당 발급처에서 새 키 발급
2. Vercel 대시보드 → siteplan-ai → Settings → Environment Variables
3. 기존 키 삭제 후 새 키 등록
4. Vercel Deployments → Redeploy (환경변수 반영)

---

## 3. Gemini API 사용량 관리

| 항목 | 무료 한도 |
|---|---|
| 일일 호출 | 20회/일 (RPD) |
| 분당 토큰 | 250,000 TPM |
| 1단계 호출 토큰 | 약 1,500 토큰 |
| 2단계 호출 토큰 | 약 15,000 토큰 (사진 포함) |

### 확인 방법
- https://aistudio.google.com/usage
- 429 TooManyRequests 에러 → 일일 한도 초과, 다음 날 리셋

### 한도 초과 시 대응
- 단기: 익일 자동 리셋 대기
- 중기: Gemini 유료 플랜 전환 검토
- 장기: Claude API 전환 검토 (사진 분석 품질 우위)

### Claude API 전환 시 수정 파일
- `api/analyze.js` — callGemini() → callClaude() 함수 교체
- `ANTHROPIC_API_KEY` 환경변수 추가
- 모델: claude-sonnet-4-5 (사진 분석) 또는 claude-haiku-4-5 (텍스트)

---

## 4. 공공 API 관리

### 4-1. 건축물대장 (건축HUB)
- 엔드포인트: `https://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo`
- 키: `DATA_GO_KR_KEY`
- 파일: `api/building.js`
- 오류 시: PNU 파싱 오류 또는 키 만료 확인

### 4-2. 공간정보 (vworld)
- 엔드포인트: `https://api.vworld.kr/req/data`
- 키: `VWORLD_API_KEY`
- 파일: `api/vworld.js`
- 제공 데이터: 필지경계, 토지특성, 토지이용계획
- 오류 시: vworld.kr 개발자센터에서 키 상태 확인

### 4-3. 나라장터 단가 (조달청)
- 엔드포인트: `https://apis.data.go.kr/1230000/ao/PriceInfoService`
- 키: `DATA_GO_KR_KEY` (건축물대장과 동일)
- 파일: `api/priceDB.js`
- 호출 방법:
  ```
  /api/priceDB?action=building&numOfRows=100  → 건축 시장시공가격
  /api/priceDB?action=civil&numOfRows=100     → 토목 시장시공가격
  ```
- search 파라미터 미지원 → 전체 수집 후 필터링 방식

### 4-4. 카카오맵
- 키 만료 시: developers.kakao.com → 앱 → 키 재발급
- `VITE_` prefix 변수는 프론트엔드에서 직접 사용 (빌드 시 포함)
- Vercel 재배포 필요

---

## 5. Vercel 관리

### 5-1. 배포 구조
```
api/*.js          → Vercel 서버리스 함수 (Node.js)
src/              → React 프론트엔드 (Vite 빌드)
vercel.json       → 함수 지역 설정 (icn1: 서울)
```

### 5-2. 함수 제한 (무료 플랜 Hobby)
| 항목 | 한도 |
|---|---|
| 실행 시간 | 10초 |
| 요청 body | 4.5MB |
| 월 실행 | 100,000회 |

### 5-3. 이미지 업로드 용량 대응
- 모바일 사진 → `Step4.jsx` resizeImage() 함수로 1280px/75% 압축
- 압축 후에도 4.5MB 초과 시: 해상도 낮추거나 장수 제한

### 5-4. 타임아웃 대응
- `api/priceDB.js?action=filter` 는 전체 수집으로 10초 초과 가능
- 대응: 페이지별 분할 호출 또는 Vercel Pro 플랜 업그레이드

### 5-5. 오류 확인 방법
- Vercel 대시보드 → siteplan-ai → Functions → Logs
- 또는 브라우저 개발자도구 → Network 탭

---

## 6. 단가 DB 관리

> 상세 내용: `docs/PRICE_UPDATE.md` 참조

| 항목 | 내용 |
|---|---|
| 업데이트 주기 | 매년 2월, 8월 |
| 대상 파일 | `src/lib/priceData.js`, `api/analyze.js` |
| 표준품셈 보정 | 원가 × 1.35 (이윤+관리비+간접비) |
| 참고 사이트 | cost.kict.re.kr |

---

## 7. 서비스 단계별 현황

| 단계 | 내용 | 상태 |
|---|---|---|
| 1단계 (무료) | 주소 입력 → 공간정보 → AI 토지 요약 | ✅ 운영 중 |
| 2단계 (9,900원) | 현장 사진 → AI 현황진단 + 방안 A·B·C + 예산 | ✅ 개발 완료 (결제 미연동) |
| 3단계 (19,900원) | 드론 측량 데이터 → 정밀 물량·예산 | ⏳ 미구현 |

### 결제 연동 예정
- `App.jsx` → `processTierPayment(tier)` 함수에 PG SDK 삽입
- 현재: 결제 없이 바로 분석 진행 (테스트 모드)

---

## 8. 주요 파일 구조

```
siteplan-AI/
├── api/
│   ├── analyze.js      ← Gemini AI 분석 (1단계/2단계 분기)
│   ├── building.js     ← 건축물대장 (건축HUB API)
│   ├── farmmap.js      ← 팜맵 토양정보
│   ├── vworld.js       ← 공간정보 (vworld API)
│   └── priceDB.js      ← 나라장터 단가 조회
├── src/
│   ├── App.jsx         ← 전체 상태 관리, 단계 흐름
│   ├── components/
│   │   ├── Step1.jsx   ← 주소 입력 + 카카오맵
│   │   ├── Step2.jsx   ← 목적 선택 + 요구사항
│   │   ├── Step3.jsx   ← 공간정보 표시 + 1단계 AI 분석
│   │   ├── Step4.jsx   ← 사진 업로드 (2단계)
│   │   └── Step5.jsx   ← AI 분석 결과 + PDF
│   └── lib/
│       ├── landData.js ← 공공데이터 병렬 수집
│       └── priceData.js← 단가 DB
└── docs/
    ├── MAINTENANCE.md  ← 이 파일
    └── PRICE_UPDATE.md ← 단가 업데이트 가이드
```

---

## 9. 정기 점검 체크리스트

### 월 1회
- [ ] Gemini API 사용량 확인 (aistudio.google.com/usage)
- [ ] Vercel 함수 오류 로그 확인
- [ ] 공공 API 정상 응답 확인 (/api/building, /api/vworld)

### 2월·8월
- [ ] 표준품셈 개정 확인 (cost.kict.re.kr)
- [ ] 나라장터 단가 변동 확인 (/api/priceDB 호출)
- [ ] priceData.js, analyze.js 단가 업데이트
- [ ] PRICE_UPDATE.md 갱신일 업데이트

### 연 1회
- [ ] API 키 만료 여부 확인 (data.go.kr, vworld, kakao)
- [ ] Vercel 플랜 한도 검토
- [ ] Gemini → Claude API 전환 타당성 검토

---

## 10. 트러블슈팅

| 증상 | 원인 | 해결 |
|---|---|---|
| "분석 중 오류" JSON 파싱 실패 | Gemini 429 한도 초과 | 익일 재시도 또는 유료 전환 |
| 지도가 안 뜸 | 카카오 JS 키 도메인 미등록 | kakao developers → 앱 → 플랫폼 → 도메인 추가 |
| 건축물대장 null | 농촌 미등기 건물 | Step3에서 사용자 직접 입력 유도 |
| 공간정보 수집 실패 | vworld 키 만료 또는 PNU 오류 | vworld.kr 키 상태 확인 |
| Vercel 4.5MB 초과 | 모바일 사진 미압축 | Step4 resizeImage() 동작 확인 |
| 함수 타임아웃 (10초) | priceDB filter 전체 수집 | 페이지별 분할 호출로 변경 |
