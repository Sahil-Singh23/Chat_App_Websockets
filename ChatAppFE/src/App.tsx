import { BrowserRouter,Routes,Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Room from './pages/Room'

function App() {
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
