import React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Bar from '../../components/user/sidemenu'
import Navbar from '../../components/user/navbar'
import ProductCard from '../../components/user/productCard';
import Flashpopup from '../../components/flashpopup';

function HomeUser() {
  const [searchValue, setSearchValue] = useState('');
  const [dataFound, setDataFound] = useState([]);
  const navigate = useNavigate();
  const [data, setData] = useState([{}]);
  const [sideBar, setSideBar] = useState(false);
  const [flashPopup, setFlashPopup] = useState({ visible: false, message: "", type: "" });
  const triggerFlash = (message, type) => {
    setFlashPopup({ visible: true, message, type });
    setTimeout(() => setFlashPopup({ ...flashPopup, visible: false }), 1000);
  };
  const name_search = (e) => {
    setSearchValue(e.target.value);
  }
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
  function show_details(id) {
    navigate(`/user/product/${id}`);
  }
  async function cart(id) {
    let res = await axios.post(`/api/product/add_to_cart/${id}`, { withCredentials: true });
  }
  function buy_product(id) {
    navigate(`/user/buy/${id}`);
  }
  const get_data = async () => {
    let res = await axios.get('/api/product/shop', { withCredentials: true });
    setDataFound(res.data.products);
  }
  useEffect(() => {

    get_data();

  }, [searchValue]);
  let filteredProducts = []
  if (dataFound) {
    filteredProducts = (dataFound.filter((product) =>
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
  }

  useEffect(() => {
    setData(filteredProducts);
  }, [dataFound]);


  return (
    <>
      <div className='w-full min-h-screen flex bg-[#FDEFEF] text-white'>
        <Flashpopup visible={flashPopup.visible} message={flashPopup.message} type={flashPopup.type} />
        <div className="flex flex-col flex-1">
          <Navbar change={change} logout={logout} f={1} name_search={name_search} />
          <div className="flex flex-row flex-1">
            <Bar sidebar={sideBar} />
            <div className="mx-10 my-8 w-full h-fit bg-gradient-to-br from-blue-200 to-blue-500 text-black rounded-3xl shadow-2xl p-8 border border-[#22222215]">
              <p className="text-4xl font-bold text-red-800 mb-6 tracking-wider drop-shadow-md">Shop The Best Deals</p>
              <div className="flex flex-wrap gap-8 justify-start">
                {data.map((item) => (
                  <ProductCard key={item._id} image={item.image} productname={item.productname} price={item.price} description={item.description} details={() => show_details(item._id)} buy={() => buy_product(item._id)} cart={() => cart(item._id)} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )

}

export default HomeUser
