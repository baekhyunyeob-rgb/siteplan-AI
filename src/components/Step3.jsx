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
    { icon: '📋', text: '용도지역 · 건폐율 · 용적률' },
    { icon: '📐', text: '면적 · 지목 · 도로접면 · 지형' },
    { icon: '💰', text: '공시지가' },
    { icon: '✅', text: 'AI 요약 — 이 땅에서 할 수 있는 것·제한 사항' },
    { icon: '🎁', text: '관련 보조금 참고 목록' },
  ],
  basic: [
    { icon: '📸', text: '현장 사진 AI 분석 (건물 상태·지형·접도)' },
    { icon: '🏗', text: '구현 방안 A · B · C 제안 + 장단점' },
    { icon: '⭐', text: '추천 방안 + 이유' },
    { icon: '💰', text: '개략 예산 범위 (±30~40% 오차 명시)' },
    { icon: '📄', text: '설계사무소 지참용 기초 문서' },
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
  restartBtn: { width: '100%', padding: 14, borderRadius: 12, border: '1px solid #E8E8E8', background: '#fff', color: '#555', fontSize: 13, fontWeight: 500, cursor: 'pointer' },
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
        borderRadius: 14, border: `2px solid ${isSelected ? borderColor : '#E8E8E8'}`,
        overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s', background: '#fff',
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
            <span>{item.icon}</span><span>{item.text}</span>
          </div>
        ))}
      </div>
      <div style={{ height: 3, background: isSelected ? borderColor : 'transparent', transition: 'background 0.2s' }} />
    </div>
  )
}

// ── free 분석 결과 표시 (Step3 내부에서 완결) ────────────────────
function FreeResult({ result, landData, onRestart }) {
  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.cardHeader}>토지 기본정보</div>
        <div style={s.cardBody}>
          <DataRow label="주소" value={landData?.토지기본?.주소} />
          <DataRow label="지목" value={landData?.토지기본?.지목} />
          <DataRow label="면적" value={landData?.토지기본?.면적} />
          <DataRow label="용도지역" value={landData?.토지특성?.용도지역} color="#0F6E56" />
          <DataRow label="도로접면" value={landData?.토지특성?.도로접면} />
          <DataRow label="지형경사" value={landData?.토지특성?.지형경사} />
          <DataRow label="공시지가" value={landData?.토지특성?.공시지가} />
        </div>
      </div>

      {result?.가능사항?.length > 0 && (
        <div style={s.card}>
          <div style={s.cardHeader}>✅ 이 땅에서 가능한 것</div>
          <div style={s.cardBody}>
            {result.가능사항.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: '#0F6E56', marginBottom: 6, lineHeight: 1.6 }}>
                <span style={{ flexShrink: 0 }}>•</span><span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {result?.불가사항?.length > 0 && (
        <div style={s.card}>
          <div style={s.cardHeader}>❌ 제한되는 것</div>
          <div style={s.cardBody}>
            {result.불가사항.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: '#A32D2D', marginBottom: 6, lineHeight: 1.6 }}>
                <span style={{ flexShrink: 0 }}>•</span><span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {result?.참고사항 && (
        <div style={s.card}>
          <div style={s.cardHeader}>📌 참고사항</div>
          <div style={s.cardBody}>
            <div style={{ fontSize: 12, color: '#555', lineHeight: 1.8 }}>{result.참고사항}</div>
          </div>
        </div>
      )}

      {result?.보조금?.length > 0 && (
        <div style={s.card}>
          <div style={s.cardHeader}>🎁 관련 보조금 참고</div>
          <div style={s.cardBody}>
            {result.보조금.map((item, i) => (
              <div key={i} style={{ padding: '10px 12px', background: '#E1F5EE', borderRadius: 8, border: '1px solid #9FE1CB', marginBottom: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#085041' }}>{item.사업명}</div>
                <div style={{ fontSize: 11, color: '#0F6E56', marginTop: 2 }}>{item.지원기관} · {item.신청조건}</div>
              </div>
            ))}
            <div style={{ fontSize: 10, color: '#aaa', marginTop: 6 }}>* 보조금은 연도·지역별로 변경될 수 있으니 해당 기관에 직접 확인하세요.</div>
          </div>
        </div>
      )}

      {/* 2단계 업셀 */}
      <div style={{ padding: '16px', background: '#FAEEDA', borderRadius: 14, border: '1px solid #FAC775' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#BA7517', marginBottom: 6 }}>현장 사진으로 더 자세한 분석을 원하시나요?</div>
        <div style={{ fontSize: 11, color: '#BA7517', lineHeight: 1.7 }}>
          2단계에서는 사진을 기반으로 방안 A·B·C와<br />개략 예산을 제안합니다. (9,900원)
        </div>
      </div>

      <button style={s.restartBtn} onClick={onRestart}>← 새 현장 분석하기</button>
    </div>
  )
}

// ── 메인 Step3 ────────────────────────────────────────────────────
export default function Step3({ landData, purpose, requirements, tier, setTier, onBack, onNext, onRestart }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)

  // free 분석 상태
  const [freeLoading, setFreeLoading] = useState(false)
  const [freeResult, setFreeResult] = useState(null)
  const [freeError, setFreeError] = useState(null)
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

  // free 선택 후 "확인하기" 클릭 → AI 호출 → 결과 표시 (Step3에서 완결)
  async function handleFreeAnalyze() {
    setFreeLoading(true)
    setFreeError(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ landData, purpose, requirements, photos: [], tier: 'free' }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setFreeResult(data)
    } catch (e) {
      setFreeError(e.message)
    } finally {
      setFreeLoading(false)
    }
  }

  // basic 선택 후 → 결제 처리 → Step4로
  async function handleBasicNext() {
    setPaying(true)
    try {
      const ok = await processTierPayment('basic')
      if (ok) onNext()
    } finally {
      setPaying(false)
    }
  }

  // free 결과 화면
  if (freeResult) {
    return <FreeResult result={freeResult} landData={landData} onRestart={onRestart} />
  }

  const basic = landData?.토지기본
  const char  = landData?.토지특성
  const building = landData?.건축물대장

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
            badge="1단계 · 무료" badgeColor="#0F6E56" badgeBg="#E1F5EE"
            borderColor="#0F6E56" headerBg="#E1F5EE"
            title="토지 기본정보 확인" price="FREE" priceSub="주소 입력만으로"
            items={TIER_ITEMS.free}
          />
          <TierCard
            selected={tier} onSelect={setTier}
            tier="basic"
            badge="2단계 · 유료" badgeColor="#BA7517" badgeBg="#FAEEDA"
            borderColor="#BA7517" headerBg="#FAEEDA"
            title="현황진단 + 방향제안" price="9,900원" priceSub="설계사무소 상담 준비용"
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

      {/* 에러 */}
      {freeError && (
        <div style={{ padding: '10px 12px', background: '#FCEBEB', borderRadius: 8, fontSize: 12, color: '#A32D2D' }}>
          ⚠ {freeError}
        </div>
      )}

      {/* 버튼 */}
      <div style={s.btnRow}>
        <button style={s.backBtn} onClick={onBack}>← 이전</button>

        {tier === 'free' && (
          <button
            onClick={freeLoading ? undefined : handleFreeAnalyze}
            style={{
              flex: 2, padding: 14, borderRadius: 12, border: 'none',
              background: freeLoading ? '#ccc' : '#0F6E56',
              color: '#fff', fontSize: 13, fontWeight: 500,
              cursor: freeLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {freeLoading ? '분석 중...' : '토지정보 확인하기 →'}
          </button>
        )}

        {tier === 'basic' && (
          <button
            onClick={paying ? undefined : handleBasicNext}
            style={{
              flex: 2, padding: 14, borderRadius: 12, border: 'none',
              background: paying ? '#ccc' : '#BA7517',
              color: '#fff', fontSize: 13, fontWeight: 500,
              cursor: paying ? 'not-allowed' : 'pointer',
            }}
          >
            {paying ? '처리 중...' : '사진 업로드하기 →'}
          </button>
        )}

        {!tier && (
          <button style={{ flex: 2, padding: 14, borderRadius: 12, border: 'none', background: '#ccc', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'not-allowed' }}>
            단계를 선택해주세요
          </button>
        )}
      </div>
    </div>
  )
}
