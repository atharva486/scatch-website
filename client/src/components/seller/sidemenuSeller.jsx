import React, { useState } from 'react'
import { Link } from 'react-router-dom';

function sidemenuSeller({sidebar}) {
  return (
    <>
    <div className={`transition-allduration-500 bg-gradient-to-b from-blue-600 to-blue-800 min-h-screen overflow-hidden shadow-md ${sidebar ? 'w-32  ' : 'w-0 overflow-hidden'}`}>
  <div className='flex flex-col pl-3 py-20 justify-around text-white text-sm font-medium'>
    <Link to='/seller/dashboard' className='flex items-center gap-2 text-xl hover:text-green-300 hover:translate-x-4 transition-all duration-200'>Dashboard</Link>
    <Link to='/seller/addproduct' className='flex items-center gap-2 text-xl hover:text-green-300 hover:translate-x-4 transition-all duration-200'>Add Products</Link>
    <Link to='/seller/business_dashboard' className='flex items-center gap-2 text-xl hover:text-green-300 hover:translate-x-4 transition-all duration-200'>Account Info</Link>
    <Link to='/seller/profile' className='flex items-center gap-2 text-xl hover:text-green-300 hover:translate-x-4 transition-all duration-200'>Profile</Link>
  </div>
</div>

    </>
  )
}

export default sidemenuSeller;
