import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import useFetch from '../../utils/useFetch';

/**
 * Revenue per month.
 *
 * Same `success`-less crash as the other charts, and `type="monotone"` is not a
 * valid prop on `<Bar>`.
 */
function Total_revenue() {
  const { data, loading, error } = useFetch('/api/seller/monthly_revenue');
  const rows = data?.data_req ?? [];

  return (
    <>
      <h2 className="text-xl text-center font-semibold mb-2 text-gray-800">Monthly Revenue</h2>

      <div className="w-full h-[320px] p-4 rounded-2xl shadow-md bg-white">
        {loading && <p className="text-gray-600">Loading chart…</p>}
        {!loading && error && <p className="text-red-700">{error}</p>}
        {!loading && !error && rows.length === 0 && (
          <p className="text-gray-600">No revenue recorded yet.</p>
        )}

        {rows.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fill: '#4b5563', fontSize: 12 }} />
              <YAxis tick={{ fill: '#4b5563', fontSize: 12 }} />
              <Tooltip formatter={(value) => `₹${value}`} />
              <Legend />
              <Bar
                dataKey="totalRevenue"
                name="Total Revenue (₹)"
                fill="#6366f1"
                fillOpacity={0.7}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );
}

export default Total_revenue;
