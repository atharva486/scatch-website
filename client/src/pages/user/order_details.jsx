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
    <div className="page-shell flex">
      <div className="flex flex-col flex-1">
        <Navbar sidebar={sideBar} change={() => setSideBar((prev) => !prev)} logout={logout} f={0} />

        <div className="flex w-full flex-1 flex-row">
          <Bar sidebar={sideBar} />

          <div className="mx-6 my-8 w-full md:mx-10">
            <div className="mb-6">
              <Link
                to="/user/orders"
                className="text-sm font-medium text-primary-500 underline-offset-4 hover:text-primary-800 hover:underline"
              >
                ← Back to orders
              </Link>
              <h1 className="page-heading mt-2">Order details</h1>
              <p className="page-sub">A record of what you bought, and where it went.</p>
            </div>

            {loading && (
              <div className="page-panel">
                <p className="text-sm text-primary-500">Loading order…</p>
              </div>
            )}

            {!loading && error && (
              <div className="page-panel border-red-200">
                <p className="text-sm text-red-700">
                  {error}.{' '}
                  <Link className="font-semibold underline underline-offset-4" to="/user/orders">
                    Back to orders
                  </Link>
                </p>
              </div>
            )}

            {!loading && !error && order && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
                <div className="page-panel flex flex-col items-center">
                  <ProductImage
                    src={order.image}
                    alt={order.productname || 'product'}
                    className="h-64 w-full rounded-xl bg-surface-100 object-contain"
                  />
                  <p className="mt-4 text-center text-sm text-primary-500">Product image</p>
                </div>

                {/* These were read-only <input>s, which looked editable but
                    were not. A definition list states the same facts without
                    the false affordance. */}
                <div className="page-panel">
                  <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <dt className="field-label">Product name</dt>
                      <dd className="text-base font-semibold text-primary-900">{order.productname}</dd>
                    </div>

                    <div>
                      <dt className="field-label">Price paid per unit</dt>
                      <dd className="text-base font-medium text-sage-700">₹{order.price}</dd>
                    </div>

                    <div>
                      <dt className="field-label">Quantity bought</dt>
                      <dd className="text-base font-medium text-primary-900">{order.quantity}</dd>
                    </div>

                    <div className="sm:col-span-2">
                      <dt className="field-label">Description</dt>
                      <dd className="text-sm leading-relaxed text-primary-600">
                        {order.description || 'No description provided.'}
                      </dd>
                    </div>

                    <div className="sm:col-span-2">
                      <dt className="field-label">Shipping address</dt>
                      {/* Orders placed before the address was structured carry
                          only the one-line `address` string, so fall back to
                          it rather than rendering an empty block. */}
                      {order.shipping ? (
                        <address className="mt-1 space-y-0.5 text-sm not-italic leading-relaxed text-primary-600">
                          <span className="block font-semibold text-primary-800">
                            {order.shipping.recipient}
                          </span>
                          <span className="block">{order.shipping.line1}</span>
                          {order.shipping.line2 && (
                            <span className="block">{order.shipping.line2}</span>
                          )}
                          <span className="block">
                            {[order.shipping.city, order.shipping.state, order.shipping.postalCode]
                              .filter(Boolean)
                              .join(' ')}
                          </span>
                          <span className="block">{order.shipping.country}</span>
                          {order.shipping.phone && (
                            <span className="block pt-1 text-primary-500">
                              {order.shipping.phone}
                            </span>
                          )}
                        </address>
                      ) : (
                        <dd className="text-sm leading-relaxed text-primary-600">
                          {order.address || 'No address was recorded.'}
                        </dd>
                      )}
                    </div>

                    <div>
                      <dt className="field-label">Order date</dt>
                      <dd className="text-sm text-primary-700">
                        {order.orderedAt ? new Date(order.orderedAt).toLocaleString() : '—'}
                      </dd>
                    </div>

                    <div>
                      <dt className="field-label">Order total</dt>
                      <dd className="text-lg font-bold text-primary-900">
                        ₹{(order.price ?? 0) * (order.quantity ?? 0)}
                      </dd>
                    </div>
                  </dl>
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
