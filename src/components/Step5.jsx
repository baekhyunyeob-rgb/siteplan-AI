import React from 'react'

const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: { background: '#fff', borderRadius: 14, border: '1px solid #E8E8E8', overflow: 'hidden' },
  cardHeader: { padding: '12px 16px 8px', fontSize: 11, fontWeight: 500, color: '#999', letterSpacing: '.04em', borderBottom: '1px solid #E8E8E8' },
  cardBody: { padding: '12px 16px' },

  resultBox: { borderRadius: 8, border: '1px solid #E8E8E8', overflow: 'hidden', marginBottom: 6 },
  resultHeader: { padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 },
  resultDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  resultTitle: { fontSize: 12, fontWeight: 500, flex: 1 },
  resultGrade: { fontSize: 10, padding: '3px 9px', borderRadius: 20, fontWeight: 500 },
  resultBody: { background: '#F7F7F5', padding: '10px 12px' },
  resultRow: { display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12, borderBottom: '1px solid #F0F0EE' },

  workItem: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, border: '1px solid #E8E8E8', background: '#F7F7F5', marginBottom: 5 },
  workNum: { width: 20, height: 20, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 500, flexShrink: 0 },
  workName: { fontSize: 12, fontWeight: 500 },
  workQty: { fontSize: 10, color: '#aaa' },

  costBox: { borderRadius: 8, overflow: 'hidden', border: '1px solid #E8E8E8' },
  costTotal: { padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  costLbl: { fontSize: 11, color: '#888' },
  costVal: { fontSize: 18, fontWeight: 700 },
  costDetail: { background: '#F7F7F5', padding: '10px 14px' },
  costRow: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 11 },

  subItem: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#E1F5EE', borderRadius: 8, border: '1px solid #9FE1CB', marginBottom: 5 },
  subName: { fontSize: 11, fontWeight: 500, color: '#085041', flex: 1 },
  subAmt: { fontSize: 12, fontWeight: 700, color: '#0F6E56' },

  pdfRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: '#fff', borderRadius: 14, border: '1px solid #E8E8E8', cursor: 'pointer' },
  pdfIcon: { width: 36, height: 36, borderRadius: 8, background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },

  restartBtn: { width: '100%', padding: 14, borderRadius: 12, border: '1px solid #E8E8E8', background: '#fff', color: '#555', fontSize: 13, fontWeight: 500, cursor: 'pointer' },

  comingSoon: { textAlign: 'center', padding: '40px 20px', color: '#aaa' },
  comingSoonIcon: { fontSize: 48, marginBottom: 12 },
  comingSoonTitle: { fontSize: 16, fontWeight: 500, color: '#555', marginBottom: 8 },
  comingSoonDesc: { fontSize: 12, lineHeight: 1.7 },
}

export default function Step5({ landData, purpose, requirements, photos, surveyFiles, isPremium, onRestart }) {
  const basic = landData?.토지기본
  const char = landData?.토지특성

  // TODO: Claude API 연동 후 실제 분석 결과로 교체
  const isAnalyzed = false // Claude API 연동 전 임시

  if (!isAnalyzed) {
    return (
      <div style={s.wrap}>
        <div style={s.card}>
          <div style={s.cardBody}>
            <div style={s.comingSoon}>
              <div style={s.comingSoonIcon}>🤖</div>
              <div style={s.comingSoonTitle}>AI 분석 준비 중</div>
              <div style={s.comingSoonDesc}>
                Claude API 연동 작업이 진행 중입니다.<br />
                공간정보 + 사진 + 측량 데이터를 통합 분석하여<br />
                현황 진단·견적·보조금 결과를 제공합니다.
              </div>
            </div>
          </div>
        </div>

        {/* 수집된 정보 요약 */}
        {basic && (
          <div style={s.card}>
            <div style={s.cardHeader}>수집된 정보 요약</div>
            <div style={s.cardBody}>
              <div style={{ fontSize: 12, color: '#555', lineHeight: 1.8 }}>
                <div>📍 {basic.주소} {basic.지번}</div>
                <div>🏷 {basic.지목} · {basic.면적}</div>
                {char && <div>📋 {char.용도지역} · 공시지가 {char.공시지가}</div>}
                <div>🎯 목적: {purpose}</div>
                <div>📸 사진: {photos.length}장</div>
                {surveyFiles.length > 0 && <div>📡 측량 데이터: {surveyFiles.length}개</div>}
                <div>💳 {isPremium ? '프리미엄 (19,900원)' : '기본 (9,900원)'}</div>
              </div>
            </div>
          </div>
        )}

        <button style={s.restartBtn} onClick={onRestart}>← 새 현장 분석하기</button>
      </div>
    )
  }

  // Claude API 연동 후 실제 결과 화면 (아래는 기획서 기준 샘플)
  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.cardHeader}>현황 분석</div>
        <div style={s.cardBody}>
          <div style={s.resultBox}>
            <div style={s.resultHeader}>
              <div style={{ ...s.resultDot, background: '#E24B4A' }} />
              <span style={s.resultTitle}>{basic?.주소}</span>
              <span style={{ ...s.resultGrade, background: '#FCEBEB', color: '#A32D2D' }}>보수 필요</span>
            </div>
          </div>
        </div>
      </div>
      <button style={s.restartBtn} onClick={onRestart}>← 새 현장 분석하기</button>
    </div>
  )
}
