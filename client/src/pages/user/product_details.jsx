import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
    <div className="page-shell flex flex-row">
      <div className="flex min-h-screen flex-1 flex-col">
        <Navbar sidebar={sideBar} change={() => setSideBar((prev) => !prev)} logout={logout} f={0} />

        <div className="flex w-full min-h-screen flex-1 flex-row">
          <Bar sidebar={sideBar} />

          <div className="mx-6 my-8 w-full md:mx-10">
            <div className="mb-6">
              <Link
                to="/user/homepage"
                className="text-sm font-medium text-primary-500 underline-offset-4 hover:text-primary-800 hover:underline"
              >
                ← Back to shop
              </Link>
              <h1 className="page-heading mt-2">Product information</h1>
            </div>

            {loading && (
              <div className="page-panel">
                <p className="text-sm text-primary-500">Loading…</p>
              </div>
            )}

            {!loading && error && (
              <div className="page-panel border-red-200">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {!loading && !error && !product && (
              <div className="page-panel">
                <p className="text-sm text-primary-500">This product is no longer available.</p>
              </div>
            )}

            {product && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="page-panel flex items-center justify-center">
                  <ProductImage
                    src={product.image}
                    alt={product.productname || 'product'}
                    className="h-80 w-full rounded-xl bg-surface-100 object-contain"
                  />
                </div>

                {/* Read-only <input>s implied "you can edit this". Plain
                    definition text states the same facts honestly. */}
                <div className="page-panel">
                  <h2 className="text-xl font-bold tracking-tight text-primary-900">
                    {product.productname}
                  </h2>

                  <div className="mt-5 flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-primary-900">₹{product.price}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        product.stock > 0 ? 'bg-sage-100 text-sage-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>

                  <p className="mt-5 text-sm leading-relaxed text-primary-600">
                    {product.description || 'No description provided.'}
                  </p>

                  <div className="mt-7 flex flex-col gap-3 border-t border-primary-100 pt-6 sm:flex-row">
                    <button
                      type="button"
                      disabled={product.stock === 0}
                      onClick={() => navigate(`/user/buy/${product._id}`)}
                      className="btn-sage"
                    >
                      {product.stock === 0 ? 'Out of stock' : 'Buy now'}
                    </button>

                    <button type="button" onClick={addToWishlist} className="btn-primary">
                      Add to wishlist
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Product_details;
