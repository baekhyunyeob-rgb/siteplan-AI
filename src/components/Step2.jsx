import React, { useState, useEffect } from 'react'
import { collectAllLandData } from '../lib/landData'

const KAKAO_REST_KEY = import.meta.env.VITE_KAKAO_REST_KEY

async function getPNU(address) {
  const res = await fetch(`/api/vworld?action=geocode&address=${encodeURIComponent(address)}`)
  const geo = await res.json()
  const pnu = geo?.response?.refined?.structure?.level4LC
  if (!pnu) throw new Error('필지 정보를 찾을 수 없습니다')
  return pnu
}

// 목적별 세부 질문
const QUESTIONS = {
  농지정리: [
    { key: '경사도', label: '땅 경사도', opts: ['평지', '약간 경사', '급경사', '모름'] },
    { key: '목표작업', label: '목표 작업', opts: ['논 조성', '밭 조성', '과수원', '복합'] },
    { key: '진입로', label: '진입로 현황', opts: ['양호', '협소', '없음', '모름'] },
    { key: '배수', label: '배수 상태', opts: ['양호', '불량', '침수 이력', '모름'] },
  ],
  신축: [
    { key: '경사도', label: '땅 경사도', opts: ['평지', '약간 경사', '급경사', '모름'] },
    { key: '용도', label: '건물 용도', opts: ['주거', '농업시설', '상업', '미정'] },
    { key: '인원', label: '사용 인원', opts: ['1~2명', '3~4명', '5명 이상'] },
    { key: '층수', label: '층수', opts: ['단층', '2층', '미정'] },
    { key: '주차', label: '주차', opts: ['1대', '2대', '불필요'] },
    { key: '난방', label: '난방 방식', opts: ['도시가스', '기름보일러', '전기', '모름'] },
  ],
  리모델링: [
    { key: '구조', label: '건물 구조', opts: ['목조', '조적조', '철근콘크리트', '모름'] },
    { key: '준공', label: '추정 준공연도', opts: ['1980년 이전', '1980~2000년', '2000년 이후', '모름'] },
    { key: '문제부위', label: '주요 문제 부위 (복수선택)', opts: ['지붕', '외벽', '내부', '설비', '기초·침하', '창호'], multiple: true },
    { key: '용도변경', label: '용도 변경', opts: ['현행 유지', '주거→상업', '농업시설→주거', '기타'] },
    { key: '설비', label: '설비 상태', opts: ['교체 필요', '부분 교체', '양호', '모름'] },
  ],
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: { background: '#fff', borderRadius: 14, border: '1px solid #E8E8E8', overflow: 'hidden' },
  cardHeader: { padding: '12px 16px 8px', fontSize: 11, fontWeight: 500, color: '#999', letterSpacing: '.04em', borderBottom: '1px solid #E8E8E8' },
  cardBody: { padding: '12px 16px' },
  purposeRow: { display: 'flex', gap: 8, marginBottom: 4 },
  purposeChip: (active) => ({
    flex: 1, padding: '10px 4px', borderRadius: 10,
    border: `1px solid ${active ? '#0F6E56' : '#E8E8E8'}`,
    background: active ? '#E1F5EE' : '#F7F7F5',
    fontSize: 12, textAlign: 'center',
    color: active ? '#0F6E56' : '#aaa',
    fontWeight: active ? 500 : 400,
    cursor: 'pointer', lineHeight: 1.5,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    minHeight: 52,
  }),
  qItem: { marginBottom: 14 },
  qLabel: { fontSize: 11, fontWeight: 500, color: '#555', marginBottom: 6 },
  opts: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  opt: (active) => ({
    padding: '4px 9px', borderRadius: 20,
    border: `1px solid ${active ? '#0F6E56' : '#E8E8E8'}`,
    background: active ? '#E1F5EE' : '#F7F7F5',
    fontSize: 11, color: active ? '#0F6E56' : '#888',
    fontWeight: active ? 500 : 400, cursor: 'pointer',
    whiteSpace: 'nowrap',
  }),
  budgetRow: { display: 'flex', alignItems: 'center', gap: 8 },
  budgetVal: { fontSize: 12, fontWeight: 500, color: '#0F6E56', minWidth: 40, textAlign: 'right' },
  collectingBox: { background: '#E1F5EE', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#0F6E56' },
  btnRow: { display: 'flex', gap: 8 },
  backBtn: { flex: 1, padding: 14, borderRadius: 12, border: '1px solid #E8E8E8', background: '#fff', color: '#888', fontSize: 13, fontWeight: 500, cursor: 'pointer' },
  nextBtn: (on) => ({ flex: 2, padding: 14, borderRadius: 12, background: on ? '#0F6E56' : '#ccc', color: '#fff', fontSize: 13, fontWeight: 500, cursor: on ? 'pointer' : 'not-allowed', border: 'none' }),
}

export default function Step2({ address, coord, purpose, setPurpose, requirements, setRequirements, onLandData, onBack, onNext }) {
  const [answers, setAnswers] = useState({})
  const [budget, setBudget] = useState(15000)
  const [collecting, setCollecting] = useState(false)
  const [collected, setCollected] = useState(false)

  const setAns = (key, val, multiple) => {
    if (multiple) {
      setAnswers(p => {
        const prev = Array.isArray(p[key]) ? p[key] : []
        const exists = prev.includes(val)
        return { ...p, [key]: exists ? prev.filter(v => v !== val) : [...prev, val] }
      })
    } else {
      setAnswers(p => ({ ...p, [key]: val }))
    }
  }

  // 목적 선택 시 백그라운드에서 공간정보 수집
  useEffect(() => {
    if (!purpose || !coord || collected) return
    setCollecting(true)
    getPNU(address).then(pnu =>
      collectAllLandData(pnu, coord.lat, coord.lng)
    ).then(data => {
      onLandData(data)
      setCollected(true)
    }).catch(console.warn)
    .finally(() => setCollecting(false))
  }, [purpose])

  const questions = purpose ? QUESTIONS[purpose] : []
  const canNext = !!purpose

  function handleNext() {
    setRequirements({ purpose, answers, budget })
    onNext()
  }

  return (
    <div style={s.wrap}>

      {/* 목적 선택 */}
      <div style={s.card}>
        <div style={s.cardHeader}>무엇을 계획하고 계신가요?</div>
        <div style={s.cardBody}>
          <div style={s.purposeRow}>
            {['농지정리', '신축', '리모델링'].map(p => (
              <div key={p} style={s.purposeChip(purpose === p)} onClick={() => setPurpose(p)}>
                {p === '농지정리' ? '농지정리\n부지조성' : p === '신축' ? '신축' : '리모델링\n증축'}
              </div>
            ))}
          </div>
          {collecting && (
            <div style={{ ...s.collectingBox, marginTop: 8 }}>
              ⏳ 공간정보를 수집하고 있습니다...
            </div>
          )}
          {collected && (
            <div style={{ ...s.collectingBox, marginTop: 8, background: '#E1F5EE', color: '#0F6E56' }}>
              ✓ 공간정보 수집 완료
            </div>
          )}
        </div>
      </div>

      {/* 세부 질문 */}
      {questions.length > 0 && (
        <div style={s.card}>
          <div style={s.cardHeader}>세부 조건</div>
          <div style={s.cardBody}>
            {questions.map(q => {
              const isMultiple = !!q.multiple
              const selected = isMultiple
                ? (Array.isArray(answers[q.key]) ? answers[q.key] : [])
                : answers[q.key]
              return (
                <div key={q.key} style={s.qItem}>
                  <div style={s.qLabel}>{q.label}</div>
                  <div style={s.opts}>
                    {q.opts.map(opt => {
                      const isActive = isMultiple ? selected.includes(opt) : selected === opt
                      return (
                        <span
                          key={opt}
                          style={s.opt(isActive)}
                          onClick={() => setAns(q.key, opt, isMultiple)}
                        >{opt}</span>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* 예산 */}
            <div style={s.qItem}>
              <div style={s.qLabel}>예산 범위</div>
              <div style={s.budgetRow}>
                <input
                  type="range" min={1000} max={100000} step={1000}
                  value={budget}
                  onChange={e => setBudget(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#0F6E56' }}
                />
                <span style={s.budgetVal}>
                  {budget >= 10000 ? `${(budget / 10000).toFixed(1)}억` : `${budget.toLocaleString()}만`}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={s.btnRow}>
        <button style={s.backBtn} onClick={onBack}>← 이전</button>
        <button style={s.nextBtn(canNext)} onClick={canNext ? handleNext : undefined}>
          {collecting ? '공간정보 수집 중...' : '다음 — 정보 확인 →'}
        </button>
      </div>
    </div>
  )
}
