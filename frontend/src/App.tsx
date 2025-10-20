import Header from './sections/Header'
import UserHome from './sections/UserHome'
// import FitnessLeaderboard from './concept/FitnessLeaderboard'

function App() {

  return (
    <div className=' bg-slate-900 p-8 md:p-16 '>
      <Header />
      <UserHome />
      {/* <FitnessLeaderboard /> */}
      {/* <GoogleSheetsModal setOpen={() => true} /> */}
    </div>
  )
}

export default App
