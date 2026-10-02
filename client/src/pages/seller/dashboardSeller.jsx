import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Bar from '../../components/seller/sidemenuSeller';
import Navbar from '../../components/seller/navbar';
import ProductCard from '../../components/seller/productSeller';
import { useFlash } from '../../context/FlashContext';
import useFetch from '../../utils/useFetch';
import useLogout from '../../utils/useLogout';
import useSearchFilter from '../../utils/useSearchFilter';

function DashboardSeller() {
  const [sideBar, setSideBar] = useState(false);

  const navigate = useNavigate();
  const logout = useLogout('/seller/login');
  const { triggerFlash } = useFlash();

  const { data, loading, error, reload } = useFetch('/api/seller/prod_names');
  const products = data?.products ?? [];

  const { search, onSearch, filtered } = useSearchFilter(products, (product) => [
    product.productname,
    product.description,
  ]);

  return (
    <div className="w-full min-h-screen flex bg-gradient-to-br from-[#f7f7fa] to-[#e3e8f0]">
      <div className="flex flex-col flex-1 min-h-screen">
        <Navbar sidebar={sideBar} change={() => setSideBar((prev) => !prev)} logout={logout} f={1} name_search={onSearch} />

        <div className="flex flex-row flex-1 w-full min-h-screen">
          <Bar sidebar={sideBar} />

          <div className="mx-10 my-8 w-full h-fit bg-gradient-to-br from-sky-300 to-sky-700 rounded-2xl shadow-lg p-8">
            <p className="text-3xl font-bold text-[#2C3E50] mb-6 border-b border-gray-300 pb-4">
              Your Products
            </p>

            {loading && <p className="text-lg text-gray-900">Loading your products…</p>}
            {!loading && error && <p className="text-lg text-red-900">{error}</p>}
            {!loading && !error && filtered.length === 0 && (
              <p className="text-lg text-gray-900">
                {search ? 'No items match that search.' : 'You have not listed any products yet.'}
              </p>
            )}

            <div className="flex flex-wrap gap-6 justify-start">
              {filtered.map((item) => (
                <ProductCard
                  key={item._id}
                  image={item.image}
                  productname={item.productname}
                  price={item.price}
                  description={item.description}
                  stock={item.stock}
                  product_id={item._id}
                  onChanged={reload}
                  onView={() => navigate(`/seller/show/${item._id}`)}
                  onError={(message) => triggerFlash(message, 'error')}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardSeller;
