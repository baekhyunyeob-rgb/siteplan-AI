// api/priceDB.js
// 나라장터 가격정보 조회 + priceDB 갱신용 엔드포인트
// GET /api/priceDB?action=building   → 건축 시장시공가격
// GET /api/priceDB?action=civil      → 토목 시장시공가격
// GET /api/priceDB?action=material   → 시설공통자재(건축)

export default async function handler(req, res) {
  const KEY = process.env.DATA_GO_KR_KEY
  if (!KEY) return res.status(500).json({ error: 'DATA_GO_KR_KEY not configured' })

  const { action = 'building', numOfRows = 100, pageNo = 1, search = '' } = req.query

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json;charset=utf-8')

  const BASE = 'https://apis.data.go.kr/1230000/ao/PriceInfoService'

  const endpoints = {
    building:  `${BASE}/getPriceInfoListMrktCnstrctPcBildng`,   // 건축 시장시공가격
    civil:     `${BASE}/getPriceInfoListMrktCnstrctPcEngrk`,    // 토목 시장시공가격
    material:  `${BASE}/getPriceInfoListFcltyCmmnMtrilBildng`,  // 시설공통자재(건축)
    standard:  `${BASE}/getStdMarkUprcinfoList`,                 // 표준시장단가
  }

  const url = endpoints[action]
  if (!url) return res.status(400).json({ error: 'invalid action' })

  try {
    const params = new URLSearchParams({
      serviceKey: KEY,
      numOfRows,
      pageNo,
      type: 'json',
      ...(search ? { search } : {}),
    })

    console.log(`[priceDB] action=${action} url=${url}`)
    const response = await fetch(`${url}?${params}`)
    const text = await response.text()
    console.log(`[priceDB] status=${response.status} preview=${text.substring(0, 200)}`)

    try {
      const data = JSON.parse(text)
      return res.status(200).json(data)
    } catch {
      return res.status(500).json({ error: 'parse failed', raw: text.substring(0, 300) })
    }
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
