import { useState } from 'react'
import Landing from './pages/Landing'
import LandingDemo from './pages/LandingDemo'

function App() {
  const [count, setCount] = useState(0)

  return (
    <section>
      <Landing></Landing>
      <LandingDemo></LandingDemo>
    </section>
  )
}

export default App
