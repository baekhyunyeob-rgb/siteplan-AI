import React, { useState, useEffect, useRef } from 'react'

const KAKAO_REST_KEY = import.meta.env.VITE_KAKAO_REST_KEY
const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY

// ── API 함수들 ──────────────────────────────────────────

// 1. 카카오: 주소 → 위경도 (지도 표시용)
async function getCoordFromAddress(address) {
  const res = await fetch(
    `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
    { headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` } }
  )
  const data = await res.json()
  if (!data.documents?.length) throw new Error('주소를 찾을 수 없습니다')
  const doc = data.documents[0]
  const addr = doc.address ?? doc.road_address
  return { lng: parseFloat(addr.x), lat: parseFloat(addr.y) }
}

// 2. 카카오: 위경도 → 주소 (GPS 역지오코딩)
async function getAddressFromCoord(lat, lng) {
  const res = await fetch(
    `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lng}&y=${lat}`,
    { headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` } }
  )
  const data = await res.json()
  return data.documents?.[0]?.address?.address_name ?? ''
}

// 3. vworld: 주소 → PNU (Vercel Route 경유, 이전 앱 검증된 방식)
// PNU 경로: geo.response.refined.structure.level4LC
async function getPNU(address) {
  const res = await fetch(`/api/vworld?action=geocode&address=${encodeURIComponent(address)}`)
  const geo = await res.json()
  const pnu = geo?.response?.refined?.structure?.level4LC
  if (!pnu) throw new Error('필지 정보를 찾을 수 없어요')
  return pnu
}

// 4. vworld: PNU → 토지정보 (Vercel Route 경유, 이전 앱 검증된 엔드포인트)
async function getLandInfo(pnu) {
  const res = await fetch(`/api/vworld?action=landinfo&pnu=${encodeURIComponent(pnu)}`)
  const data = await res.json()
  if (data.error) throw new Error(data.error)

  // ladfrlList 응답 구조에서 필요한 필드 추출
  const item = data?.landCharacteristics?.landCharacteristic?.[0]
    ?? data?.field?.[0]
    ?? data?.fields?.field?.[0]

  if (!item) throw new Error('토지정보를 찾을 수 없습니다')

  return {
    용도지역: item.prposAreaDstrcNm ?? item.jimok ?? '확인 필요',
    지목: item.lndcgrCodeNm ?? item.jimokNm ?? '확인 필요',
    면적: item.lndpclAr ? `${item.lndpclAr}㎡` : '확인 필요',
    공시지가: item.pblntfPclnd
      ? `${Number(item.pblntfPclnd).toLocaleString()}원/㎡`
      : '확인 필요',
  }
}

// 5. 카카오 지도 SDK 로드
function loadKakaoMap() {
  return new Promise((resolve) => {
    if (window.kakao?.maps) { resolve(); return }
    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false`
    script.onload = () => window.kakao.maps.load(resolve)
    document.head.appendChild(script)
  })
}

// ── 스타일 ──────────────────────────────────────────────

const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: { background: '#fff', borderRadius: 14, border: '1px solid #E8E8E8', overflow: 'hidden' },
  cardHeader: {
    padding: '12px 16px 8px', fontSize: 11, fontWeight: 500,
    color: '#999', letterSpacing: '.04em', borderBottom: '1px solid #E8E8E8',
  },
  cardBody: { padding: '12px 16px' },
  addrRow: { display: 'flex', gap: 6, marginBottom: 8 },
  addrInput: {
    flex: 1, padding: '10px 12px', fontSize: 13, borderRadius: 8,
    border: '1px solid #E8E8E8', outline: 'none', background: '#F7F7F5',
    fontFamily: 'inherit',
  },
  addrBtn: {
    padding: '10px 14px', background: '#1D9E75', color: '#fff',
    fontSize: 12, fontWeight: 500, borderRadius: 8, whiteSpace: 'nowrap', cursor: 'pointer',
  },
  gpsBtn: {
    padding: '10px 12px', background: '#F7F7F5', color: '#555',
    fontSize: 12, borderRadius: 8, border: '1px solid #E8E8E8',
    whiteSpace: 'nowrap', cursor: 'pointer',
  },
  mapEmpty: {
    height: 80, borderRadius: 10, background: '#F7F7F5',
    border: '1px solid #E8E8E8', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 12, color: '#bbb', marginBottom: 8,
  },
  mapFull: {
    height: 200, borderRadius: 10, overflow: 'hidden',
    border: '1px solid #E8E8E8', marginBottom: 8,
  },
  loadingBox: {
    background: '#E1F5EE', borderRadius: 8, padding: '10px 12px',
    fontSize: 12, color: '#0F6E56', marginBottom: 8,
  },
  errorBox: {
    background: '#FCEBEB', borderRadius: 8, padding: '10px 12px',
    fontSize: 12, color: '#A32D2D', marginBottom: 8,
  },
  resultBox: { borderRadius: 8, overflow: 'hidden', border: '1px solid #E8E8E8', marginBottom: 4 },
  resultRow: {
    display: 'flex', justifyContent: 'space-between',
    padding: '8px 12px', fontSize: 12,
  },
  photoGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 6 },
  slotOk: {
    aspectRatio: '1', borderRadius: 8, border: '1px solid #5DCAA5',
    background: '#E1F5EE', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 10, color: '#0F6E56', fontWeight: 500,
  },
  slotAdd: {
    aspectRatio: '1', borderRadius: 8, border: '1px dashed #ccc',
    background: '#F7F7F5', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 20, color: '#ccc', cursor: 'pointer',
  },
  fileRow: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
    background: '#F7F7F5', borderRadius: 8, border: '1px solid #E8E8E8', marginBottom: 6,
  },
  fileIcon: {
    width: 30, height: 30, borderRadius: 7, background: '#E1F5EE',
    border: '1px solid #9FE1CB', display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0,
  },
  fileName: { fontSize: 12, fontWeight: 500 },
  fileSub: { fontSize: 10, color: '#aaa' },
  badgeDone: { fontSize: 10, padding: '3px 9px', borderRadius: 20, background: '#E1F5EE', color: '#0F6E56' },
  badgeOpt: { fontSize: 10, padding: '3px 9px', borderRadius: 20, background: '#F7F7F5', color: '#aaa', border: '1px solid #E8E8E8' },
  nextBtn: {
    width: '100%', padding: 14, borderRadius: 12, background: '#1D9E75',
    color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none',
  },
  nextBtnOff: {
    width: '100%', padding: 14, borderRadius: 12, background: '#ccc',
    color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'not-allowed', border: 'none',
  },
}

// ── 컴포넌트 ─────────────────────────────────────────────

export default function Step1({ onNext }) {
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [coord, setCoord] = useState(null)
  const [landInfo, setLandInfo] = useState(null)
  const [photos] = useState(['외관', '내부1', '내부2'])
  const mapRef = useRef(null)
  const mapInstance = useRef(null)

  // 지도 표시
  useEffect(() => {
    if (!coord || !mapRef.current) return
    loadKakaoMap().then(() => {
      const { kakao } = window
      const position = new kakao.maps.LatLng(coord.lat, coord.lng)
      if (!mapInstance.current) {
        mapInstance.current = new kakao.maps.Map(mapRef.current, { center: position, level: 4 })
        new kakao.maps.Marker({ map: mapInstance.current, position })
      } else {
        mapInstance.current.setCenter(position)
      }
    })
  }, [coord])

  // 주소 조회
  async function handleSearch() {
    if (!address.trim()) return
    setLoading(true); setError(null); setLandInfo(null); setCoord(null)
    try {
      // 카카오: 지도 표시용 좌표
      const { lat, lng } = await getCoordFromAddress(address)
      setCoord({ lat, lng })
      // vworld: 주소 직접 → PNU → 토지정보
      const pnu = await getPNU(address)
      const info = await getLandInfo(pnu)
      setLandInfo(info)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // 현재 위치
  async function handleGPS() {
    if (!navigator.geolocation) { setError('GPS를 지원하지 않는 브라우저입니다'); return }
    setLoading(true); setError(null); setLandInfo(null)
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lng } }) => {
        try {
          setCoord({ lat, lng })
          // 카카오 역지오코딩으로 주소 텍스트 획득
          const addr = await getAddressFromCoord(lat, lng)
          if (addr) setAddress(addr)
          // vworld: 주소 → PNU → 토지정보
          const pnu = await getPNU(addr || `${lat},${lng}`)
          const info = await getLandInfo(pnu)
          setLandInfo(info)
        } catch (e) {
          setError(e.message)
        } finally {
          setLoading(false)
        }
      },
      () => { setError('위치 정보를 가져올 수 없습니다'); setLoading(false) }
    )
  }

  return (
    <div style={s.wrap}>

      {/* 주소 입력 */}
      <div style={s.card}>
        <div style={s.cardHeader}>주소 입력</div>
        <div style={s.cardBody}>
          <div style={s.addrRow}>
            <input
              style={s.addrInput}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="지번 또는 도로명 주소 입력"
            />
            <button style={s.addrBtn} onClick={handleSearch}>조회</button>
            <button style={s.gpsBtn} onClick={handleGPS}>📍 현위치</button>
          </div>

          {loading && <div style={s.loadingBox}>⏳ 토지정보를 조회하고 있습니다...</div>}
          {error && <div style={s.errorBox}>⚠ {error}</div>}

          {/* 지도 */}
          {coord
            ? <div style={s.mapFull}><div ref={mapRef} style={{ width: '100%', height: '100%' }} /></div>
            : <div style={s.mapEmpty}>주소를 입력하면 지도가 표시됩니다</div>
          }

          {/* 토지정보 결과 */}
          {landInfo && (
            <div style={s.resultBox}>
              {Object.entries(landInfo).map(([k, v], i, arr) => (
                <div key={k} style={{
                  ...s.resultRow,
                  borderBottom: i < arr.length - 1 ? '1px solid #F0F0EE' : 'none',
                  background: i % 2 === 0 ? '#fff' : '#FAFAF8',
                }}>
                  <span style={{ color: '#888' }}>{k}</span>
                  <span style={{ fontWeight: 500, color: '#0F6E56' }}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 현장 사진 */}
      <div style={s.card}>
        <div style={s.cardHeader}>현장 사진</div>
        <div style={s.cardBody}>
          <div style={s.photoGrid}>
            {photos.map((l) => <div key={l} style={s.slotOk}>{l}</div>)}
            <div style={s.slotAdd}>+</div>
          </div>
          <div style={{ fontSize: 11, color: '#aaa' }}>외관 1장 + 내부 주요 공간 권장</div>
        </div>
      </div>

      {/* 측량 데이터 */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          측량 데이터 <span style={{ fontWeight: 400, color: '#bbb' }}>(선택)</span>
        </div>
        <div style={s.cardBody}>
          <div style={s.fileRow}>
            <div style={s.fileIcon}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#0F6E56" strokeWidth="1.3">
                <rect x="1" y="3" width="14" height="9" rx="2" /><path d="M4 12v3M12 12v3" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={s.fileName}>정사영상</div>
              <div style={s.fileSub}>GeoTIFF · JPG</div>
            </div>
            <span style={s.badgeDone}>완료</span>
          </div>
          <div style={s.fileRow}>
            <div style={s.fileIcon}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#0F6E56" strokeWidth="1.3">
                <circle cx="8" cy="8" r="2" /><path d="M8 1v3M8 12v3M1 8h3M12 8h3" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={s.fileName}>포인트 클라우드</div>
              <div style={s.fileSub}>LAS · LAZ</div>
            </div>
            <span style={s.badgeOpt}>선택</span>
          </div>
        </div>
      </div>

      <button
        style={landInfo ? s.nextBtn : s.nextBtnOff}
        onClick={landInfo ? onNext : undefined}
      >
        {landInfo ? '다음 — 요구사항 입력 →' : '주소를 먼저 조회해주세요'}
      </button>
    </div>
  )
}
