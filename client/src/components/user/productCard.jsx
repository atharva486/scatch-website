import React from 'react';
import { Link } from 'react-router-dom';
import ProductImage from '../ProductImage';

/**
 * Product display card.
 *
 * @param to  where the "View Details" button navigates
 */
function ProductCard({ image, productname, price, description, stock, to, onBuy, onCart, isBuyer = true }) {
  const inStock = stock > 0;

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-primary-100 overflow-hidden transition-shadow duration-200 hover:shadow-md flex flex-col group">
      <Link to={to} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 rounded-t-2xl">
        <ProductImage
          className="h-48 w-full object-cover bg-primary-100"
          src={image}
          alt={productname || 'product'}
        />
        {/* Stock badge overlay */}
        {!inStock && (
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Out of Stock</span>
          </div>
        )}
        {inStock && stock <= 5 && (
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-100 text-accent-800">Only {stock} left</span>
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <Link to={to} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 rounded-lg">
          <h2 className="text-base font-semibold text-primary-900 line-clamp-1 group-hover:text-accent-600 transition-colors" title={productname}>
            {productname}
          </h2>
        </Link>

        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-primary-900">₹{price}</span>
          {inStock && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sage-100 text-sage-800 ml-auto">{stock} in stock</span>
          )}
        </div>

        <p className="text-sm text-primary-500 line-clamp-2">{description}</p>

        <div className="flex flex-col gap-2 pt-2 border-t border-primary-100">
          <Link
            to={to}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-primary-300 text-primary-700 hover:bg-primary-50 focus:ring-primary-500 text-center text-sm py-2"
          >
            View Details
          </Link>

          {isBuyer ? (
            <>
              <button
                type="button"
                onClick={onBuy}
                disabled={!inStock}
                className={inStock
                  ? 'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-sage-600 text-white hover:bg-sage-700 focus:ring-sage-500 active:scale-[0.98] shadow-sm text-sm py-2'
                  : 'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-primary-300 text-primary-500 cursor-not-allowed text-sm py-2'}
              >
                {inStock ? 'Buy Now' : 'Out of Stock'}
              </button>
              <button
                type="button"
                onClick={onCart}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-accent-600 text-white hover:bg-accent-700 focus:ring-accent-500 active:scale-[0.98] shadow-sm text-sm py-2"
              >
                Add to Cart
              </button>
            </>
          ) : (
            <p className="text-xs text-primary-400 text-center py-1">
              {stock} unit{stock === 1 ? '' : 's'} in stock
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;