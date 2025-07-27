import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate,Link } from 'react-router-dom';
import Bar from '../../components/user/sidemenu'
import Navbar from '../../components/user/navbar'
import Flashpopup from '../../components/flashpopup';

function Orders() {
  const [flashPopup, setFlashPopup] = useState({ visible: false, message: "", type: "" });
    const triggerFlash = (message, type) => {
        setFlashPopup({ visible: true, message, type });
        setTimeout(() => setFlashPopup({ ...flashPopup, visible: false }), 1000);
    };
    const [searchValue, setSearchValue] = useState('');
    const [dataFound, setDataFound] = useState([]);
    const navigate = useNavigate();
    const [sideBar, setSideBar] = useState(false);
    const change = () => {
        setSideBar(prev => (!prev))
    }
      const name_search = (e) => {
    setSearchValue(e.target.value);
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
    const [data, setData] = useState([]);
    useEffect(() => {
      const get_data = async () => {
        let res = await axios.get('/api/user/get_products', { withCredentials: true });
        setDataFound(res.data.products);
      }
      get_data();
  
    }, [searchValue]);
      let filteredProducts = (dataFound.filter((product) =>
        product.prod.productname
          .toLowerCase()
          .replace(/\s+/g, '')
          .includes(
            searchValue
              .toLowerCase()
              .replace(/\s+/g, '')
  
          )
      ))
      if(filteredProducts.length===0){
  
       filteredProducts = 
        (dataFound.filter((product) =>
        product.time
          .toLowerCase()
          .replace(/\s+/g, '')
          .includes(
            searchValue
              .toLowerCase()
              .replace(/\s+/g, '')
  
          )
      ))
      }
    useEffect(()=>{
      setData(filteredProducts);
    },[dataFound]);
    
  return (
  <>
    <div className='w-full min-h-screen flex flex-row bg-[#FDEFEF]'>
      <Flashpopup visible={flashPopup.visible} message={flashPopup.message} type={flashPopup.type} />
      <div className="flex flex-col flex-1 min-h-screen">
        <Navbar change={change} logout={logout} f={1} name_search={name_search} />
        <div className="flex flex-row flex-1 w-full min-h-screen">
          <Bar sidebar={sideBar} />

          <div className="mx-10 my-8 w-full h-fit bg-gradient-to-br from-sky-300 to-sky-600 rounded-2xl shadow-xl p-8 border border-[#E2E8F0]">
            <h3 className='text-4xl font-bold text-red-800 mb-8 tracking-wide'>Order History</h3>

            <div className="overflow-x-auto rounded-xl">
              <table className="min-w-full text-sm border border-gray-200 shadow-md">
                <thead className="bg-[#F1F5F9] text-gray-700 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-4 py-3 border-r text-center">S.no.</th>
                    <th className="px-6 py-3 border-r text-center">Product Name</th>
                    <th className="px-6 py-3 border-r text-center">Price (₹)</th>
                    <th className="px-6 py-3 border-r text-center">Quantity</th>
                    <th className="px-6 py-3 text-center">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.map((item, index) => (
                    <tr
                      key={index}
                      className="bg-white even:bg-[#FAFAFA] hover:bg-[#f3f4f6] transition duration-150 border-t"
                    >
                      <td className="px-4 py-3 text-center font-medium border-black border-r">{index + 1}</td>
                      <td className="px-6 py-3 text-center text-[#3B82F6] border-black border-r">
                        <Link
                          to={`/user/order_details`}
                          state={{
                            product_id: item.prod._id,
                            date: item.time,
                            quantity_used: item.quantity,
                          }}
                          className="hover:underline hover:text-[#2563EB] " 
                        >
                          {item.prod.productname}
                        </Link>
                      </td>
                      <td className="px-6 py-3  border-black border-r text-center text-[#10B981] font-semibold">
                        ₹{item.buy_price}
                      </td>
                      <td className="px-6 py-3 border-black border-r text-center">{item.quantity}</td>
                      <td className="px-6 py-3 border-black border-r text-center text-gray-600">{item.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    </div>
  </>
);

}

export default Orders
