import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import useFetch from '../../utils/useFetch';

const LOW_STOCK_THRESHOLD = 5;

const renderStockTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="bg-white border border-gray-300 p-2 rounded shadow">
      <p className="font-semibold">{row.productname}</p>
      <p>Stock: {row.stock}</p>
    </div>
  );
};

/**
 * Products running low on stock.
 *
 * The endpoint returns `products` (it used to answer `success: false` on
 * success), and the component previously pushed into a local array *during
 * render*, mutating state between renders. The filter and sort are now derived
 * with `useMemo`, and out-of-stock items get a non-zero display value so their
 * bar is still visible (a real 0-height bar is invisible).
 */
function Stock_item() {
  const { data, loading, error } = useFetch('/api/seller/low_stock');
  const products = data?.products ?? [];

  const lowStock = products
    .filter((item) => item.stock < LOW_STOCK_THRESHOLD)
    .map((item) => ({
      productname: item.productname,
      stock: item.stock,
      // A zero-height bar renders as nothing at all.
      displayStock: item.stock === 0 ? 0.2 : item.stock,
    }));

  return (
    <>
      <h2 className="text-center text-lg font-semibold mb-4">
        Low Stock Items (Less than {LOW_STOCK_THRESHOLD})
      </h2>

      <div className="w-full h-[320px] p-4 rounded-2xl shadow-md bg-white">
        {loading && <p className="text-gray-600">Loading chart…</p>}
        {!loading && error && <p className="text-red-700">{error}</p>}
        {!loading && !error && lowStock.length === 0 && (
          <p className="text-gray-600">Nothing is running low.</p>
        )}

        {lowStock.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={lowStock}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="productname" interval={0} angle={-20} textAnchor="end" fontSize={11} />
              <YAxis allowDecimals={false} />
              <Tooltip content={renderStockTooltip} />
              <Bar dataKey="displayStock" name="Units in stock">
                {lowStock.map((item, index) => (
                  <Cell key={`${item.productname}-${index}`} fill={item.stock === 0 ? '#dc2626' : '#f59e0b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );
}

export default Stock_item;
