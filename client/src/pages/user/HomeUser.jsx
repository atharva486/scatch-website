import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../axios/api';
import Bar from '../../components/user/sidemenu';
import Navbar from '../../components/user/navbar';
import ProductCard from '../../components/user/productCard';
import { useFlash } from '../../context/FlashContext';
import useLogout from '../../utils/useLogout';
import useSearchFilter from '../../utils/useSearchFilter';

function HomeUser() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sideBar, setSideBar] = useState(false);

  const navigate = useNavigate();
  const logout = useLogout();
  const { triggerFlash } = useFlash();

  // Derived during render: previously the list was refetched on every keystroke
  // and copied through a second state variable, so `useState([{}])` seeded the
  // page with an empty object and `data.map` crashed before any product loaded.
  const { onSearch, filtered } = useSearchFilter(products, (product) => [
    product.productname,
    product.description,
  ]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    api
      .get('/api/product/shop')
      .then((res) => {
        if (!cancelled) setProducts(res.data.products ?? []);
      })
      .catch((err) => {
        if (!cancelled) triggerFlash(err.friendlyMessage || 'Could not load the shop.', 'error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [triggerFlash]);

  const addToWishlist = async (id) => {
    try {
      const res = await api.post(`/api/product/add_to_cart/${id}`);
      triggerFlash(
        res.data.alreadyInWishlist
          ? 'That product is already in your wishlist'
          : 'Added to your wishlist',
        'success'
      );
    } catch (err) {
      triggerFlash(err.friendlyMessage || 'Could not add to your wishlist.', 'error');
    }
  };

  return (
    <div className="page-shell flex">
      <div className="flex flex-col flex-1">
        <Navbar sidebar={sideBar} change={() => setSideBar((prev) => !prev)} logout={logout} f={1} name_search={onSearch} />

        <div className="flex flex-row flex-1">
          <Bar sidebar={sideBar} />

          <div className="mx-6 my-8 w-full md:mx-10">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="section-label">Featured catalogue</p>
                <h1 className="page-heading mt-1.5">Shop the best deals</h1>
                <p className="page-sub">
                  Genuine OEM and aftermarket parts from verified sellers, with live stock counts.
                </p>
              </div>

              <p className="text-sm font-medium text-primary-500">
                {loading
                  ? 'Loading…'
                  : `${filtered.length} ${filtered.length === 1 ? 'product' : 'products'}`}
              </p>
            </div>

            {loading && (
              <div className="page-panel">
                <p className="text-sm text-primary-500">Loading products…</p>
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="page-panel">
                <p className="text-sm text-primary-500">
                  No products match that search. Try a different term.
                </p>
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((item) => (
                  <ProductCard
                    key={item._id}
                    image={item.image}
                    productname={item.productname}
                    price={item.price}
                    description={item.description}
                    stock={item.stock}
                    to={`/user/product/${item._id}`}
                    onBuy={() => navigate(`/user/buy/${item._id}`)}
                    onCart={() => addToWishlist(item._id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeUser;
