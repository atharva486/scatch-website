import { useState } from 'react';
import Bar from '../../components/seller/sidemenuSeller';
import Navbar from '../../components/seller/navbar';
import Sales_over_time from '../../components/seller/Sales_over_time';
import Sold_products from '../../components/seller/sold_products';
import Stock_item from '../../components/seller/Stock_item';
import Total_revenue from '../../components/seller/Total_revenue';
import useLogout from '../../utils/useLogout';

function Business_dashboard() {
  const [sideBar, setSideBar] = useState(false);
  const logout = useLogout('/seller/login');

  return (
    <div className="page-shell flex">
      <Bar sidebar={sideBar} />

      <div className="flex min-h-screen flex-1 flex-col">
        <Navbar sidebar={sideBar} change={() => setSideBar((prev) => !prev)} logout={logout} f={0} />

        <div className="mx-6 my-8 w-full md:mx-10">
          <div className="mb-6">
            <p className="section-label">Seller portal</p>
            <h1 className="page-heading mt-1.5">Business analysis</h1>
            <p className="page-sub">How your store has performed over the last six months.</p>
          </div>

          <div className="flex w-full flex-col gap-6">
            {[
              { key: 'sales', label: 'Sales over time', chart: Sales_over_time },
              { key: 'revenue', label: 'Revenue', chart: Total_revenue },
              { key: 'sold', label: 'Units sold', chart: Sold_products },
              { key: 'stock', label: 'Stock on hand', chart: Stock_item },
            ].map(({ key, label, chart: Chart }) => (
              <section key={key} className="page-panel p-0">
                <h2 className="border-b border-primary-100 px-6 py-4 text-sm font-semibold text-primary-700">
                  {label}
                </h2>
                <div className="h-[320px] w-full p-4">
                  <Chart />
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Business_dashboard;
