
import { DashboardLayout } from './components/DashboardLayout'
import { ActiveUserProvider } from './context/ActiveUserContext'
import Header from './sections/Header'
import UserHome from './sections/UserHome'
// import FitnessLeaderboard from './concept/FitnessLeaderboard'

function App() {

  return (
    <ActiveUserProvider>
      <>
        <DashboardLayout />
        {/* <main className=''>
          <UserHome />
        </main> */}
      </>
    </ActiveUserProvider>
    
  )
}

export default App
