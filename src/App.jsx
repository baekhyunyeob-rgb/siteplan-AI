import React, { useState } from 'react'
import Step1 from './components/Step1'
import Step2 from './components/Step2'
import Step3 from './components/Step3'
import Step4 from './components/Step4'
import Step5 from './components/Step5'

const STEPS = ['주소', '요구사항', '정보확인', '자료업로드', '분석결과']

export default function App() {
  const [step, setStep] = useState(1)

  // 전체 데이터 상태
  const [address, setAddress] = useState('')       // 입력 주소
  const [coord, setCoord] = useState(null)         // 위경도
  const [landData, setLandData] = useState(null)   // 공간정보
  const [purpose, setPurpose] = useState(null)     // 목적
  const [requirements, setRequirements] = useState({}) // 요구사항
  const [photos, setPhotos] = useState([])         // 사진
  const [surveyFiles, setSurveyFiles] = useState([]) // 측량 데이터
  const [isPremium, setIsPremium] = useState(false)  // 과금 여부

  const goNext = () => setStep(s => s + 1)
  const goBack = () => setStep(s => s - 1)

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

        {/* 단계 표시 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {STEPS.map((label, i) => {
            const s = i + 1
            const isActive = s === step
            const isDone = s < step
            return (
              <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
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
            onBack={goBack}
            onNext={goNext}
          />
        )}
        {step === 4 && (
          <Step4
            purpose={purpose}
            photos={photos}
            setPhotos={setPhotos}
            surveyFiles={surveyFiles}
            setSurveyFiles={setSurveyFiles}
            isPremium={isPremium}
            setIsPremium={setIsPremium}
            onBack={goBack}
            onNext={goNext}
          />
        )}
        {step === 5 && (
          <Step5
            landData={landData}
            purpose={purpose}
            requirements={requirements}
            photos={photos}
            surveyFiles={surveyFiles}
            isPremium={isPremium}
            onRestart={() => {
              setStep(1)
              setAddress('')
              setCoord(null)
              setLandData(null)
              setPurpose(null)
              setRequirements({})
              setPhotos([])
              setSurveyFiles([])
              setIsPremium(false)
            }}
          />
        )}
      </div>
    </div>
  )
}
