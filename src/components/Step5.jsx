import React, { useState, useEffect } from 'react'

const GRADE_COLOR = {
  '양호': { bg: '#E1F5EE', color: '#0F6E56', dot: '#1D9E75' },
  '보통': { bg: '#FAEEDA', color: '#BA7517', dot: '#EF9F27' },
  '불량': { bg: '#FCEBEB', color: '#A32D2D', dot: '#E24B4A' },
  '위험': { bg: '#FCEBEB', color: '#A32D2D', dot: '#E24B4A' },
}

const PRIORITY_COLOR = {
  '필수': { bg: '#FCEBEB', color: '#A32D2D' },
  '권장': { bg: '#E6F1FB', color: '#0C447C' },
  '선택': { bg: '#F7F7F5', color: '#888' },
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: { background: '#fff', borderRadius: 14, border: '1px solid #E8E8E8', overflow: 'hidden' },
  cardHeader: { padding: '12px 16px 8px', fontSize: 11, fontWeight: 500, color: '#999', letterSpacing: '.04em', borderBottom: '1px solid #E8E8E8' },
  cardBody: { padding: '12px 16px' },

  loadingBox: { textAlign: 'center', padding: '48px 20px' },
  loadingIcon: { fontSize: 40, marginBottom: 12 },
  loadingTitle: { fontSize: 15, fontWeight: 500, color: '#0F6E56', marginBottom: 6 },
  loadingDesc: { fontSize: 12, color: '#aaa', lineHeight: 1.7 },

  errorBox: { background: '#FCEBEB', borderRadius: 10, padding: '16px', textAlign: 'center' },

  gradeRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 },
  gradeDot: { width: 12, height: 12, borderRadius: '50%', flexShrink: 0 },
  gradeBadge: { fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 500 },
  summary: { fontSize: 14, fontWeight: 500, color: '#1A1A1A', marginBottom: 10 },
  findingItem: { display: 'flex', gap: 6, fontSize: 12, color: '#555', marginBottom: 5, lineHeight: 1.6 },
  warningItem: { display: 'flex', gap: 6, fontSize: 12, color: '#BA7517', marginBottom: 5, lineHeight: 1.6 },

  workItem: { padding: '10px 12px', borderRadius: 10, border: '1px solid #E8E8E8', background: '#FAFAF8', marginBottom: 6 },
  workHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 },
  workNum: { width: 20, height: 20, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: '#1A1A1A', color: '#fff', flexShrink: 0 },
  workName: { fontSize: 13, fontWeight: 500, flex: 1 },
  workPriority: { fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 500 },
  workDetail: { display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888' },

  costBox: { borderRadius: 10, overflow: 'hidden', border: '1px solid #E8E8E8' },
  costTotal: { padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F7F7F5' },
  costLbl: { fontSize: 11, color: '#888' },
  costVal: { fontSize: 20, fontWeight: 700, color: '#185FA5' },
  costNote: { padding: '8px 14px', fontSize: 10, color: '#aaa', borderTop: '1px solid #E8E8E8' },

  subItem: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#E1F5EE', borderRadius: 8, border: '1px solid #9FE1CB', marginBottom: 6 },
  subName: { fontSize: 12, fontWeight: 500, color: '#085041', flex: 1 },
  subAmt: { fontSize: 13, fontWeight: 700, color: '#0F6E56' },

  opinionBox: { background: '#F7F7F5', borderRadius: 10, padding: '14px', fontSize: 12, color: '#555', lineHeight: 1.8 },

  pdfRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: '#fff', borderRadius: 14, border: '1px solid #E8E8E8', cursor: 'pointer' },
  pdfIcon: { width: 36, height: 36, borderRadius: 8, background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },

  restartBtn: { width: '100%', padding: 14, borderRadius: 12, border: '1px solid #E8E8E8', background: '#fff', color: '#555', fontSize: 13, fontWeight: 500, cursor: 'pointer' },
}

// 사진 → base64 변환
async function fileToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target.result.split(',')[1]
      resolve({ base64, mimeType: file.type })
    }
    reader.readAsDataURL(file)
  })
}

export default function Step5({ landData, purpose, requirements, photos, surveyFiles, isPremium, onRestart }) {
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loadingStep, setLoadingStep] = useState(0)

  const loadingMessages = [
    '공간정보를 분석하고 있습니다...',
    '현장 사진을 검토하고 있습니다...',
    '공사 범위를 산출하고 있습니다...',
    '보조금 정보를 확인하고 있습니다...',
    '보고서를 작성하고 있습니다...',
  ]

  useEffect(() => {
    // 로딩 메시지 순환
    const interval = setInterval(() => {
      setLoadingStep(s => (s + 1) % loadingMessages.length)
    }, 2000)

    analyze().finally(() => clearInterval(interval))
    return () => clearInterval(interval)
  }, [])

  async function analyze() {
    try {
      // 사진 → base64 변환
      const photoData = await Promise.all(
        photos.map(async (p) => {
          if (p.file) {
            const { base64, mimeType } = await fileToBase64(p.file)
            return { key: p.key, label: p.label, base64, mimeType }
          }
          return null
        })
      ).then(arr => arr.filter(Boolean))

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          landData,
          purpose,
          requirements,
          photos: photoData,
          isPremium,
        })
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // 로딩 화면
  if (loading) {
    return (
      <div style={s.wrap}>
        <div style={s.card}>
          <div style={s.cardBody}>
            <div style={s.loadingBox}>
              <div style={s.loadingIcon}>🤖</div>
              <div style={s.loadingTitle}>AI 분석 중...</div>
              <div style={s.loadingDesc}>
                {loadingMessages[loadingStep]}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 에러 화면
  if (error) {
    return (
      <div style={s.wrap}>
        <div style={s.card}>
          <div style={s.cardBody}>
            <div style={s.errorBox}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>⚠</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#A32D2D', marginBottom: 6 }}>분석 중 오류가 발생했습니다</div>
              <div style={{ fontSize: 12, color: '#A32D2D' }}>{error}</div>
            </div>
          </div>
        </div>
        <button style={s.restartBtn} onClick={onRestart}>← 다시 시작하기</button>
      </div>
    )
  }

  const grade = result?.현황진단?.종합등급 ?? '보통'
  const gradeStyle = GRADE_COLOR[grade] ?? GRADE_COLOR['보통']

  return (
    <div style={s.wrap}>

      {/* 현황 진단 */}
      <div style={s.card}>
        <div style={s.cardHeader}>현황 분석</div>
        <div style={s.cardBody}>
          <div style={s.gradeRow}>
            <div style={{ ...s.gradeDot, background: gradeStyle.dot }} />
            <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>
              {landData?.토지기본?.주소} {landData?.토지기본?.지번}
            </div>
            <span style={{ ...s.gradeBadge, background: gradeStyle.bg, color: gradeStyle.color }}>
              {grade}
            </span>
          </div>

          {result?.현황진단?.한줄요약 && (
            <div style={s.summary}>{result.현황진단.한줄요약}</div>
          )}

          {result?.현황진단?.주요발견?.map((item, i) => (
            <div key={i} style={s.findingItem}>
              <span>•</span><span>{item}</span>
            </div>
          ))}

          {result?.현황진단?.주의사항?.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {result.현황진단.주의사항.map((item, i) => (
                <div key={i} style={s.warningItem}>
                  <span>⚠</span><span>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 공사 범위 */}
      {result?.공사범위?.length > 0 && (
        <div style={s.card}>
          <div style={s.cardHeader}>공사 우선순위</div>
          <div style={s.cardBody}>
            {result.공사범위.map((item, i) => {
              const pc = PRIORITY_COLOR[item.우선도] ?? PRIORITY_COLOR['선택']
              return (
                <div key={i} style={s.workItem}>
                  <div style={s.workHeader}>
                    <div style={s.workNum}>{item.순위}</div>
                    <div style={s.workName}>{item.공종}</div>
                    <span style={{ ...s.workPriority, background: pc.bg, color: pc.color }}>
                      {item.우선도}
                    </span>
                  </div>
                  <div style={s.workDetail}>
                    <span>{item.수량}</span>
                    <span style={{ fontWeight: 500, color: pc.color }}>
                      {item.예상금액하한?.toLocaleString()}만~{item.예상금액상한?.toLocaleString()}만
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 예상 공사비 */}
      {result?.총예상공사비 && (
        <div style={s.card}>
          <div style={s.cardHeader}>예상 공사비</div>
          <div style={s.cardBody}>
            <div style={s.costBox}>
              <div style={s.costTotal}>
                <span style={s.costLbl}>총 예상 비용</span>
                <span style={s.costVal}>
                  {result.총예상공사비.하한?.toLocaleString()}만~{result.총예상공사비.상한?.toLocaleString()}만
                </span>
              </div>
              <div style={s.costNote}>{result.총예상공사비.비고}</div>
            </div>
          </div>
        </div>
      )}

      {/* 보조금 */}
      {result?.보조금?.length > 0 && (
        <div style={s.card}>
          <div style={s.cardHeader}>보조금 매칭</div>
          <div style={s.cardBody}>
            {result.보조금.map((item, i) => (
              <div key={i} style={s.subItem}>
                <div style={{ flex: 1 }}>
                  <div style={s.subName}>{item.사업명}</div>
                  <div style={{ fontSize: 10, color: '#0F6E56' }}>{item.지원기관} · {item.신청조건}</div>
                </div>
                <span style={s.subAmt}>최대 {item.최대지원액?.toLocaleString()}만</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 전문가 의견 */}
      {result?.전문가의견 && (
        <div style={s.card}>
          <div style={s.cardHeader}>전문가 의견</div>
          <div style={s.cardBody}>
            <div style={s.opinionBox}>{result.전문가의견}</div>
          </div>
        </div>
      )}

      {/* PDF 다운로드 */}
      <div style={s.pdfRow}>
        <div style={s.pdfIcon}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#185FA5" strokeWidth="1.3">
            <rect x="3" y="1" width="12" height="16" rx="2" />
            <path d="M6 6h6M6 9h6M6 12h4" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>시공자용 리포트 PDF</div>
          <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>현황·물량·보조금 포함</div>
        </div>
        <span style={{ color: '#aaa', fontSize: 18 }}>↓</span>
      </div>

      <button style={s.restartBtn} onClick={onRestart}>← 새 현장 분석하기</button>
    </div>
  )
}
