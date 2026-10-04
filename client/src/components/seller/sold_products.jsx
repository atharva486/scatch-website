import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import useFetch from '../../utils/useFetch';
import { ANIMATE_BARS, AXIS_TICK, CURSOR_FILL, GRID_STROKE, SERIES, TOOLTIP_STYLE } from './chartTheme';

/**
 * Units sold per product.
 *
 * `setData(res.data.data_req)` set `undefined` on any failure, and the render
 * then called `sold_products.map(...)`, throwing. The heading moved to the
 * section wrapper in `business_analysis.jsx`.
 */
function Sold_products() {
  const { data, loading, error } = useFetch('/api/seller/prod_quantity');
  const rows = data?.data_req ?? [];

  return (
    <div className="h-full w-full">
      {loading && <p className="text-sm text-primary-500">Loading chart…</p>}
      {!loading && error && <p className="text-sm text-red-700">{error}</p>}
      {!loading && !error && rows.length === 0 && (
        <p className="text-sm text-primary-500">No products have sold yet.</p>
      )}

      {rows.length > 0 && (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 10, right: 16, left: -16, bottom: 56 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
            <XAxis
              dataKey="productname"
              angle={-35}
              textAnchor="end"
              interval={0}
              height={60}
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
            />
            <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              cursor={{ fill: CURSOR_FILL }}
              formatter={(value) => [value, 'Units sold']}
            />
            <Bar dataKey="unitsSold" name="Units sold" fill={SERIES.sage} radius={[6, 6, 0, 0]} isAnimationActive={ANIMATE_BARS} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default Sold_products;
