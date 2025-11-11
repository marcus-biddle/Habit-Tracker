import { Omega } from 'lucide-react'
import { useActiveUser } from '../context/ActiveUserContext'
const Header = () => {
  const { user } = useActiveUser();

  return (
    <div className='relative flex gap-8 text-white p-4'>
        <div className='flex items-center gap-4'>
            <Omega className=' size-10' />
            {/* <h2 className=' text-4xl font-bold font-serif'>{user}</h2> */}
        </div>
        {/* <div>
            <User className=' size-10' />
        </div> */}
    </div>
  )
}

export default Header