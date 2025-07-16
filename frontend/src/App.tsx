import './App.css'
import { GoogleSheetsModal } from './components/GoogleSheetsModal'
import FitnessLeaderboard from './concept/FitnessLeaderboard'

function App() {

  return (
    <>
      {/* <FitnessLeaderboard /> */}
      <GoogleSheetsModal setOpen={() => true} />
    </>
  )
}

export default App
