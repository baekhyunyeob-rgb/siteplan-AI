import React, { useState } from 'react'

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
  progressWrap: {
    display: 'flex',
    gap: 4,
    padding: '10px 16px 3px',
  },
  pb: { flex: 1, height: 2, borderRadius: 2, background: '#E8E8E8' },
  pbOn: { flex: 1, height: 2, borderRadius: 2, background: '#534AB7' },
  stepLabel: {
    padding: '2px 16px 8px',
    fontSize: 9,
    color: '#534AB7',
    fontWeight: 500,
  },
  purRow: {
    display: 'flex',
    gap: 4,
    padding: '4px 16px 8px',
  },
  chip: {
    flex: 1,
    padding: '6px 2px',
    borderRadius: 8,
    border: '1px solid #E8E8E8',
    background: '#F7F7F5',
    fontSize: 8,
    textAlign: 'center',
    color: '#aaa',
    lineHeight: 1.4,
    cursor: 'pointer',
  },
  chipActive: {
    flex: 1,
    padding: '6px 2px',
    borderRadius: 8,
    border: '1px solid #7F77DD',
    background: '#EEEDFE',
    fontSize: 8,
    textAlign: 'center',
    color: '#534AB7',
    lineHeight: 1.4,
    fontWeight: 500,
    cursor: 'pointer',
  },
  divider: { height: 1, background: '#E8E8E8', margin: '4px 16px' },
  section: { padding: '6px 16px' },
  sectionTitle: { fontSize: 9, fontWeight: 500, color: '#999', marginBottom: 6 },
  qItem: { marginBottom: 10 },
  qLabel: { fontSize: 9, fontWeight: 500, color: '#888', marginBottom: 4 },
  opts: { display: 'flex', gap: 3, flexWrap: 'wrap' },
  opt: {
    padding: '3px 8px',
    borderRadius: 20,
    border: '1px solid #E8E8E8',
    background: '#F7F7F5',
    fontSize: 8,
    color: '#888',
    cursor: 'pointer',
  },
  optActive: {
    padding: '3px 8px',
    borderRadius: 20,
    border: '1px solid #7F77DD',
    background: '#EEEDFE',
    fontSize: 8,
    color: '#534AB7',
    fontWeight: 500,
    cursor: 'pointer',
  },
  optDim: {
    padding: '3px 8px',
    borderRadius: 20,
    border: '1px dashed #E8E8E8',
    background: '#F7F7F5',
    fontSize: 8,
    color: '#bbb',
    cursor: 'pointer',
  },
  budgetRow: { display: 'flex', alignItems: 'center', gap: 6 },
  budgetVal: { fontSize: 9, fontWeight: 500, color: '#534AB7', minWidth: 36, textAlign: 'right' },
  analyzeBtn: {
    margin: '8px 16px 16px',
    padding: 11,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: 500,
    color: '#fff',
    background: '#534AB7',
    width: 'calc(100% - 32px)',
    display: 'block',
    cursor: 'pointer',
  },
}

const Q = ({ label, options, selected, onSelect }) => (
  <div style={styles.qItem}>
    <div style={styles.qLabel}>{label}</div>
    <div style={styles.opts}>
      {options.map(({ text, dim }) => {
        const isActive = selected === text
        const s = dim ? styles.optDim : isActive ? styles.optActive : styles.opt
        return (
          <span key={text} style={s} onClick={() => onSelect(text)}>
            {text}
          </span>
        )
      })}
    </div>
  </div>
)

export default function Step2({ onNext }) {
  const [purpose, setPurpose] = useState('신축')
  const [answers, setAnswers] = useState({
    경사도: '평지',
    용도: '주거',
    인원: '3~4명',
    층수: '단층',
    주차: '2대',
    난방: '기름보일러',
  })
  const [budget, setBudget] = useState(15000)

  const set = (key) => (val) => setAnswers((p) => ({ ...p, [key]: val }))

  return (
    <div style={styles.phone}>
      <div style={styles.statusBar}><span>9:41</span><span>●●●</span></div>
      <div style={styles.topBar}>
        <span style={{ fontSize: 10, color: '#aaa' }}>←</span>
        <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>요구사항 입력</span>
        <span style={{ fontSize: 9, color: '#aaa' }}>2/3</span>
      </div>
      <div style={styles.progressWrap}>
        <div style={styles.pbOn} /><div style={styles.pbOn} /><div style={styles.pb} />
      </div>
      <div style={styles.stepLabel}>무엇을 계획하고 계신가요?</div>

      {/* 목적 칩 */}
      <div style={styles.purRow}>
        {['농지정리\n부지조성', '신축', '리모델링\n증축'].map((p) => {
          const label = p.replace('\n', ' ')
          const key = p.includes('농지') ? '농지정리' : p.includes('리모') ? '리모델링' : '신축'
          return (
            <div
              key={key}
              style={purpose === key ? styles.chipActive : styles.chip}
              onClick={() => setPurpose(key)}
            >
              {p.split('\n').map((l, i) => <div key={i}>{l}</div>)}
            </div>
          )
        })}
      </div>

      <div style={styles.divider} />

      <div style={styles.section}>
        <Q label="땅 경사도" selected={answers.경사도} onSelect={set('경사도')}
          options={[{text:'평지'},{text:'약간 경사'},{text:'급경사'},{text:'모름',dim:true}]} />
        <Q label="건물 용도" selected={answers.용도} onSelect={set('용도')}
          options={[{text:'주거'},{text:'농업시설'},{text:'상업'},{text:'미정',dim:true}]} />
        <Q label="사용 인원" selected={answers.인원} onSelect={set('인원')}
          options={[{text:'1~2명'},{text:'3~4명'},{text:'5명 이상'}]} />
        <Q label="층수" selected={answers.층수} onSelect={set('층수')}
          options={[{text:'단층'},{text:'2층'},{text:'미정',dim:true}]} />
        <Q label="주차" selected={answers.주차} onSelect={set('주차')}
          options={[{text:'주차 1대'},{text:'2대'},{text:'불필요'}]} />
        <Q label="난방 방식" selected={answers.난방} onSelect={set('난방')}
          options={[{text:'도시가스'},{text:'기름보일러'},{text:'전기'},{text:'모름',dim:true}]} />

        {/* 예산 슬라이더 */}
        <div style={styles.qItem}>
          <div style={styles.qLabel}>예산 범위</div>
          <div style={styles.budgetRow}>
            <input
              type="range" min={5000} max={50000} step={1000}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              style={{ flex: 1, accentColor: '#534AB7' }}
            />
            <span style={styles.budgetVal}>
              {(budget / 10000).toFixed(1)}억
            </span>
          </div>
        </div>
      </div>

      <button style={styles.analyzeBtn} onClick={onNext}>
        분석 시작 →
      </button>
    </div>
  )
}
