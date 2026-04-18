import React, { useState } from 'react'

const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid #E8E8E8',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: '12px 16px 8px',
    fontSize: 11,
    fontWeight: 500,
    color: '#999',
    letterSpacing: '.04em',
    borderBottom: '1px solid #E8E8E8',
  },
  cardBody: { padding: '12px 16px' },

  addrBox: {
    background: '#F7F7F5',
    borderRadius: 8,
    border: '1px solid #E8E8E8',
    overflow: 'hidden',
    marginBottom: 6,
  },
  addrInputRow: { display: 'flex' },
  addrInput: {
    flex: 1, padding: '9px 12px', fontSize: 12,
    color: '#555', background: 'transparent', border: 'none', outline: 'none',
  },
  addrBtn: {
    padding: '9px 14px', background: '#1D9E75',
    color: '#fff', fontSize: 11, borderRadius: '0 8px 0 0',
  },
  addrResult: { padding: '10px 12px', borderTop: '1px solid #E8E8E8' },
  addrRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 },

  photoGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 6,
  },
  slotOk: {
    aspectRatio: '1', borderRadius: 8, border: '1px solid #5DCAA5',
    background: '#E1F5EE', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 10, color: '#0F6E56', fontWeight: 500,
  },
  slotAdd: {
    aspectRatio: '1', borderRadius: 8, border: '1px dashed #ccc',
    background: '#F7F7F5', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 20, color: '#ccc', cursor: 'pointer',
  },

  fileRow: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px', background: '#F7F7F5',
    borderRadius: 8, border: '1px solid #E8E8E8', marginBottom: 6,
  },
  fileIcon: {
    width: 30, height: 30, borderRadius: 7, background: '#E1F5EE',
    border: '1px solid #9FE1CB', display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0,
  },
  fileText: { flex: 1 },
  fileName: { fontSize: 12, fontWeight: 500 },
  fileSub: { fontSize: 10, color: '#aaa' },
  badgeDone: {
    fontSize: 10, padding: '3px 9px', borderRadius: 20,
    background: '#E1F5EE', color: '#0F6E56',
  },
  badgeOpt: {
    fontSize: 10, padding: '3px 9px', borderRadius: 20,
    background: '#F7F7F5', color: '#aaa', border: '1px solid #E8E8E8',
  },

  nextBtn: {
    width: '100%', padding: 14, borderRadius: 12,
    background: '#1D9E75', color: '#fff',
    fontSize: 13, fontWeight: 500, textAlign: 'center', cursor: 'pointer',
  },
}

export default function Step1({ onNext }) {
  const [addressed, setAddressed] = useState(false)

  return (
    <div style={s.wrap}>

      {/* 주소 */}
      <div style={s.card}>
        <div style={s.cardHeader}>주소 입력</div>
        <div style={s.cardBody}>
          <div style={s.addrBox}>
            <div style={s.addrInputRow}>
              <input
                style={s.addrInput}
                defaultValue="전남 강진군 성전면 월남리 123"
                placeholder="주소를 입력하세요"
              />
              <button style={s.addrBtn} onClick={() => setAddressed(true)}>조회</button>
            </div>
            {addressed && (
              <div style={s.addrResult}>
                {[
                  ['용도지역', '농림지역', '#0F6E56'],
                  ['지목', '대지', '#0F6E56'],
                  ['건폐율', '60%', '#0F6E56'],
                  ['보조금', '3개 해당', '#0F6E56'],
                  ['농지전용', '확인 필요', '#BA7517'],
                ].map(([k, v, c]) => (
                  <div key={k} style={s.addrRow}>
                    <span style={{ color: '#888' }}>{k}</span>
                    <span style={{ fontWeight: 500, color: c }}>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 현장 사진 */}
      <div style={s.card}>
        <div style={s.cardHeader}>현장 사진</div>
        <div style={s.cardBody}>
          <div style={s.photoGrid}>
            {['외관', '내부1', '내부2'].map((l) => (
              <div key={l} style={s.slotOk}>{l}</div>
            ))}
            <div style={s.slotAdd}>+</div>
          </div>
          <div style={{ fontSize: 11, color: '#aaa' }}>외관 1장 + 내부 주요 공간 권장</div>
        </div>
      </div>

      {/* 측량 데이터 */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          측량 데이터 <span style={{ fontWeight: 400, color: '#bbb' }}>(선택)</span>
        </div>
        <div style={s.cardBody}>
          <div style={s.fileRow}>
            <div style={s.fileIcon}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#0F6E56" strokeWidth="1.3">
                <rect x="1" y="3" width="14" height="9" rx="2" /><path d="M4 12v3M12 12v3" />
              </svg>
            </div>
            <div style={s.fileText}>
              <div style={s.fileName}>정사영상</div>
              <div style={s.fileSub}>GeoTIFF · JPG</div>
            </div>
            <span style={s.badgeDone}>완료</span>
          </div>
          <div style={s.fileRow}>
            <div style={s.fileIcon}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#0F6E56" strokeWidth="1.3">
                <circle cx="8" cy="8" r="2" /><path d="M8 1v3M8 12v3M1 8h3M12 8h3" />
              </svg>
            </div>
            <div style={s.fileText}>
              <div style={s.fileName}>포인트 클라우드</div>
              <div style={s.fileSub}>LAS · LAZ</div>
            </div>
            <span style={s.badgeOpt}>선택</span>
          </div>
        </div>
      </div>

      <button style={s.nextBtn} onClick={onNext}>
        다음 — 요구사항 입력 →
      </button>
    </div>
  )
}
