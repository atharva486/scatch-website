import React from 'react'
import { useState, useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import Bar from '../../components/user/sidemenu'
import Navbar from '../../components/user/navbar'
import Flashpopup from '../../components/flashpopup';

function Order_details() {

    const [data, setData] = useState({});
    const { state } = useLocation();
    const { product_id, date, quantity_used } = state || {};
    const [sideBar, setSideBar] = useState(false);
    const [flashPopup, setFlashPopup] = useState({ visible: false, message: "", type: "" });
    const triggerFlash = (message, type) => {
        setFlashPopup({ visible: true, message, type });
        setTimeout(() => setFlashPopup({ ...flashPopup, visible: false }), 1000);
    };
    const change = () => {
        setSideBar(prev => (!prev))
    }
    const logout = async () => {
        try {
            let res = await axios.post('/api/user/logout', {}, { withCredentials: true })
            if (res.data.success)
                navigate('/user/login');
            else
                triggerFlash("Not Able to Logout", "error");
        }
        catch (err) {
            triggerFlash("Not Able to Logout", "error");
        }
    }
    async function show_details() {
        try {
            let res = await axios.post('/api/product/order_details', { product_id, date, quantity_used }, { withCredentials: true });
            if (res.data.success)
                setData(res.data.data_req);
            else
                triggerFlash("Not Able to Load Page.PLease Try Again Later", "error");
        } catch (err) {
            triggerFlash("Failed to fetch the order details.PLease try Again", "error");

        }
    }

    useEffect(() => { show_details() }, []);

    return (
        <>
            <Flashpopup visible={flashPopup.visible} message={flashPopup.message} type={flashPopup.type} />
            <div className='w-full min-h-screen flex bg-[#FDEFEF] text-white'>
                <div className="flex flex-col flex-1">
                    <Navbar change={change} logout={logout} f={0} />
                    <div className="flex flex-row flex-1 w-full">
                        <Bar sidebar={sideBar} />
                        <div className="mx-8 my-6 w-full bg-gradient-to-r from-sky-400 to-sky-800 text-black rounded-3xl shadow-2xl p-10 border border-[#0F346015]">
                            <p className="text-4xl font-bold text-red-800 mb-8 tracking-wide drop-shadow-sm">Order History</p>
                            <form className="flex flex-col gap-5">
                                <div className="flex flex-col items-center">
                                    <img src={`http://localhost:3000/images/${data.image}`} alt="image_Product" className='w-80 h-80 object-contain rounded-xl shadow' />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex flex-col">
                                        <label className="text-md text-[#0F3460]">Product Name</label>
                                        <input type="text" name='productname' value={data.productname || ""} className="rounded-lg px-4 py-3 bg-white border-2 border-[#0F3460]/10 focus:outline-none focus:ring-2 focus:ring-[#E94560]" disabled />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-md text-[#0F3460]">Price (in ₹)</label>
                                        <input type="number" name='price' value={data.price || ""} className="rounded-lg px-4 py-3 bg-white border-2 border-[#0F3460]/10 focus:outline-none focus:ring-2 focus:ring-[#E94560]" disabled />
                                    </div>
                                    <div className="flex flex-col col-span-2">
                                        <label className="text-md text-[#0F3460]">Description</label>
                                        <textarea value={data.description || ""} name='description' className="rounded-lg px-4 py-3 bg-white border-2 border-[#0F3460]/10 resize-none focus:outline-none focus:ring-2 focus:ring-[#E94560]" disabled />
                                    </div>
                                    <div className="flex flex-col col-span-2">
                                        <label className="text-md text-[#0F3460]">Address</label>
                                        <textarea name='address' value={data.address || ""} className="rounded-lg px-4 py-3 bg-white border-2 border-[#0F3460]/10 resize-none focus:outline-none focus:ring-2 focus:ring-[#E94560]" disabled />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-md text-[#0F3460]">Order Date</label>
                                        <input type="text" name='date' value={data.date || ""} className="rounded-lg px-4 py-3 bg-white border-2 border-[#0F3460]/10 focus:outline-none focus:ring-2 focus:ring-[#E94560]" disabled />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-md text-[#0F3460]">Quantity U Bought</label>
                                        <input type='number' value={data.quantity_used || ''} name='quantity' className="rounded-lg px-4 py-3 bg-white border-2 border-[#0F3460]/10 focus:outline-none focus:ring-2 focus:ring-[#E94560]" disabled />
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )

}

export default Order_details
