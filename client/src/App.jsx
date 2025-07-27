import { useState } from 'react'
import { BrowserRouter,Routes,Route, useLocation } from "react-router-dom";
import UserRoutes from './routes/userRoutes';
import SellerRoutes from './routes/sellerRoutes';
function AppRouter() {
  const location = useLocation();

  if (location.pathname.startsWith('/seller')) {
    return <SellerRoutes/>;
  } else {
    return <UserRoutes />;
  }
}

function App(){
  return (
    <BrowserRouter>
    <AppRouter/>
    </BrowserRouter>
  )
}
export default App
