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
    <div className="page-shell flex flex-row">
      <div className="flex min-h-screen flex-1 flex-col">
        <Navbar sidebar={sideBar} change={() => setSideBar((prev) => !prev)} logout={logout} f={1} name_search={onSearch} />

        <div className="flex w-full min-h-screen flex-1 flex-row">
          <Bar sidebar={sideBar} />

          <div className="mx-6 my-8 w-full md:mx-10">
            <div className="mb-6">
              <p className="section-label">Your account</p>
              <h1 className="page-heading mt-1.5">Order history</h1>
              <p className="page-sub">Every order you have placed, most recent first.</p>
            </div>

            {loading && (
              <div className="page-panel">
                <p className="text-sm text-primary-500">Loading your orders…</p>
              </div>
            )}

            {!loading && error && (
              <div className="page-panel border-red-200">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {!loading && !error && filtered.length === 0 && (
              <div className="page-panel">
                <p className="text-sm text-primary-500">
                  No orders yet. Parts you buy will show up here.
                </p>
              </div>
            )}

            {filtered.length > 0 && (
              <div className="table-shell bg-white">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="text-center">#</th>
                      <th>Product</th>
                      <th className="text-center">Price</th>
                      <th className="text-center">Qty</th>
                      <th className="text-center">Total</th>
                      <th className="text-center">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((order, index) => (
                      <tr key={order._id}>
                        <td className="text-center font-medium text-primary-400">{index + 1}</td>
                        <td>
                          <div className="flex items-center gap-3">
                            <ProductImage
                              src={order.product?.image}
                              alt={order.product?.productname || 'product'}
                              className="h-10 w-10 shrink-0 rounded-lg object-cover bg-surface-200"
                            />
                            <Link
                              // The order id is in the URL, so the page survives a
                              // refresh or a shared link. It used to live in
                              // `location.state`, which is lost on reload.
                              to={`/user/order_details/${order._id}`}
                              className="font-medium text-primary-900 underline-offset-4 hover:text-accent-700 hover:underline"
                            >
                              {order.product?.productname ?? 'Unavailable product'}
                            </Link>
                          </div>
                        </td>
                        <td className="text-center font-medium text-sage-700">₹{order.buyPrice}</td>
                        <td className="text-center">{order.quantity}</td>
                        <td className="text-center font-semibold text-primary-900">
                          ₹{order.buyPrice * order.quantity}
                        </td>
                        <td className="text-center text-primary-500">{formatDate(order.orderedAt)}</td>
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
