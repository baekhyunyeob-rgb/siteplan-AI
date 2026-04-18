// src/lib/landData.js
// PNU 하나로 모든 공공 데이터를 병렬 수집
// 결과는 하나의 landData 객체로 합쳐서 반환
// 나중에 Claude API에 통째로 전달

const safe = async (fn) => {
  try { return await fn() }
  catch (e) { console.warn(e.message); return null }
}

// vworld 단일 호출
async function vworld(action, params = {}) {
  const qs = new URLSearchParams({ action, ...params }).toString()
  const res = await fetch(`/api/vworld?${qs}`)
  return res.json()
}

// 건축물대장 호출
async function building(pnu) {
  const res = await fetch(`/api/building?pnu=${pnu}`)
  return res.json()
}

// 팜맵 호출
async function farmmap(lat, lng) {
  const res = await fetch(`/api/farmmap?lat=${lat}&lng=${lng}`)
  return res.json()
}

// ── 파싱 함수들 ─────────────────────────────────────────

function parseLandBasic(data) {
  const item = data?.ladfrlVOList?.ladfrlVOList?.[0]
  if (!item) return null
  return {
    주소: item.ldCodeNm,
    지번: item.mnnmSlno,
    지목: item.lndcgrCodeNm,
    면적: item.lndpclAr ? `${Number(item.lndpclAr).toLocaleString()}㎡` : null,
    소유구분: item.posesnSeCodeNm,
    대장구분: item.regstrSeCodeNm,
  }
}

function parseLandUse(data) {
  const items = data?.landUseInfoList?.landUseInfo
  if (!items?.length) return null
  return items.map(i => ({
    용도지역: i.prposAreaDstrcNm,
    저촉여부: i.cnflcAt === '1' ? '저촉' : '해당없음',
  }))
}

function parseLandChar(data) {
  // 실제 응답 구조: data.landCharacteristicss.field[0] (s 두개)
  const item = data?.landCharacteristicss?.field?.[0]
  if (!item) return null
  return {
    용도지역: item.prposArea1Nm ?? null,
    용도지역2: item.prposArea2Nm !== '지정되지않음' ? item.prposArea2Nm : null,
    토지이용상황: item.ladUseSittnNm ?? null,
    지형경사: item.tpgrphHgCodeNm ?? null,
    지형형상: item.tpgrphFrmCodeNm ?? null,
    도로접면: item.roadSideCodeNm ?? null,
    공시지가: item.pblntfPclnd
      ? `${Number(item.pblntfPclnd).toLocaleString()}원/㎡`
      : null,
    공시기준: item.stdrYear ? `${item.stdrYear}년 ${item.stdrMt}월` : null,
  }
}

function parseLandPrice(data) {
  return null // landchar에 공시지가 포함됨
}

function parseParcel(data) {
  const features = data?.response?.result?.featureCollection?.features
  if (!features?.length) return null
  return features[0]?.geometry // GeoJSON 폴리곤
}

function parseBuilding(data) {
  const item = data?.response?.body?.items?.item
  const i = Array.isArray(item) ? item[0] : item
  if (!i) return null
  return {
    건물명: i.bldNm,
    주용도: i.mainPurpsCdNm,
    구조: i.strctCdNm,
    지붕: i.roofCdNm,
    지상층수: i.grndFlrCnt,
    지하층수: i.ugrndFlrCnt,
    건축면적: i.archArea ? `${i.archArea}㎡` : null,
    연면적: i.totArea ? `${i.totArea}㎡` : null,
    건폐율: i.bcRat ? `${i.bcRat}%` : null,
    용적률: i.vlRat ? `${i.vlRat}%` : null,
    사용승인일: i.useAprDay,
    허가일: i.pmsDay,
    세대수: i.hhldCnt,
  }
}

function parseFarmmap(data) {
  const item = data?.response?.body?.items?.item
  const i = Array.isArray(item) ? item[0] : item
  if (!i) return null
  return {
    토양형: i.soilSeries,
    토성: i.soilTexture,
    배수등급: i.drainageGrade,
    유효토심: i.effectiveSoilDepth,
    경사도: i.slope,
    토지이용: i.landUse,
  }
}

// ── 메인 수집 함수 ───────────────────────────────────────

export async function collectAllLandData(pnu, lat, lng) {
  console.log(`[collectAll] pnu=${pnu} lat=${lat} lng=${lng}`)

  // 모든 API 병렬 호출
  const [
    basicRaw,
    useRaw,
    charRaw,
    priceRaw,
    parcelRaw,
    buildingRaw,
    farmmapRaw,
  ] = await Promise.all([
    safe(() => vworld('landbasic', { pnu })),
    safe(() => vworld('landuse', { pnu })),
    safe(() => vworld('landchar', { pnu })),
    safe(() => Promise.resolve(null)), // landprice → landchar에 포함
    safe(() => vworld('parcel', { pnu })),
    safe(() => building(pnu)),
    safe(() => farmmap(lat, lng)),
  ])

  // 파싱해서 하나의 객체로 합치기
  const landData = {
    pnu,
    좌표: { lat, lng },
    토지기본: parseLandBasic(basicRaw),
    토지이용계획: parseLandUse(useRaw),
    토지특성: parseLandChar(charRaw),
    공시지가: null, // landchar에 포함됨
    필지경계: parseParcel(parcelRaw),
    건축물대장: parseBuilding(buildingRaw),
    토양정보: parseFarmmap(farmmapRaw),
    수집시각: new Date().toISOString(),
  }

  console.log('[collectAll] 완료:', JSON.stringify(landData, null, 2))
  return landData
}
