import React, { useEffect, useRef, useState } from 'react'
import { processTierPayment } from '../App'

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

const TIER_ITEMS = {
  free: [
    { icon: '📍', text: '필지경계 지도' },
    { icon: '📋', text: '용도지역 · 건폐율 · 용적률' },
    { icon: '📐', text: '면적 · 지목 · 도로접면 · 지형' },
    { icon: '💰', text: '공시지가' },
    { icon: '✅', text: '"이 땅에서 할 수 있는 것·없는 것" AI 요약' },
  ],
  basic: [
    { icon: '📸', text: '현장 사진 AI 분석 (건물 상태·지형·접도)' },
    { icon: '🏗', text: '구현 방안 A · B · C 제안 + 장단점' },
    { icon: '⭐', text: '추천 방안 + 이유' },
    { icon: '💰', text: '개략 예산 범위 (±30~40% 오차 명시)' },
    { icon: '📄', text: '설계사무소 지참용 기초 문서 PDF' },
  ],
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: { background: '#fff', borderRadius: 14, border: '1px solid #E8E8E8', overflow: 'hidden' },
  cardHeader: { padding: '12px 16px 8px', fontSize: 11, fontWeight: 500, color: '#999', letterSpacing: '.04em', borderBottom: '1px solid #E8E8E8' },
  cardBody: { padding: '12px 16px' },
  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 10, fontWeight: 500, color: '#aaa', marginBottom: 6, letterSpacing: '.05em' },
  dataRow: { display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: 12, borderBottom: '1px solid #F5F5F3' },
  btnRow: { display: 'flex', gap: 8 },
  backBtn: { flex: 1, padding: 14, borderRadius: 12, border: '1px solid #E8E8E8', background: '#fff', color: '#888', fontSize: 13, fontWeight: 500, cursor: 'pointer' },
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

function TierCard({ selected, onSelect, tier, badge, badgeColor, badgeBg, title, price, priceSub, items, borderColor, headerBg }) {
  const isSelected = selected === tier
  return (
    <div
      onClick={() => onSelect(tier)}
      style={{
        borderRadius: 14,
        border: `2px solid ${isSelected ? borderColor : '#E8E8E8'}`,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.2s',
        background: '#fff',
      }}
    >
      <div style={{ padding: '14px 16px 12px', background: isSelected ? headerBg : '#F7F7F5' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '.08em',
              color: isSelected ? badgeColor : '#aaa',
              background: isSelected ? badgeBg : '#EBEBEB',
              display: 'inline-block', padding: '2px 8px', borderRadius: 20, marginBottom: 6,
            }}>{badge}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: isSelected ? badgeColor : '#555' }}>{title}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: isSelected ? badgeColor : '#999' }}>{price}</div>
            {priceSub && <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>{priceSub}</div>}
          </div>
        </div>
      </div>
      <div style={{ padding: '12px 16px' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: isSelected ? '#333' : '#aaa', marginBottom: 6, lineHeight: 1.5 }}>
            <span>{item.icon}</span>
            <span>{item.text}</span>
          </div>
        ))}
      </div>
      <div style={{ height: 3, background: isSelected ? borderColor : 'transparent', transition: 'background 0.2s' }} />
    </div>
  )
}

export default function Step3({ landData, purpose, requirements, tier, setTier, onBack, onNext }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const [paying, setPaying] = useState(false)

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

  // ── 다음 버튼 클릭 ──────────────────────────────────────────────────────
  // 💳 결제 처리는 processTierPayment() 함수 안에서 담당 (App.jsx)
  // 나중에 실제 PG 연동 시 App.jsx의 processTierPayment 함수만 수정하면 됩니다
  async function handleNext() {
    if (!tier) return
    setPaying(true)
    try {
      const ok = await processTierPayment(tier)
      if (ok) onNext()
    } finally {
      setPaying(false)
    }
  }

  const basic = landData?.토지기본
  const char = landData?.토지특성
  const building = landData?.건축물대장

  const nextLabel = () => {
    if (paying) return '처리 중...'
    if (!tier) return '단계를 선택해주세요'
    if (tier === 'free') return '무료로 토지정보 확인 →'
    if (tier === 'basic') return '9,900원으로 AI 분석 시작 →'
    return '다음 →'
  }

  return (
    <div style={s.wrap}>

      {/* 필지 지도 */}
      {landData?.좌표
        ? <div style={{ height: 240, borderRadius: 14, overflow: 'hidden', border: '1px solid #E8E8E8' }}>
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
          </div>
        : <div style={{ height: 160, borderRadius: 14, background: '#F7F7F5', border: '1px solid #E8E8E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#bbb' }}>
            공간정보를 불러오는 중...
          </div>
      }

      {/* 토지 정보 */}
      {(basic || char || building) && (
        <div style={s.card}>
          <div style={s.cardHeader}>수집된 토지 정보</div>
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

      {/* 단계 선택 */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 10, paddingLeft: 2 }}>
          어떤 분석이 필요하신가요?
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <TierCard
            selected={tier} onSelect={setTier}
            tier="free"
            badge="1단계 · 무료"
            badgeColor="#0F6E56" badgeBg="#E1F5EE"
            borderColor="#0F6E56" headerBg="#E1F5EE"
            title="토지 기본정보 확인"
            price="FREE"
            priceSub="주소 입력만으로"
            items={TIER_ITEMS.free}
          />
          <TierCard
            selected={tier} onSelect={setTier}
            tier="basic"
            badge="2단계 · 유료"
            badgeColor="#BA7517" badgeBg="#FAEEDA"
            borderColor="#BA7517" headerBg="#FAEEDA"
            title="현황진단 + 방향제안"
            price="9,900원"
            priceSub="설계사무소 상담 준비용"
            items={TIER_ITEMS.basic}
          />
        </div>

        {tier === 'basic' && (
          <div style={{ marginTop: 10, padding: '10px 12px', background: '#FAEEDA', borderRadius: 8, border: '1px solid #FAC775' }}>
            <div style={{ fontSize: 11, color: '#BA7517', lineHeight: 1.7 }}>
              ⚠ 본 분석은 현장 사진 기반 참고자료입니다. 정확한 물량·예산은 드론 측량 후 확정됩니다.
            </div>
          </div>
        )}
      </div>

      <div style={s.btnRow}>
        <button style={s.backBtn} onClick={onBack}>← 이전</button>
        <button
          onClick={tier && !paying ? handleNext : undefined}
          style={{
            flex: 2, padding: 14, borderRadius: 12, border: 'none',
            background: tier && !paying ? (tier === 'free' ? '#0F6E56' : '#BA7517') : '#ccc',
            color: '#fff', fontSize: 13, fontWeight: 500,
            cursor: tier && !paying ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s',
          }}
        >
          {nextLabel()}
        </button>
      </div>
    </div>
  )
}
