import { BrowserRouter, Route, Routes } from 'react-router'
import './App.css'
import Main from './pages/Main'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/supply-db' element={<Main />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
