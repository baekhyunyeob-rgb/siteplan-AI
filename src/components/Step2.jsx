import React, { useState } from 'react'

const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: { background: '#fff', borderRadius: 14, border: '1px solid #E8E8E8', overflow: 'hidden' },
  cardHeader: { padding: '12px 16px 8px', fontSize: 11, fontWeight: 500, color: '#999', letterSpacing: '.04em', borderBottom: '1px solid #E8E8E8' },
  cardBody: { padding: '12px 16px' },

  purRow: { display: 'flex', gap: 6 },
  chip: {
    flex: 1, padding: '8px 4px', borderRadius: 10, border: '1px solid #E8E8E8',
    background: '#F7F7F5', fontSize: 11, textAlign: 'center', color: '#aaa',
    lineHeight: 1.4, cursor: 'pointer',
  },
  chipActive: {
    flex: 1, padding: '8px 4px', borderRadius: 10, border: '1px solid #7F77DD',
    background: '#EEEDFE', fontSize: 11, textAlign: 'center', color: '#534AB7',
    lineHeight: 1.4, fontWeight: 500, cursor: 'pointer',
  },

  qItem: { marginBottom: 12 },
  qLabel: { fontSize: 11, fontWeight: 500, color: '#888', marginBottom: 6 },
  opts: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  opt: {
    padding: '4px 10px', borderRadius: 20, border: '1px solid #E8E8E8',
    background: '#F7F7F5', fontSize: 11, color: '#888', cursor: 'pointer',
  },
  optActive: {
    padding: '4px 10px', borderRadius: 20, border: '1px solid #7F77DD',
    background: '#EEEDFE', fontSize: 11, color: '#534AB7', fontWeight: 500, cursor: 'pointer',
  },
  optDim: {
    padding: '4px 10px', borderRadius: 20, border: '1px dashed #E8E8E8',
    background: '#F7F7F5', fontSize: 11, color: '#bbb', cursor: 'pointer',
  },

  budgetRow: { display: 'flex', alignItems: 'center', gap: 8 },
  budgetVal: { fontSize: 12, fontWeight: 500, color: '#534AB7', minWidth: 40, textAlign: 'right' },

  btnRow: { display: 'flex', gap: 8 },
  backBtn: {
    flex: 1, padding: 14, borderRadius: 12, border: '1px solid #E8E8E8',
    background: '#fff', color: '#888', fontSize: 13, fontWeight: 500, cursor: 'pointer',
  },
  nextBtn: {
    flex: 2, padding: 14, borderRadius: 12,
    background: '#534AB7', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer',
  },
}

const Q = ({ label, options, selected, onSelect }) => (
  <div style={s.qItem}>
    <div style={s.qLabel}>{label}</div>
    <div style={s.opts}>
      {options.map(({ text, dim }) => (
        <span
          key={text}
          style={dim ? s.optDim : selected === text ? s.optActive : s.opt}
          onClick={() => onSelect(text)}
        >{text}</span>
      ))}
    </div>
  </div>
)

export default function Step2({ onBack, onNext }) {
  const [purpose, setPurpose] = useState('신축')
  const [ans, setAns] = useState({ 경사도: '평지', 용도: '주거', 인원: '3~4명', 층수: '단층', 주차: '2대', 난방: '기름보일러' })
  const [budget, setBudget] = useState(15000)
  const set = (k) => (v) => setAns((p) => ({ ...p, [k]: v }))

  return (
    <div style={s.wrap}>

      {/* 목적 선택 */}
      <div style={s.card}>
        <div style={s.cardHeader}>무엇을 계획하고 계신가요?</div>
        <div style={s.cardBody}>
          <div style={s.purRow}>
            {[['농지정리', '부지조성'], ['신축'], ['리모델링', '증축']].map((lines) => {
              const key = lines[0].includes('농') ? '농지정리' : lines[0].includes('리') ? '리모델링' : '신축'
              return (
                <div key={key} style={purpose === key ? s.chipActive : s.chip} onClick={() => setPurpose(key)}>
                  {lines.map((l, i) => <div key={i}>{l}</div>)}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 질문 카드 */}
      <div style={s.card}>
        <div style={s.cardHeader}>세부 조건</div>
        <div style={s.cardBody}>
          <Q label="땅 경사도" selected={ans.경사도} onSelect={set('경사도')}
            options={[{text:'평지'},{text:'약간 경사'},{text:'급경사'},{text:'모름',dim:true}]} />
          <Q label="건물 용도" selected={ans.용도} onSelect={set('용도')}
            options={[{text:'주거'},{text:'농업시설'},{text:'상업'},{text:'미정',dim:true}]} />
          <Q label="사용 인원" selected={ans.인원} onSelect={set('인원')}
            options={[{text:'1~2명'},{text:'3~4명'},{text:'5명 이상'}]} />
          <Q label="층수" selected={ans.층수} onSelect={set('층수')}
            options={[{text:'단층'},{text:'2층'},{text:'미정',dim:true}]} />
          <Q label="주차" selected={ans.주차} onSelect={set('주차')}
            options={[{text:'주차 1대'},{text:'2대'},{text:'불필요'}]} />
          <Q label="난방 방식" selected={ans.난방} onSelect={set('난방')}
            options={[{text:'도시가스'},{text:'기름보일러'},{text:'전기'},{text:'모름',dim:true}]} />
          <div style={{ ...s.qItem, marginBottom: 0 }}>
            <div style={s.qLabel}>예산 범위</div>
            <div style={s.budgetRow}>
              <input type="range" min={5000} max={50000} step={1000} value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                style={{ flex: 1, accentColor: '#534AB7' }} />
              <span style={s.budgetVal}>{(budget / 10000).toFixed(1)}억</span>
            </div>
          </div>
        </div>
      </div>

      <div style={s.btnRow}>
        <button style={s.backBtn} onClick={onBack}>← 이전</button>
        <button style={s.nextBtn} onClick={onNext}>분석 시작 →</button>
      </div>
    </div>
  )
}
