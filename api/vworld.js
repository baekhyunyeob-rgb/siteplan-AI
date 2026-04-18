// api/vworld.js
// 브라우저 → 이 파일 → vworld API (CORS 우회)
// action=geocode : 위경도 → PNU
// action=landinfo : PNU → 토지정보

export default async function handler(req, res) {
  const { action, lat, lng, pnu } = req.query
  const KEY = process.env.VWORLD_API_KEY

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json;charset=utf-8')

  if (!KEY) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  try {
    let url = ''

    if (action === 'geocode') {
      // 위경도 → PNU
      // 응답 경로: response.refined.structure.level4LC
      url =
        `https://api.vworld.kr/req/address` +
        `?service=address&request=getAddress&version=2.0` +
        `&crs=epsg:4326&point=${lng},${lat}` +
        `&type=both&zipcode=true&simple=false&format=json` +
        `&key=${KEY}`

    } else if (action === 'landinfo') {
      // PNU → 토지정보 (용도지역, 지목, 건폐율 등)
      url =
        `https://api.vworld.kr/ned/data/getLandCharacteristics` +
        `?key=${KEY}&pnu=${pnu}&format=json&numOfRows=1&pageNo=1`

    } else {
      return res.status(400).json({ error: 'invalid action' })
    }

    console.log('Fetching:', url)
    const response = await fetch(url)
    const text = await response.text()
    console.log('Status:', response.status, '/ Preview:', text.substring(0, 200))

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
