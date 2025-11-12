import React, { useState } from 'react'
import Login from './login';
import Register from './register';
import { Link, Outlet } from 'react-router';

const AuthLayout = () => {
    const [isCreatingAccount, setCreatingAccount] = useState(false);

  return (
    <div>
      <header>
        <h2>Auth Section</h2>
        <nav>
          <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
        </nav>
      </header>

      <main>
        {/* Child auth route elements like login/register render here */}
        <Outlet />
      </main>
    </div>
  )
}

export default AuthLayout