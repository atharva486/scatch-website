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
 * Checkout page.
 *
 * Previously it sent `data` (the whole product document) to the server and read
 * a non-existent `quantity_used` field to work out remaining stock. The backend
 * now takes the price from its own database and returns the authoritative
 * `stock`, so this page reads that directly.
 */
function Buy() {
  const { id } = useParams();
  const [address, setAddress] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [sideBar, setSideBar] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const logout = useLogout();
  const { triggerFlash } = useFlash();

  const { data, loading, error } = useFetch(`/api/product/${id}`);
  const product = data?.product;

  const requested = Number(quantity);
  const quantityValid = Number.isInteger(requested) && requested >= 1;
  const withinStock = product ? requested <= product.stock : false;

  const buy = async () => {
    if (!quantityValid) {
      triggerFlash('Enter a whole number of at least 1 for the quantity.', 'error');
      return;
    }
    if (!address.trim()) {
      triggerFlash('Enter a shipping address to place the order.', 'error');
      return;
    }
    if (!withinStock) {
      triggerFlash(`Only ${product?.stock ?? 0} unit(s) are available.`, 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/api/product/buy/${id}`, {
        quantity: requested,
        address: address.trim(),
      });
      triggerFlash('Order placed successfully', 'success');
      navigate('/user/orders', { replace: true });
    } catch (err) {
      triggerFlash(err.friendlyMessage || 'Could not place the order.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell flex">
      <div className="flex flex-col flex-1">
        <Navbar sidebar={sideBar} change={() => setSideBar((prev) => !prev)} logout={logout} f={0} />

        <div className="flex w-full flex-1 flex-row">
          <Bar sidebar={sideBar} />

          <div className="mx-6 my-8 w-full md:mx-10">
            <div className="mb-6">
              <Link
                to={`/user/product/${id}`}
                className="text-sm font-medium text-primary-500 underline-offset-4 hover:text-primary-800 hover:underline"
              >
                ← Back to product
              </Link>
              <h1 className="page-heading mt-2">Checkout</h1>
              <p className="page-sub">Confirm where this should be delivered.</p>
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
              <form
                className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]"
                onSubmit={(event) => {
                  event.preventDefault();
                  buy();
                }}
              >
                <div className="page-panel flex flex-col gap-6">
                  <ProductImage
                    src={product.image}
                    alt={product.productname || 'product'}
                    className="h-64 w-full rounded-xl border border-primary-100 bg-surface-100 object-cover"
                  />

                  <div>
                    <p className="section-label">Ordering</p>
                    <h2 className="mt-1.5 text-xl font-bold tracking-tight text-primary-900">
                      {product.productname}
                    </h2>
                  </div>

                  <div>
                    <label className="field-label" htmlFor="address">
                      Shipping address
                    </label>
                    <textarea
                      id="address"
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      maxLength={500}
                      placeholder="Where should we deliver this?"
                      className="field-input resize-none"
                    />
                  </div>

                  <div>
                    <label className="field-label" htmlFor="quantity">
                      Quantity
                    </label>
                    <input
                      id="quantity"
                      type="number"
                      placeholder="1"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(event) => setQuantity(event.target.value)}
                      onKeyDown={(event) => {
                        if (['-', '+', 'e', 'E', '.'].includes(event.key)) event.preventDefault();
                      }}
                      className="field-input w-32"
                    />
                    <p className="field-hint">
                      {product.stock} unit{product.stock === 1 ? '' : 's'} available.
                    </p>
                    {quantityValid && !withinStock && (
                      <p className="mt-1.5 text-xs font-semibold text-red-600">
                        Max available quantity: {product.stock}
                      </p>
                    )}
                  </div>
                </div>

                {/* Summary stays visible next to the form so the total never
                    scrolls out of reach while editing. */}
                <div className="page-panel h-fit lg:sticky lg:top-8">
                  <p className="section-label">Order summary</p>

                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-primary-500">Unit price</dt>
                      <dd className="font-medium text-primary-900">₹{product.price}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-primary-500">Quantity</dt>
                      <dd className="font-medium text-primary-900">
                        {quantityValid ? requested : 0}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-primary-500">Delivery</dt>
                      <dd className="font-medium text-sage-700">Free</dd>
                    </div>
                  </dl>

                  <div className="mt-4 flex items-baseline justify-between border-t border-primary-100 pt-4">
                    <span className="text-sm font-semibold text-primary-500">Total</span>
                    <span className="text-2xl font-bold text-primary-900">
                      ₹{(product.price ?? 0) * (quantityValid ? requested : 0)}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || product.stock === 0}
                    className="btn-primary mt-5 w-full"
                  >
                    {submitting
                      ? 'Placing order…'
                      : product.stock === 0
                        ? 'Out of stock'
                        : 'Place order'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Buy;
