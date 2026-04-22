import React, { useState, useRef } from 'react'

// ── 목적별 기본 사진 가이드 ──────────────────────────────────────
const BASE_GUIDES = {
  농지정리: [
    { key: 'overview', label: '부지 전경', desc: '부지 전체가 보이도록 멀리서 촬영', required: true },
    { key: 'slope', label: '경사·지형', desc: '땅의 높낮이와 경사가 보이는 각도', required: true },
    { key: 'access', label: '진입로', desc: '도로에서 부지로 진입하는 길', required: true },
    { key: 'drain', label: '배수로', desc: '주변 배수로 또는 수로 현황', required: false },
    { key: 'boundary', label: '경계 현황', desc: '인접 토지·도로와의 경계 부분', required: false },
  ],
  신축: [
    { key: 'overview', label: '부지 전경', desc: '부지 전체가 보이도록 멀리서 촬영', required: true },
    { key: 'road', label: '도로 접면', desc: '부지와 도로가 만나는 부분', required: true },
    { key: 'surroundings', label: '주변 환경', desc: '인접 건물·시설물 현황', required: true },
    { key: 'slope', label: '지형 특이사항', desc: '경사·습지·암반 등 특이한 지형', required: false },
  ],
  리모델링: [
    { key: 'front', label: '외관 전면', desc: '건물 정면 전체가 보이게 촬영', required: true },
    { key: 'side', label: '외관 측면·후면', desc: '건물 옆면과 뒷면', required: true },
    { key: 'roof', label: '지붕 상태', desc: '지붕 전체 모습 (위에서 또는 멀리서)', required: true },
    { key: 'interior', label: '내부 주요 공간', desc: '거실·주방·방 등 주요 공간', required: true },
    { key: 'crack', label: '균열·침하 부위', desc: '균열·누수·침하 의심 부위 클로즈업', required: false },
    { key: 'utility', label: '설비 현황', desc: '배전반·보일러·배관 등', required: false },
  ],
}

// 리모델링 세부 문제부위 → 추가 필수 사진 매핑
const PROBLEM_EXTRA = {
  '지붕':   { key: 'roof_detail', label: '지붕 상세', desc: '지붕 손상 부위 클로즈업', required: true },
  '외벽':   { key: 'wall_detail', label: '외벽 상세', desc: '외벽 균열·박락 부위 클로즈업', required: true },
  '내부':   { key: 'interior_detail', label: '내부 상세', desc: '내부 손상 부위 클로즈업', required: true },
  '설비':   { key: 'utility_detail', label: '설비 상세', desc: '보일러·배관·배전반 클로즈업', required: true },
  '기초·침하': { key: 'foundation', label: '기초·침하', desc: '건물 기초 또는 침하 의심 부위', required: true },
  '창호':   { key: 'window', label: '창호 현황', desc: '창문·문틀 상태 클로즈업', required: true },
}

// requirements.answers에 따라 가이드 동적 생성
function buildGuides(purpose, answers) {
  const base = BASE_GUIDES[purpose] || BASE_GUIDES['신축']
  if (purpose !== '리모델링') return base

  const extras = []
  const problems = answers?.문제부위 ?? []
  for (const p of problems) {
    if (PROBLEM_EXTRA[p]) extras.push(PROBLEM_EXTRA[p])
  }

  // 중복 key 제거
  const existingKeys = base.map(g => g.key)
  const filtered = extras.filter(e => !existingKeys.includes(e.key))
  return [...base, ...filtered]
}

// 이미지 리사이즈 압축 (모바일 대용량 대응)
async function resizeImage(file, maxWidth = 1280, quality = 0.75) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let w = img.width, h = img.height
        if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth }
        canvas.width = w; canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, { type: 'image/jpeg' }))
        }, 'image/jpeg', quality)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: { background: '#fff', borderRadius: 14, border: '1px solid #E8E8E8', overflow: 'hidden' },
  cardHeader: { padding: '12px 16px 8px', fontSize: 11, fontWeight: 500, color: '#999', letterSpacing: '.04em', borderBottom: '1px solid #E8E8E8' },
  cardBody: { padding: '12px 16px' },
  btnRow: { display: 'flex', gap: 8 },
  backBtn: { flex: 1, padding: 14, borderRadius: 12, border: '1px solid #E8E8E8', background: '#fff', color: '#888', fontSize: 13, fontWeight: 500, cursor: 'pointer' },
  nextBtn: (on) => ({ flex: 2, padding: 14, borderRadius: 12, background: on ? '#0F6E56' : '#ccc', color: '#fff', fontSize: 13, fontWeight: 500, cursor: on ? 'pointer' : 'not-allowed', border: 'none' }),
}

// 썸네일 그리드
function ThumbGrid({ files, onAdd, onRemove }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
      {files.map((f, i) => (
        <div key={i} style={{ position: 'relative', width: 64, height: 64 }}>
          <img
            src={URL.createObjectURL(f.file)}
            alt=""
            style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid #E8E8E8' }}
          />
          <button
            onClick={() => onRemove(i)}
            style={{
              position: 'absolute', top: -6, right: -6,
              width: 18, height: 18, borderRadius: '50%',
              background: '#A32D2D', color: '#fff',
              border: 'none', fontSize: 10, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              lineHeight: 1,
            }}
          >✕</button>
        </div>
      ))}
      {/* 추가 버튼 */}
      <div
        onClick={onAdd}
        style={{
          width: 64, height: 64, borderRadius: 8,
          border: '1px dashed #ccc', background: '#F7F7F5',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#aaa', fontSize: 10, gap: 2,
        }}
      >
        <span style={{ fontSize: 20 }}>📷</span>
        <span>추가</span>
      </div>
    </div>
  )
}

// 사진 항목 카드
function PhotoItem({ guide, files, memo, onAdd, onRemove, onMemo }) {
  const hasFiles = files.length > 0
  return (
    <div style={{ marginBottom: 14, padding: '12px', borderRadius: 10, border: `1px solid ${hasFiles ? '#9FE1CB' : '#E8E8E8'}`, background: hasFiles ? '#F5FBF8' : '#FAFAF8' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', flex: 1 }}>{guide.label}</span>
        <span style={{
          fontSize: 9, padding: '2px 6px', borderRadius: 10, fontWeight: 500,
          background: guide.required ? '#FCEBEB' : '#F7F7F5',
          color: guide.required ? '#A32D2D' : '#aaa',
        }}>{guide.required ? '필수' : '선택'}</span>
        {hasFiles && <span style={{ fontSize: 10, color: '#0F6E56' }}>✓ {files.length}장</span>}
      </div>

      {/* 설명 */}
      <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>{guide.desc}</div>

      {/* 썸네일 그리드 */}
      <ThumbGrid files={files} onAdd={onAdd} onRemove={onRemove} />

      {/* 메모 입력 */}
      <textarea
        value={memo}
        onChange={e => onMemo(e.target.value)}
        placeholder="AI에게 전달할 추가 설명 (선택) — 예: 균열이 3년 전부터 심해졌음"
        rows={2}
        style={{
          width: '100%', marginTop: 10, padding: '8px 10px',
          fontSize: 11, color: '#555', borderRadius: 8,
          border: '1px solid #E8E8E8', background: '#fff',
          resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
          outline: 'none',
        }}
      />
    </div>
  )
}

export default function Step4({ purpose, tier, requirements, photos, setPhotos, onBack, onNext }) {
  const [memos, setMemos] = useState({})

  const guides = buildGuides(purpose, requirements?.answers)
  const requiredKeys = guides.filter(g => g.required).map(g => g.key)

  // photos 구조: [{ key, label, file, name }] → 여러 장 지원을 위해
  // key별로 그룹핑
  const photosByKey = {}
  for (const p of photos) {
    if (!photosByKey[p.key]) photosByKey[p.key] = []
    photosByKey[p.key].push(p)
  }

  const allRequiredDone = requiredKeys.every(k => (photosByKey[k]?.length ?? 0) > 0)
  const remaining = requiredKeys.filter(k => !(photosByKey[k]?.length > 0)).length

  async function handleAdd(guide) {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = async (e) => {
      const files = Array.from(e.target.files)
      const resized = await Promise.all(files.map(f => resizeImage(f)))
      const newPhotos = resized.map(f => ({ key: guide.key, label: guide.label, file: f, name: f.name }))
      setPhotos(prev => [...prev, ...newPhotos])
    }
    input.click()
  }

  function handleRemove(guide, idx) {
    const keyFiles = photosByKey[guide.key] ?? []
    const target = keyFiles[idx]
    setPhotos(prev => {
      const remaining = [...prev]
      const pos = remaining.findIndex(p => p.key === guide.key && p.file === target.file)
      if (pos !== -1) remaining.splice(pos, 1)
      return remaining
    })
  }

  function handleMemo(key, val) {
    setMemos(prev => ({ ...prev, [key]: val }))
    // 메모를 requirements에 합쳐서 analyze에서 활용
    setPhotos(prev => prev.map(p => p.key === key ? { ...p, memo: val } : p))
  }

  return (
    <div style={s.wrap}>

      {/* 안내 */}
      <div style={{ padding: '12px 14px', background: '#FAEEDA', borderRadius: 10, border: '1px solid #FAC775', fontSize: 12, color: '#BA7517', lineHeight: 1.7 }}>
        📸 AI가 사진을 분석해 현황을 진단하고 방안 A·B·C를 제안합니다.<br />
        <strong>필수</strong> 항목 사진을 올려주세요. 항목당 여러 장 가능합니다.<br />
        추가 설명을 입력하면 더 정확한 분석을 받을 수 있어요.
      </div>

      {/* 사진 업로드 */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          현장 사진 업로드
          <span style={{ float: 'right', fontSize: 10, color: '#A32D2D' }}>* 필수</span>
        </div>
        <div style={s.cardBody}>
          {guides.map(guide => (
            <PhotoItem
              key={guide.key}
              guide={guide}
              files={photosByKey[guide.key] ?? []}
              memo={memos[guide.key] ?? ''}
              onAdd={() => handleAdd(guide)}
              onRemove={(idx) => handleRemove(guide, idx)}
              onMemo={(val) => handleMemo(guide.key, val)}
            />
          ))}
        </div>
      </div>

      <div style={s.btnRow}>
        <button style={s.backBtn} onClick={onBack}>← 이전</button>
        <button style={s.nextBtn(allRequiredDone)} onClick={allRequiredDone ? onNext : undefined}>
          {allRequiredDone ? '분석 시작 →' : `필수 사진 ${remaining}항목 더 필요`}
        </button>
      </div>
    </div>
  )
}
