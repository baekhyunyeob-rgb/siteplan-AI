import React from 'react'

const styles = {
  phone: {
    width: 320,
    background: '#fff',
    borderRadius: 32,
    border: '1px solid #ddd',
    overflow: 'hidden',
    boxShadow: '0 16px 48px rgba(0,0,0,.12)',
    fontFamily: "'Noto Sans KR', sans-serif",
  },
  statusBar: {
    background: '#F7F7F5',
    padding: '10px 20px 7px',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 10,
    color: '#aaa',
  },
  topBar: {
    borderBottom: '1px solid #E8E8E8',
    padding: '10px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  section: { padding: '8px 16px' },
  sectionTitle: { fontSize: 9, fontWeight: 500, color: '#999', marginBottom: 6, letterSpacing: '.04em' },
  divider: { height: 1, background: '#E8E8E8', margin: '4px 16px' },

  resultBox: { borderRadius: 8, border: '1px solid #E8E8E8', overflow: 'hidden', marginBottom: 6 },
  resultHeader: { padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 6 },
  resultDot: { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },
  resultTitle: { fontSize: 9, fontWeight: 500, flex: 1 },
  resultGrade: { fontSize: 8, padding: '2px 7px', borderRadius: 20, fontWeight: 500 },
  resultBody: { background: '#F7F7F5', padding: '7px 10px' },
  resultRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 8 },

  workItem: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 8px', borderRadius: 7,
    border: '1px solid #E8E8E8', background: '#F7F7F5', marginBottom: 3,
  },
  workNum: {
    width: 16, height: 16, borderRadius: 4,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 8, fontWeight: 500, flexShrink: 0,
  },
  workName: { fontSize: 9, fontWeight: 500 },
  workQty: { fontSize: 8, color: '#aaa' },

  costBox: { borderRadius: 8, overflow: 'hidden', border: '1px solid #E8E8E8', marginBottom: 6 },
  costTotal: { padding: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  costLbl: { fontSize: 9, color: '#888' },
  costVal: { fontSize: 15, fontWeight: 700 },
  costDetail: { background: '#F7F7F5', padding: '7px 10px' },
  costRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 8 },

  subItem: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 8px', background: '#E1F5EE',
    borderRadius: 6, border: '1px solid #9FE1CB', marginBottom: 3,
  },
  subName: { fontSize: 8, fontWeight: 500, color: '#085041', flex: 1 },
  subAmt: { fontSize: 9, fontWeight: 700, color: '#0F6E56' },

  pdfRow: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 16px', borderTop: '1px solid #E8E8E8',
  },
  pdfIcon: {
    width: 28, height: 28, borderRadius: 6, background: '#E6F1FB',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
}

export default function Step3({ onRestart }) {
  return (
    <div style={styles.phone}>
      <div style={styles.statusBar}><span>9:41</span><span>●●●</span></div>
      <div style={styles.topBar}>
        <span style={{ fontSize: 10, color: '#aaa', cursor: 'pointer' }} onClick={onRestart}>←</span>
        <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>분석 결과</span>
        <span style={{ fontSize: 9, color: '#aaa' }}>3/3</span>
      </div>

      {/* 현황 분석 */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>현황 분석</div>
        <div style={styles.resultBox}>
          <div style={styles.resultHeader}>
            <div style={{ ...styles.resultDot, background: '#E24B4A' }} />
            <span style={styles.resultTitle}>전북 순창군 구림면 안정리</span>
            <span style={{ ...styles.resultGrade, background: '#FCEBEB', color: '#A32D2D' }}>보수 필요</span>
          </div>
          <div style={styles.resultBody}>
            <div style={styles.resultRow}><span style={{ color: '#888' }}>연면적</span><span style={{ fontWeight: 500 }}>82㎡ (약 25평)</span></div>
            <div style={styles.resultRow}><span style={{ color: '#888' }}>추정 준공</span><span style={{ fontWeight: 500 }}>1975년경</span></div>
            <div style={styles.resultRow}><span style={{ color: '#888' }}>지붕 상태</span><span style={{ fontWeight: 500, color: '#E24B4A' }}>불량</span></div>
            <div style={{ ...styles.resultRow, marginBottom: 0 }}><span style={{ color: '#888' }}>기초 침하</span><span style={{ fontWeight: 500, color: '#BA7517' }}>일부 의심</span></div>
          </div>
        </div>
      </div>

      <div style={styles.divider} />

      {/* 공사 우선순위 */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>공사 우선순위</div>
        <div style={styles.workItem}>
          <div style={{ ...styles.workNum, background: '#FCEBEB', color: '#A32D2D' }}>1</div>
          <div style={{ flex: 1 }}>
            <div style={styles.workName}>지붕 전면 교체</div>
            <div style={styles.workQty}>82㎡ · 칼라강판</div>
          </div>
          <span style={{ fontSize: 9, fontWeight: 500, color: '#A32D2D' }}>820만~</span>
        </div>
        <div style={styles.workItem}>
          <div style={{ ...styles.workNum, background: '#E6F1FB', color: '#0C447C' }}>2</div>
          <div style={{ flex: 1 }}>
            <div style={styles.workName}>외벽 단열·방수</div>
            <div style={styles.workQty}>168㎡</div>
          </div>
          <span style={{ fontSize: 9, fontWeight: 500, color: '#0C447C' }}>1,050만~</span>
        </div>
        <div style={styles.workItem}>
          <div style={{ ...styles.workNum, background: '#E6F1FB', color: '#0C447C' }}>3</div>
          <div style={{ flex: 1 }}>
            <div style={styles.workName}>내부 리모델링</div>
            <div style={styles.workQty}>82㎡</div>
          </div>
          <span style={{ fontSize: 9, fontWeight: 500, color: '#0C447C' }}>1,200만~</span>
        </div>
      </div>

      <div style={styles.divider} />

      {/* 예상 공사비 */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>예상 공사비</div>
        <div style={styles.costBox}>
          <div style={styles.costTotal}>
            <span style={styles.costLbl}>총 예상 비용</span>
            <span style={{ ...styles.costVal, color: '#185FA5' }}>3,550만~4,800만</span>
          </div>
          <div style={styles.costDetail}>
            <div style={styles.costRow}><span style={{ color: '#888' }}>지붕·기초</span><span>820만~1,200만</span></div>
            <div style={styles.costRow}><span style={{ color: '#888' }}>외벽·단열</span><span>1,050만~1,400만</span></div>
            <div style={{ ...styles.costRow, marginBottom: 0 }}><span style={{ color: '#888' }}>내부·설비</span><span>1,680만~2,200만</span></div>
          </div>
        </div>
      </div>

      <div style={styles.divider} />

      {/* 보조금 */}
      <div style={{ ...styles.section, paddingBottom: 8 }}>
        <div style={styles.sectionTitle}>보조금 매칭</div>
        <div style={styles.subItem}>
          <span style={styles.subName}>농촌 빈집 정비 지원 (농식품부)</span>
          <span style={styles.subAmt}>최대 4,500만</span>
        </div>
        <div style={styles.subItem}>
          <span style={styles.subName}>순창군 귀농인 주택 수리비</span>
          <span style={styles.subAmt}>최대 500만</span>
        </div>
      </div>

      {/* PDF 다운로드 */}
      <div style={styles.pdfRow}>
        <div style={styles.pdfIcon}>
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="#185FA5" strokeWidth="1.3">
            <rect x="3" y="1" width="12" height="16" rx="2" />
            <path d="M6 6h6M6 9h6M6 12h4" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 500 }}>시공자용 리포트 PDF</div>
          <div style={{ fontSize: 8, color: '#aaa' }}>현황·물량·도면·보조금 포함</div>
        </div>
        <span style={{ color: '#aaa', fontSize: 14 }}>↓</span>
      </div>
    </div>
  )
}
