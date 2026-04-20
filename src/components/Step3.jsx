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

const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: { background: '#fff', borderRadius: 14, border: '1px solid #E8E8E8', overflow: 'hidden' },
  cardHeader: { padding: '12px 16px 8px', fontSize: 11, fontWeight: 500, color: '#999', letterSpacing: '.04em', borderBottom: '1px solid #E8E8E8' },
  cardBody: { padding: '12px 16px' },
  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 10, fontWeight: 500, color: '#aaa', marginBottom: 6, letterSpacing: '.05em' },
  dataRow: { display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: 12, borderBottom: '1px solid #F5F5F3' },
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

export default function Step3({ landData, purpose, requirements, tier, setTier, onBack, onNext, onRestart }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)

  // 'idle' | 'loading' | 'done' | 'error'
  const [aiState, setAiState] = useState('idle')
  const [aiResult, setAiResult] = useState(null)
  const [aiError, setAiError] = useState(null)
  const [loadingMsg, setLoadingMsg] = useState(0)
  const [paying, setPaying] = useState(false)

  const msgs = ['공간정보를 분석하고 있습니다...', '법적 현황을 정리하고 있습니다...', '보고서를 작성하고 있습니다...']

  // 지도
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

  // AI 요약 호출
  async function runAiSummary() {
    setAiState('loading')
    setAiError(null)
    const interval = setInterval(() => setLoadingMsg(m => (m + 1) % msgs.length), 2000)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ landData, purpose, requirements, photos: [], tier: 'free' }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setAiResult(data)
      setAiState('done')
    } catch (e) {
      setAiError(e.message)
      setAiState('error')
    } finally {
      clearInterval(interval)
    }
  }

  // 2단계 진행
  async function handleBasic() {
    setPaying(true)
    try {
      const ok = await processTierPayment('basic')
      if (ok) { setTier('basic'); onNext() }
    } finally {
      setPaying(false)
    }
  }

  const basic    = landData?.토지기본
  const char     = landData?.토지특성
  const building = landData?.건축물대장
  const hasData  = basic || char || building

  return (
    <div style={s.wrap}>

      {/* ── 지도 ── */}
      {landData?.좌표
        ? <div style={{ height: 240, borderRadius: 14, overflow: 'hidden', border: '1px solid #E8E8E8' }}>
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
          </div>
        : <div style={{ height: 160, borderRadius: 14, background: '#F7F7F5', border: '1px solid #E8E8E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#bbb' }}>
            공간정보를 불러오는 중...
          </div>
      }

      {/* ── 공공데이터 — API 수집되면 즉시 표시 ── */}
      {hasData && (
        <div style={s.card}>
          <div style={s.cardHeader}>수집된 토지 정보</div>
          <div style={s.cardBody}>
            {basic && (
              <div style={s.section}>
                <div style={s.sectionTitle}>기본 현황</div>
                <DataRow label="주소"     value={basic.주소} />
                <DataRow label="지번"     value={basic.지번} />
                <DataRow label="지목"     value={basic.지목} />
                <DataRow label="면적"     value={basic.면적} />
                <DataRow label="소유구분" value={basic.소유구분} />
              </div>
            )}
            {char && (
              <div style={s.section}>
                <div style={s.sectionTitle}>법적 현황</div>
                <DataRow label="용도지역"     value={char.용도지역}     color="#0F6E56" />
                <DataRow label="토지이용상황" value={char.토지이용상황} />
                <DataRow label="지형경사"     value={char.지형경사} />
                <DataRow label="지형형상"     value={char.지형형상} />
                <DataRow label="도로접면"     value={char.도로접면} />
                <DataRow label="공시지가"     value={char.공시지가} />
                <DataRow label="공시기준"     value={char.공시기준} />
              </div>
            )}
            {building && (
              <div style={s.section}>
                <div style={s.sectionTitle}>건축물 현황</div>
                <DataRow label="주용도"     value={building.주용도} />
                <DataRow label="구조"       value={building.구조} />
                <DataRow label="사용승인일" value={building.사용승인일} />
                <DataRow label="건축면적"   value={building.건축면적} />
                <DataRow label="연면적"     value={building.연면적} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 하단 영역: aiState에 따라 교체 ── */}

      {/* idle → 1단계 카드 */}
      {aiState === 'idle' && hasData && (
        <div style={{ borderRadius: 14, border: '2px solid #0F6E56', overflow: 'hidden', background: '#fff' }}>
          <div style={{ padding: '14px 16px 12px', background: '#E1F5EE' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#0F6E56', background: '#9FE1CB', display: 'inline-block', padding: '2px 8px', borderRadius: 20, marginBottom: 6 }}>
                  1단계 · 무료
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0F6E56' }}>AI 토지 분석</div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#0F6E56' }}>FREE</div>
            </div>
          </div>
          <div style={{ padding: '12px 16px' }}>
            {[
              { icon: '✅', text: '이 땅에서 할 수 있는 것' },
              { icon: '❌', text: '법적으로 제한되는 것' },
              { icon: '📌', text: '주의해야 할 사항' },
              { icon: '🎁', text: '관련 보조금 참고' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: '#333', marginBottom: 6, lineHeight: 1.5 }}>
                <span>{item.icon}</span><span>{item.text}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: '0 16px 16px' }}>
            <button
              onClick={runAiSummary}
              style={{ width: '100%', padding: 13, borderRadius: 10, border: 'none', background: '#0F6E56', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            >
              AI 분석하기 →
            </button>
          </div>
        </div>
      )}

      {/* loading → 로딩 표시 */}
      {aiState === 'loading' && (
        <div style={s.card}>
          <div style={s.cardBody}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 0' }}>
              <div style={{ fontSize: 28 }}>📋</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#0F6E56', marginBottom: 4 }}>AI 분석 중...</div>
                <div style={{ fontSize: 11, color: '#aaa' }}>{msgs[loadingMsg]}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* done → AI 요약 결과 */}
      {aiState === 'done' && aiResult && (
        <>
          {aiResult.가능사항?.length > 0 && (
            <div style={s.card}>
              <div style={s.cardHeader}>✅ 이 땅에서 가능한 것</div>
              <div style={s.cardBody}>
                {aiResult.가능사항.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: '#0F6E56', marginBottom: 6, lineHeight: 1.6 }}>
                    <span style={{ flexShrink: 0 }}>•</span><span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {aiResult.불가사항?.length > 0 && (
            <div style={s.card}>
              <div style={s.cardHeader}>❌ 제한되는 것</div>
              <div style={s.cardBody}>
                {aiResult.불가사항.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: '#A32D2D', marginBottom: 6, lineHeight: 1.6 }}>
                    <span style={{ flexShrink: 0 }}>•</span><span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {aiResult.참고사항 && (
            <div style={s.card}>
              <div style={s.cardHeader}>📌 참고사항</div>
              <div style={s.cardBody}>
                <div style={{ fontSize: 12, color: '#555', lineHeight: 1.8 }}>{aiResult.참고사항}</div>
              </div>
            </div>
          )}
          {aiResult.보조금?.length > 0 && (
            <div style={s.card}>
              <div style={s.cardHeader}>🎁 관련 보조금 참고</div>
              <div style={s.cardBody}>
                {aiResult.보조금.map((item, i) => (
                  <div key={i} style={{ padding: '10px 12px', background: '#E1F5EE', borderRadius: 8, border: '1px solid #9FE1CB', marginBottom: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: '#085041' }}>{item.사업명}</div>
                    <div style={{ fontSize: 11, color: '#0F6E56', marginTop: 2 }}>{item.지원기관} · {item.신청조건}</div>
                  </div>
                ))}
                <div style={{ fontSize: 10, color: '#aaa', marginTop: 6 }}>* 보조금은 연도·지역별로 변경될 수 있으니 해당 기관에 직접 확인하세요.</div>
              </div>
            </div>
          )}
        </>
      )}

      {/* error → 다시 시도 */}
      {aiState === 'error' && (
        <div style={{ padding: '12px 14px', background: '#F7F7F5', borderRadius: 10, border: '1px solid #E8E8E8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#aaa' }}>AI 요약 실패 — {aiError}</span>
          <button onClick={runAiSummary} style={{ fontSize: 11, color: '#0F6E56', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 8, flexShrink: 0 }}>
            다시 시도
          </button>
        </div>
      )}

      {/* ── 2단계 카드 — AI 분석 후에만 표시 ── */}
      {(aiState === 'done' || aiState === 'error') && hasData && (
        <div style={{ borderRadius: 14, border: '2px solid #BA7517', overflow: 'hidden', background: '#fff' }}>
          <div style={{ padding: '14px 16px 12px', background: '#FAEEDA' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#BA7517', background: '#FAD48A', display: 'inline-block', padding: '2px 8px', borderRadius: 20, marginBottom: 6 }}>
                  2단계 · 유료
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#BA7517' }}>현황진단 + 방향제안</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#BA7517' }}>9,900원</div>
                <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>설계사무소 상담 준비용</div>
              </div>
            </div>
          </div>
          <div style={{ padding: '12px 16px' }}>
            {[
              { icon: '📸', text: '현장 사진 AI 분석 (건물 상태·지형·접도)' },
              { icon: '🏗', text: '구현 방안 A · B · C 제안 + 장단점' },
              { icon: '⭐', text: '추천 방안 + 이유' },
              { icon: '💰', text: '개략 예산 범위 (±30~40% 오차 명시)' },
              { icon: '📄', text: '설계사무소 지참용 기초 문서' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: '#333', marginBottom: 6, lineHeight: 1.5 }}>
                <span>{item.icon}</span><span>{item.text}</span>
              </div>
            ))}
            <div style={{ marginTop: 10, padding: '8px 10px', background: '#FAEEDA', borderRadius: 8, fontSize: 11, color: '#BA7517' }}>
              ⚠ 현장 사진 기반 참고자료입니다. 정확한 물량·예산은 드론 측량 후 확정됩니다.
            </div>
          </div>
          <div style={{ padding: '0 16px 16px' }}>
            <button
              onClick={paying ? undefined : handleBasic}
              style={{ width: '100%', padding: 13, borderRadius: 10, border: 'none', background: paying ? '#ccc' : '#BA7517', color: '#fff', fontSize: 13, fontWeight: 500, cursor: paying ? 'not-allowed' : 'pointer' }}
            >
              {paying ? '처리 중...' : '사진 업로드하고 AI 분석받기 →'}
            </button>
          </div>
        </div>
      )}

      <button style={s.restartBtn} onClick={onRestart}>← 새 현장 분석하기</button>
    </div>
  )
}
