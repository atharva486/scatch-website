import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../axios/api';
import Bar from '../../components/user/sidemenu';
import Navbar from '../../components/user/navbar';
import useLogout from '../../utils/useLogout';
import ProductImage from '../../components/ProductImage';

/**
 * Single order view.
 *
 * Three bugs here:
 *   - `navigate` was called in the logout handler but never imported, so
 *     logging out from this page threw a ReferenceError;
 *   - the order was looked up by product + quantity + formatted date passed
 *     through `location.state`, which is ambiguous and gone on refresh;
 *   - the image src was hardcoded to `http://localhost:3000/images/`, so no
 *     image ever loaded outside the developer's machine.
 *
 * The route now carries the order id, and image URLs are built by `imageUrl`.
 */
function Order_details() {
  const { order_id: orderId } = useParams();
  const [sideBar, setSideBar] = useState(false);
  const logout = useLogout();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) {
      setError('No order was selected.');
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);

    api
      .post('/api/product/order_details', { order_id: orderId })
      .then((res) => {
        if (!cancelled) setOrder(res.data.order);
      })
      .catch((err) => {
        if (!cancelled) setError(err.friendlyMessage || 'Could not load this order.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return (
    <div className="w-full min-h-screen flex bg-[#FDEFEF]">
      <div className="flex flex-col flex-1">
        <Navbar sidebar={sideBar} change={() => setSideBar((prev) => !prev)} logout={logout} f={0} />

        <div className="flex flex-row flex-1 w-full">
          <Bar sidebar={sideBar} />

          <div className="mx-8 my-6 w-full bg-gradient-to-r from-sky-400 to-sky-800 text-black rounded-3xl shadow-2xl p-10 border border-[#0F346015]">
            <p className="text-4xl font-bold text-red-800 mb-8 tracking-wide">Order Details</p>

            {loading && <p className="text-lg">Loading order…</p>}

            {!loading && error && (
              <p className="text-lg text-red-900">
                {error}. <Link className="underline" to="/user/orders">Back to orders</Link>
              </p>
            )}

            {!loading && !error && order && (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col items-center">
                  <ProductImage
                    src={order.image}
                    alt={order.productname || 'product'}
                    className="w-80 h-80 object-contain rounded-xl shadow bg-white/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="text-md text-[#0F3460]">Product Name</label>
                    <input
                      type="text"
                      value={order.productname || ''}
                      readOnly
                      className="rounded-lg px-4 py-3 bg-white border-2 border-[#0F3460]/10"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-md text-[#0F3460]">Price paid per unit (₹)</label>
                    <input
                      type="number"
                      value={order.price ?? ''}
                      readOnly
                      className="rounded-lg px-4 py-3 bg-white border-2 border-[#0F3460]/10"
                    />
                  </div>

                  <div className="flex flex-col col-span-2">
                    <label className="text-md text-[#0F3460]">Description</label>
                    <textarea
                      value={order.description || ''}
                      readOnly
                      rows={3}
                      className="rounded-lg px-4 py-3 bg-white border-2 border-[#0F3460]/10 resize-none"
                    />
                  </div>

                  <div className="flex flex-col col-span-2">
                    <label className="text-md text-[#0F3460]">Address</label>
                    <textarea
                      value={order.address || ''}
                      readOnly
                      rows={2}
                      className="rounded-lg px-4 py-3 bg-white border-2 border-[#0F3460]/10 resize-none"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-md text-[#0F3460]">Order Date</label>
                    <input
                      type="text"
                      value={order.orderedAt ? new Date(order.orderedAt).toLocaleString() : ''}
                      readOnly
                      className="rounded-lg px-4 py-3 bg-white border-2 border-[#0F3460]/10"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-md text-[#0F3460]">Quantity bought</label>
                    <input
                      type="number"
                      value={order.quantity ?? ''}
                      readOnly
                      className="rounded-lg px-4 py-3 bg-white border-2 border-[#0F3460]/10"
                    />
                  </div>

                  <div className="flex flex-col col-span-2">
                    <label className="text-md text-[#0F3460]">Order total (₹)</label>
                    <input
                      type="number"
                      value={(order.price ?? 0) * (order.quantity ?? 0)}
                      readOnly
                      className="rounded-lg px-4 py-3 bg-white border-2 border-[#0F3460]/10 font-semibold"
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

export default Order_details;
