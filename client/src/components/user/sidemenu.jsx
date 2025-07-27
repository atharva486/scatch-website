import React from 'react'
import { Link } from 'react-router-dom';
function sidemenu({sidebar}) {
  return (
    <>
    <div className={`transition-all duration-500 ease-in-out min-h-screen ${sidebar ? 'w-40' : 'w-0'} bg-gradient-to-b from-blue-600 to-blue-800 overflow-hidden shadow-md`}>
  <div className='flex flex-col pl-3 py-20 gap-6 text-white text-sm font-medium'>
    <Link to='/user/homepage' className=' text-xl  transition-all duration-200 hover:scale-105 hover:text-green-300'>Home Page</Link>
    <Link to='/user/orders' className=' text-xl  transition-all duration-200 hover:scale-105 hover:text-green-300'>My Orders</Link>
    <Link to='/user/wishlist' className=' text-xl  transition-all duration-200 hover:scale-105 hover:text-green-300'>Wishlist</Link>
    <Link to='/user/profile' className=' text-xl  transition-all duration-200 hover:scale-105 hover:text-green-300'>Profile</Link>
  </div>
</div>

    </>
  )
}

export default sidemenu;
