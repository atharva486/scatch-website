import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    <div className="page-shell flex">
      <div className="flex min-h-screen flex-1 flex-col">
        <Navbar sidebar={sideBar} change={() => setSideBar((prev) => !prev)} logout={logout} f={1} name_search={onSearch} />

        <div className="flex w-full min-h-screen flex-1 flex-row">
          <Bar sidebar={sideBar} />

          <div className="mx-6 my-8 w-full md:mx-10">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="section-label">Seller portal</p>
                <h1 className="page-heading mt-1.5">Your products</h1>
                <p className="page-sub">Everything you have listed, with live stock levels.</p>
              </div>

              <Link to="/seller/addproduct" className="btn-primary">
                List a new product
              </Link>
            </div>

            {loading && (
              <div className="page-panel">
                <p className="text-sm text-primary-500">Loading your products…</p>
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
                  {search ? 'No items match that search.' : 'You have not listed any products yet.'}
                </p>
              </div>
            )}

            {filtered.length > 0 && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardSeller;
