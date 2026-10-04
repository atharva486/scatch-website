import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-100 px-6 py-16">
      <div className="page-panel flex max-w-md flex-col items-center gap-4 text-center">
        <p className="text-6xl font-bold tracking-tight text-primary-300">404</p>
        <h1 className="text-xl font-semibold text-primary-900">This page does not exist</h1>
        <p className="text-sm leading-relaxed text-primary-500">
          The link may be broken, or the page may have been moved.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Link to="/user/homepage" className="btn-primary">
            Go to shopping
          </Link>
          <Link to="/seller/dashboard" className="btn-quiet">
            Seller dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;