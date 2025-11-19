import { LoginForm } from '../../components/login-form'
import { useState } from 'react'

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm email={email} setEmail={setEmail} password={password} setPassword={setPassword} />
      </div>
    </div>
  )
}
