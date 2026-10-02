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
    <div className="w-full min-h-screen flex bg-[#FDEFEF]">
      <div className="flex flex-col flex-1">
        <Navbar sidebar={sideBar} change={() => setSideBar((prev) => !prev)} logout={logout} f={1} name_search={onSearch} />

        <div className="flex flex-row flex-1">
          <Bar sidebar={sideBar} />

          <div className="mx-10 my-8 w-full h-fit bg-gradient-to-br from-blue-200 to-blue-500 text-black rounded-3xl shadow-2xl p-8 border border-[#22222215]">
            <p className="text-4xl font-bold text-red-800 mb-6 tracking-wider drop-shadow-md">
              Shop The Best Deals
            </p>

            {loading && <p className="text-lg text-gray-700">Loading products…</p>}

            {!loading && filtered.length === 0 && (
              <p className="text-lg text-gray-700">
                No products to show yet. Try a different search.
              </p>
            )}

            <div className="flex flex-wrap gap-8 justify-start">
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeUser;
