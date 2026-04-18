import React from 'react'

const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: { background: '#fff', borderRadius: 14, border: '1px solid #E8E8E8', overflow: 'hidden' },
  cardHeader: { padding: '12px 16px 8px', fontSize: 11, fontWeight: 500, color: '#999', letterSpacing: '.04em', borderBottom: '1px solid #E8E8E8' },
  cardBody: { padding: '12px 16px' },

  resultBox: { borderRadius: 8, border: '1px solid #E8E8E8', overflow: 'hidden' },
  resultHeader: { padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 },
  resultDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  resultTitle: { fontSize: 12, fontWeight: 500, flex: 1 },
  resultGrade: { fontSize: 10, padding: '3px 9px', borderRadius: 20, fontWeight: 500 },
  resultBody: { background: '#F7F7F5', padding: '10px 12px' },
  resultRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 },

  workItem: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
    borderRadius: 8, border: '1px solid #E8E8E8', background: '#F7F7F5', marginBottom: 5,
  },
  workNum: {
    width: 20, height: 20, borderRadius: 5, display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 10, fontWeight: 500, flexShrink: 0,
  },
  workName: { fontSize: 12, fontWeight: 500 },
  workQty: { fontSize: 10, color: '#aaa' },

  costBox: { borderRadius: 8, overflow: 'hidden', border: '1px solid #E8E8E8' },
  costTotal: { padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  costLbl: { fontSize: 11, color: '#888' },
  costVal: { fontSize: 18, fontWeight: 700 },
  costDetail: { background: '#F7F7F5', padding: '10px 14px' },
  costRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 11 },

  subItem: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
    background: '#E1F5EE', borderRadius: 8, border: '1px solid #9FE1CB', marginBottom: 5,
  },
  subName: { fontSize: 11, fontWeight: 500, color: '#085041', flex: 1 },
  subAmt: { fontSize: 12, fontWeight: 700, color: '#0F6E56' },

  pdfRow: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px',
    background: '#fff', borderRadius: 14, border: '1px solid #E8E8E8', cursor: 'pointer',
  },
  pdfIcon: {
    width: 36, height: 36, borderRadius: 8, background: '#E6F1FB',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },

  restartBtn: {
    width: '100%', padding: 14, borderRadius: 12, border: '1px solid #E8E8E8',
    background: '#fff', color: '#555', fontSize: 13, fontWeight: 500, cursor: 'pointer',
  },
}

export default function Step3({ onRestart }) {
  return (
    <div style={s.wrap}>

      {/* 현황 분석 */}
      <div style={s.card}>
        <div style={s.cardHeader}>현황 분석</div>
        <div style={s.cardBody}>
          <div style={s.resultBox}>
            <div style={s.resultHeader}>
              <div style={{ ...s.resultDot, background: '#E24B4A' }} />
              <span style={s.resultTitle}>전북 순창군 구림면 안정리</span>
              <span style={{ ...s.resultGrade, background: '#FCEBEB', color: '#A32D2D' }}>보수 필요</span>
            </div>
            <div style={s.resultBody}>
              {[
                ['연면적', '82㎡ (약 25평)', null],
                ['추정 준공', '1975년경', null],
                ['지붕 상태', '불량', '#E24B4A'],
                ['기초 침하', '일부 의심', '#BA7517'],
              ].map(([k, v, c], i, arr) => (
                <div key={k} style={{ ...s.resultRow, marginBottom: i === arr.length - 1 ? 0 : 5 }}>
                  <span style={{ color: '#888' }}>{k}</span>
                  <span style={{ fontWeight: 500, color: c || '#1A1A1A' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 공사 우선순위 */}
      <div style={s.card}>
        <div style={s.cardHeader}>공사 우선순위</div>
        <div style={s.cardBody}>
          {[
            { num: 1, name: '지붕 전면 교체', qty: '82㎡ · 칼라강판', cost: '820만~', nb: '#FCEBEB', nc: '#A32D2D', vc: '#A32D2D' },
            { num: 2, name: '외벽 단열·방수', qty: '168㎡', cost: '1,050만~', nb: '#E6F1FB', nc: '#0C447C', vc: '#0C447C' },
            { num: 3, name: '내부 리모델링', qty: '82㎡', cost: '1,200만~', nb: '#E6F1FB', nc: '#0C447C', vc: '#0C447C' },
          ].map((item, i, arr) => (
            <div key={item.num} style={{ ...s.workItem, marginBottom: i === arr.length - 1 ? 0 : 5 }}>
              <div style={{ ...s.workNum, background: item.nb, color: item.nc }}>{item.num}</div>
              <div style={{ flex: 1 }}>
                <div style={s.workName}>{item.name}</div>
                <div style={s.workQty}>{item.qty}</div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 500, color: item.vc }}>{item.cost}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 예상 공사비 */}
      <div style={s.card}>
        <div style={s.cardHeader}>예상 공사비</div>
        <div style={s.cardBody}>
          <div style={s.costBox}>
            <div style={s.costTotal}>
              <span style={s.costLbl}>총 예상 비용</span>
              <span style={{ ...s.costVal, color: '#185FA5' }}>3,550만~4,800만</span>
            </div>
            <div style={s.costDetail}>
              {[['지붕·기초', '820만~1,200만'], ['외벽·단열', '1,050만~1,400만'], ['내부·설비', '1,680만~2,200만']].map(([k, v], i, arr) => (
                <div key={k} style={{ ...s.costRow, marginBottom: i === arr.length - 1 ? 0 : 5 }}>
                  <span style={{ color: '#888' }}>{k}</span><span>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 보조금 */}
      <div style={s.card}>
        <div style={s.cardHeader}>보조금 매칭</div>
        <div style={s.cardBody}>
          {[
            ['농촌 빈집 정비 지원 (농식품부)', '최대 4,500만'],
            ['순창군 귀농인 주택 수리비', '최대 500만'],
          ].map(([name, amt], i, arr) => (
            <div key={name} style={{ ...s.subItem, marginBottom: i === arr.length - 1 ? 0 : 5 }}>
              <span style={s.subName}>{name}</span>
              <span style={s.subAmt}>{amt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* PDF */}
      <div style={s.pdfRow}>
        <div style={s.pdfIcon}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#185FA5" strokeWidth="1.3">
            <rect x="3" y="1" width="12" height="16" rx="2" />
            <path d="M6 6h6M6 9h6M6 12h4" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>시공자용 리포트 PDF</div>
          <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>현황·물량·도면·보조금 포함</div>
        </div>
        <span style={{ color: '#aaa', fontSize: 18 }}>↓</span>
      </div>

      <button style={s.restartBtn} onClick={onRestart}>← 새 현장 분석하기</button>
    </div>
  )
}
