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
    <div className="w-full min-h-screen flex flex-row bg-gradient-to-br from-[#f7f7fa] to-[#e3e8f0]">
      <div className="flex flex-col flex-1 min-h-screen">
        <Navbar sidebar={sideBar} change={() => setSideBar((prev) => !prev)} logout={logout} f={1} name_search={onSearch} />

        <div className="flex flex-row flex-1">
          <Bar sidebar={sideBar} />

          <div className="mx-10 my-8 w-full h-fit bg-gradient-to-br from-sky-300 to-sky-600 rounded-2xl shadow-md p-8">
            <h3 className="text-4xl font-bold text-red-800 pb-6 border-b border-gray-200">
              Your Wishlist
            </h3>

            {loading && <p className="text-lg text-gray-900">Loading your wishlist…</p>}
            {!loading && error && <p className="text-lg text-red-900">{error}</p>}
            {!loading && !error && filtered.length === 0 && (
              <p className="text-lg text-gray-900">
                Your wishlist is empty. Add products from the{' '}
                <Link className="underline" to="/user/homepage">
                  shop
                </Link>
                .
              </p>
            )}

            {filtered.length > 0 && (
              <div className="overflow-x-auto rounded-2xl shadow-md mt-6 bg-white">
                <table className="w-full table-fixed">
                  <thead className="bg-[#f4f4f7] text-[#333]">
                    <tr>
                      <th className="w-[60px] border-r px-2 py-3 text-center text-sm font-semibold">
                        S.no.
                      </th>
                      <th className="border-r px-6 py-3 text-left text-sm font-semibold">
                        Product
                      </th>
                      <th className="w-[120px] border-r px-6 py-3 text-center text-sm font-semibold">
                        Price (₹)
                      </th>
                      <th className="w-[180px] px-6 py-3 text-center text-sm font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-[#555]">
                    {filtered.map((item, index) => (
                      <tr key={item._id} className="border-b hover:bg-[#fdfdfd] transition duration-150">
                        <td className="border-r py-2 text-center">{index + 1}</td>
                        <td className="border-r py-2">
                          <div className="flex items-center gap-3 px-2">
                            <ProductImage
                              src={item.image}
                              alt={item.productname || 'product'}
                              className="h-12 w-12 rounded object-cover bg-gray-200"
                            />
                            <Link
                              to={`/user/product/${item._id}`}
                              className="text-[#1d4ed8] hover:underline"
                            >
                              {item.productname}
                            </Link>
                          </div>
                        </td>
                        <td className="border-r py-2 text-center">{item.price}</td>
                        <td className="py-2 text-center">
                          <button
                            type="button"
                            disabled={removing === item._id}
                            onClick={() => removeItem(item._id)}
                            className="text-sm text-red-500 hover:text-red-600 hover:underline transition disabled:opacity-50"
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
