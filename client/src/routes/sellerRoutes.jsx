import React from 'react'
import { Routes, Route } from 'react-router-dom';
import LoginSeller from '../pages/seller/loginSeller';
import DashboardSeller from '../pages/seller/dashboardSeller'
import RegisterSeller from '../pages/seller/registerSeller';
import AddProduct from '../pages/seller/addProducts';
import ShowProduct from '../pages/seller/showProduct';
import ProfileSeller from '../pages/seller/profileSeller';
import Business_dashboard from '../pages/seller/business_analysis';

function SellerRoutes() {
  return (
    <Routes>
    <Route path='/seller/profile' element={<ProfileSeller/>} />
    <Route path='/seller/show/:product_id' element={<ShowProduct/>} />
    <Route path='/seller/register' element={<RegisterSeller/>} />
    <Route path='/seller/login' element={<LoginSeller/>} />
    <Route path='/seller/dashboard' element={<DashboardSeller/>} />
    <Route path='/seller/addproduct' element={<AddProduct/>}/>
    <Route path='/seller/business_dashboard' element={<Business_dashboard/>}/>
    </Routes>
  )
}

export default SellerRoutes
