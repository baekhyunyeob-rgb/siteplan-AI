// api/farmmap.js
// 팜맵 토양검정 정보 조회 (좌표 기반)

export default async function handler(req, res) {
  const { lat, lng } = req.query
  const KEY = process.env.DATA_GO_KR_KEY

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json;charset=utf-8')

  if (!KEY) return res.status(500).json({ error: 'DATA_GO_KR_KEY not configured' })
  if (!lat || !lng) return res.status(400).json({ error: 'lat, lng required' })

  try {
    // serviceKey는 encodeURIComponent 하지 않고 그대로 사용
    const url = `https://apis.data.go.kr/B552895/rest/farmmap/getFarmmapSoilAnalysisService` +
      `/getCoordinateBasedSoilAnalsInfo` +
      `?serviceKey=${KEY}&lat=${lat}&lon=${lng}&numOfRows=1&pageNo=1&_type=json`

    console.log(`[farmmap] lat=${lat} lng=${lng}`)
    const response = await fetch(url)
    const text = await response.text()
    console.log(`[farmmap] status=${response.status} preview=${text.substring(0, 200)}`)

    // XML 응답이면 에러 처리
    if (text.trim().startsWith('<?xml') || text.trim().startsWith('<')) {
      return res.status(200).json({ error: 'xml_response', raw: text.substring(0, 300) })
    }

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
