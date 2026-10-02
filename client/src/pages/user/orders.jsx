import { useState } from 'react';
import { Link } from 'react-router-dom';
import Bar from '../../components/user/sidemenu';
import Navbar from '../../components/user/navbar';
import useFetch from '../../utils/useFetch';
import useLogout from '../../utils/useLogout';
import useSearchFilter from '../../utils/useSearchFilter';
import ProductImage from '../../components/ProductImage';

const formatDate = (value) =>
  value ? new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '';

function Orders() {
  const [sideBar, setSideBar] = useState(false);
  const { data, loading, error } = useFetch('/api/user/get_products');
  const logout = useLogout();

  // `orders` is the new shape; it used to read `res.data.products` and then
  // dereferenced `item.prod.productname`, which threw as soon as a product had
  // been deleted.
  const orders = data?.orders ?? [];
  const { onSearch, filtered } = useSearchFilter(orders, (order) => [
    order.product?.productname,
    formatDate(order.orderedAt),
  ]);

  return (
    <div className="w-full min-h-screen flex flex-row bg-[#FDEFEF]">
      <div className="flex flex-col flex-1 min-h-screen">
        <Navbar sidebar={sideBar} change={() => setSideBar((prev) => !prev)} logout={logout} f={1} name_search={onSearch} />

        <div className="flex flex-row flex-1 w-full min-h-screen">
          <Bar sidebar={sideBar} />

          <div className="mx-10 my-8 w-full h-fit bg-gradient-to-br from-sky-300 to-sky-600 rounded-2xl shadow-xl p-8 border border-[#E2E8F0]">
            <h3 className="text-4xl font-bold text-red-800 mb-8 tracking-wide">Order History</h3>

            {loading && <p className="text-lg text-gray-900">Loading your orders…</p>}
            {!loading && error && <p className="text-lg text-red-900">{error}</p>}
            {!loading && !error && filtered.length === 0 && (
              <p className="text-lg text-gray-900">No orders yet.</p>
            )}

            {filtered.length > 0 && (
              <div className="overflow-x-auto rounded-xl">
                <table className="min-w-full text-sm border border-gray-200 shadow-md">
                  <thead className="bg-[#F1F5F9] text-gray-700 uppercase text-xs tracking-wider">
                    <tr>
                      <th className="px-4 py-3 border-r text-center">S.no.</th>
                      <th className="px-6 py-3 border-r text-center">Product</th>
                      <th className="px-6 py-3 border-r text-center">Price (₹)</th>
                      <th className="px-6 py-3 border-r text-center">Quantity</th>
                      <th className="px-6 py-3 border-r text-center">Total (₹)</th>
                      <th className="px-6 py-3 text-center">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((order, index) => (
                      <tr
                        key={order._id}
                        className="bg-white even:bg-[#FAFAFA] hover:bg-[#f3f4f6] transition duration-150 border-t"
                      >
                        <td className="px-4 py-3 text-center font-medium border-black border-r">
                          {index + 1}
                        </td>
                        <td className="px-6 py-3 text-center border-black border-r">
                          <div className="flex items-center justify-center gap-3">
                            <ProductImage
                              src={order.product?.image}
                              alt={order.product?.productname || 'product'}
                              className="h-10 w-10 rounded object-cover bg-gray-200"
                            />
                            <Link
                              // The order id is in the URL, so the page survives a
                              // refresh or a shared link. It used to live in
                              // `location.state`, which is lost on reload.
                              to={`/user/order_details/${order._id}`}
                              className="text-[#1d4ed8] hover:underline"
                            >
                              {order.product?.productname ?? 'Unavailable product'}
                            </Link>
                          </div>
                        </td>
                        <td className="px-6 py-3 border-black border-r text-center text-[#10B981] font-semibold">
                          ₹{order.buyPrice}
                        </td>
                        <td className="px-6 py-3 border-black border-r text-center">{order.quantity}</td>
                        <td className="px-6 py-3 border-black border-r text-center font-semibold">
                          ₹{order.buyPrice * order.quantity}
                        </td>
                        <td className="px-6 py-3 border-black border-r text-center text-gray-600">
                          {formatDate(order.orderedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Orders;
