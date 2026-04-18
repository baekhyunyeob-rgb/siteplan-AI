// api/building.js
// 건축물대장 정보 조회 (건축HUB)
// 기존 건물이 있는 필지에서 건물 현황 파악용
// sigunguCd: PNU 앞 5자리, bjdongCd: 6~10자리, bun: 본번, ji: 부번

export default async function handler(req, res) {
  const { pnu } = req.query
  const KEY = process.env.DATA_GO_KR_KEY

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json;charset=utf-8')

  if (!KEY) return res.status(500).json({ error: 'DATA_GO_KR_KEY not configured' })
  if (!pnu || pnu.length < 19) return res.status(400).json({ error: 'invalid pnu' })

  // PNU 파싱: 5자리(시군구) + 5자리(읍면동) + 4자리(본번) + 4자리(부번) + 1자리(산여부)
  const sigunguCd = pnu.substring(0, 5)
  const bjdongCd = pnu.substring(5, 10)
  const bun = pnu.substring(11, 15).replace(/^0+/, '') || '0'
  const ji = pnu.substring(15, 19).replace(/^0+/, '') || '0'

  try {
    const url = `https://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo` +
      `?serviceKey=${KEY}` +
      `&sigunguCd=${sigunguCd}&bjdongCd=${bjdongCd}` +
      `&bun=${bun}&ji=${ji}` +
      `&numOfRows=5&pageNo=1&_type=json`

    console.log(`[building] sigunguCd=${sigunguCd} bjdongCd=${bjdongCd} bun=${bun} ji=${ji}`)
    const response = await fetch(url)
    const text = await response.text()
    console.log(`[building] status=${response.status} preview=${text.substring(0, 100)}`)

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
