import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import useFetch from '../../utils/useFetch';
import { ANIMATE_BARS, AXIS_TICK, CURSOR_FILL, GRID_STROKE, SERIES, TOOLTIP_STYLE } from './chartTheme';

/**
 * Units sold per month.
 *
 * `setData(res.data.data_req)` ran without checking `res.data.success`, and the
 * endpoint used to answer `success: false` even when it worked, so any failure
 * set `data` to `undefined` and `data.length` threw — taking down the whole
 * analytics page. Also removed `type="monotone"`, which is not a valid `Bar`
 * prop (it belongs to Line/Area charts).
 *
 * The heading moved to the section wrapper in `business_analysis.jsx`, so the
 * chart no longer repeats it.
 */
function Sales_over_time() {
  const { data, loading, error } = useFetch('/api/seller/monthly_orders');
  const rows = data?.data_req ?? [];

  return (
    <div className="h-full w-full">
      {loading && <p className="text-sm text-primary-500">Loading chart…</p>}
      {!loading && error && <p className="text-sm text-red-700">{error}</p>}
      {!loading && !error && rows.length === 0 && (
        <p className="text-sm text-primary-500">No sales recorded yet.</p>
      )}

      {rows.length > 0 && (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
            <XAxis dataKey="month" tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: CURSOR_FILL }} />
            <Bar dataKey="totalOrders" name="Units sold" fill={SERIES.primary} radius={[6, 6, 0, 0]} isAnimationActive={ANIMATE_BARS} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default Sales_over_time;
