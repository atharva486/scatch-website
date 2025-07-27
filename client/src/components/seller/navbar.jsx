import React, { useEffect } from 'react'
import axios from 'axios'
import { useState } from 'react'

function Navbar({ change, logout, f, name_search }) {




  return (
    <>
      <div className='w-full h-20 bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-between px-6 shadow-md'>
        <button onClick={change} className='text-white text-base font-medium hover:text-green-300 transition'>☰ Side Bar</button>
        <div className='text-white text-3xl font-bold tracking-wide'>Scatch</div>
        {f===1 && (<input type='text' placeholder='🔍 Search Product' onChange={(e) => name_search(e)} className='bg-gray-200 text-gray-800 placeholder-gray-600 rounded-full px-5 py-2 w-80 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400' />)}
        <button onClick={logout} className='text-white text-base font-medium hover:text-red-300 transition'>Logout</button>
      </div>
    </>

  )
}

export default Navbar
