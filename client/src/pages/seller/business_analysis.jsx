import React, { useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Bar from '../../components/seller/sidemenuSeller';
import Navbar from '../../components/seller/navbar';
import Sales_over_time from '../../components/seller/Sales_over_time';
import Total_revenue from '../../components/seller/Total_revenue';
import Sold_products from '../../components/seller/sold_products';
import Stock_item from '../../components/seller/Stock_item';
import Flashpopup from '../../components/flashpopup';

function Business_dashboard() {
  const [flashPopup,setFlashPopup] = useState({visible:false,message: "",type:""});
  const triggerFlash = (message, type) => {
    setFlashPopup({ visible: true, message, type });
    setTimeout(() => setFlashPopup({ ...flashPopup, visible: false }), 1000); 
  };
  const navigate = useNavigate();
  const [sideBar, setSideBar] = useState(false);
  const change = () => {
    setSideBar(prev => (!prev));
  }

  const logout = async ()=>{
    try{
    let res = await axios.post('/api/user/logout',{},{withCredentials:true})
    if(res.data.success)
    navigate('/user/login');
    else
      triggerFlash("Not Able to Logout","error");

    }
    catch{
      triggerFlash("Not Able to Logout","error");
    }

    
  }
return (
  <>
    <div className="w-full min-h-screen flex bg-[#F4F6F8]">
      <Flashpopup visible={flashPopup.visible} message={flashPopup.message} type={flashPopup.type} />
      <Bar sidebar={sideBar} />

      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar change={change} logout={logout} f={0} />

        <div className="mx-10 my-8 bg-gradient-to-b from-sky-300 to-sky-700 rounded-2xl shadow-lg px-6 pb-64">
          <p className="text-2xl font-semibold text-red-800 mb-4 border-b pt-5">DashBoard Analysis</p>

          <div className="w-full h-full flex flex-wrap gap-20">
            <div className="w-full h-[320px] mt-5 bg-[#F0F4FF] rounded-xl shadow-md">
              <Sales_over_time />
            </div>
            <div className="w-full h-[320px] mt-10 bg-[#F0F4FF] rounded-xl shadow-md">
              <Total_revenue />
            </div>
            <div className="w-full h-[320px] mt-10 bg-[#F0F4FF] rounded-xl shadow-md">
              <Sold_products />
            </div>
            <div className="w-full h-[320px] mt-10 bg-[#F0F4FF] rounded-xl shadow-md">
              <Stock_item />
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
)

}

export default Business_dashboard
