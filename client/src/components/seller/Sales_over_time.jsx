import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import useFetch from '../../utils/useFetch';

/**
 * Units sold per month.
 *
 * `setData(res.data.data_req)` ran without checking `res.data.success`, and the
 * endpoint used to answer `success: false` even when it worked, so any failure
 * set `data` to `undefined` and `data.length` threw — taking down the whole
 * analytics page. Also removed `type="monotone"`, which is not a valid `Bar`
 * prop (it belongs to Line/Area charts).
 */
function Sales_over_time() {
  const { data, loading, error } = useFetch('/api/seller/monthly_orders');
  const rows = data?.data_req ?? [];

  return (
    <>
      <h2 className="text-xl font-semibold text-center text-gray-700 mb-4">
        Monthly Sales Overview
      </h2>

      <div className="w-full h-[320px] p-4 rounded-2xl shadow-md bg-white">
        {loading && <p className="text-gray-600">Loading chart…</p>}
        {!loading && error && <p className="text-red-700">{error}</p>}
        {!loading && !error && rows.length === 0 && (
          <p className="text-gray-600">No sales recorded yet.</p>
        )}

        {rows.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fill: '#4b5563', fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: '#4b5563', fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalOrders" name="Units sold" fill="#4f46e5" fillOpacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );
}

export default Sales_over_time;
