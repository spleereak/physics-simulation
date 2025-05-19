import FrictionSimulation from "./pages/FrictionSimulation.tsx";
import {Route, Routes} from "react-router-dom";
import {VideoPlayer} from "./components/VideoPlayer.tsx";

function App() {

  return (
    <Routes>
      <Route path='/' element={<FrictionSimulation />} />
      <Route path='/video/:videoId' element={<VideoPlayer />} />
    </Routes>
  )
}

export default App
