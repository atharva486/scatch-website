import React, { useEffect } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import api from '../../axios/api';
import Bar from '../../components/seller/sidemenuSeller'
import Navbar from '../../components/seller/navbar'
import ProductCard from '../../components/seller/productSeller';
import Flashpopup from '../../components/flashpopup';

function DashboardSeller() {
  const [searchValue, setSearchValue] = useState('');
  const [dataFound, setDataFound] = useState([]);
  const [flashPopup, setFlashPopup] = useState({ visible: false, message: "", type: "" });
  const triggerFlash = (message, type) => {
    setFlashPopup({ visible: true, message, type });
    setTimeout(() => setFlashPopup({ ...flashPopup, visible: false }), 1000);
  };
  const [data, setData] = useState([]);
  const navigate = useNavigate()
  const [sideBar, setSideBar] = useState(false);
  const change = () => {
    setSideBar(prev => (!prev))
  }
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

  const name_search = (e) => {
    setSearchValue(e.target.value);
  }
  useEffect(() => {
    const get_data = async () => {
      try {
        let res = await api.get('/api/seller/prod_names', { withCredentials: true });
        setDataFound(res.data.products);
      }
      catch (err) {
        triggerFlash("Something went wrong", "error");
      }
    }
    get_data();

  }, [searchValue]);
  let filteredProducts = (dataFound.filter((product) =>
    product.productname
      .toLowerCase()
      .replace(/\s+/g, '')
      .includes(
        searchValue
          .toLowerCase()
          .replace(/\s+/g, '')

      )
  ))
  if (filteredProducts.length === 0) {

    filteredProducts =
      (dataFound.filter((product) =>
        product.description
          .toLowerCase()
          .replace(/\s+/g, '')
          .includes(
            searchValue
              .toLowerCase()
              .replace(/\s+/g, '')

          )
      ))
  }


  useEffect(() => {
    setData(filteredProducts);
  }, [dataFound]);
return (
<>
  <div className="w-full min-h-screen flex bg-gradient-to-br from-[#f7f7fa] to-[#e3e8f0]">
    <Flashpopup visible={flashPopup.visible} message={flashPopup.message} type={flashPopup.type} />
    <div className="flex flex-col flex-1 min-h-screen">
      <Navbar change={change} logout={logout} f={1} name_search={name_search} />
      <div className="flex flex-row flex-1 w-full min-h-screen">
        <Bar sidebar={sideBar} />
        <div className="mx-10 my-8 w-full h-fit bg-gradient-to-br from-sky-300 to-sky-700 rounded-2xl shadow-lg p-8">
          <p className="text-3xl font-bold text-[#2C3E50] mb-6 border-b border-gray-300 pb-4">Your Products</p>
          <div className="flex flex-wrap gap-6 justify-start">
            {data.map((item) => (
              <ProductCard
                key={item._id}
                image={item.image}
                productname={item.productname}
                price={item.price}
                description={item.description}
                product_id={item._id}
                stock={item.stock}
              />
            ))}
            {(data.length == 0 && searchValue.length > 0) && (
              <div className="text-gray-900 text-lg">No Item of that name</div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
</>
)

}

export default DashboardSeller
