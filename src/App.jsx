import Home from "./Pages/Home";
import { Routes, Route } from "react-router-dom"
import Sign from "./Pages/Sign"

function App() {

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={ <Sign /> } />
    </Routes>
  )
}

export default App
