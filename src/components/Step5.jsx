import React, { useState, useEffect } from 'react'

const GRADE_COLOR = {
  '양호': { bg: '#E1F5EE', color: '#0F6E56', dot: '#1D9E75' },
  '보통': { bg: '#FAEEDA', color: '#BA7517', dot: '#EF9F27' },
  '불량': { bg: '#FCEBEB', color: '#A32D2D', dot: '#E24B4A' },
  '위험': { bg: '#FCEBEB', color: '#A32D2D', dot: '#E24B4A' },
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: { background: '#fff', borderRadius: 14, border: '1px solid #E8E8E8', overflow: 'hidden' },
  cardHeader: { padding: '12px 16px 8px', fontSize: 11, fontWeight: 500, color: '#999', letterSpacing: '.04em', borderBottom: '1px solid #E8E8E8' },
  cardBody: { padding: '12px 16px' },
  loadingBox: { textAlign: 'center', padding: '48px 20px' },
  loadingIcon: { fontSize: 40, marginBottom: 12 },
  loadingTitle: { fontSize: 15, fontWeight: 500, color: '#0F6E56', marginBottom: 6 },
  loadingDesc: { fontSize: 12, color: '#aaa', lineHeight: 1.7 },
  errorBox: { background: '#FCEBEB', borderRadius: 10, padding: '16px', textAlign: 'center' },
  dataRow: { display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: 12, borderBottom: '1px solid #F5F5F3' },
  opinionBox: { background: '#F7F7F5', borderRadius: 10, padding: '14px', fontSize: 12, color: '#555', lineHeight: 1.8 },
  restartBtn: { width: '100%', padding: 14, borderRadius: 12, border: '1px solid #E8E8E8', background: '#fff', color: '#555', fontSize: 13, fontWeight: 500, cursor: 'pointer' },
  pdfRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: '#fff', borderRadius: 14, border: '1px solid #E8E8E8', cursor: 'pointer' },
}

async function fileToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target.result.split(',')[1]
      resolve({ base64, mimeType: file.type })
    }
    reader.readAsDataURL(file)
  })
}

// PDF 다운로드 — 텍스트 기반 HTML → 새 창 인쇄
function downloadPDF(result, landData) {
  const addr = `${landData?.토지기본?.주소 ?? ''} ${landData?.토지기본?.지번 ?? ''}`
  const date = new Date().toLocaleDateString('ko-KR')
  const plans = result?.방안 ?? []
  const recommended = result?.추천방안

  const planRows = plans.map((p, i) => {
    const label = ['A', 'B', 'C'][i]
    const isRec = recommended === label
    return `
      <div style="border:1px solid #ddd;border-radius:8px;padding:14px;margin-bottom:10px;${isRec ? 'border-color:#BA7517;background:#FFFDF5' : ''}">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <strong>방안 ${label}${isRec ? ' ⭐ 추천' : ''}</strong>
          <span style="color:#185FA5;font-weight:600">${(p.예산하한 ?? 0).toLocaleString()}만 ~ ${(p.예산상한 ?? 0).toLocaleString()}만원</span>
        </div>
        <div style="font-size:13px;color:#333;margin-bottom:8px">${p.방향}</div>
        <div style="font-size:12px;color:#555;margin-bottom:8px">${p.설명}</div>
        <div style="display:flex;gap:8px">
          <div style="flex:1;background:#F0FBF6;padding:8px;border-radius:6px">
            <div style="font-size:11px;color:#0F6E56;margin-bottom:4px">장점</div>
            ${(p.장점 ?? []).map(t => `<div style="font-size:11px">✓ ${t}</div>`).join('')}
          </div>
          <div style="flex:1;background:#FEF2F2;padding:8px;border-radius:6px">
            <div style="font-size:11px;color:#A32D2D;margin-bottom:4px">단점</div>
            ${(p.단점 ?? []).map(t => `<div style="font-size:11px">• ${t}</div>`).join('')}
          </div>
        </div>
      </div>`
  }).join('')

  const subsidyRows = (result?.보조금 ?? []).map(s =>
    `<div style="padding:8px 12px;background:#F0FBF6;border-radius:6px;margin-bottom:6px">
      <div style="display:flex;justify-content:space-between">
        <strong style="font-size:12px">${s.사업명}</strong>
        ${s.최대지원액 ? `<span style="color:#0F6E56;font-weight:600">최대 ${s.최대지원액.toLocaleString()}만원</span>` : ''}
      </div>
      <div style="font-size:11px;color:#555;margin-top:2px">${s.지원기관} · ${s.신청조건}</div>
    </div>`
  ).join('')

  const html = `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8">
  <title>SiteplanAI 분석 리포트</title>
  <style>
    body{font-family:'Malgun Gothic',sans-serif;max-width:720px;margin:0 auto;padding:32px;color:#1A1A1A;font-size:13px;line-height:1.6}
    h1{font-size:22px;color:#0F6E56;margin-bottom:4px}
    h2{font-size:15px;color:#333;border-bottom:2px solid #0F6E56;padding-bottom:6px;margin:24px 0 12px}
    .meta{color:#888;font-size:12px;margin-bottom:24px}
    .badge{display:inline-block;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:600}
    .row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #F0F0EE;font-size:12px}
    .disclaimer{margin-top:24px;padding:10px;background:#F7F7F5;border-radius:6px;font-size:11px;color:#888}
    @media print{body{padding:16px}}
  </style></head><body>
  <h1>SiteplanAI 현장 분석 리포트</h1>
  <div class="meta">📍 ${addr} &nbsp;|&nbsp; 작성일: ${date} &nbsp;|&nbsp; 본 문서는 설계사무소 상담 준비용 참고자료입니다</div>

  <h2>현황 진단</h2>
  <div style="margin-bottom:8px">
    <span class="badge" style="background:#FAEEDA;color:#BA7517">${result?.현황진단?.종합등급 ?? '보통'}</span>
    <strong style="margin-left:10px">${result?.현황진단?.한줄요약 ?? ''}</strong>
  </div>
  ${(result?.현황진단?.주요발견 ?? []).map(t => `<div style="font-size:12px;color:#555;margin-bottom:4px">• ${t}</div>`).join('')}
  ${(result?.현황진단?.주의사항 ?? []).map(t => `<div style="font-size:12px;color:#BA7517;margin-bottom:4px">⚠ ${t}</div>`).join('')}

  <h2>구현 방안 비교</h2>
  ${planRows}

  ${result?.추천이유 ? `
  <h2>추천 방안 ${recommended} — 이유</h2>
  <div style="padding:12px;background:#F7F7F5;border-radius:8px;font-size:12px;color:#555">${result.추천이유}</div>` : ''}

  ${result?.총예산 ? `
  <h2>개략 예산 (추천 방안 기준)</h2>
  <div style="padding:12px;background:#EFF6FF;border-radius:8px;display:flex;justify-content:space-between;align-items:center">
    <span>총 예상 비용</span>
    <strong style="font-size:18px;color:#185FA5">${(result.총예산.하한 ?? 0).toLocaleString()}만 ~ ${(result.총예산.상한 ?? 0).toLocaleString()}만원</strong>
  </div>
  <div style="font-size:11px;color:#aaa;margin-top:6px">${result.총예산.비고 ?? ''}</div>` : ''}

  ${subsidyRows ? `<h2>보조금 참고</h2>${subsidyRows}` : ''}

  ${result?.전문가의견 ? `
  <h2>전문가 의견</h2>
  <div style="padding:12px;background:#F7F7F5;border-radius:8px;font-size:12px;color:#555">${result.전문가의견}</div>` : ''}

  <div class="disclaimer">본 문서는 현장 사진 기반 AI 분석 참고자료이며, 설계사무소 상담 준비용입니다. 정확한 물량·예산은 드론 측량 후 확정됩니다. 보조금은 연도·지역별로 변경될 수 있으니 해당 기관에 직접 확인하세요.</div>
  </body></html>`

  const w = window.open('', '_blank')
  w.document.write(html)
  w.document.close()
  setTimeout(() => w.print(), 500)
}

function DataRow({ label, value, color }) {
  if (!value) return null
  return (
    <div style={s.dataRow}>
      <span style={{ color: '#888' }}>{label}</span>
      <span style={{ fontWeight: 500, color: color || '#1A1A1A' }}>{value}</span>
    </div>
  )
}

// ── 1단계 결과 UI ─────────────────────────────────────────────────
function FreeResult({ result, landData, onRestart }) {
  return (
    <div style={s.wrap}>

      {/* 토지 기본정보 */}
      <div style={s.card}>
        <div style={s.cardHeader}>토지 기본정보</div>
        <div style={s.cardBody}>
          <DataRow label="주소" value={landData?.토지기본?.주소} />
          <DataRow label="지목" value={landData?.토지기본?.지목} />
          <DataRow label="면적" value={landData?.토지기본?.면적} />
          <DataRow label="용도지역" value={landData?.토지특성?.용도지역} color="#0F6E56" />
          <DataRow label="도로접면" value={landData?.토지특성?.도로접면} />
          <DataRow label="공시지가" value={landData?.토지특성?.공시지가} />
        </div>
      </div>

      {/* 할 수 있는 것 / 없는 것 */}
      {result?.가능사항?.length > 0 && (
        <div style={s.card}>
          <div style={s.cardHeader}>✅ 이 땅에서 할 수 있는 것</div>
          <div style={s.cardBody}>
            {result.가능사항.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: '#0F6E56', marginBottom: 6, lineHeight: 1.6 }}>
                <span>•</span><span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {result?.불가사항?.length > 0 && (
        <div style={s.card}>
          <div style={s.cardHeader}>❌ 할 수 없는 것</div>
          <div style={s.cardBody}>
            {result.불가사항.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: '#A32D2D', marginBottom: 6, lineHeight: 1.6 }}>
                <span>•</span><span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 참고사항 */}
      {result?.참고사항 && (
        <div style={s.card}>
          <div style={s.cardHeader}>📌 참고사항</div>
          <div style={s.cardBody}>
            <div style={s.opinionBox}>{result.참고사항}</div>
          </div>
        </div>
      )}

      {/* 보조금 */}
      {result?.보조금?.length > 0 && (
        <div style={s.card}>
          <div style={s.cardHeader}>🎁 관련 보조금 참고</div>
          <div style={s.cardBody}>
            {result.보조금.map((item, i) => (
              <div key={i} style={{ padding: '10px 12px', background: '#E1F5EE', borderRadius: 8, border: '1px solid #9FE1CB', marginBottom: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#085041' }}>{item.사업명}</div>
                <div style={{ fontSize: 11, color: '#0F6E56', marginTop: 2 }}>{item.지원기관} · {item.신청조건}</div>
              </div>
            ))}
            <div style={{ fontSize: 10, color: '#aaa', marginTop: 8 }}>* 보조금은 연도별·지역별 변경될 수 있으니 해당 기관에 직접 확인하세요.</div>
          </div>
        </div>
      )}

      {/* 2단계 업셀 */}
      <div style={{ padding: '16px', background: '#FAEEDA', borderRadius: 14, border: '1px solid #FAC775' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#BA7517', marginBottom: 6 }}>더 자세한 분석이 필요하신가요?</div>
        <div style={{ fontSize: 11, color: '#BA7517', lineHeight: 1.7, marginBottom: 12 }}>
          현장 사진을 올리면 AI가 방안 A·B·C를 제안하고<br />개략 예산을 산출합니다. (9,900원)
        </div>
        <div style={{ fontSize: 11, color: '#BA7517' }}>← 이전으로 돌아가 2단계를 선택하세요</div>
      </div>

      <button style={s.restartBtn} onClick={onRestart}>← 새 현장 분석하기</button>
    </div>
  )
}

// ── 2단계 결과 UI ─────────────────────────────────────────────────
function BasicResult({ result, landData, onRestart }) {
  const [selectedPlan, setSelectedPlan] = useState(null)

  const grade = result?.현황진단?.종합등급 ?? '보통'
  const gradeStyle = GRADE_COLOR[grade] ?? GRADE_COLOR['보통']
  const plans = result?.방안 ?? []
  const recommended = result?.추천방안

  return (
    <div style={s.wrap}>

      {/* 현황 진단 */}
      <div style={s.card}>
        <div style={s.cardHeader}>현황 진단</div>
        <div style={s.cardBody}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: gradeStyle.dot, flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>
              {landData?.토지기본?.주소} {landData?.토지기본?.지번}
            </div>
            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 500, background: gradeStyle.bg, color: gradeStyle.color }}>
              {grade}
            </span>
          </div>

          {result?.현황진단?.한줄요약 && (
            <div style={{ fontSize: 14, fontWeight: 500, color: '#1A1A1A', marginBottom: 10 }}>
              {result.현황진단.한줄요약}
            </div>
          )}

          {result?.현황진단?.주요발견?.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, fontSize: 12, color: '#555', marginBottom: 5, lineHeight: 1.6 }}>
              <span>•</span><span>{item}</span>
            </div>
          ))}

          {result?.현황진단?.주의사항?.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {result.현황진단.주의사항.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, fontSize: 12, color: '#BA7517', marginBottom: 5, lineHeight: 1.6 }}>
                  <span>⚠</span><span>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 방안 A · B · C */}
      {plans.length > 0 && (
        <div style={s.card}>
          <div style={s.cardHeader}>구현 방안 비교</div>
          <div style={s.cardBody}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {plans.map((plan, i) => {
                const label = ['A', 'B', 'C'][i]
                const isRec = recommended === label
                const isActive = selectedPlan === i
                return (
                  <div
                    key={i}
                    onClick={() => setSelectedPlan(isActive ? null : i)}
                    style={{
                      flex: 1, padding: '10px 8px', borderRadius: 10, textAlign: 'center',
                      border: `2px solid ${isActive ? '#0F6E56' : '#E8E8E8'}`,
                      background: isActive ? '#E1F5EE' : '#F7F7F5',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontSize: 16, fontWeight: 700, color: isActive ? '#0F6E56' : '#555' }}>
                      방안 {label}
                    </div>
                    <div style={{ fontSize: 10, color: isRec ? '#BA7517' : '#aaa', marginTop: 2 }}>
                      {isRec ? '⭐ 추천' : plan.방향?.substring(0, 8) + '...'}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 선택된 방안 상세 */}
            {selectedPlan !== null && plans[selectedPlan] && (() => {
              const plan = plans[selectedPlan]
              const label = ['A', 'B', 'C'][selectedPlan]
              const isRec = recommended === label
              return (
                <div style={{ padding: '14px', background: '#F7F7F5', borderRadius: 10, border: `1px solid ${isRec ? '#FAC775' : '#E8E8E8'}` }}>
                  {isRec && (
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#BA7517', marginBottom: 6 }}>⭐ 추천 방안</div>
                  )}
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 8 }}>{plan.방향}</div>
                  <div style={{ fontSize: 12, color: '#555', marginBottom: 10, lineHeight: 1.7 }}>{plan.설명}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ flex: 1, padding: '10px', background: '#E1F5EE', borderRadius: 8 }}>
                      <div style={{ fontSize: 10, color: '#0F6E56', marginBottom: 4 }}>장점</div>
                      {plan.장점?.map((p, i) => (
                        <div key={i} style={{ fontSize: 11, color: '#0F6E56', marginBottom: 3 }}>✓ {p}</div>
                      ))}
                    </div>
                    <div style={{ flex: 1, padding: '10px', background: '#FCEBEB', borderRadius: 8 }}>
                      <div style={{ fontSize: 10, color: '#A32D2D', marginBottom: 4 }}>단점</div>
                      {plan.단점?.map((p, i) => (
                        <div key={i} style={{ fontSize: 11, color: '#A32D2D', marginBottom: 3 }}>• {p}</div>
                      ))}
                    </div>
                  </div>
                  {plan.예산하한 && (
                    <div style={{ marginTop: 10, padding: '8px 12px', background: '#fff', borderRadius: 8, border: '1px solid #E8E8E8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: '#888' }}>개략 예산</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#185FA5' }}>
                        {plan.예산하한?.toLocaleString()}만 ~ {plan.예산상한?.toLocaleString()}만원
                      </span>
                    </div>
                  )}
                </div>
              )
            })()}

            {selectedPlan === null && (
              <div style={{ textAlign: 'center', fontSize: 12, color: '#aaa', padding: '12px 0' }}>
                방안을 탭해서 상세 내용을 확인하세요
              </div>
            )}
          </div>
        </div>
      )}

      {/* 추천 방안 요약 */}
      {result?.추천이유 && (
        <div style={s.card}>
          <div style={s.cardHeader}>⭐ 추천 방안 {recommended} — 이유</div>
          <div style={s.cardBody}>
            <div style={s.opinionBox}>{result.추천이유}</div>
          </div>
        </div>
      )}

      {/* 총 예산 */}
      {result?.총예산 && (
        <div style={s.card}>
          <div style={s.cardHeader}>개략 예산 (추천 방안 기준)</div>
          <div style={s.cardBody}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#F7F7F5', borderRadius: 10 }}>
              <span style={{ fontSize: 11, color: '#888' }}>총 예상 비용</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#185FA5' }}>
                {result.총예산.하한?.toLocaleString()}만 ~ {result.총예산.상한?.toLocaleString()}만원
              </span>
            </div>
            <div style={{ fontSize: 10, color: '#aaa', marginTop: 8, lineHeight: 1.7 }}>
              {result.총예산.비고 ?? '현장 사진 기반 참고치입니다. 정확한 견적은 드론 측량 후 확정됩니다.'}
            </div>

            {/* 단가 출처 안내 */}
            <div style={{ marginTop: 12, padding: '10px 12px', background: '#F0F7FF', borderRadius: 8, border: '1px solid #C8DFF7' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#185FA5', marginBottom: 6 }}>📋 예산 산출 기준</div>
              <div style={{ fontSize: 10, color: '#555', lineHeight: 1.8 }}>
                <div>• <b>표준품셈</b> — 국토교통부 공식 원가에 이윤·관리비 35% 가산 <span style={{ color: '#aaa' }}>(오차 ±10%)</span></div>
                <div>• <b>시장시공가격</b> — 조달청 나라장터 실거래 단가 <span style={{ color: '#aaa' }}>(오차 ±10%)</span></div>
                <div>• <b>시장조사</b> — 업계 통용 견적가 기준 <span style={{ color: '#aaa' }}>(오차 ±15~20%)</span></div>
              </div>
              <div style={{ marginTop: 8, fontSize: 10, color: '#BA7517', lineHeight: 1.7 }}>
                💡 <b>절감 팁</b> — 인근 지방 중소도시 업체가 수도권 대비 10~20% 유리합니다. 반드시 2~3개 업체 비교 견적을 받으세요.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 보조금 */}
      {result?.보조금?.length > 0 && (
        <div style={s.card}>
          <div style={s.cardHeader}>🎁 보조금 매칭</div>
          <div style={s.cardBody}>
            {result.보조금.map((item, i) => (
              <div key={i} style={{ padding: '10px 12px', background: '#E1F5EE', borderRadius: 8, border: '1px solid #9FE1CB', marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: '#085041' }}>{item.사업명}</div>
                    <div style={{ fontSize: 10, color: '#0F6E56', marginTop: 2 }}>{item.지원기관} · {item.신청조건}</div>
                  </div>
                  {item.최대지원액 && (
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0F6E56' }}>최대 {item.최대지원액?.toLocaleString()}만</span>
                  )}
                </div>
              </div>
            ))}
            <div style={{ fontSize: 10, color: '#aaa', marginTop: 8 }}>* 보조금은 연도별·지역별 변경될 수 있으니 해당 기관에 직접 확인하세요.</div>
          </div>
        </div>
      )}

      {/* 전문가 의견 */}
      {result?.전문가의견 && (
        <div style={s.card}>
          <div style={s.cardHeader}>전문가 의견</div>
          <div style={s.cardBody}>
            <div style={s.opinionBox}>{result.전문가의견}</div>
          </div>
        </div>
      )}

      {/* 면책 */}
      <div style={{ padding: '12px 14px', background: '#F7F7F5', borderRadius: 10, border: '1px solid #E8E8E8', fontSize: 10, color: '#aaa', lineHeight: 1.8 }}>
        <div>• 본 보고서는 현장 사진 기반 AI 분석 참고자료이며, 설계사무소 상담 준비용입니다.</div>
        <div>• 예산은 2025년 상반기 표준품셈·시장가 기준이며, VAT 별도입니다.</div>
        <div>• 표준품셈 항목 ±10%, 시장조사 항목 ±15~20% 오차 가능합니다.</div>
        <div>• 정확한 물량·금액은 드론 측량 및 현장 실측 후 확정됩니다.</div>
        <div>• 보조금은 연도·지역별 변경될 수 있으니 해당 기관에 직접 확인하세요.</div>
      </div>

      {/* PDF */}
      <div style={s.pdfRow} onClick={() => downloadPDF(result, landData)}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#185FA5" strokeWidth="1.3">
            <rect x="3" y="1" width="12" height="16" rx="2" />
            <path d="M6 6h6M6 9h6M6 12h4" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>설계사무소 지참용 PDF</div>
          <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>현황진단·방안비교·보조금 포함</div>
        </div>
        <span style={{ color: '#185FA5', fontSize: 18 }}>↓</span>
      </div>

      <button style={s.restartBtn} onClick={onRestart}>← 새 현장 분석하기</button>
    </div>
  )
}

// ── 메인 Step5 ────────────────────────────────────────────────────
export default function Step5({ landData, purpose, requirements, tier, photos, surveyFiles, onRestart }) {
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loadingStep, setLoadingStep] = useState(0)

  const loadingMessages = tier === 'free'
    ? ['공간정보를 분석하고 있습니다...', '법적 현황을 정리하고 있습니다...', '보고서를 작성하고 있습니다...']
    : ['현장 사진을 분석하고 있습니다...', '건물 상태를 진단하고 있습니다...', '방안 A·B·C를 구성하고 있습니다...', '예산을 산출하고 있습니다...', '보고서를 작성하고 있습니다...']

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingStep(s => (s + 1) % loadingMessages.length)
    }, 2000)
    analyze().finally(() => clearInterval(interval))
    return () => clearInterval(interval)
  }, [])

  async function analyze() {
    try {
      let photoData = []
      if (tier === 'basic' && photos.length > 0) {
        photoData = await Promise.all(
          photos.map(async (p) => {
            if (p.file) {
              const reader = new FileReader()
              const base64 = await new Promise(res => {
                reader.onload = e => res(e.target.result.split(',')[1])
                reader.readAsDataURL(p.file)
              })
              return { key: p.key, label: p.label, base64, mimeType: p.file.type }
            }
            return null
          })
        ).then(arr => arr.filter(Boolean))
      }

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ landData, purpose, requirements, photos: photoData, tier }),
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={s.wrap}>
        <div style={s.card}>
          <div style={s.cardBody}>
            <div style={s.loadingBox}>
              <div style={s.loadingIcon}>{tier === 'free' ? '📋' : '🤖'}</div>
              <div style={s.loadingTitle}>{tier === 'free' ? '토지정보 분석 중...' : 'AI 분석 중...'}</div>
              <div style={s.loadingDesc}>{loadingMessages[loadingStep]}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={s.wrap}>
        <div style={s.card}>
          <div style={s.cardBody}>
            <div style={s.errorBox}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>⚠</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#A32D2D', marginBottom: 6 }}>분석 중 오류가 발생했습니다</div>
              <div style={{ fontSize: 12, color: '#A32D2D' }}>{error}</div>
            </div>
          </div>
        </div>
        <button style={s.restartBtn} onClick={onRestart}>← 다시 시작하기</button>
      </div>
    )
  }

  if (tier === 'free') {
    return <FreeResult result={result} landData={landData} onRestart={onRestart} />
  }

  return <BasicResult result={result} landData={landData} onRestart={onRestart} />
}
