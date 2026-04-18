import React, { useState } from 'react'
import Step1 from './components/Step1'
import Step2 from './components/Step2'
import Step3 from './components/Step3'

export default function App() {
  const [step, setStep] = useState(1)
  const [landData, setLandData] = useState(null) // 전체 공간정보 저장

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
        padding: '20px 20px 12px',
        borderBottom: '1px solid #E8E8E8',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontFamily: "'Noto Serif KR', serif", fontSize: 20, fontWeight: 700, color: '#0F6E56', letterSpacing: '-0.02em' }}>
            SiteplanAI
          </div>
          <div style={{ fontSize: 10, color: '#999', marginTop: 2 }}>
            드론 측량 기반 토목·건축 설계 지원
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{
              width: s === step ? 28 : 8, height: 8, borderRadius: 4,
              background: s === step ? '#0F6E56' : s < step ? '#9FE1CB' : '#D0D0CC',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>
      </div>

      {/* 본문 */}
      <div style={{ flex: 1, padding: '16px 16px 32px' }}>
        {step === 1 && (
          <Step1
            onNext={() => setStep(2)}
            onLandData={setLandData}
          />
        )}
        {step === 2 && (
          <Step2
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
            landData={landData}
          />
        )}
        {step === 3 && (
          <Step3
            onRestart={() => { setStep(1); setLandData(null) }}
            landData={landData}
          />
        )}
      </div>
    </div>
  )
}
