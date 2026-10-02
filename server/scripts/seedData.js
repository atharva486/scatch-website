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

  for (let monthAgo = 5; monthAgo >= 0; monthAgo -= 1) {
    const ordersThisMonth = 3 + ((monthAgo * 2) % 4);

    for (let n = 0; n < ordersThisMonth; n += 1) {
      const product = products[(monthAgo + n) % products.length];
      const buyer = users[(monthAgo + n) % users.length];
      const quantity = 1 + ((monthAgo + n) % 3);

      const orderedAt = new Date(now);
      orderedAt.setMonth(orderedAt.getMonth() - monthAgo);
      orderedAt.setDate(2 + n * 7);

      await orderModel.create({
        product: product._id,
        buyer: buyer._id,
        seller: product.seller,
        quantity,
        buyPrice: product.price,
        address: ADDRESSES[(monthAgo + n) % ADDRESSES.length],
        orderedAt,
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