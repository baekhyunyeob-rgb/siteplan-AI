// api/vworld.js
// PNU 기반 vworld 데이터 수집
// action=geocode   : 주소 → PNU + 좌표
// action=landbasic : PNU → 토지기본 (지목·면적·소유구분)
// action=landuse   : PNU → 토지이용계획 (용도지역·건폐율·용적률)
// action=landprice : PNU → 개별공시지가
// action=parcel    : PNU → 필지경계 폴리곤

export default async function handler(req, res) {
  const { action, address, pnu, lat, lng } = req.query
  const KEY = process.env.VWORLD_API_KEY

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json;charset=utf-8')

  if (!KEY) return res.status(500).json({ error: 'VWORLD_API_KEY not configured' })

  try {
    let url = ''

    if (action === 'geocode') {
      // 주소 → 좌표 + PNU (검증된 방식)
      url = `https://api.vworld.kr/req/address` +
        `?service=address&request=getcoord&version=2.0` +
        `&crs=epsg:4326&address=${encodeURIComponent(address)}` +
        `&refine=true&simple=false&format=json&type=parcel&key=${KEY}`

    } else if (action === 'landbasic') {
      // 토지기본정보: 지목·면적·지번·소유구분
      url = `https://api.vworld.kr/ned/data/ladfrlList` +
        `?key=${KEY}&pnu=${pnu}&format=json`

    } else if (action === 'landuse') {
      // 토지이용계획: 용도지역·저촉여부·개발제한
      url = `https://api.vworld.kr/ned/data/getLandUseInfo` +
        `?key=${KEY}&pnu=${pnu}&format=json`

    } else if (action === 'landchar') {
      // 토지특성: 용도지역·건폐율·용적률·지형높이
      url = `https://api.vworld.kr/ned/data/getLandCharacteristics` +
        `?key=${KEY}&pnu=${pnu}&format=json&numOfRows=1&pageNo=1`

    } else if (action === 'landprice') {
      // 개별공시지가
      url = `https://api.vworld.kr/ned/data/getIndividualLandPrice` +
        `?key=${KEY}&pnu=${pnu}&format=json&numOfRows=1&pageNo=1`

    } else if (action === 'parcel') {
      // 필지경계 폴리곤 (지도 표시용)
      url = `https://api.vworld.kr/req/data` +
        `?service=data&request=GetFeature&data=LP_PA_CBND_BUBUN` +
        `&key=${KEY}&attrFilter=pnu:=:${pnu}&format=json`

    } else {
      return res.status(400).json({ error: 'invalid action' })
    }

    console.log(`[vworld] action=${action}`)
    const response = await fetch(url)
    const text = await response.text()
    console.log(`[vworld] status=${response.status} preview=${text.substring(0, 100)}`)

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
