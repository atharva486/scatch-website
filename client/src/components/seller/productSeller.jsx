import React, { useState } from 'react';
import api from '../../axios/api';
import {useNavigate} from 'react-router-dom';
import Flashpopup from '../flashpopup';

function ProductCard({product_id,image, productname, price, description,stock }) {
  const [flashPopup,setFlashPopup] = useState({visible:false,message: "",type:""});
  const triggerFlash = (message, type) => {
    setFlashPopup({ visible: true, message, type });
    setTimeout(() => setFlashPopup({ ...flashPopup, visible: false }), 1000); 
  };
  const [newprice,setNewPrice] = useState(price);
  const [showModal, setShowModal] = useState(false);

  const [newStock,setNewStock] =useState('');
  const [renewStock,setRenewStock] = useState(false);
  const navigate = useNavigate();
  const delete_product =  async ()=>{
    try{
    let res = await api.post(`/api/seller/delete`,{product_id},{withCredentials:true});
    if(res.data.success){
      triggerFlash("Deleted The Product Successfully","success");
    window.location.reload();
    }
    else
      triggerFlash("Something went wrong","error");
    }
    catch(err){
      triggerFlash("Something went wrong","error");
    }

  }
  const show_details =  ()=>{
    navigate(`/seller/show/${product_id}`);
  }
  const restock = ()=>{
    setRenewStock(true);
  }
  const change_price = ()=>{
    setShowModal(true);
  }
  const handleNewPrice = async ()=>{
    setShowModal(false);
    try{
    let res = await api.post(`/api/product/change_price/${product_id}`,{newprice},{withCredentials:true});
    if(!res.data.success)
      triggerFlash("Something went wrong","error");
    
    else
      triggerFlash("Changed The Price Successfully!!","success");
    }
    catch(err){
      triggerFlash("Something went wrong","error");
    }
  }
  const handleNewStock = async ()=>{
    setRenewStock(false);
    try{
    let res = await api.post(`/api/product/restock/${product_id}`,{newStock},{withCredentials:true})
      if(!res.data.success)
        triggerFlash("Something went wrong","error");
          
    else
      triggerFlash("Updated the Stock Successfully!!","success");
    }
    catch{
      triggerFlash("Something went wrong","error");
    }
  }


  return (
    <div className="w-64 rounded-2xl shadow-md bg-blue-100 border border-gray-200 hover:shadow-xl transition duration-300">
      <Flashpopup visible={flashPopup.visible} message={flashPopup.message} type={flashPopup.type} />
      <img
        className="h-48 w-full object-cover rounded-t-2xl"
        src={`https://res.cloudinary.com/dunxugggm/image/upload/${image}`}
        alt="product"
      />
      <div className="p-4 flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-gray-800">{productname}</h2>
        <p className="text-green-600 font-medium text-md">Rs.{newprice}</p>
        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        <div className='flex flex-wrap justify-between '>
          <button  onClick={show_details} className="mt-2 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md text-sm">
          View Details
        </button>
        
        <button onClick={delete_product} className="mt-2 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md text-sm">
          Delete Product
        </button>
        <button onClick={change_price} className="mt-2 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md text-sm">
          Change Price
        </button>
        <button onClick={restock} className="mt-2  bg-blue-600 hover:bg-blue-700 text-white py-1 px-1 rounded-md text-sm">
          Add New Stock
        </button>
        </div>
        {showModal && (
        <div className="fixed inset-0 bg-gradient-to-b from-sky-300 to-sky-800  bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-blue-100 p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-lg font-semibold mb-4">Change Price</h3>
            <input
              type="number"
              className="border px-3 py-2 w-full mb-4 rounded"
              placeholder="Enter quantity"
              value={newprice}
              onChange={(e) => setNewPrice(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleNewPrice}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Change The Price
              </button>
            </div>
          </div>
        </div>
      )}
      {renewStock && (
        <div className="fixed inset-0 bg-gradient-to-b from-sky-300 to-sky-800  bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-blue-100 p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-lg font-semibold mb-4">Add Stock</h3>
            <input
              type="number"
              className="border px-3 py-2 w-full mb-4 rounded"
              placeholder="Enter quantity"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRenewStock(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleNewStock}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Add New Stock
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default ProductCard;
