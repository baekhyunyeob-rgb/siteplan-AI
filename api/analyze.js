// api/analyze.js
// Gemini API 연동 - 사진 분석 + 현황진단 + 견적 + 보조금

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const KEY = process.env.GEMINI_API_KEY
  if (!KEY) return res.status(500).json({ error: 'GEMINI_API_KEY not configured' })

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json;charset=utf-8')

  try {
    const { landData, purpose, requirements, photos, isPremium } = req.body

    // ── 프롬프트 구성 ─────────────────────────────────────
    const landInfo = landData?.토지기본
    const charInfo = landData?.토지특성
    const buildingInfo = landData?.건축물대장

    const systemPrompt = `당신은 토목·건축 설계 지원 AI입니다.
드론 측량 기반 현장 분석 전문가로서 공간정보와 현장 사진을 분석하여
시공업체가 활용할 수 있는 수준의 견적·물량 보고서를 작성합니다.
반드시 JSON 형식으로만 응답하세요. 마크다운 코드블록 없이 순수 JSON만 출력하세요.`

    const userPrompt = `
다음 정보를 바탕으로 현장 분석 보고서를 작성해주세요.

## 공간정보
- 주소: ${landInfo?.주소 ?? '미상'} ${landInfo?.지번 ?? ''}
- 지목: ${landInfo?.지목 ?? '미상'}
- 면적: ${landInfo?.면적 ?? '미상'}
- 용도지역: ${charInfo?.용도지역 ?? '미상'}
- 토지이용상황: ${charInfo?.토지이용상황 ?? '미상'}
- 지형경사: ${charInfo?.지형경사 ?? '미상'}
- 지형형상: ${charInfo?.지형형상 ?? '미상'}
- 도로접면: ${charInfo?.도로접면 ?? '미상'}
- 공시지가: ${charInfo?.공시지가 ?? '미상'}
${buildingInfo ? `
## 기존 건축물
- 주용도: ${buildingInfo.주용도}
- 구조: ${buildingInfo.구조}
- 사용승인일: ${buildingInfo.사용승인일}
- 건축면적: ${buildingInfo.건축면적}
- 연면적: ${buildingInfo.연면적}
` : '- 기존 건축물 없음 (나대지)'}

## 사용자 요구사항
- 목적: ${purpose}
- 세부조건: ${JSON.stringify(requirements?.answers ?? {})}
- 예산: ${requirements?.budget ? `${(requirements.budget / 10000).toFixed(1)}억원` : '미정'}

## 첨부 사진
${photos?.length}장의 현장 사진이 첨부되어 있습니다. 사진을 분석하여 현황을 파악해주세요.

## 출력 형식 (JSON)
{
  "현황진단": {
    "종합등급": "양호|보통|불량|위험 중 하나",
    "한줄요약": "현황을 한 줄로 요약",
    "주요발견": ["발견사항1", "발견사항2", "발견사항3"],
    "주의사항": ["주의사항1", "주의사항2"]
  },
  "공사범위": [
    {
      "순위": 1,
      "공종": "공사명",
      "수량": "수량 및 단위",
      "우선도": "필수|권장|선택",
      "예상금액하한": 숫자(만원),
      "예상금액상한": 숫자(만원)
    }
  ],
  "총예상공사비": {
    "하한": 숫자(만원),
    "상한": 숫자(만원),
    "비고": "표준품셈 기반 추정치, 현장 확인 필요"
  },
  "보조금": [
    {
      "사업명": "보조금명",
      "지원기관": "기관명",
      "최대지원액": 숫자(만원),
      "신청조건": "조건 설명"
    }
  ],
  "전문가의견": "종합 의견 및 권고사항 (3~5문장)"
}`

    // ── 사진을 Gemini에 전달할 parts 구성 ─────────────────
    const parts = [{ text: userPrompt }]

    if (photos && photos.length > 0) {
      for (const photo of photos) {
        if (photo.base64 && photo.mimeType) {
          parts.push({
            inline_data: {
              mime_type: photo.mimeType,
              data: photo.base64,
            }
          })
        }
      }
    }

    // ── Gemini API 호출 ────────────────────────────────────
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${KEY}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
        }
      })
    })

    const data = await response.json()
    console.log('[analyze] status:', response.status)

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message ?? 'Gemini API error' })
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) return res.status(500).json({ error: '응답이 비어있습니다' })

    console.log('[analyze] response preview:', text.substring(0, 200))

    // JSON 파싱
    const clean = text.replace(/```json|```/g, '').trim()
    try {
      const result = JSON.parse(clean)
      return res.status(200).json(result)
    } catch {
      // JSON 파싱 실패 시 텍스트 그대로 반환
      return res.status(200).json({ raw: text })
    }

  } catch (e) {
    console.error('[analyze] error:', e)
    return res.status(500).json({ error: e.message })
  }
}
