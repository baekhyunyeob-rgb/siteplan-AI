import React, { useState } from 'react'

const PHOTO_GUIDES = {
  농지정리: [
    { key: 'overview', label: '부지 전경', desc: '부지 전체가 보이도록 멀리서 촬영', required: true, example: '🌾' },
    { key: 'slope', label: '경사·지형', desc: '땅의 높낮이와 경사가 보이는 각도', required: true, example: '⛰' },
    { key: 'access', label: '진입로', desc: '도로에서 부지로 진입하는 길', required: true, example: '🛤' },
    { key: 'drain', label: '배수로', desc: '주변 배수로 또는 수로 현황', required: false, example: '💧' },
    { key: 'boundary', label: '경계 현황', desc: '인접 토지·도로와의 경계 부분', required: false, example: '📐' },
  ],
  신축: [
    { key: 'overview', label: '부지 전경', desc: '부지 전체가 보이도록 멀리서 촬영', required: true, example: '🏞' },
    { key: 'road', label: '도로 접면', desc: '부지와 도로가 만나는 부분', required: true, example: '🛣' },
    { key: 'surroundings', label: '주변 환경', desc: '인접 건물·시설물 현황', required: true, example: '🏘' },
    { key: 'slope', label: '지형 특이사항', desc: '경사·습지·암반 등 특이한 지형', required: false, example: '⛰' },
  ],
  리모델링: [
    { key: 'front', label: '외관 전면', desc: '건물 정면 전체가 보이게 촬영', required: true, example: '🏠' },
    { key: 'side', label: '외관 측면·후면', desc: '건물 옆면과 뒷면', required: true, example: '🏚' },
    { key: 'roof', label: '지붕 상태', desc: '지붕 전체 모습 (위에서 또는 멀리서)', required: true, example: '🏛' },
    { key: 'interior', label: '내부 주요 공간', desc: '거실·주방·방 등 주요 공간', required: true, example: '🛋' },
    { key: 'crack', label: '균열·침하 부위', desc: '균열·누수·침하 의심 부위 클로즈업', required: false, example: '🔍' },
    { key: 'utility', label: '설비 현황', desc: '배전반·보일러·배관 등', required: false, example: '⚙️' },
  ],
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: { background: '#fff', borderRadius: 14, border: '1px solid #E8E8E8', overflow: 'hidden' },
  cardHeader: { padding: '12px 16px 8px', fontSize: 11, fontWeight: 500, color: '#999', letterSpacing: '.04em', borderBottom: '1px solid #E8E8E8' },
  cardBody: { padding: '12px 16px' },
  photoItem: { marginBottom: 12, padding: '10px 12px', borderRadius: 10, border: '1px solid #E8E8E8', background: '#FAFAF8' },
  photoHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 },
  photoEmoji: { fontSize: 20 },
  photoLabel: { fontSize: 12, fontWeight: 500, flex: 1 },
  requiredBadge: { fontSize: 9, padding: '2px 6px', borderRadius: 10, background: '#FCEBEB', color: '#A32D2D' },
  optBadge: { fontSize: 9, padding: '2px 6px', borderRadius: 10, background: '#F7F7F5', color: '#aaa' },
  photoDesc: { fontSize: 11, color: '#888', marginBottom: 8 },
  photoUpload: (hasFile) => ({
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 12px', borderRadius: 8,
    border: `1px dashed ${hasFile ? '#0F6E56' : '#ccc'}`,
    background: hasFile ? '#E1F5EE' : '#fff',
    cursor: 'pointer', fontSize: 12,
    color: hasFile ? '#0F6E56' : '#aaa',
  }),
  btnRow: { display: 'flex', gap: 8 },
  backBtn: { flex: 1, padding: 14, borderRadius: 12, border: '1px solid #E8E8E8', background: '#fff', color: '#888', fontSize: 13, fontWeight: 500, cursor: 'pointer' },
  nextBtn: (on) => ({ flex: 2, padding: 14, borderRadius: 12, background: on ? '#0F6E56' : '#ccc', color: '#fff', fontSize: 13, fontWeight: 500, cursor: on ? 'pointer' : 'not-allowed', border: 'none' }),
}

export default function Step4({ purpose, tier, photos, setPhotos, surveyFiles, setSurveyFiles, onBack, onNext }) {

  // ── 1단계(무료): 사진 업로드 없이 바로 분석 ──────────────────────
  if (tier === 'free') {
    return (
      <div style={s.wrap}>
        <div style={s.card}>
          <div style={s.cardHeader}>1단계 — 토지 기본정보</div>
          <div style={s.cardBody}>
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#0F6E56', marginBottom: 8 }}>
                수집된 공간정보로 AI 요약을 생성합니다
              </div>
              <div style={{ fontSize: 12, color: '#888', lineHeight: 1.7 }}>
                용도지역·건폐율·용적률·공시지가 등<br />
                수집된 토지정보를 바탕으로<br />
                "이 땅에서 할 수 있는 것·없는 것"을 정리합니다
              </div>
            </div>
          </div>
        </div>
        <div style={s.btnRow}>
          <button style={s.backBtn} onClick={onBack}>← 이전</button>
          <button style={s.nextBtn(true)} onClick={onNext}>분석 시작 →</button>
        </div>
      </div>
    )
  }

  // ── 2단계(유료): 사진 업로드 필요 ──────────────────────────────
  const guides = PHOTO_GUIDES[purpose] || PHOTO_GUIDES['신축']
  const requiredKeys = guides.filter(g => g.required).map(g => g.key)
  const uploadedKeys = photos.map(p => p.key)
  const allRequiredDone = requiredKeys.every(k => uploadedKeys.includes(k))
  const remaining = requiredKeys.filter(k => !uploadedKeys.includes(k)).length

  function handlePhotoUpload(guide) {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      setPhotos(prev => {
        const filtered = prev.filter(p => p.key !== guide.key)
        return [...filtered, { key: guide.key, label: guide.label, file, name: file.name }]
      })
    }
    input.click()
  }

  return (
    <div style={s.wrap}>

      {/* 안내 */}
      <div style={{ padding: '12px 14px', background: '#FAEEDA', borderRadius: 10, border: '1px solid #FAC775', fontSize: 12, color: '#BA7517', lineHeight: 1.7 }}>
        📸 AI가 사진을 분석해 현황을 진단하고 방안 A·B·C를 제안합니다.<br />
        <strong>필수</strong> 사진을 모두 올려주세요.
      </div>

      {/* 사진 업로드 */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          현장 사진 업로드
          <span style={{ float: 'right', fontSize: 10, color: '#A32D2D' }}>* 필수</span>
        </div>
        <div style={s.cardBody}>
          {guides.map(guide => {
            const uploaded = photos.find(p => p.key === guide.key)
            return (
              <div key={guide.key} style={s.photoItem}>
                <div style={s.photoHeader}>
                  <span style={s.photoEmoji}>{guide.example}</span>
                  <span style={s.photoLabel}>{guide.label}</span>
                  <span style={guide.required ? s.requiredBadge : s.optBadge}>
                    {guide.required ? '필수' : '선택'}
                  </span>
                </div>
                <div style={s.photoDesc}>{guide.desc}</div>
                <div style={s.photoUpload(!!uploaded)} onClick={() => handlePhotoUpload(guide)}>
                  {uploaded ? <>✓ {uploaded.name}</> : <>📷 사진 선택하기</>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={s.btnRow}>
        <button style={s.backBtn} onClick={onBack}>← 이전</button>
        <button style={s.nextBtn(allRequiredDone)} onClick={allRequiredDone ? onNext : undefined}>
          {allRequiredDone ? '분석 시작 →' : `필수 사진 ${remaining}장 더 필요`}
        </button>
      </div>
    </div>
  )
}
