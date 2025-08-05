import React from 'react'
import { useState, useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom';
import api from '../../axios/api';
import Bar from '../../components/user/sidemenu'
import Navbar from '../../components/user/navbar'
import Flashpopup from '../../components/flashpopup';

function Product_details() {
    const [data, setData] = useState({});
        let {product_id} = useParams();
        const [sideBar, setSideBar] = useState(false);
        const [flashPopup,setFlashPopup] = useState({visible:false,message: "",type:""});
        const triggerFlash = (message, type) => {
        setFlashPopup({ visible: true, message, type });
        setTimeout(() => setFlashPopup({ ...flashPopup, visible: false }), 1000); 
        };
        const change = () => {
            setSideBar(prev => (!prev))
        }
        const logout = async () => {
            try{
            let res = await api.post('/api/user/logout', {}, { withCredentials: true })
            if(res.data.success)
            navigate('/user/login');
            else
              triggerFlash("Not Able to Logout","error");  
            }
            catch(err){
                triggerFlash("Not Able to Logout","error");
            }
        }
        async function show_details() {
            try {

                let res = await api.get(`/api/product/product_details/${product_id}`, { withCredentials: true });

                if(res.data.success)
                setData(res.data.product);
                else
                triggerFlash("Not Able to Load Page.PLease Try Again Later","error");
            
            } catch (err) {
                triggerFlash("Failed to fetch the order details.PLease try Again","error");
    
            }
        }
    
        useEffect(() => { show_details() }, []);
return (
  <>
    <div className="w-full min-h-screen flex flex-row bg-[#FDEFEF]">
      <Flashpopup visible={flashPopup.visible} message={flashPopup.message} type={flashPopup.type} />
      <div className="flex flex-col flex-1 min-h-screen">
        <Navbar change={change} logout={logout} f={0} />

        <div className="flex flex-row flex-1 min-h-screen">
          <Bar sidebar={sideBar} />

          <div className="mx-8 my-5 w-full rounded-2xl shadow-md p-10 bg-gradient-to-br from-sky-300 to-sky-700">
            <p className="text-3xl font-semibold text-red-800 mb-6">
              Product Information...
            </p>

            <form className="flex flex-col gap-4">
              <div className="flex flex-col items-center">
                <img
                  src={`https://res.cloudinary.com/dunxugggm/image/upload/${data.image}`}
                  alt="image_Product"
                  className="w-96 h-96 object-contain rounded-lg shadow"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-lg text-white mb-1">Product Name</label>
                <input
                  type="text"
                  name="productname"
                  value={data.productname || ""}
                  className="bg-[#FDEFEF] border border-gray-300 rounded-lg px-4 py-2 focus:outline-none"
                  disabled
                />
              </div>

              <div className="flex flex-col">
                <label className="text-lg text-white mb-1">Price (in Rupees)</label>
                <input
                  type="number"
                  name="price"
                  value={data.price || ""}
                  className="bg-[#FDEFEF] border border-gray-300 rounded-lg px-4 py-2 focus:outline-none"
                  disabled
                />
              </div>

              <div className="flex flex-col">
                <label className="text-lg text-white mb-1">Description</label>
                <textarea
                  name="description"
                  value={data.description || ""}
                  className="bg-[#FDEFEF] border border-gray-300 rounded-lg px-4 py-2 resize-none focus:outline-none"
                  disabled
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </>
);

}

export default Product_details
