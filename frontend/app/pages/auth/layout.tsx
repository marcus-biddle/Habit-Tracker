import { useState } from 'react';
import { Link, Outlet } from 'react-router';
import Register from './register';
import Login from './login';

const AuthLayout = () => {
  const [registering, isRegistering] = useState(false);
  return (
    <div className=' relative w-full flex flex-col items-center'>
      <header className='w-full items-center flex justify-center p-6'>
        <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
          Habit Tracker
        </h1>
      </header>

      <main className='w-full '>
        <Outlet />
      </main>
    </div>
  )
}

export default AuthLayout