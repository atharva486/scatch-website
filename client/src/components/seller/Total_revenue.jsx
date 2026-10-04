import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import useFetch from '../../utils/useFetch';
import { ANIMATE_BARS, AXIS_TICK, CURSOR_FILL, GRID_STROKE, SERIES, TOOLTIP_STYLE } from './chartTheme';

/**
 * Revenue per month.
 *
 * Same `success`-less crash as the other charts, and `type="monotone"` is not a
 * valid prop on `<Bar>`. The heading moved to the section wrapper in
 * `business_analysis.jsx`.
 */
function Total_revenue() {
  const { data, loading, error } = useFetch('/api/seller/monthly_revenue');
  const rows = data?.data_req ?? [];

  return (
    <div className="h-full w-full">
      {loading && <p className="text-sm text-primary-500">Loading chart…</p>}
      {!loading && error && <p className="text-sm text-red-700">{error}</p>}
      {!loading && !error && rows.length === 0 && (
        <p className="text-sm text-primary-500">No revenue recorded yet.</p>
      )}

      {rows.length > 0 && (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 10, right: 16, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
            <XAxis dataKey="month" tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              cursor={{ fill: CURSOR_FILL }}
              formatter={(value) => [`₹${value}`, 'Revenue']}
            />
            <Bar dataKey="totalRevenue" name="Revenue" fill={SERIES.accent} radius={[6, 6, 0, 0]} isAnimationActive={ANIMATE_BARS} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default Total_revenue;
