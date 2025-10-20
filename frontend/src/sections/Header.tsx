import { Omega, User } from 'lucide-react'
import React from 'react'

const Header = () => {
  return (
    <div className='flex justify-between text-white'>
        <div>
            <Omega className=' size-10' />
        </div>
        <div>
            <User className=' size-10' />
        </div>
    </div>
  )
}

export default Header