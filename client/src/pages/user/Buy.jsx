import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import Bar from '../../components/user/sidemenu'
import Navbar from '../../components/user/navbar'
import Flashpopup from '../../components/flashpopup'

function Buy() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [address, setAddress] = useState('')
  const [stock_used, setStock_used] = useState(0)
  const [quantity, setQuantity] = useState(0)
  const [data, setData] = useState({})
  const [sideBar, setSideBar] = useState(false)
  const [check, setCheck] = useState(false)
  const [flashPopup, setFlashPopup] = useState({ visible: false, message: "", type: "" })

  const triggerFlash = (message, type) => {
    setFlashPopup({ visible: true, message, type })
    setTimeout(() => setFlashPopup({ ...flashPopup, visible: false }), 1000)
  }

  const change = () => {
    setSideBar(prev => (!prev))
  }

  const logout = async () => {
    try {
      let res = await axios.post('/api/user/logout', {}, { withCredentials: true })
      if (res.data.success) navigate('/user/login')
      else triggerFlash("Not Able to Logout", "error")
    } catch {
      triggerFlash("Not Able to Logout", "error")
    }
  }

  const handleChange = (e) => {

    setQuantity(e.target.value)
  }

  const handleAddress = (e) => {
    setAddress(e.target.value)
  }

  const buy = async () => {
    try {
      let res = await axios.post(`/api/product/buy/${id}`, { quantity, data, address }, { withCredentials: true })
      if (res.data.success) navigate('/user/homepage')
      else triggerFlash("Not able to buy. Try after sometime", "error")
    } catch {
      triggerFlash("Something went wrong", "error")
    }
  }

  async function show_details(id) {
    try {
      let res = await axios.get(`/api/product/${id}`, { withCredentials: true })
      if (res.data.success) {
        setStock_used(res.data.quantity_used)
        setData(res.data.product)
      } else {
        triggerFlash("Something went wrong. Please try again.", "error")
      }
    } catch {
      triggerFlash("Something went wrong", "error")
    }
  }

  useEffect(() => {
    show_details(id)
  }, [])

  return (
    <>
  <div className='w-full min-h-screen flex bg-[#FDEFEF]  text-white'>
    <Flashpopup visible={flashPopup.visible} message={flashPopup.message} type={flashPopup.type} />
    <div className="flex flex-col flex-1">
      <Navbar change={change} logout={logout} f={0} />
      <div className="flex flex-row w-full h-full">
        <Bar sidebar={sideBar} />
        <div className="flex-1 px-10 py-8">
          <div className="bg-gradient-to-br from-blue-200 to-blue-700 rounded-2xl shadow-2xl p-8">
            <p className="text-4xl font-bold text-red-800 mb-8 tracking-wide">Product Overview</p>

            <form className="flex flex-col gap-6">
              <div>
                <img src={`http://localhost:3000/images/${data.image}`} alt="Product" className='w-120 h-80 object-cover rounded-xl shadow-lg border border-[#e9456044]' />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-lg font-medium text-[#F0F0F0]">Product Name</label>
                <input
                  type="text"
                  value={data.productname || ""}
                  disabled
                  className="bg-gray-200 text-zinc-900 border border-[#E94560] px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E94560]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-lg font-medium text-[#F0F0F0]">Price (₹)</label>
                <input
                  type="number"
                  value={data.price || ""}
                  disabled
                  className="bg-gray-200 text-zinc-900 border border-[#E94560] px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E94560]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-lg font-medium text-[#F0F0F0]">Description</label>
                <textarea
                  value={data.description || ""}
                  disabled
                  className="bg-gray-200 text-zinc-900 border border-[#E94560] px-4 py-3 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#E94560]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-lg font-medium text-[#F0F0F0]">Shipping Address</label>
                <textarea
                  onChange={handleAddress}
                  className="bg-gray-200 text-zinc-900 border border-[#E94560] px-4 py-3 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#E94560]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-lg font-medium text-[#F0F0F0]">Quantity</label>
                <input
                  type='number'
                  placeholder={0}
                  min="1"
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (["-", "+", "e", "E", "."].includes(e.key)) e.preventDefault();
                  }}
                  className="bg-gray-200 text-zinc-900 border border-[#E94560] px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E94560]"
                />
              </div>

              <div>
                <button
                  type='button'
                  onClick={() => {
                    if (quantity <= (data.stock - stock_used)) buy();
                    else {
                      setCheck(true);
                      setTimeout(() => setCheck(false), 3000);
                    }
                  }}
                  className="bg-[#E94560] hover:bg-[#ff6b81] px-8 py-3 rounded-full text-lg font-semibold tracking-wide transition-all duration-300"
                >
                  Buy Now
                </button>
              </div>
            </form>

            {check && (
              <div className='text-lg mt-6 text-yellow-300 font-semibold animate-pulse'>
                Max Available Quantity: {data.stock - stock_used}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
</>

  )
}

export default Buy
