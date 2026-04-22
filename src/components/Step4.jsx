import React, { useState } from 'react'

// 이미지 리사이즈 압축
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

// 목적별 사진 가이드 — Step2 요구사항 항목과 일치
const GUIDES = {
  농지정리: [
    { key: 'overview', label: '부지 전경', required: true,
      desc: '부지 전체가 한눈에 보이도록 멀리서 촬영 (여러 각도 가능)',
      placeholder: '예: 북쪽 경사가 심하고 남쪽은 평탄함. 서쪽 끝에 물이 고이는 웅덩이 있어 우기 시 침수 우려' },
    { key: 'access', label: '진입로', required: true,
      desc: '도로에서 부지로 들어오는 길 전체 촬영',
      placeholder: '예: 농로 폭 약 3m, 비포장. 대형 트럭 진입 어려움. 우기 시 진흙탕으로 이용 불가' },
    { key: 'drain', label: '배수·수로', required: true,
      desc: '주변 배수로, 수로, 물 흐름 방향 촬영',
      placeholder: '예: 북쪽 수로가 막혀 있어 침수 이력 있음. 우기 시 부지 전체 침수됨' },
    { key: 'extra', label: '기타 영향 요소', required: false,
      desc: '경사, 암반, 인접지 경계, 전봇대 등 공사에 영향을 줄 수 있는 요소 촬영',
      placeholder: '예: 동쪽 경계에 콘크리트 옹벽 있음. 인접 농지보다 약 1m 낮음. 부지 중앙에 노출 암반 있음' },
  ],
  신축: [
    { key: 'overview', label: '부지 전경', required: true,
      desc: '부지 전체가 한눈에 보이도록 멀리서 촬영',
      placeholder: '예: 남향 평지. 동쪽에 기존 창고 있음. 북쪽 경사 약간 있어 성토 필요할 듯' },
    { key: 'access', label: '진입로·도로접면', required: true,
      desc: '부지와 도로가 만나는 부분, 도로 폭도 보이게 촬영',
      placeholder: '예: 도로 폭 약 4m 포장도로. 부지 접면 길이 약 12m. 전봇대가 진입 방해' },
    { key: 'drain', label: '배수·지형', required: true,
      desc: '경사, 배수 흐름, 주변 지형 촬영',
      placeholder: '예: 북동쪽 모서리에 암반 노출. 빗물이 남쪽으로 흐름. 지하수 수위 높을 수 있어 기초 검토 필요' },
    { key: 'extra', label: '기타 영향 요소', required: false,
      desc: '인접 건물, 전봇대, 수목 등 공사에 영향을 줄 수 있는 요소 촬영',
      placeholder: '예: 북쪽 2층 주택과 약 3m 이격. 남쪽은 논. 부지 내 노거수 1그루 있어 이식 필요' },
    { key: 'reference', label: '참고 이미지 (원하는 형태)', required: false,
      desc: '원하는 건물 스타일, 외관, 평면 등 참고할 이미지 자유롭게 업로드',
      placeholder: '예: 단층 목조 주택 스타일 원함. 처마 깊고 외벽 노출콘크리트 선호. 남향 데크 필수. 방 3개 이상' },
  ],
  리모델링: [
    { key: 'exterior', label: '외관 전체', required: true,
      desc: '건물 전면·측면·후면 전체 모습 촬영 (멀리서 + 가까이)',
      placeholder: '예: 외벽 조적조 전반적 양호하나 북쪽 외벽 하단 습기 흔적. 처마 부분 도장 들뜸' },
    { key: 'roof', label: '지붕', required: false,
      desc: '지붕 전체 + 손상·누수 의심 부위 클로즈업 함께 촬영',
      placeholder: '예: 칼라강판 지붕 약 15년 경과. 북쪽 경사면 이끼 많고 용마루 실링 벌어짐. 비 올 때 다락방 천장에서 물 샘' },
    { key: 'wall', label: '외벽', required: false,
      desc: '외벽 전체 + 균열·박락·습기 부위 클로즈업 촬영',
      placeholder: '예: 서쪽 외벽 수직 균열 폭 약 3mm. 북쪽 하단 습기로 벽돌 백화 현상. 3년 전부터 점점 심해짐' },
    { key: 'interior', label: '내부', required: false,
      desc: '거실·주방·방 전체 + 손상 부위 클로즈업 함께 촬영',
      placeholder: '예: 거실 천장 누수 자국. 주방 바닥 타일 들뜸. 안방 창호 틀 썩어 외풍 심함. 전체적으로 단열 불량' },
    { key: 'utility', label: '설비', required: false,
      desc: '보일러·배전반·배관·화장실 등 설비 전체 촬영',
      placeholder: '예: 기름보일러 15년 이상 노후. 화장실 변기·세면대 파손 심각. 전기 노출 배선 다수. 정화조 위치 불명' },
    { key: 'foundation', label: '기초·침하', required: false,
      desc: '건물 기초부, 침하 의심 부위, 바닥 기울기 등 촬영',
      placeholder: '예: 현관 바닥이 약 3cm 기울어짐. 남동쪽 모서리 기초 부분 균열. 문이 잘 안 닫힘' },
    { key: 'window', label: '창호', required: false,
      desc: '창문·문틀 전체 + 손상·결로·외풍 부위 촬영',
      placeholder: '예: 전체 알루미늄 단창으로 결로 심각. 안방 창문 틀 썩어 교체 필요. 현관문 잠금장치 불량' },
  ],
}

// Step2 문제부위 선택 → Step4 해당 항목 필수 전환
const PROBLEM_KEY_MAP = {
  '지붕': 'roof',
  '외벽': 'wall',
  '내부': 'interior',
  '설비': 'utility',
  '기초·침하': 'foundation',
  '창호': 'window',
}

function buildGuides(purpose, answers) {
  const base = JSON.parse(JSON.stringify(GUIDES[purpose] || GUIDES['신축']))
  if (purpose !== '리모델링') return base

  const problems = answers?.문제부위 ?? []
  for (const p of problems) {
    const key = PROBLEM_KEY_MAP[p]
    if (key) {
      const guide = base.find(g => g.key === key)
      if (guide) guide.required = true
    }
  }
  return base
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
            }}
          >✕</button>
        </div>
      ))}
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

function PhotoItem({ guide, files, memo, onAdd, onRemove, onMemo }) {
  const hasFiles = files.length > 0
  return (
    <div style={{
      marginBottom: 14, padding: '12px', borderRadius: 10,
      border: `1px solid ${hasFiles ? '#9FE1CB' : '#E8E8E8'}`,
      background: hasFiles ? '#F5FBF8' : '#FAFAF8',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', flex: 1 }}>{guide.label}</span>
        <span style={{
          fontSize: 9, padding: '2px 6px', borderRadius: 10, fontWeight: 500,
          background: guide.required ? '#FCEBEB' : '#F7F7F5',
          color: guide.required ? '#A32D2D' : '#aaa',
        }}>{guide.required ? '필수' : '선택'}</span>
        {hasFiles && <span style={{ fontSize: 10, color: '#0F6E56' }}>✓ {files.length}장</span>}
      </div>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>{guide.desc}</div>
      <ThumbGrid files={files} onAdd={onAdd} onRemove={onRemove} />
      <textarea
        value={memo}
        onChange={e => onMemo(e.target.value)}
        placeholder={guide.placeholder}
        rows={2}
        style={{
          width: '100%', marginTop: 10, padding: '8px 10px',
          fontSize: 11, color: '#555', borderRadius: 8,
          border: '1px solid #E8E8E8', background: '#fff',
          resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none',
        }}
      />
    </div>
  )
}

export default function Step4({ purpose, tier, requirements, photos, setPhotos, onBack, onNext }) {
  const [memos, setMemos] = useState({})

  const guides = buildGuides(purpose, requirements?.answers)
  const requiredKeys = guides.filter(g => g.required).map(g => g.key)

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
      const newPhotos = resized.map(f => ({
        key: guide.key, label: guide.label, file: f, name: f.name,
        memo: memos[guide.key] ?? '',
      }))
      setPhotos(prev => [...prev, ...newPhotos])
    }
    input.click()
  }

  function handleRemove(guide, idx) {
    const keyFiles = photosByKey[guide.key] ?? []
    const target = keyFiles[idx]
    setPhotos(prev => {
      const next = [...prev]
      const pos = next.findIndex(p => p.key === guide.key && p.file === target.file)
      if (pos !== -1) next.splice(pos, 1)
      return next
    })
  }

  function handleMemo(key, val) {
    setMemos(prev => ({ ...prev, [key]: val }))
    setPhotos(prev => prev.map(p => p.key === key ? { ...p, memo: val } : p))
  }

  return (
    <div style={s.wrap}>
      <div style={{ padding: '12px 14px', background: '#FAEEDA', borderRadius: 10, border: '1px solid #FAC775', fontSize: 12, color: '#BA7517', lineHeight: 1.7 }}>
        📸 AI가 사진을 분석해 현황을 진단하고 방안 A·B·C를 제안합니다.<br />
        각 항목에 여러 장 업로드 가능하며, 설명을 입력할수록 분석이 정확해집니다.
      </div>

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
          {allRequiredDone ? '분석 시작 →' : `필수 항목 ${remaining}개 더 필요`}
        </button>
      </div>
    </div>
  )
}
