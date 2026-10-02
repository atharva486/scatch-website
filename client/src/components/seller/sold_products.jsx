import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import useFetch from '../../utils/useFetch';

/**
 * Units sold per product.
 *
 * `setData(res.data.data_req)` set `undefined` on any failure, and the render
 * then called `sold_products.map(...)`, throwing.
 */
function Sold_products() {
  const { data, loading, error } = useFetch('/api/seller/prod_quantity');
  const rows = data?.data_req ?? [];

  return (
    <>
      <h2 className="text-lg font-semibold text-center text-gray-700 mb-2">
        Quantity of Products Sold
      </h2>

      <div className="w-full h-[320px] p-4 rounded-2xl shadow-md bg-white">
        {loading && <p className="text-gray-600">Loading chart…</p>}
        {!loading && error && <p className="text-red-700">{error}</p>}
        {!loading && !error && rows.length === 0 && (
          <p className="text-gray-600">No products have sold yet.</p>
        )}

        {rows.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 20, right: 20, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="productname"
                angle={-40}
                textAnchor="end"
                interval={0}
                tick={{ fill: '#555', fontSize: 11 }}
              />
              <YAxis allowDecimals={false} tick={{ fill: '#555', fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="unitsSold" name="Units Sold" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );
}

export default Sold_products;
