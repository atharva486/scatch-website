import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../axios/api';
import Bar from '../../components/user/sidemenu';
import Navbar from '../../components/user/navbar';
import AddressFields from '../../components/user/AddressFields';
import { useFlash } from '../../context/FlashContext';
import useFetch from '../../utils/useFetch';
import useLogout from '../../utils/useLogout';
import ProductImage from '../../components/ProductImage';
import {
  ADDRESS_FIELDS,
  EMPTY_ADDRESS,
  normaliseAddress,
  validateAddress,
  validateAddressField,
} from '../../utils/address';

/**
 * Checkout page.
 *
 * Previously it sent `data` (the whole product document) to the server and read
 * a non-existent `quantity_used` field to work out remaining stock. The backend
 * now takes the price from its own database and returns the authoritative
 * `stock`, so this page reads that directly.
 *
 * The shipping address used to be one free-text textarea that could only be
 * checked for emptiness and could not be autofilled. It is now a structured
 * form (see `components/user/AddressFields.jsx`) that the server validates
 * field by field.
 */
function Buy() {
  const { id } = useParams();
  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [addressErrors, setAddressErrors] = useState({});
  // Errors appear once a field has been left, or once submit has been pressed.
  // Validating from the first keystroke would scold someone mid-typing.
  const [addressTouched, setAddressTouched] = useState({});
  // Set once the buyer edits any field, so the prefill below stops overwriting
  // their input. This has to be an explicit flag rather than "is the form
  // non-empty?", because the prefill itself makes it non-empty -- the first
  // pass would set a default country and then block the profile name forever.
  const [addressEdited, setAddressEdited] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [quantity, setQuantity] = useState('1');
  const [sideBar, setSideBar] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const logout = useLogout();
  const { triggerFlash } = useFlash();

  const { data, loading, error } = useFetch(`/api/product/${id}`);
  const product = data?.product;

  // Prefills. The name and phone come from the profile so they never have to be
  // typed twice, and the locality comes from the buyer's most recent order so a
  // returning customer just confirms it.
  const { data: profileData } = useFetch('/api/user/profile');
  const { data: ordersData } = useFetch('/api/user/get_products');

  useEffect(() => {
    if (addressEdited) return;

    const lastShipping = ordersData?.orders?.[0]?.shipping;
    const user = profileData?.user;
    // Wait for both sources, otherwise the first pass would fill in defaults
    // and the second would have nothing left to add.
    if (!user && !lastShipping) return;

    setAddress(
      normaliseAddress({
        ...(lastShipping ?? {}),
        recipient: user?.fullname || lastShipping?.recipient || '',
        phone: String(user?.contact ?? '') || lastShipping?.phone || '',
        country: lastShipping?.country || 'India',
      })
    );
  }, [profileData, ordersData, addressEdited]);

  const requested = Number(quantity);
  const quantityValid = Number.isInteger(requested) && requested >= 1;
  const withinStock = product ? requested <= product.stock : false;

  const updateAddress = (name, value) => {
    setAddressEdited(true);
    setAddress((previous) => ({ ...previous, [name]: value }));
    // Clear the complaint as soon as the field is edited again.
    if (addressErrors[name]) setAddressErrors((previous) => ({ ...previous, [name]: '' }));
  };

  const blurAddress = (name) => {
    setAddressTouched((previous) => ({ ...previous, [name]: true }));
    const field = ADDRESS_FIELDS.find((candidate) => candidate.name === name);
    setAddressErrors((previous) => ({
      ...previous,
      [name]: field ? validateAddressField(field, address[name]) : '',
    }));
  };

  const buy = async () => {
    setSubmitAttempted(true);

    if (!quantityValid) {
      triggerFlash('Enter a whole number of at least 1 for the quantity.', 'error');
      return;
    }
    if (!withinStock) {
      triggerFlash(`Only ${product?.stock ?? 0} unit(s) are available.`, 'error');
      return;
    }

    // Validate the whole address on submit so the buyer sees every problem at
    // once, rather than fixing one field per round trip.
    const errors = validateAddress(address);
    setAddressErrors(errors);
    const invalidFields = Object.keys(errors);
    if (invalidFields.length) {
      triggerFlash('Check the highlighted delivery address fields.', 'error');
      // Move the buyer to the first problem, as a real checkout form does.
      document.getElementById(`ship-${invalidFields[0]}`)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/api/product/buy/${id}`, {
        quantity: requested,
        shipping: normaliseAddress(address),
      });
      triggerFlash('Order placed successfully', 'success');
      navigate('/user/orders', { replace: true });
    } catch (err) {
      triggerFlash(err.friendlyMessage || 'Could not place the order.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Only surface an error for a field the buyer has actually engaged with.
  const visibleAddressErrors = Object.fromEntries(
    Object.entries(addressErrors).filter(([name]) => addressTouched[name] || submitAttempted)
  );

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

                  <AddressFields
                    value={address}
                    errors={visibleAddressErrors}
                    onChange={updateAddress}
                    onBlur={blurAddress}
                  />

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
