import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams,useNavigate  } from 'react-router-dom';
import Bar from '../../components/seller/sidemenuSeller';
import Navbar from '../../components/seller/navbar';
import Flashpopup from '../../components/flashpopup';

function ShowProduct() {
    const [flashPopup,setFlashPopup] = useState({visible:false,message: "",type:""});
  const triggerFlash = (message, type) => {
    setFlashPopup({ visible: true, message, type });
    setTimeout(() => setFlashPopup({ ...flashPopup, visible: false }), 1000); 
  };
    const navigate = useNavigate();
    const {product_id} = useParams();
    const [data,setData] = useState({});
    const [sideBar, setSideBar] = useState(false);
    const change = () => {
        setSideBar(prev => (!prev))
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
    
    const get_data = async ()=>{
        try{
            let res = await axios.get(`/api/product/show_seller/${product_id}`,{withCredentials:true});
            setData(res.data.product);
            let stock = res.data.stock_left;
            setData(prev=>({...prev,stock:stock}));
        }
        catch(err){
            triggerFlash("Something went Wrong","error");
        }
    }
    useEffect(()=>{
        get_data();
    },[])
    
return (
  <>
    <div className="w-full min-h-screen flex flex-row bg-gradient-to-br from-[#f7f7fa] to-[#e3e8f0]">
      <Flashpopup visible={flashPopup.visible} message={flashPopup.message} type={flashPopup.type} />
      <div className="flex flex-col flex-1 min-h-screen">
        <Navbar change={change} logout={logout} f={0} />
        <div className="flex flex-row flex-1 w-full min-h-screen">
          <Bar sidebar={sideBar} />
          <div className="mx-10 my-8 w-full bg-gradient-to-br from-sky-300 to-sky-600 rounded-2xl shadow-md p-10">
            <p className="text-3xl font-bold text-red-800 pb-6 border-b border-gray-200">
              Product Information
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 text-[#2C3E50]">
              <div className="flex justify-center items-center">
                <img
                  src={`http://localhost:3000/images/${data.image}`}
                  alt="Product"
                  className="w-144 h-120 object-contain "
                />
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-lg font-medium">Product Name</label>
                  <input
                    type="text"
                    name="productname"
                    value={data.productname || ""}
                    className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    disabled
                  />
                </div>

                <div>
                  <label className="text-lg font-medium">Price (in ₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={data.price || ""}
                    className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    disabled
                  />
                </div>

                <div>
                  <label className="text-lg font-medium">Description</label>
                  <textarea
                    name="description"
                    value={data.description || ""}
                    className="w-full mt-1 px-4 py-2 h-28 rounded-xl border border-gray-300 bg-white shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                    disabled
                  />
                </div>

                <div>
                  <label className="text-lg font-medium">Quantity Left</label>
                  <input
                    type="number"
                    name="stock"
                    value={data.stock ?? ""}
                    className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);

}

export default ShowProduct
