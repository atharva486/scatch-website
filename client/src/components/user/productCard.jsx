import React from 'react';

function ProductCard({ image, productname, price, description, buy, details, cart }) {
  return (
    <div className="w-64 rounded-2xl shadow-lg  border bg-[#FDEFEF] border-gray-200 hover:shadow-2xl transition duration-300">
      <img
        className="h-48 w-full object-cover rounded-t-2xl"
        src={`http://localhost:3000/images/${image}`}
        alt="product"
      />
      <div className="p-4 flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-gray-800 truncate">{productname}</h2>
        <p className="text-emerald-600 font-semibold text-md">₹{price}</p>
        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>

        <button
          onClick={details}
          className="mt-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white py-1 px-3 rounded-md text-sm transition"
        >
          View Details
        </button>

        <div className='flex justify-between mt-2'>
          <button
            onClick={buy}
            className="bg-[#10B981] hover:bg-[#059669] text-white py-1 px-3 rounded-md text-sm"
          >
            Buy
          </button>
          <button
            onClick={cart}
            className="bg-[#FF6B6B] hover:bg-[#e04646] text-white py-1 px-3 rounded-md text-sm"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}


export default ProductCard;
