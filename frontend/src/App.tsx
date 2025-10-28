import { Sidebar } from './components/Sidebar'
import { ActiveUserProvider } from './context/ActiveUserCotnext'
import Header from './sections/Header'
import UserHome from './sections/UserHome'
// import FitnessLeaderboard from './concept/FitnessLeaderboard'

function App() {

  return (
    <ActiveUserProvider>
      <Sidebar />
      <div className='relative min-h-screen bg-slate-900 flex flex-col justify-center px-8'>
        <Header />
        <main className=''>
          <UserHome />
        </main>
      </div>
    </ActiveUserProvider>
    
  )
}

export default App
