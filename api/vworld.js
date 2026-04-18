// api/vworld.js
// 이전 앱(kitchen-garden) 검증된 방식 그대로 적용
// action=geocode  : 주소텍스트 → PNU (request=getcoord)
// action=landinfo : PNU → 토지정보 (/ned/data/ladfrlList)

export default async function handler(req, res) {
  const { action, address, pnu } = req.query
  const KEY = process.env.VWORLD_API_KEY

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json;charset=utf-8')

  if (!KEY) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  try {
    let url = ''

    if (action === 'geocode') {
      // 주소 → 좌표+PNU 한번에
      // PNU 경로: geo.response.refined.structure.level4LC (검증됨)
      url =
        `https://api.vworld.kr/req/address` +
        `?service=address&request=getcoord&version=2.0` +
        `&crs=epsg:4326&address=${encodeURIComponent(address)}` +
        `&refine=true&simple=false&format=json&type=parcel` +
        `&key=${KEY}`

    } else if (action === 'landinfo') {
      // PNU → 토지이용계획 (이전 앱 검증된 엔드포인트)
      url =
        `https://api.vworld.kr/ned/data/ladfrlList` +
        `?key=${KEY}&pnu=${pnu}&format=json`

    } else {
      return res.status(400).json({ error: 'invalid action' })
    }

    console.log('Fetching:', url)
    const response = await fetch(url)
    const text = await response.text()
    console.log('Status:', response.status)
    console.log('Preview:', text.substring(0, 300))

    try {
      const data = JSON.parse(text)
      return res.status(200).json(data)
    } catch (parseErr) {
      return res.status(500).json({ error: 'Parse failed', raw: text.substring(0, 500) })
    }

  } catch (e) {
    console.error('Fetch error:', e)
    return res.status(500).json({ error: e.message })
  }
}
