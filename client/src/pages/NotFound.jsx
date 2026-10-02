import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FDEFEF] text-center px-6">
      <p className="text-7xl font-bold text-blue-700">404</p>
      <h1 className="text-2xl font-semibold text-gray-800">This page does not exist</h1>
      <p className="text-gray-600 max-w-md">
        The link may be broken, or the page may have been moved.
      </p>
      <div className="flex gap-3 mt-2">
        <Link
          to="/user/homepage"
          className="px-5 py-2 rounded-full bg-blue-700 text-white font-medium hover:bg-blue-900 transition"
        >
          Go to shopping
        </Link>
        <Link
          to="/seller/dashboard"
          className="px-5 py-2 rounded-full bg-white border border-blue-700 text-blue-700 font-medium hover:bg-blue-50 transition"
        >
          Seller dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFound;