/**
 * Demo data for the Scatch app.
 *
 * Creates sellers, customers, products and orders spread over the last six
 * months so the seller analytics charts have real shape.
 *
 * Used by `npm run seed` and automatically by the server when it boots with no
 * MONGODB_URI, so a fresh clone has something to look at immediately.
 */
const mongoose = require('mongoose');

const ownerModel = require('../models/ownermodel');
const userModel = require('../models/usermodel');
const productModel = require('../models/productmodel');
const orderModel = require('../models/ordermodel');
const { generatePassword } = require('../utils/generateUser');

const DEMO_PASSWORD = 'Password123';

const SELLERS = [
  { fullname: 'Aarav Motors', email: 'seller@scatch.dev', gstin: '27ABCDE1234F1Z5' },
  { fullname: 'Vertex Trading', email: 'seller2@scatch.dev', gstin: '29ABCDE1234F1Z5' },
];

const USERS = [
  { fullname: 'Atharva Patil', email: 'user@scatch.dev', contact: 9876543210 },
  { fullname: 'Riya Sharma', email: 'user2@scatch.dev', contact: 9123456780 },
];

// productname, price, stock, description, cloudinary public id
//
// The image ids are verified to exist in the `dunxugggm` account. The previous
// id (`samples/ecommerce/accessories-bike`) returns 404, so every seeded product
// rendered as a broken image.
const PRODUCTS = [
  ['Vintage Exhaust System', 8499, 6, 'Stainless steel exhaust system, direct fit, includes gaskets and hardware.', 'samples/ecommerce/analog-classic'],
  ['Ceramic Brake Pad Set', 2299, 4, 'Low dust ceramic compound for front axles. Fits most sedans.', 'samples/ecommerce/shoes'],
  ['Alloy Wheel 17 inch', 12499, 3, 'Five spoke alloy wheel with anti corrosion coating.', 'samples/ecommerce/car-interior-design'],
  ['Synthetic Motor Oil 5L', 1899, 25, '5W-30 fully synthetic engine oil. Meets API SP.', 'samples/ecommerce/analog-classic'],
  ['Car LED Headlamp Pair', 3499, 2, '6500K LED headlamp bulbs, plug and play, fan cooled.', 'sample'],
  ['Leather Seat Cover Set', 5599, 8, 'Premium leatherette covers with memory foam bolsters.', 'samples/ecommerce/leather-bag-gray'],
];
// (verified 200: analog-classic, shoes, car-interior-design, sample, leather-bag-gray)

const ADDRESSES = [
  '221B Baker Street, London',
  '12 MG Road, Bengaluru 560001',
  '45 Park Street, Kolkata 700016',
  '78 Connaught Place, New Delhi 110001',
];

function banner() {
  return `
  Sign in with password: ${DEMO_PASSWORD}
    Customer   user@scatch.dev
    Customer   user2@scatch.dev
    Seller     seller@scatch.dev
    Seller     seller2@scatch.dev
`;
}

/**
 * @param {{ reset?: boolean }} options
 *   reset - wipe existing data first. Defaults to true.
 */
async function seed({ reset = true } = {}) {
  if (reset) {
    await Promise.all([
      ownerModel.deleteMany({}),
      userModel.deleteMany({}),
      productModel.deleteMany({}),
      orderModel.deleteMany({}),
    ]);
  }

  const password = await generatePassword(DEMO_PASSWORD);

  const sellers = [];
  for (const seller of SELLERS) {
    sellers.push(await ownerModel.create({ ...seller, password }));
  }

  const users = [];
  for (const user of USERS) {
    users.push(await userModel.create({ ...user, password }));
  }

  const products = [];
  for (const [i, [productname, price, stock, description, image]] of PRODUCTS.entries()) {
    products.push(
      await productModel.create({
        productname,
        price,
        stock,
        description,
        image,
        seller: sellers[i % sellers.length]._id,
      })
    );
  }

  // Spread orders over the last six months so the monthly charts are populated.
  const now = Date.now();
  let orderCount = 0;

  /**
   * Places `count` orders inside one calendar month: ascending, distinct, and
   * never in the future.
   *
   * The original code called `setDate(2 + n * 7)` on "now". That overshot into
   * the future on most days -- run on the 4th, setDate(16) was twelve days
   * ahead -- and a future-dated order sorted above the buyer's real newest one
   * in the history list, so checkout prefilled from the wrong record. It also
   * gave every order the seed run's time of day, leaving their relative order
   * arbitrary.
   *
   * Spreading across the window the month actually leaves available fixes both,
   * and keeps each month's orders inside that month so the charts bucket them
   * under the right label.
   */
  function monthSlots(monthAgo, count) {
    // `setMonth(m, 1)` sets month and day together, so it cannot overflow the
    // way `setMonth(m)` followed by `setDate(1)` would from a 29th-31st.
    const start = new Date(now);
    start.setMonth(start.getMonth() - monthAgo, 1);
    start.setHours(0, 0, 0, 0);

    const nextMonth = new Date(start);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // The current month's window closes at "now". An earlier month's closes at
    // its end, which is in the past by definition.
    const span = Math.min(nextMonth.getTime(), now) - start.getTime();

    // Degenerate only at the exact millisecond a month begins. Step back a
    // second at a time so the orders stay distinct, ordered, and in the past.
    if (span < count) return Array.from({ length: count }, (_, n) => new Date(now - (count - n) * 1000));

    return Array.from(
      { length: count },
      (_, n) => new Date(start.getTime() + Math.round(((n + 1) * span) / (count + 1)))
    );
  }

  for (let monthAgo = 5; monthAgo >= 0; monthAgo -= 1) {
    const ordersThisMonth = 3 + ((monthAgo * 2) % 4);
    const slots = monthSlots(monthAgo, ordersThisMonth);

    for (let n = 0; n < ordersThisMonth; n += 1) {
      const product = products[(monthAgo + n) % products.length];
      const buyer = users[(monthAgo + n) % users.length];
      const quantity = 1 + ((monthAgo + n) % 3);

      await orderModel.create({
        product: product._id,
        buyer: buyer._id,
        seller: product.seller,
        quantity,
        buyPrice: product.price,
        address: ADDRESSES[(monthAgo + n) % ADDRESSES.length],
        orderedAt: slots[n],
      });

      orderCount += 1;
    }
  }

  users[0].wishlist = [{ product: products[0]._id }, { product: products[2]._id }];
  await users[0].save();
  users[1].wishlist = [{ product: products[4]._id }];
  await users[1].save();

  return {
    sellers: sellers.length,
    users: users.length,
    products: products.length,
    orders: orderCount,
    banner: banner(),
  };
}

module.exports = { seed, DEMO_PASSWORD, SELLERS, USERS, banner };