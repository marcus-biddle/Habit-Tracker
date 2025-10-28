import { Omega } from 'lucide-react'
import { useActiveUser } from '../context/ActiveUserCotnext'
const Header = () => {
  const { user } = useActiveUser();

  return (
    <div className='relative flex justify-between text-white'>
        <div className='flex items-center gap-4'>
            <Omega className=' size-8' />
            <h2 className=' text-4xl font-bold font-serif'>{user}</h2>
        </div>
        {/* <div>
            <User className=' size-10' />
        </div> */}
    </div>
  )
}

export default Header