import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Bar from '../../components/seller/sidemenuSeller';
import Navbar from '../../components/seller/navbar';
import useFetch from '../../utils/useFetch';
import useLogout from '../../utils/useLogout';
import ProductImage from '../../components/ProductImage';

function ShowProduct() {
  const { product_id: productId } = useParams();
  const [sideBar, setSideBar] = useState(false);
  const logout = useLogout('/seller/login');

  const { data, loading, error } = useFetch(`/api/product/show_seller/${productId}`);
  const product = data?.product;

  return (
    <div className="page-shell flex flex-row">
      <div className="flex min-h-screen flex-1 flex-col">
        <Navbar sidebar={sideBar} change={() => setSideBar((prev) => !prev)} logout={logout} f={0} />

        <div className="flex flex-row flex-1 w-full min-h-screen">
          <Bar sidebar={sideBar} />

          <div className="mx-6 my-8 w-full md:mx-10">
            <div className="mb-6">
              <Link
                to="/seller/dashboard"
                className="text-sm font-medium text-primary-500 underline-offset-4 hover:text-primary-800 hover:underline"
              >
                ← Back to your products
              </Link>
              <h1 className="page-heading mt-2">Product information</h1>
            </div>

            {loading && (
              <div className="page-panel">
                <p className="text-sm text-primary-500">Loading product…</p>
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
                    alt={product.productname || 'Product'}
                    className="h-72 w-full rounded-xl bg-surface-100 object-contain"
                  />
                </div>

                {/* Read-only <input>s implied "you can edit this" when the real
                    editing happens on the dashboard. Plain text is honest. */}
                <div className="page-panel">
                  <dl className="flex flex-col gap-5">
                    <div>
                      <dt className="field-label">Product name</dt>
                      <dd className="text-base font-semibold text-primary-900">
                        {product.productname}
                      </dd>
                    </div>

                    <div>
                      <dt className="field-label">Price</dt>
                      <dd className="text-xl font-bold text-primary-900">₹{product.price}</dd>
                    </div>

                    <div>
                      <dt className="field-label">Description</dt>
                      <dd className="text-sm leading-relaxed text-primary-600">
                        {product.description || 'No description provided.'}
                      </dd>
                    </div>

                    <div>
                      {/* `stock` is the authoritative remaining quantity. The old
                          page read a `stock_left` field that no longer exists. */}
                      <dt className="field-label">Quantity left</dt>
                      <dd
                        className={`text-sm font-semibold ${
                          product.stock === 0 ? 'text-red-600' : 'text-sage-700'
                        }`}
                      >
                        {product.stock === 0
                          ? 'Out of stock'
                          : `${product.stock} unit${product.stock === 1 ? '' : 's'} remaining`}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-6 border-t border-primary-100 pt-5">
                    <Link to="/seller/dashboard" className="btn-primary">
                      Change price or stock
                    </Link>
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

export default ShowProduct;
