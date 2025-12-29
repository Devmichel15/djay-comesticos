import Landing from "./Pages/Landing";
import { Routes, Route } from "react-router-dom"
import Sign from "./Pages/Sign"

function App() {

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={ <Sign /> } />
    </Routes>
  )
}

export default App
