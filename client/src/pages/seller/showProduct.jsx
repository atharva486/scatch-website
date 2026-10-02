import { useState } from 'react';
import { useParams } from 'react-router-dom';
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
    <div className="w-full min-h-screen flex flex-row bg-gradient-to-br from-[#f7f7fa] to-[#e3e8f0]">
      <div className="flex flex-col flex-1 min-h-screen">
        <Navbar sidebar={sideBar} change={() => setSideBar((prev) => !prev)} logout={logout} f={0} />

        <div className="flex flex-row flex-1 w-full min-h-screen">
          <Bar sidebar={sideBar} />

          <div className="mx-10 my-8 w-full bg-gradient-to-br from-sky-300 to-sky-600 rounded-2xl shadow-md p-10">
            <p className="text-3xl font-bold text-red-800 pb-6 border-b border-gray-200">
              Product Information
            </p>

            {loading && <p className="text-lg text-gray-900">Loading product…</p>}
            {!loading && error && <p className="text-lg text-red-900">{error}</p>}
            {!loading && !error && !product && (
              <p className="text-lg text-gray-900">This product is no longer available.</p>
            )}

            {product && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 text-[#2C3E50]">
                <div className="flex justify-center items-center">
                  <ProductImage
                    src={product.image}
                    alt={product.productname || 'Product'}
                    className="w-96 h-80 object-contain bg-white/40 rounded-xl"
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-lg font-medium">Product Name</label>
                    <input
                      type="text"
                      value={product.productname || ''}
                      readOnly
                      className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 bg-white shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-lg font-medium">Price (in ₹)</label>
                    <input
                      type="number"
                      value={product.price ?? ''}
                      readOnly
                      className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 bg-white shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-lg font-medium">Description</label>
                    <textarea
                      value={product.description || ''}
                      readOnly
                      rows={4}
                      className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 bg-white shadow-sm resize-none"
                    />
                  </div>

                  <div>
                    {/* `stock` is the authoritative remaining quantity. The old
                        page read a `stock_left` field that no longer exists. */}
                    <label className="text-lg font-medium">Quantity Left</label>
                    <input
                      type="number"
                      value={product.stock ?? 0}
                      readOnly
                      className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 bg-white shadow-sm"
                    />
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
