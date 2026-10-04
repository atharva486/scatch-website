import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../axios/api';
import Bar from '../../components/user/sidemenu';
import Navbar from '../../components/user/navbar';
import { useFlash } from '../../context/FlashContext';
import useFetch from '../../utils/useFetch';
import useLogout from '../../utils/useLogout';
import useSearchFilter from '../../utils/useSearchFilter';
import ProductImage from '../../components/ProductImage';

/**
 * Wishlist.
 *
 * The logout handler called `awapi.post(...)` - a typo for `api` - which threw
 * `ReferenceError: awapi is not defined` the moment anyone clicked Logout here.
 * The list also read `res.data.products` and then `item.prod.productname`; the
 * endpoint returns a flat `wishlist` array.
 */
function Wishlist() {
  const [removing, setRemoving] = useState(null);
  const [sideBar, setSideBar] = useState(false);

  const logout = useLogout();
  const { triggerFlash } = useFlash();

  const { data, loading, error, setData } = useFetch('/api/user/wishlist_products');
  const wishlist = data?.wishlist ?? [];
  const { onSearch, filtered } = useSearchFilter(wishlist, (item) => [item.productname]);

  const removeItem = async (id) => {
    setRemoving(id);
    try {
      await api.post(`/api/user/delete/wishlist_item/${id}`);
      // Update locally instead of refetching the whole wishlist.
      setData((current) => ({
        ...current,
        wishlist: (current?.wishlist ?? []).filter((item) => item._id !== id),
      }));
      triggerFlash('Removed from your wishlist', 'success');
    } catch (err) {
      triggerFlash(err.friendlyMessage || 'Could not remove that item.', 'error');
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="page-shell flex flex-row">
      <div className="flex min-h-screen flex-1 flex-col">
        <Navbar sidebar={sideBar} change={() => setSideBar((prev) => !prev)} logout={logout} f={1} name_search={onSearch} />

        <div className="flex flex-1 flex-row">
          <Bar sidebar={sideBar} />

          <div className="mx-6 my-8 w-full md:mx-10">
            <div className="mb-6">
              <p className="section-label">Saved for later</p>
              <h1 className="page-heading mt-1.5">Your wishlist</h1>
              <p className="page-sub">Parts you have saved while browsing the catalogue.</p>
            </div>

            {loading && (
              <div className="page-panel">
                <p className="text-sm text-primary-500">Loading your wishlist…</p>
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
                  Your wishlist is empty. Add parts from the{' '}
                  <Link className="font-semibold text-primary-900 underline-offset-4 hover:underline" to="/user/homepage">
                    shop
                  </Link>
                  .
                </p>
              </div>
            )}

            {filtered.length > 0 && (
              <div className="table-shell bg-white">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="w-[60px] text-center">#</th>
                      <th>Product</th>
                      <th className="w-[120px] text-center">Price</th>
                      <th className="w-[140px] text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item, index) => (
                      <tr key={item._id}>
                        <td className="text-center text-primary-400">{index + 1}</td>
                        <td>
                          <div className="flex items-center gap-3">
                            <ProductImage
                              src={item.image}
                              alt={item.productname || 'product'}
                              className="h-11 w-11 shrink-0 rounded-lg object-cover bg-surface-200"
                            />
                            <Link
                              to={`/user/product/${item._id}`}
                              className="font-medium text-primary-900 underline-offset-4 hover:text-accent-700 hover:underline"
                            >
                              {item.productname}
                            </Link>
                          </div>
                        </td>
                        <td className="text-center font-semibold text-primary-900">₹{item.price}</td>
                        <td className="text-center">
                          <button
                            type="button"
                            disabled={removing === item._id}
                            onClick={() => removeItem(item._id)}
                            className="btn-quiet px-3 py-1.5 text-xs text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                          >
                            {removing === item._id ? 'Removing…' : 'Remove'}
                          </button>
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

export default Wishlist;
