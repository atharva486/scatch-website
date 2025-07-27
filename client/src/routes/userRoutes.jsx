import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RegisterUser from '../pages/user/registerUser';
import LoginUser from '../pages/user/loginUser';
import HomeUser from '../pages/user/HomeUser';
import Buy from '../pages/user/Buy';
import ProfileUser from '../pages/user/profileUser';
import Orders from '../pages/user/orders';
import Wishlist from '../pages/user/wishlist';
import Order_details from '../pages/user/order_details';
import Product_details from '../pages/user/product_details';

function UserRoutes() {
  return (
    <Routes>
      <Route path='/user/orders' element={<Orders/>}/>
      <Route path='/user/profile' element={<ProfileUser/>} />
    <Route path='/' element={<LoginUser/>}/>
    <Route path='/user/buy/:id' element={<Buy/>} />
      <Route path='/user/homepage' element={<HomeUser/>} />
      <Route path='/user/register' element={<RegisterUser/>} />
      <Route path='/user/login' element={<LoginUser/>} />
      <Route path='/user/wishlist' element ={<Wishlist/>} />
      <Route path='/user/order_details' element={<Order_details/>} />
      <Route path='/user/product/:product_id' element={<Product_details/>} />
    </Routes>
  )
}

export default UserRoutes
