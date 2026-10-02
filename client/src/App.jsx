import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import RequireAuth from './components/RequireAuth';
import { FlashProvider } from './context/FlashContext';
import NotFound from './pages/NotFound';

// Customer pages
import Buy from './pages/user/Buy';
import HomeUser from './pages/user/HomeUser';
import LoginUser from './pages/user/loginUser';
import OrderDetails from './pages/user/order_details';
import Orders from './pages/user/orders';
import ProductDetails from './pages/user/product_details';
import ProfileUser from './pages/user/profileUser';
import RegisterUser from './pages/user/registerUser';
import Wishlist from './pages/user/wishlist';

// Seller pages
import AddProduct from './pages/seller/addProducts';
import BusinessDashboard from './pages/seller/business_analysis';
import DashboardSeller from './pages/seller/dashboardSeller';
import LoginSeller from './pages/seller/loginSeller';
import ProfileSeller from './pages/seller/profileSeller';
import RegisterSeller from './pages/seller/registerSeller';
import ShowProduct from './pages/seller/showProduct';

/**
 * One flat route table.
 *
 * The app previously nested a second `<Routes>` inside each portal and gave the
 * inner routes *absolute* paths. A nested `<Routes>` only matches the part of
 * the URL the parent route did not consume, so by the time `/user/login` was
 * looked up there was nothing left to match and every page rendered the 404
 * branch. Listing every path once, here, removes that whole class of bug.
 */
function App() {
  return (
    <BrowserRouter>
      <FlashProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/user/homepage" replace />} />

          {/* --- Customer portal --- */}
          <Route path="/user/login" element={<LoginUser />} />
          <Route path="/user/register" element={<RegisterUser />} />

          <Route
            path="/user/homepage"
            element={
              <RequireAuth role="user">
                <HomeUser />
              </RequireAuth>
            }
          />
          <Route
            path="/user/orders"
            element={
              <RequireAuth role="user">
                <Orders />
              </RequireAuth>
            }
          />
          <Route
            path="/user/order_details/:order_id"
            element={
              <RequireAuth role="user">
                <OrderDetails />
              </RequireAuth>
            }
          />
          <Route
            path="/user/wishlist"
            element={
              <RequireAuth role="user">
                <Wishlist />
              </RequireAuth>
            }
          />
          <Route
            path="/user/profile"
            element={
              <RequireAuth role="user">
                <ProfileUser />
              </RequireAuth>
            }
          />
          <Route
            path="/user/product/:product_id"
            element={
              <RequireAuth role="user">
                <ProductDetails />
              </RequireAuth>
            }
          />
          <Route
            path="/user/buy/:id"
            element={
              <RequireAuth role="user">
                <Buy />
              </RequireAuth>
            }
          />

          {/* --- Seller portal --- */}
          <Route path="/seller/login" element={<LoginSeller />} />
          <Route path="/seller/register" element={<RegisterSeller />} />

          <Route
            path="/seller/dashboard"
            element={
              <RequireAuth role="seller">
                <DashboardSeller />
              </RequireAuth>
            }
          />
          <Route
            path="/seller/addproduct"
            element={
              <RequireAuth role="seller">
                <AddProduct />
              </RequireAuth>
            }
          />
          <Route
            path="/seller/business_dashboard"
            element={
              <RequireAuth role="seller">
                <BusinessDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/seller/profile"
            element={
              <RequireAuth role="seller">
                <ProfileSeller />
              </RequireAuth>
            }
          />
          <Route
            path="/seller/show/:product_id"
            element={
              <RequireAuth role="seller">
                <ShowProduct />
              </RequireAuth>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </FlashProvider>
    </BrowserRouter>
  );
}

export default App;
