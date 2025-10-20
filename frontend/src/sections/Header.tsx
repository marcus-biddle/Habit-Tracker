import { Omega } from 'lucide-react'
const Header = () => {
  return (
    <div className='relative flex justify-between text-white p-8 md:p-16'>
        <div>
            <Omega className=' size-10' />
        </div>
        {/* <div>
            <User className=' size-10' />
        </div> */}
    </div>
  )
}

export default Header