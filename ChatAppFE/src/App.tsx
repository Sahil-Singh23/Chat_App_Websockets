import { useState } from 'react'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Glow from './components/Glow'
import Room from './pages/Room'

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Landing></Landing>}></Route>
        <Route path='/room/:roomCode' element={<Room></Room>}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
