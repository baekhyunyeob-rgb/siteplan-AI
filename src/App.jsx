import React, { useState } from 'react'
import Step1 from './components/Step1'
import Step2 from './components/Step2'
import Step3 from './components/Step3'

const appStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 24,
}

const headerStyle = {
  textAlign: 'center',
}

const logoStyle = {
  fontFamily: "'Noto Serif KR', serif",
  fontSize: 22,
  fontWeight: 700,
  color: '#0F6E56',
  letterSpacing: '-0.02em',
}

const subStyle = {
  fontSize: 11,
  color: '#999',
  marginTop: 4,
}

const stepNavStyle = {
  display: 'flex',
  gap: 8,
}

const stepDotStyle = (active) => ({
  width: active ? 24 : 8,
  height: 8,
  borderRadius: 4,
  background: active ? '#0F6E56' : '#D0D0CC',
  transition: 'all 0.3s ease',
})

export default function App() {
  const [step, setStep] = useState(1)

  return (
    <div style={appStyle}>
      <div style={headerStyle}>
        <div style={logoStyle}>SiteplanAI</div>
        <div style={subStyle}>드론 측량 기반 토목·건축 설계 지원</div>
      </div>

      <div style={stepNavStyle}>
        <div style={stepDotStyle(step === 1)} />
        <div style={stepDotStyle(step === 2)} />
        <div style={stepDotStyle(step === 3)} />
      </div>

      {step === 1 && <Step1 onNext={() => setStep(2)} />}
      {step === 2 && <Step2 onNext={() => setStep(3)} />}
      {step === 3 && <Step3 onRestart={() => setStep(1)} />}
    </div>
  )
}
