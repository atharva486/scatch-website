import React from 'react';
import { Link } from 'react-router-dom';
import ProductImage from '../ProductImage';

/**
 * @param to  where the "View Details" button navigates
 */
function ProductCard({ image, productname, price, description, stock, to, onBuy, onCart, isBuyer = true }) {
  return (
    <div className="w-64 rounded-2xl shadow-lg border bg-[#FDEFEF] border-gray-200 hover:shadow-2xl transition duration-300 flex flex-col">
      <Link to={to} className="block">
        <ProductImage
          className="h-48 w-full object-cover rounded-t-2xl bg-gray-200"
          src={image}
          alt={productname || 'product'}
         
        />
      </Link>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <h2 className="text-lg font-semibold text-gray-800 truncate" title={productname}>
          {productname}
        </h2>
        <p className="text-emerald-600 font-semibold">₹{price}</p>
        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>

        <Link
          to={to}
          className="mt-2 text-center bg-[#3B82F6] hover:bg-[#2563EB] text-white py-1 px-3 rounded-md text-sm transition"
        >
          View Details
        </Link>

        {isBuyer ? (
          <>
            <button
              type="button"
              onClick={onBuy}
              disabled={stock === 0}
              className="bg-[#10B981] hover:bg-[#059669] disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-1 px-3 rounded-md text-sm transition"
            >
              {stock === 0 ? 'Out of stock' : 'Buy'}
            </button>
            <button
              type="button"
              onClick={onCart}
              className="bg-[#FF6B6B] hover:bg-[#e04646] text-white py-1 px-3 rounded-md text-sm transition"
            >
              Add to Cart
            </button>
          </>
        ) : (
          <p className="text-xs text-gray-500 text-center">
            {stock} unit{stock === 1 ? '' : 's'} in stock
          </p>
        )}
      </div>
    </div>
  );
}

export default ProductCard;