import React, { useEffect, useRef } from 'react'

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY

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
  mapBox: { height: 240, borderRadius: 10, overflow: 'hidden', border: '1px solid #E8E8E8' },
  mapEmpty: { height: 240, borderRadius: 10, background: '#F7F7F5', border: '1px solid #E8E8E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#bbb' },
  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 10, fontWeight: 500, color: '#aaa', marginBottom: 6, letterSpacing: '.05em' },
  dataRow: { display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: 12, borderBottom: '1px solid #F5F5F3' },
  highlight: { background: '#E1F5EE', borderRadius: 10, padding: '12px 14px', marginBottom: 8 },
  highlightLabel: { fontSize: 10, color: '#0F6E56', marginBottom: 4 },
  highlightValue: { fontSize: 18, fontWeight: 700, color: '#0F6E56' },
  payBox: { background: '#fff', borderRadius: 14, border: '2px solid #0F6E56', overflow: 'hidden' },
  payHeader: { padding: '14px 16px 10px', background: '#E1F5EE' },
  payTitle: { fontSize: 14, fontWeight: 700, color: '#0F6E56' },
  paySub: { fontSize: 11, color: '#1D9E75', marginTop: 2 },
  payBody: { padding: '12px 16px' },
  payItem: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 12, borderBottom: '1px solid #F0F0EE' },
  payPrice: { padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E8E8E8' },
  btnRow: { display: 'flex', gap: 8 },
  backBtn: { flex: 1, padding: 14, borderRadius: 12, border: '1px solid #E8E8E8', background: '#fff', color: '#888', fontSize: 13, fontWeight: 500, cursor: 'pointer' },
  payBtn: { flex: 2, padding: 14, borderRadius: 12, background: '#0F6E56', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none' },
}

function DataRow({ label, value, color }) {
  if (!value) return null
  return (
    <div style={s.dataRow}>
      <span style={{ color: '#888' }}>{label}</span>
      <span style={{ fontWeight: 500, color: color || '#1A1A1A' }}>{value}</span>
    </div>
  )
}

export default function Step3({ landData, purpose, requirements, onBack, onNext }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)

  useEffect(() => {
    if (!landData?.좌표) return
    const timer = setTimeout(() => {
      if (!mapRef.current) return
      loadKakaoMap().then(() => {
        const { kakao } = window
        const { lat, lng } = landData.좌표
        const position = new kakao.maps.LatLng(lat, lng)

        if (mapInstance.current) mapInstance.current = null
        mapInstance.current = new kakao.maps.Map(mapRef.current, { center: position, level: 4 })
        const map = mapInstance.current

        if (landData.필지경계?.coordinates) {
          const coords = landData.필지경계.coordinates[0][0]
          const path = coords.map(([lng, lat]) => new kakao.maps.LatLng(lat, lng))

          new kakao.maps.Polygon({
            map, path,
            strokeWeight: 2, strokeColor: '#0F6E56', strokeOpacity: 0.9,
            fillColor: '#E1F5EE', fillOpacity: 0.4,
          })

          const bounds = new kakao.maps.LatLngBounds()
          path.forEach(p => bounds.extend(p))
          map.setBounds(bounds, 40)
        } else {
          new kakao.maps.Marker({ map, position })
        }
      })
    }, 100)
    return () => clearTimeout(timer)
  }, [landData])

  const basic = landData?.토지기본
  const char = landData?.토지특성
  const building = landData?.건축물대장

  return (
    <div style={s.wrap}>

      {/* 필지 지도 - 전체 너비 */}
      {landData?.좌표
        ? <div style={{ height: 280, borderRadius: 14, overflow: 'hidden', border: '1px solid #E8E8E8' }}>
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
          </div>
        : <div style={{ height: 200, borderRadius: 14, background: '#F7F7F5', border: '1px solid #E8E8E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#bbb' }}>
            공간정보를 불러오는 중...
          </div>
      }

      {/* 토지 정보 */}
      {(basic || char) && (
        <div style={s.card}>
          <div style={s.cardHeader}>토지 정보</div>
          <div style={s.cardBody}>
            {basic && (
              <div style={s.section}>
                <div style={s.sectionTitle}>기본 현황</div>
                <DataRow label="주소" value={basic.주소} />
                <DataRow label="지번" value={basic.지번} />
                <DataRow label="지목" value={basic.지목} />
                <DataRow label="면적" value={basic.면적} />
                <DataRow label="소유구분" value={basic.소유구분} />
              </div>
            )}
            {char && (
              <div style={s.section}>
                <div style={s.sectionTitle}>법적 현황</div>
                <DataRow label="용도지역" value={char.용도지역} color="#0F6E56" />
                <DataRow label="토지이용상황" value={char.토지이용상황} />
                <DataRow label="지형경사" value={char.지형경사} />
                <DataRow label="지형형상" value={char.지형형상} />
                <DataRow label="도로접면" value={char.도로접면} />
                <DataRow label="공시지가" value={char.공시지가} />
                <DataRow label="공시기준" value={char.공시기준} />
              </div>
            )}
            {building && (
              <div style={s.section}>
                <div style={s.sectionTitle}>건축물 현황</div>
                <DataRow label="주용도" value={building.주용도} />
                <DataRow label="구조" value={building.구조} />
                <DataRow label="사용승인일" value={building.사용승인일} />
                <DataRow label="건축면적" value={building.건축면적} />
                <DataRow label="연면적" value={building.연면적} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 과금 안내 */}
      <div style={s.payBox}>
        <div style={s.payHeader}>
          <div style={s.payTitle}>AI 분석 시작하기</div>
          <div style={s.paySub}>사진을 올리면 AI가 현황을 분석하고 견적을 산출합니다</div>
        </div>
        <div style={s.payBody}>
          {[
            '📸 현황 사진 AI 분석',
            '🏗 공사 범위·물량 산출',
            '💰 예상 공사비 (하한·상한)',
            '🎁 보조금 자동 매칭',
            '📄 시공자용 PDF 리포트',
          ].map((item, i) => (
            <div key={i} style={{ ...s.payItem, borderBottom: i === 4 ? 'none' : '1px solid #F0F0EE' }}>
              <span>{item}</span>
            </div>
          ))}
        </div>
        <div style={s.payPrice}>
          <div>
            <div style={{ fontSize: 11, color: '#888' }}>기본 분석</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#0F6E56' }}>9,900원</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#888' }}>드론 측량 포함</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#185FA5' }}>19,900원</div>
          </div>
        </div>
      </div>

      <div style={s.btnRow}>
        <button style={s.backBtn} onClick={onBack}>← 이전</button>
        <button style={s.payBtn} onClick={onNext}>분석 시작하기 →</button>
      </div>
    </div>
  )
}
