import { useState } from 'react'
import Landing from './pages/Landing'
import LandingDemo from './pages/LandingDemo'
import Glow from './components/Glow'

function App() {
  const [count, setCount] = useState(0)

  return (
    <section className='min-h-screen'>
      <Glow></Glow>
      <Landing></Landing>
    </section>
  )
}

export default App
