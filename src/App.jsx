import { BrowserRouter, Route, Routes } from 'react-router'
import './App.css'
import Main from './pages/Main'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Main />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
