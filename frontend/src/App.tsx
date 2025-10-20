import Header from './sections/Header'
import UserHome from './sections/UserHome'
// import FitnessLeaderboard from './concept/FitnessLeaderboard'

function App() {

  return (
    <div className='relative min-h-screen bg-slate-900 flex flex-col justify-center'>
      <Header />
      <main className='px-8 mb-8 md:px-16'>
        <UserHome />
      </main>
    </div>
  )
}

export default App
