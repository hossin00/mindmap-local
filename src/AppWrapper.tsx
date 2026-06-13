import { useState } from 'react'
import SplashScreen from './components/SplashScreen'
import Onboarding from './components/Onboarding'
import App from './App'

const DONE_KEY = 'mindmap-local_onboarded_v1'
type Phase = 'splash' | 'onboard' | 'app'

export default function AppWrapper() {
  const [phase, setPhase] = useState<Phase>('splash')
  const features = ["Infinite canvas mind maps", "Drag and connect nodes", "Color-coded branches", "Export as image"]
  return (
    <>
      {phase === 'splash' && <SplashScreen onDone={()=>setPhase(localStorage.getItem(DONE_KEY)?'app':'onboard')} color1="#f97316" color2="#ea580c" emoji="🗺️" name="MindMap Local" tagline="Offline mind mapping and brainstorming"/>}
      {phase === 'onboard' && <Onboarding onDone={()=>{localStorage.setItem(DONE_KEY,'1');setPhase('app')}} color1="#f97316" emoji="🗺️" name="MindMap Local" features={features}/>}
      {phase === 'app' && <App/>}
    </>
  )
}