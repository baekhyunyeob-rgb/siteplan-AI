import React, { useState } from 'react'
import Step1 from './components/Step1'
import Step2 from './components/Step2'
import Step3 from './components/Step3'
import Step4 from './components/Step4'
import Step5 from './components/Step5'

const STEPS = ['주소', '요구사항', '정보확인', '자료업로드', '분석결과']

// ─────────────────────────────────────────────────────────────
// 💳 결제 처리 함수 — 나중에 여기에 실제 PG 연동 코드를 넣으면 됩니다
// tier: 'free' | 'basic' | 'premium'
// 현재는 항상 성공(true)을 반환 → 실제 결제 시 PG SDK 호출로 교체
// ─────────────────────────────────────────────────────────────
export async function processTierPayment(tier) {
  if (tier === 'free') return true

  // TODO: 실제 결제 연동 시 아래 주석을 해제하고 구현
  // const amount = tier === 'basic' ? 9900 : 19900
  // const result = await PortOne.requestPayment({ amount, ... })
  // return result.success

  return true  // 현재는 결제 없이 통과
}

export default function App() {
  const [step, setStep] = useState(1)

  const [address, setAddress] = useState('')
  const [coord, setCoord] = useState(null)
  const [landData, setLandData] = useState(null)
  const [purpose, setPurpose] = useState(null)
  const [requirements, setRequirements] = useState({})
  const [photos, setPhotos] = useState([])
  const [surveyFiles, setSurveyFiles] = useState({ ortho: [], pointcloud: [] })
  // tier: 'free'(1단계 무료) | 'basic'(2단계 9,900원) | 'premium'(3단계 19,900원)
  const [tier, setTier] = useState(null)

  const goNext = () => setStep(s => s + 1)
  const goBack = () => setStep(s => s - 1)
  const goRestart = () => {
    setStep(1)
    setAddress('')
    setCoord(null)
    setLandData(null)
    setPurpose(null)
    setRequirements({})
    setPhotos([])
    setSurveyFiles({ ortho: [], pointcloud: [] })
    setTier(null)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F7F5',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: 480,
      margin: '0 auto',
    }}>
      {/* 헤더 */}
      <div style={{
        padding: '16px 20px 12px',
        borderBottom: '1px solid #E8E8E8',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div>
          <div style={{
            fontFamily: "'Noto Serif KR', serif",
            fontSize: 18,
            fontWeight: 700,
            color: '#0F6E56',
            letterSpacing: '-0.02em',
          }}>SiteplanAI</div>
          <div style={{ fontSize: 10, color: '#999', marginTop: 1 }}>
            드론 측량 기반 토목·건축 설계 지원
          </div>
        </div>

        {/* 단계 표시 — free는 3단계, basic은 5단계 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {(tier === 'free' ? [1,2,3] : [1,2,3,4,5]).map((s) => {
            const isActive = s === step
            const isDone = s < step
            return (
              <div key={s}>
                <div style={{
                  width: isActive ? 24 : 8,
                  height: 6,
                  borderRadius: 3,
                  background: isActive ? '#0F6E56' : isDone ? '#9FE1CB' : '#D0D0CC',
                  transition: 'all 0.3s ease',
                }} />
              </div>
            )
          })}
        </div>
      </div>

      {/* 단계 라벨 */}
      <div style={{
        padding: '8px 20px',
        background: '#fff',
        borderBottom: '1px solid #E8E8E8',
        fontSize: 11,
        color: '#0F6E56',
        fontWeight: 500,
      }}>
        {step}단계 · {STEPS[step - 1]}
      </div>

      {/* 본문 */}
      <div style={{ flex: 1, padding: '16px 16px 40px' }}>
        {step === 1 && (
          <Step1
            address={address}
            setAddress={setAddress}
            coord={coord}
            setCoord={setCoord}
            onNext={goNext}
          />
        )}
        {step === 2 && (
          <Step2
            address={address}
            coord={coord}
            purpose={purpose}
            setPurpose={setPurpose}
            requirements={requirements}
            setRequirements={setRequirements}
            onLandData={setLandData}
            onBack={goBack}
            onNext={goNext}
          />
        )}
        {step === 3 && (
          <Step3
            landData={landData}
            purpose={purpose}
            requirements={requirements}
            tier={tier}
            setTier={setTier}
            onBack={goBack}
            onNext={goNext}        // basic → Step4로
            onRestart={goRestart}  // free 분석 완료 후 처음으로
          />
        )}
        {step === 4 && (
          <Step4
            purpose={purpose}
            tier={tier}
            requirements={requirements}
            photos={photos}
            setPhotos={setPhotos}
            surveyFiles={surveyFiles}
            setSurveyFiles={setSurveyFiles}
            onBack={goBack}
            onNext={goNext}
          />
        )}
        {step === 5 && (
          <Step5
            landData={landData}
            purpose={purpose}
            requirements={requirements}
            tier={tier}
            photos={photos}
            surveyFiles={surveyFiles}
            onRestart={goRestart}
          />
        )}
      </div>
    </div>
  )
}
