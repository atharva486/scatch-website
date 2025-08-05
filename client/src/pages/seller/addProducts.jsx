import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../axios/api';
import Bar from '../../components/seller/sidemenuSeller';
import Navbar from '../../components/seller/navbar';
import Flashpopup from '../../components/flashpopup';

function AddProduct() {
    const navigate = useNavigate();
    const fileRef = useRef(null);
    const [sideBar, setSideBar] = useState(false);
    const [flashPopup, setFlashPopup] = useState({ visible: false, message: "", type: "" });
    const triggerFlash = (message, type) => {
        setFlashPopup({ visible: true, message, type });
        setTimeout(() => setFlashPopup({ ...flashPopup, visible: false }), 1000);
    };
    const [formData, setFormData] = useState({ productname: '', price: '', description: '', stock: '', image: null })
    const change = () => setSideBar(prev => !prev);
    const logout = async () => {
        try {
            let res = await api.post('/api/user/logout', {}, { withCredentials: true })
            if (res.data.success)
                navigate('/user/login');
            else
                triggerFlash("Not Able to Logout", "error");

        }
        catch {
            triggerFlash("Not Able to Logout", "error");
        }


    }
    const add = (e) => {
        if (e.target.type === 'file')
            setFormData(prev => ({ ...prev, image: e.target.files[0] }))
        else
            setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }
    const submit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('productname', formData.productname);
        data.append('price', formData.price);
        data.append('description', formData.description);
        data.append('image', formData.image);
        data.append('stock', formData.stock);
        let res = await api.post('/api/seller/create', data, { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } });
        if (res.data.success == true) {
            triggerFlash("Product Added Succesfully!!!","success");
        }
        else {
            if(res.data.message == true)
                triggerFlash("Enter All the Details to Add the Product","error");
            else
            triggerFlash("Something Went Wrong. Please Add again!!","error");

        }
        if (fileRef.current) {
            fileRef.current.value = null;
        }
        setFormData({ productname: '', price: '', description: '',stock:'', image: null });

    }
return (
  <div className="w-full min-h-screen flex bg-gradient-to-br from-[#fef6f6] to-[#f2f6fb] font-sans">
    <Flashpopup visible={flashPopup.visible} message={flashPopup.message} type={flashPopup.type} />
    <div className="flex flex-col flex-1 min-h-screen">
      <Navbar change={change} logout={logout} f={0} />
      <div className="flex flex-row flex-1 min-h-screen">
        <Bar sidebar={sideBar} />

        <div className="mx-8 my-10 bg-gradient-to-b from-sky-300 to-sky-700 w-full rounded-2xl shadow-lg p-10">
          <p className="text-3xl font-bold text-[#2C3E50] mb-8 border-b pb-3 border-gray-300">
            📦 List a New Product
          </p>

          <form onSubmit={submit} className="flex flex-col gap-6">
            <div className="flex flex-col">
              <label className="text-lg text-gray-700 mb-1">Product Name</label>
              <input
                type="text"
                name="productname"
                value={formData.productname}
                placeholder="e.g. Vintage Exhaust System"
                onChange={add}
                className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#f9fafb]"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-lg text-gray-700 mb-1">Price (in Rupees)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                placeholder="e.g. 4999"
                onChange={add}
                min="1"
                className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#f9fafb]"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-lg text-gray-700 mb-1">Description</label>
              <textarea
                placeholder="Detailed product description..."
                value={formData.description}
                name="description"
                rows={4}
                onChange={add}
                className="border border-gray-300 rounded-xl px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#f9fafb]"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-lg text-gray-700 mb-1">Stock</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                placeholder="e.g. 1"
                min="1"
                onChange={add}
                className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#f9fafb]"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-lg text-gray-700 mb-1">Upload Image</label>
              <input
                type="file"
                accept="image/*"
                ref={fileRef}
                name="image"
                onChange={add}
                className="border border-dashed border-blue-300 px-4 py-3 rounded-xl bg-[#f0f6ff] hover:bg-[#e4efff] transition-all duration-200"
                required
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                onClick={submit}
                className="bg-green-400 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-green-800 transition-all duration-200 "
              >
                Create Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
);

}

export default AddProduct;
