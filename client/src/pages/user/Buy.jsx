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
    <div className="w-full min-h-screen flex bg-[#FDEFEF]">
      <div className="flex flex-col flex-1">
        <Navbar sidebar={sideBar} change={() => setSideBar((prev) => !prev)} logout={logout} f={0} />

        <div className="flex flex-row w-full h-full">
          <Bar sidebar={sideBar} />

          <div className="flex-1 px-10 py-8">
            <div className="bg-gradient-to-br from-blue-200 to-blue-700 rounded-2xl shadow-2xl p-8">
              <p className="text-4xl font-bold text-red-800 mb-8 tracking-wide">Product Overview</p>

              {loading && <p className="text-lg text-gray-900">Loading…</p>}
              {!loading && error && <p className="text-lg text-red-900">{error}</p>}
              {!loading && !error && !product && (
                <p className="text-lg text-gray-900">This product is no longer available.</p>
              )}

              {product && (
                <form
                  className="flex flex-col gap-6"
                  onSubmit={(event) => {
                    event.preventDefault();
                    buy();
                  }}
                >
                  <div>
                    <ProductImage
                      src={product.image}
                      alt={product.productname || 'product'}
                      className="w-120 h-80 object-cover rounded-xl shadow-lg border border-[#e9456044]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-lg font-medium text-[#F0F0F0]">Product Name</label>
                    <input
                      type="text"
                      value={product.productname || ''}
                      readOnly
                      className="bg-gray-200 text-zinc-900 border border-[#E94560] px-4 py-3 rounded-md"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-lg font-medium text-[#F0F0F0]">Price (₹)</label>
                    <input
                      type="number"
                      value={product.price ?? ''}
                      readOnly
                      className="bg-gray-200 text-zinc-900 border border-[#E94560] px-4 py-3 rounded-md"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-lg font-medium text-[#F0F0F0]">
                      Available: {product.stock} unit{product.stock === 1 ? '' : 's'}
                    </label>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-lg font-medium text-[#F0F0F0]">Shipping Address</label>
                    <textarea
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      maxLength={500}
                      placeholder="Where should we deliver this?"
                      className="bg-gray-200 text-zinc-900 border border-[#E94560] px-4 py-3 rounded-md resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-lg font-medium text-[#F0F0F0]">Quantity</label>
                    <input
                      type="number"
                      placeholder="1"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(event) => setQuantity(event.target.value)}
                      onKeyDown={(event) => {
                        if (['-', '+', 'e', 'E', '.'].includes(event.key)) event.preventDefault();
                      }}
                      className="bg-gray-200 text-zinc-900 border border-[#E94560] px-4 py-3 rounded-md"
                    />
                    {quantityValid && !withinStock && (
                      <p className="text-yellow-200 font-semibold">
                        Max available quantity: {product.stock}
                      </p>
                    )}
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={submitting || product.stock === 0}
                      className="bg-[#E94560] hover:bg-[#ff6b81] disabled:bg-gray-500 disabled:cursor-not-allowed px-8 py-3 rounded-full text-lg font-semibold tracking-wide transition-all duration-300"
                    >
                      {submitting
                        ? 'Placing order…'
                        : product.stock === 0
                          ? 'Out of Stock'
                          : `Buy Now · ₹${(product.price ?? 0) * (quantityValid ? requested : 0)}`}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Buy;
