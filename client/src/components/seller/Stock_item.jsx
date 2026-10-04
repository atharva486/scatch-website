import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import useFetch from '../../utils/useFetch';
import { ANIMATE_BARS, AXIS_TICK, CURSOR_FILL, GRID_STROKE, SERIES, TOOLTIP_STYLE } from './chartTheme';

const LOW_STOCK_THRESHOLD = 5;

const renderStockTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div style={TOOLTIP_STYLE}>
      <p className="font-semibold text-primary-900">{row.productname}</p>
      <p className="text-primary-600">
        {row.stock === 0 ? 'Out of stock' : `${row.stock} in stock`}
      </p>
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
 * bar is still visible (a real 0-height bar is invisible). The heading moved to
 * the section wrapper in `business_analysis.jsx`.
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
    <div className="h-full w-full">
      {loading && <p className="text-sm text-primary-500">Loading chart…</p>}
      {!loading && error && <p className="text-sm text-red-700">{error}</p>}
      {!loading && !error && lowStock.length === 0 && (
        <p className="text-sm text-primary-500">Nothing is running low.</p>
      )}

      {lowStock.length > 0 && (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={lowStock} margin={{ top: 10, right: 16, left: -16, bottom: 56 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
            <XAxis
              dataKey="productname"
              interval={0}
              angle={-35}
              textAnchor="end"
              height={60}
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
            />
            <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <Tooltip content={renderStockTooltip} cursor={{ fill: CURSOR_FILL }} />
            <Bar dataKey="displayStock" name="Units in stock" radius={[6, 6, 0, 0]} isAnimationActive={ANIMATE_BARS}>
              {lowStock.map((item, index) => (
                <Cell
                  key={`${item.productname}-${index}`}
                  fill={item.stock === 0 ? SERIES.danger : SERIES.accent}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default Stock_item;
