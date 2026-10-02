import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../axios/api';
import Bar from '../../components/user/sidemenu';
import Navbar from '../../components/user/navbar';
import { useFlash } from '../../context/FlashContext';
import useFetch from '../../utils/useFetch';
import useLogout from '../../utils/useLogout';
import ProductImage from '../../components/ProductImage';

/**
 * Product detail page (customer view).
 *
 * This file previously called `navigate(...)` inside its logout handler without
 * ever calling `useNavigate`, so any failure on this page - or a click on the
 * "Buy" button once that was added - threw `ReferenceError: navigate is not
 * defined`.
 */
function Product_details() {
  const { product_id: productId } = useParams();
  const [sideBar, setSideBar] = useState(false);

  const navigate = useNavigate();
  const logout = useLogout();
  const { triggerFlash } = useFlash();

  const { data, loading, error } = useFetch(`/api/product/product_details/${productId}`);
  const product = data?.product;

  const addToWishlist = async () => {
    try {
      const res = await api.post(`/api/product/add_to_cart/${productId}`);
      triggerFlash(
        res.data.alreadyInWishlist
          ? 'That product is already in your wishlist'
          : 'Added to your wishlist',
        'success'
      );
    } catch (err) {
      triggerFlash(err.friendlyMessage || 'Could not add to your wishlist.', 'error');
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-row bg-[#FDEFEF]">
      <div className="flex flex-col flex-1 min-h-screen">
        <Navbar sidebar={sideBar} change={() => setSideBar((prev) => !prev)} logout={logout} f={0} />

        <div className="flex flex-row flex-1 min-h-screen">
          <Bar sidebar={sideBar} />

          <div className="mx-8 my-5 w-full rounded-2xl shadow-md p-10 bg-gradient-to-br from-sky-300 to-sky-700">
            <p className="text-3xl font-semibold text-red-800 mb-6">Product Information</p>

            {loading && <p className="text-lg text-gray-800">Loading…</p>}

            {!loading && error && <p className="text-lg text-red-900">{error}</p>}

            {!loading && !error && !product && (
              <p className="text-lg text-gray-800">This product is no longer available.</p>
            )}

            {product && (
              <>
                <div className="flex flex-col items-center">
                  <ProductImage
                    src={product.image}
                    alt={product.productname || 'product'}
                    className="w-96 h-96 object-contain rounded-lg shadow bg-white/40"
                  />
                </div>

                <div className="flex flex-col gap-4 mt-6">
                  <div className="flex flex-col">
                    <label className="text-lg text-white mb-1">Product Name</label>
                    <input
                      type="text"
                      value={product.productname || ''}
                      readOnly
                      className="bg-[#FDEFEF] border border-gray-300 rounded-lg px-4 py-2 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-lg text-white mb-1">Price (in Rupees)</label>
                    <input
                      type="number"
                      value={product.price ?? ''}
                      readOnly
                      className="bg-[#FDEFEF] border border-gray-300 rounded-lg px-4 py-2 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-lg text-white mb-1">Available Stock</label>
                    <input
                      type="number"
                      value={product.stock ?? 0}
                      readOnly
                      className="bg-[#FDEFEF] border border-gray-300 rounded-lg px-4 py-2 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-lg text-white mb-1">Description</label>
                    <textarea
                      value={product.description || ''}
                      readOnly
                      rows={3}
                      className="bg-[#FDEFEF] border border-gray-300 rounded-lg px-4 py-2 resize-none focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      disabled={product.stock === 0}
                      onClick={() => navigate(`/user/buy/${product._id}`)}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-full text-lg font-semibold transition"
                    >
                      {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
                    </button>

                    <button
                      type="button"
                      onClick={addToWishlist}
                      className="bg-red-500 hover:bg-red-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Product_details;
