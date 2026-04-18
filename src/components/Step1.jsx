import React, { useState, useEffect, useRef } from 'react'

const KAKAO_REST_KEY = import.meta.env.VITE_KAKAO_REST_KEY
const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY

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

async function getAddressFromCoord(lat, lng) {
  const res = await fetch(
    `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lng}&y=${lat}`,
    { headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` } }
  )
  const data = await res.json()
  return data.documents?.[0]?.address?.address_name ?? ''
}

function loadKakaoMap() {
  return new Promise((resolve) => {
    if (window.kakao?.maps) { resolve(); return }
    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false`
    script.onload = () => window.kakao.maps.load(resolve)
    document.head.appendChild(script)
  })
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: { background: '#fff', borderRadius: 14, border: '1px solid #E8E8E8', overflow: 'hidden' },
  cardHeader: { padding: '12px 16px 8px', fontSize: 11, fontWeight: 500, color: '#999', letterSpacing: '.04em', borderBottom: '1px solid #E8E8E8' },
  cardBody: { padding: '12px 16px' },
  addrRow: { display: 'flex', gap: 6, marginBottom: 8 },
  addrInput: { flex: 1, padding: '10px 12px', fontSize: 13, borderRadius: 8, border: '1px solid #E8E8E8', outline: 'none', background: '#F7F7F5', fontFamily: 'inherit' },
  addrBtn: { padding: '10px 14px', background: '#1D9E75', color: '#fff', fontSize: 12, fontWeight: 500, borderRadius: 8, whiteSpace: 'nowrap', cursor: 'pointer' },
  gpsBtn: { padding: '10px 12px', background: '#F7F7F5', color: '#555', fontSize: 12, borderRadius: 8, border: '1px solid #E8E8E8', whiteSpace: 'nowrap', cursor: 'pointer' },
  mapEmpty: { height: 200, borderRadius: 10, background: '#F7F7F5', border: '1px solid #E8E8E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#bbb' },
  mapFull: { height: 240, borderRadius: 10, overflow: 'hidden', border: '1px solid #E8E8E8' },
  loadingBox: { background: '#E1F5EE', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#0F6E56', marginBottom: 8 },
  errorBox: { background: '#FCEBEB', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#A32D2D', marginBottom: 8 },
  addrResult: { background: '#F7F7F5', borderRadius: 8, padding: '10px 12px', fontSize: 12, marginBottom: 4 },
  nextBtn: { width: '100%', padding: 14, borderRadius: 12, background: '#1D9E75', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none' },
  nextBtnOff: { width: '100%', padding: 14, borderRadius: 12, background: '#ccc', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'not-allowed', border: 'none' },
}

export default function Step1({ address, setAddress, coord, setCoord, onNext }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [resolvedAddress, setResolvedAddress] = useState('')
  const mapRef = useRef(null)
  const mapInstance = useRef(null)

  // 스팟 지도 (핀만 표시)
  useEffect(() => {
    if (!coord) return
    const timer = setTimeout(() => {
      if (!mapRef.current) return
      loadKakaoMap().then(() => {
        const { kakao } = window
        const position = new kakao.maps.LatLng(coord.lat, coord.lng)
        if (mapInstance.current) mapInstance.current = null
        mapInstance.current = new kakao.maps.Map(mapRef.current, { center: position, level: 5 })
        new kakao.maps.Marker({ map: mapInstance.current, position })
      })
    }, 100)
    return () => clearTimeout(timer)
  }, [coord])

  async function handleSearch() {
    if (!address.trim()) return
    setLoading(true); setError(null)
    try {
      const c = await getCoordFromAddress(address)
      setCoord(c)
      setResolvedAddress(address)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGPS() {
    if (!navigator.geolocation) { setError('GPS를 지원하지 않는 브라우저입니다'); return }
    setLoading(true); setError(null)
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lng } }) => {
        try {
          setCoord({ lat, lng })
          const addr = await getAddressFromCoord(lat, lng)
          if (addr) { setAddress(addr); setResolvedAddress(addr) }
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
      <div style={s.card}>
        <div style={s.cardHeader}>현장 주소</div>
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
            <button style={s.gpsBtn} onClick={handleGPS}>📍</button>
          </div>

          {loading && <div style={s.loadingBox}>⏳ 주소를 확인하고 있습니다...</div>}
          {error && <div style={s.errorBox}>⚠ {error}</div>}

          {resolvedAddress && !loading && (
            <div style={s.addrResult}>
              📍 {resolvedAddress}
            </div>
          )}
        </div>
      </div>

      {/* 스팟 지도 - 전체 너비 */}
      {coord
        ? <div style={{ height: 260, borderRadius: 14, overflow: 'hidden', border: '1px solid #E8E8E8' }}>
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
          </div>
        : <div style={{ height: 180, borderRadius: 14, background: '#F7F7F5', border: '1px solid #E8E8E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#bbb' }}>
            📍 주소를 입력하면 지도가 표시됩니다
          </div>
      }

      <button
        style={coord ? s.nextBtn : s.nextBtnOff}
        onClick={coord ? onNext : undefined}
      >
        {coord ? '다음 — 요구사항 입력 →' : '주소를 먼저 입력해주세요'}
      </button>
    </div>
  )
}
