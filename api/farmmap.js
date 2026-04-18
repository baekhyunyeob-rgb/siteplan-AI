// api/farmmap.js
// 팜맵 토양검정 정보 조회
// positionX, positionY: EPSG:5179 (TM 좌표계) 필요
// WGS84(위경도) → EPSG:5179 변환 후 호출

// WGS84 → EPSG:5179 (Korean 1985 / Modified Central Belt 2010) 변환
// 간이 변환 (proj4 없이 근사값 사용)
function wgs84ToTM(lat, lng) {
  // 한국 TM 좌표 근사 변환 (EPSG:5179 기준)
  const rad = Math.PI / 180
  const a = 6378137.0
  const f = 1 / 298.257222101
  const e2 = 2 * f - f * f
  const e = Math.sqrt(e2)

  const lat0 = 38 * rad
  const lng0 = 127.5 * rad
  const k0 = 0.9996
  const dx = 1000000
  const dy = 2000000

  const latR = lat * rad
  const lngR = lng * rad

  const N = a / Math.sqrt(1 - e2 * Math.sin(latR) ** 2)
  const T = Math.tan(latR) ** 2
  const C = (e2 / (1 - e2)) * Math.cos(latR) ** 2
  const A = Math.cos(latR) * (lngR - lng0)

  const e4 = e2 * e2
  const e6 = e4 * e2

  const M = a * (
    (1 - e2 / 4 - 3 * e4 / 64 - 5 * e6 / 256) * latR
    - (3 * e2 / 8 + 3 * e4 / 32 + 45 * e6 / 1024) * Math.sin(2 * latR)
    + (15 * e4 / 256 + 45 * e6 / 1024) * Math.sin(4 * latR)
    - (35 * e6 / 3072) * Math.sin(6 * latR)
  )

  const M0 = a * (
    (1 - e2 / 4 - 3 * e4 / 64 - 5 * e6 / 256) * lat0
    - (3 * e2 / 8 + 3 * e4 / 32 + 45 * e6 / 1024) * Math.sin(2 * lat0)
    + (15 * e4 / 256 + 45 * e6 / 1024) * Math.sin(4 * lat0)
    - (35 * e6 / 3072) * Math.sin(6 * lat0)
  )

  const x = k0 * N * (
    A + (1 - T + C) * A ** 3 / 6
    + (5 - 18 * T + T ** 2 + 72 * C - 58 * (e2 / (1 - e2))) * A ** 5 / 120
  ) + dx

  const y = k0 * (
    M - M0 + N * Math.tan(latR) * (
      A ** 2 / 2
      + (5 - T + 9 * C + 4 * C ** 2) * A ** 4 / 24
      + (61 - 58 * T + T ** 2 + 600 * C - 330 * (e2 / (1 - e2))) * A ** 6 / 720
    )
  ) + dy

  return { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 }
}

export default async function handler(req, res) {
  const { lat, lng, year } = req.query
  const KEY = process.env.DATA_GO_KR_KEY

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json;charset=utf-8')

  if (!KEY) return res.status(500).json({ error: 'DATA_GO_KR_KEY not configured' })
  if (!lat || !lng) return res.status(400).json({ error: 'lat, lng required' })

  try {
    // WGS84 → TM 좌표 변환
    const tm = wgs84ToTM(parseFloat(lat), parseFloat(lng))
    console.log(`[farmmap] lat=${lat} lng=${lng} → positionX=${tm.x} positionY=${tm.y}`)

    const targetYear = year || new Date().getFullYear() - 1

    const url = `https://apis.data.go.kr/B552895/rest/farmmap/getFarmmapSoilAnalysisService` +
      `/getCoordinateBasedSoilAnalsInfo` +
      `?serviceKey=${encodeURIComponent(KEY)}` +
      `&numOfRows=1&pageNo=1&type=json` +
      `&positionX=${tm.x}&positionY=${tm.y}` +
      `&year=${targetYear}`

    console.log(`[farmmap] url=${url}`)
    const response = await fetch(url)
    const text = await response.text()
    console.log(`[farmmap] status=${response.status} preview=${text.substring(0, 200)}`)

    if (text.trim().startsWith('<?xml') || text.trim().startsWith('<')) {
      // XML 응답이면 에러 내용 파싱
      return res.status(200).json({ error: 'xml_response', raw: text.substring(0, 300) })
    }

    try {
      const data = JSON.parse(text)
      return res.status(200).json(data)
    } catch {
      return res.status(500).json({ error: 'parse failed', raw: text.substring(0, 300) })
    }

  } catch (e) {
    console.error('[farmmap] error:', e)
    return res.status(500).json({ error: e.message })
  }
}
