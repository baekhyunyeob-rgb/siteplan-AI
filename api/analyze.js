// api/analyze.js
// tier: 'free'  → 공간정보만으로 토지 기본정보 요약 (사진 없음)
// tier: 'basic' → 현장 사진 + 공간정보 → 방안 A·B·C + 예산 산출

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const KEY = process.env.GEMINI_API_KEY
  if (!KEY) return res.status(500).json({ error: 'GEMINI_API_KEY not configured' })

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json;charset=utf-8')

  try {
    const { landData, purpose, requirements, photos, tier } = req.body

    const landInfo  = landData?.토지기본
    const charInfo  = landData?.토지특성
    const buildInfo = landData?.건축물대장

    // ─────────────────────────────────────────────────────────────
    // 공통 토지정보 블록
    // ─────────────────────────────────────────────────────────────
    const landBlock = `
## 토지 공간정보
- 주소: ${landInfo?.주소 ?? '미상'} ${landInfo?.지번 ?? ''}
- 지목: ${landInfo?.지목 ?? '미상'}
- 면적: ${landInfo?.면적 ?? '미상'}
- 소유구분: ${landInfo?.소유구분 ?? '미상'}
- 용도지역: ${charInfo?.용도지역 ?? '미상'}
- 토지이용상황: ${charInfo?.토지이용상황 ?? '미상'}
- 지형경사: ${charInfo?.지형경사 ?? '미상'}
- 지형형상: ${charInfo?.지형형상 ?? '미상'}
- 도로접면: ${charInfo?.도로접면 ?? '미상'}
- 공시지가: ${charInfo?.공시지가 ?? '미상'}
${buildInfo ? `
## 기존 건축물
- 주용도: ${buildInfo.주용도}
- 구조: ${buildInfo.구조}
- 사용승인일: ${buildInfo.사용승인일}
- 건축면적: ${buildInfo.건축면적}
- 연면적: ${buildInfo.연면적}
` : '- 기존 건축물: 없음 (나대지)'}

## 사용자 요구사항
- 목적: ${purpose ?? '미상'}
- 세부조건: ${JSON.stringify(requirements?.answers ?? {})}
- 예산: ${requirements?.budget ? `${(requirements.budget / 10000).toFixed(1)}억원` : '미정'}`

    // ─────────────────────────────────────────────────────────────
    // 1단계(free): 공간정보만으로 토지 기본 요약
    // ─────────────────────────────────────────────────────────────
    if (tier === 'free') {
      const systemPrompt = `당신은 토목·건축 분야 전문가입니다.
공간정보(용도지역·지목·면적·도로접면 등)를 분석하여
토지 소유자가 쉽게 이해할 수 있도록 "이 땅에서 할 수 있는 것과 없는 것"을 정리합니다.
반드시 JSON 형식으로만 응답하세요. 마크다운 코드블록 없이 순수 JSON만 출력하세요.`

      const userPrompt = `${landBlock}

위 공간정보를 바탕으로 토지 기본 분석 결과를 작성해주세요.

출력 형식 (JSON):
{
  "가능사항": [
    "이 땅에서 할 수 있는 것 (구체적으로, 3~5개)",
    "예: 농업용 창고 신축 가능 (농지 + 농업진흥지역 외)",
    "예: 소규모 단독주택 신축 검토 가능 (건폐율 20% 이내)"
  ],
  "불가사항": [
    "이 땅에서 할 수 없는 것 (구체적으로, 2~4개)",
    "예: 상업시설 불가 (용도지역 농림지역)",
    "예: 개발행위 시 농지전용 허가 필수"
  ],
  "참고사항": "종합 코멘트 (2~3문장, 주의할 법적 사항 포함)",
  "보조금": [
    {
      "사업명": "보조금·지원사업 이름",
      "지원기관": "기관명",
      "신청조건": "간단한 조건 설명"
    }
  ]
}`

      const result = await callGemini(KEY, systemPrompt, userPrompt, [])
      return res.status(200).json(result)
    }

    // ─────────────────────────────────────────────────────────────
    // 2단계(basic): 사진 + 공간정보 → 방안 A·B·C + 예산
    // ─────────────────────────────────────────────────────────────
    const systemPrompt = `당신은 토목·건축 설계 지원 전문가입니다.
현장 사진과 공간정보를 종합 분석하여 건물주·토지주가 설계사무소 상담 전에
활용할 수 있는 수준의 분석 보고서를 작성합니다.

핵심 원칙:
1. 사진에서 실제로 보이는 것만 근거로 진단하세요.
2. 방안 A·B·C는 비용·공사범위·실현성이 서로 명확히 달라야 합니다.
3. 예산은 반드시 하한·상한으로 범위를 제시하고 ±30~40% 오차임을 명시하세요.
4. 보조금은 해당 목적(${purpose})과 지역에 실제 존재 가능한 것만 제시하세요.
5. 반드시 JSON 형식으로만 응답하세요. 마크다운 코드블록 없이 순수 JSON만 출력하세요.`

    const userPrompt = `${landBlock}

첨부 사진: ${photos?.length ?? 0}장 (각 사진의 촬영 목적은 아래 참고)
${photos?.map(p => `- ${p.label}: ${p.key}`).join('\n') ?? ''}

위 정보와 첨부 사진을 종합하여 현장 분석 보고서를 작성해주세요.

출력 형식 (JSON):
{
  "현황진단": {
    "종합등급": "양호 또는 보통 또는 불량 또는 위험",
    "한줄요약": "현황을 한 문장으로 핵심 요약",
    "주요발견": ["사진에서 확인된 주요 현황 3~5개"],
    "주의사항": ["즉시 조치 필요하거나 주의해야 할 사항 1~3개 (없으면 빈 배열)"]
  },
  "방안": [
    {
      "방향": "방안 A 핵심 방향 (10자 이내)",
      "설명": "방안 A 상세 설명 (2~3문장, 공사 범위·방법 구체적으로)",
      "장점": ["장점 2~3개"],
      "단점": ["단점 1~2개"],
      "예산하한": 숫자(만원 단위),
      "예산상한": 숫자(만원 단위)
    },
    {
      "방향": "방안 B 핵심 방향",
      "설명": "방안 B 상세 설명",
      "장점": ["장점 2~3개"],
      "단점": ["단점 1~2개"],
      "예산하한": 숫자,
      "예산상한": 숫자
    },
    {
      "방향": "방안 C 핵심 방향",
      "설명": "방안 C 상세 설명",
      "장점": ["장점 2~3개"],
      "단점": ["단점 1~2개"],
      "예산하한": 숫자,
      "예산상한": 숫자
    }
  ],
  "추천방안": "A 또는 B 또는 C",
  "추천이유": "추천 방안을 선택한 이유 (2~3문장, 사용자 예산·목적·현장 조건 반영)",
  "총예산": {
    "하한": 숫자(만원),
    "상한": 숫자(만원),
    "비고": "현장 사진 기반 참고치입니다. ±30~40% 오차가 있을 수 있으며, 정확한 견적은 드론 측량 후 확정됩니다."
  },
  "보조금": [
    {
      "사업명": "보조금·지원사업 이름",
      "지원기관": "기관명",
      "최대지원액": 숫자(만원),
      "신청조건": "간단한 조건 설명"
    }
  ],
  "전문가의견": "종합 의견 및 다음 단계 권고 (3~4문장)"
}`

    const result = await callGemini(KEY, systemPrompt, userPrompt, photos ?? [])
    return res.status(200).json(result)

  } catch (e) {
    console.error('[analyze] error:', e)
    return res.status(500).json({ error: e.message })
  }
}

// ─────────────────────────────────────────────────────────────────
// Gemini API 호출 공통 함수
// ─────────────────────────────────────────────────────────────────
async function callGemini(KEY, systemPrompt, userPrompt, photos) {
  const parts = [{ text: userPrompt }]

  // 사진 첨부 (2단계만)
  for (const photo of photos) {
    if (photo.base64 && photo.mimeType) {
      parts.push({ inline_data: { mime_type: photo.mimeType, data: photo.base64 } })
    }
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${KEY}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 3000 },
    })
  })

  const data = await response.json()
  console.log('[analyze] status:', response.status)

  if (!response.ok) throw new Error(data.error?.message ?? 'Gemini API error')

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('응답이 비어있습니다')

  console.log('[analyze] preview:', text.substring(0, 200))

  const clean = text.replace(/```json|```/g, '').trim()
  try {
    return JSON.parse(clean)
  } catch {
    return { raw: text }
  }
}
