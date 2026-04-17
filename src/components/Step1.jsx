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
    fontSize: 14,
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
  topBarTitle: {
    fontSize: 13,
    fontWeight: 500,
    flex: 1,
  },
  progressWrap: {
    display: 'flex',
    gap: 4,
    padding: '10px 16px 3px',
  },
  pb: {
    flex: 1,
    height: 2,
    borderRadius: 2,
    background: '#E8E8E8',
  },
  pbOn: {
    flex: 1,
    height: 2,
    borderRadius: 2,
    background: '#534AB7',
  },
  stepLabel: {
    padding: '2px 16px 10px',
    fontSize: 9,
    color: '#534AB7',
    fontWeight: 500,
  },
  section: {
    padding: '6px 16px',
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 500,
    color: '#999',
    marginBottom: 6,
    letterSpacing: '.04em',
  },
  divider: {
    height: 1,
    background: '#E8E8E8',
    margin: '4px 16px',
  },
  addrBox: {
    background: '#F7F7F5',
    borderRadius: 8,
    border: '1px solid #E8E8E8',
    overflow: 'hidden',
    marginBottom: 6,
  },
  addrInputRow: {
    display: 'flex',
  },
  addrInput: {
    flex: 1,
    padding: '8px 10px',
    fontSize: 9,
    color: '#555',
    background: 'transparent',
    border: 'none',
    outline: 'none',
  },
  addrBtn: {
    padding: '8px 12px',
    background: '#1D9E75',
    color: '#fff',
    fontSize: 9,
    borderRadius: '0 8px 0 0',
  },
  addrResult: {
    padding: '8px 10px',
    borderTop: '1px solid #E8E8E8',
  },
  addrRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 3,
    fontSize: 9,
  },
  addrKey: { color: '#888' },
  addrVal: { fontWeight: 500, color: '#0F6E56' },
  addrWarn: { fontWeight: 500, color: '#BA7517' },
  photoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 4,
    marginBottom: 4,
  },
  photoSlot: {
    aspectRatio: '1',
    borderRadius: 6,
    border: '1px solid #E8E8E8',
    background: '#F7F7F5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 7,
    color: '#aaa',
    cursor: 'pointer',
  },
  photoSlotOk: {
    aspectRatio: '1',
    borderRadius: 6,
    border: '1px solid #5DCAA5',
    background: '#E1F5EE',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 7,
    color: '#0F6E56',
    fontWeight: 500,
  },
  fileRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 10px',
    background: '#F7F7F5',
    borderRadius: 8,
    border: '1px solid #E8E8E8',
    marginBottom: 4,
  },
  fileIcon: {
    width: 26,
    height: 26,
    borderRadius: 6,
    background: '#E1F5EE',
    border: '1px solid #9FE1CB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  fileText: { flex: 1 },
  fileName: { fontSize: 9, fontWeight: 500 },
  fileSub: { fontSize: 8, color: '#aaa' },
  badgeDone: {
    fontSize: 8,
    padding: '2px 7px',
    borderRadius: 20,
    background: '#E1F5EE',
    color: '#0F6E56',
    whiteSpace: 'nowrap',
  },
  badgeOpt: {
    fontSize: 8,
    padding: '2px 7px',
    borderRadius: 20,
    background: '#F7F7F5',
    color: '#aaa',
    border: '1px solid #E8E8E8',
    whiteSpace: 'nowrap',
  },
  nextBtn: {
    margin: '8px 16px 16px',
    padding: 11,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: 500,
    color: '#fff',
    background: '#1D9E75',
    display: 'block',
    width: 'calc(100% - 32px)',
  },
}

export default function Step1({ onNext }) {
  const [addressed, setAddressed] = useState(false)
  const [photos] = useState(['외관', '내부1', '내부2'])

  return (
    <div style={styles.phone}>
      {/* 상태바 */}
      <div style={styles.statusBar}>
        <span>9:41</span>
        <span>●●●</span>
      </div>

      {/* 탑바 */}
      <div style={styles.topBar}>
        <span style={{ fontSize: 10, color: '#aaa' }}>←</span>
        <span style={styles.topBarTitle}>현장 정보 입력</span>
        <span style={{ fontSize: 9, color: '#aaa' }}>1/3</span>
      </div>

      {/* 진행 바 */}
      <div style={styles.progressWrap}>
        <div style={styles.pbOn} />
        <div style={styles.pb} />
        <div style={styles.pb} />
      </div>
      <div style={styles.stepLabel}>현장 정보를 수집합니다</div>

      {/* 주소 입력 */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>주소 입력</div>
        <div style={styles.addrBox}>
          <div style={styles.addrInputRow}>
            <input
              style={styles.addrInput}
              defaultValue="전남 강진군 성전면 월남리 123"
              placeholder="주소를 입력하세요"
            />
            <button style={styles.addrBtn} onClick={() => setAddressed(true)}>
              조회
            </button>
          </div>
          {addressed && (
            <div style={styles.addrResult}>
              <div style={styles.addrRow}>
                <span style={styles.addrKey}>용도지역</span>
                <span style={styles.addrVal}>농림지역</span>
              </div>
              <div style={styles.addrRow}>
                <span style={styles.addrKey}>지목</span>
                <span style={styles.addrVal}>대지</span>
              </div>
              <div style={styles.addrRow}>
                <span style={styles.addrKey}>건폐율</span>
                <span style={styles.addrVal}>60%</span>
              </div>
              <div style={styles.addrRow}>
                <span style={styles.addrKey}>보조금</span>
                <span style={styles.addrVal}>3개 해당</span>
              </div>
              <div style={styles.addrRow}>
                <span style={styles.addrKey}>농지전용</span>
                <span style={styles.addrWarn}>확인 필요</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={styles.divider} />

      {/* 현장 사진 */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>현장 사진</div>
        <div style={styles.photoGrid}>
          {photos.map((label) => (
            <div key={label} style={styles.photoSlotOk}>{label}</div>
          ))}
          <div style={{ ...styles.photoSlot, fontSize: 14, color: '#ccc' }}>+</div>
        </div>
        <div style={{ fontSize: 8, color: '#aaa', marginBottom: 6 }}>
          외관 1장 + 내부 주요 공간 권장
        </div>
      </div>

      <div style={styles.divider} />

      {/* 측량 데이터 */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          측량 데이터{' '}
          <span style={{ fontWeight: 400, color: '#aaa' }}>(선택)</span>
        </div>
        <div style={styles.fileRow}>
          <div style={styles.fileIcon}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#0F6E56" strokeWidth="1.3">
              <rect x="1" y="3" width="14" height="9" rx="2" />
              <path d="M4 12v3M12 12v3" />
            </svg>
          </div>
          <div style={styles.fileText}>
            <div style={styles.fileName}>정사영상</div>
            <div style={styles.fileSub}>GeoTIFF · JPG</div>
          </div>
          <span style={styles.badgeDone}>완료</span>
        </div>
        <div style={styles.fileRow}>
          <div style={styles.fileIcon}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#0F6E56" strokeWidth="1.3">
              <circle cx="8" cy="8" r="2" />
              <path d="M8 1v3M8 12v3M1 8h3M12 8h3" />
            </svg>
          </div>
          <div style={styles.fileText}>
            <div style={styles.fileName}>포인트 클라우드</div>
            <div style={styles.fileSub}>LAS · LAZ</div>
          </div>
          <span style={styles.badgeOpt}>선택</span>
        </div>
      </div>

      {/* 다음 버튼 */}
      <button style={styles.nextBtn} onClick={onNext}>
        다음 — 요구사항 입력 →
      </button>
    </div>
  )
}
