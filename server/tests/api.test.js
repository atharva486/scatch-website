/**
 * API integration tests.
 *
 * Each run starts a fresh in-memory MongoDB, so tests are isolated and no real
 * database is touched. Run with: npm test
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let memoryServer;

const PASSWORD = 'Password123';

// A tiny 1x1 PNG.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==',
  'base64'
);

test.before(async () => {
  memoryServer = await MongoMemoryServer.create({ instance: { dbName: 'scatch-test' } });
  process.env.MONGODB_URI = memoryServer.getUri();
  process.env.JWT_KEY = 'test_secret_key_for_tests_only';
  process.env.NODE_ENV = 'test';

  // Loaded after the env vars are set so dotenv does not overwrite them.
  ({ app } = require('../app'));
  const { connectDB } = require('../config/mongoose-connection');
  await connectDB();
});

test.after(async () => {
  await mongoose.connection.close();
  // The mongod child process must be stopped explicitly or the test runner
  // never exits.
  if (memoryServer) await memoryServer.stop();
});

// ---------------------------------------------------------------- helpers

/** Registers an account and returns an authenticated supertest agent. */
async function makeAccount({ path, fullname, email, gstin }) {
  const agent = request.agent(app);
  agent.accountEmail = email;

  const res = await agent.post(`${path}/register`).send({ fullname, email, password: PASSWORD, gstin });
  assert.equal(res.status, 201, `register ${email} failed: ${res.text}`);

  const login = await agent.post(`${path}/login`).send({ email, password: PASSWORD });
  assert.equal(login.status, 200, `login ${email} failed: ${login.text}`);

  return agent;
}

const uniqueEmail = (label) => `${label}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@scatch.test`;

async function makeSeller() {
  return makeAccount({
    path: '/api/seller',
    fullname: 'Seed Seller',
    email: uniqueEmail('seller'),
    gstin: '27ABCDE1234F1Z5',
  });
}

async function makeCustomer() {
  return makeAccount({ path: '/api/user', fullname: 'Seed Customer', email: uniqueEmail('user') });
}

async function makeProduct(seller, overrides = {}) {
  const res = await seller
    .post('/api/seller/create')
    .field('productname', overrides.productname || 'Test Product')
    .field('price', String(overrides.price ?? 500))
    .field('description', overrides.description || 'A product used in tests')
    .field('stock', String(overrides.stock ?? 5))
    .attach('image', PNG, { filename: 'pixel.png', contentType: 'image/png' });

  assert.equal(res.status, 201, `create product failed: ${res.text}`);
  return res.body.product;
}

/**
 * A complete, valid delivery address.
 *
 * Pass overrides to blank or corrupt one part: `validShipping({ city: '' })`.
 */
const validShipping = (overrides = {}) => ({
  recipient: 'Ada Lovelace',
  line1: '221B Baker Street',
  line2: 'Flat 3',
  city: 'London',
  state: 'Greater London',
  postalCode: 'NW1 6XE',
  country: 'United Kingdom',
  phone: '+44 20 7946 0958',
  ...overrides,
});

// ------------------------------------------------------------------ health

test('GET /api/health reports ok', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
  assert.equal(res.body.database, 'connected');
});

test('unknown API routes return a JSON 404', async () => {
  const res = await request(app).get('/api/definitely-not-a-route');
  assert.equal(res.status, 404);
  assert.equal(res.body.success, false);
});

// ----------------------------------------------------------- registration

test('rejects a malformed email', async () => {
  const res = await request(app)
    .post('/api/user/register')
    .send({ fullname: 'A', email: 'not-an-email', password: PASSWORD });
  assert.equal(res.status, 400);
});

test('rejects a password shorter than 8 characters', async () => {
  const res = await request(app)
    .post('/api/user/register')
    .send({ fullname: 'Short Pass', email: uniqueEmail('short'), password: 'short' });
  assert.equal(res.status, 400);
});

test('rejects an invalid GSTIN', async () => {
  const res = await request(app).post('/api/seller/register').send({
    fullname: 'Bad GSTIN',
    email: uniqueEmail('gstin'),
    password: PASSWORD,
    gstin: '123',
  });
  assert.equal(res.status, 400);
});

test('rejects a duplicate email', async () => {
  const email = uniqueEmail('dupe');
  const first = await request(app)
    .post('/api/user/register')
    .send({ fullname: 'First', email, password: PASSWORD });
  assert.equal(first.status, 201);

  const second = await request(app)
    .post('/api/user/register')
    .send({ fullname: 'Second', email, password: PASSWORD });
  assert.equal(second.status, 400);
});

test('login does not reveal whether an email is registered', async () => {
  const unknown = await request(app)
    .post('/api/user/login')
    .send({ email: uniqueEmail('ghost'), password: 'whatever' });
  assert.equal(unknown.status, 401);
  assert.match(unknown.body.error, /No user account/);

  const customer = await makeCustomer();
  const wrongPassword = await request(app)
    .post('/api/user/login')
    .send({ email: customer.accountEmail, password: 'WrongPassword1' });
  assert.equal(wrongPassword.status, 401);
  assert.match(wrongPassword.body.error, /Incorrect password/);
});

// -------------------------------------------------------------- auth rules

test('anonymous requests are rejected from protected routes', async () => {
  for (const path of [
    '/api/user/profile',
    '/api/user/get_products',
    '/api/user/wishlist_products',
    '/api/seller/profile',
    '/api/seller/products',
    '/api/seller/monthly_revenue',
  ]) {
    const res = await request(app).get(path);
    assert.equal(res.status, 401, `${path} should require authentication`);
  }
});

test('a customer session cannot reach seller endpoints', async () => {
  const customer = await makeCustomer();
  const res = await customer.get('/api/seller/monthly_revenue');
  assert.equal(res.status, 401);
});

test('a seller session cannot reach customer endpoints', async () => {
  const seller = await makeSeller();
  const res = await seller.get('/api/user/profile');
  assert.equal(res.status, 401);
});

// ---------------------------------------------------------- product routes

test('concrete product routes are not shadowed by the /:id route', async () => {
  const seller = await makeSeller();
  const product = await makeProduct(seller);
  const customer = await makeCustomer();

  const details = await customer.get(`/api/product/product_details/${product._id}`);
  assert.equal(details.status, 200);
  assert.equal(details.body.success, true);
  assert.equal(details.body.product.productname, 'Test Product');

  const sellerView = await seller.get(`/api/product/show_seller/${product._id}`);
  assert.equal(sellerView.status, 200);
  assert.equal(sellerView.body.success, true);
});

test('the shop only lists products that are in stock', async () => {
  const seller = await makeSeller();
  await makeProduct(seller, { productname: 'In Stock Item', stock: 3 });
  const customer = await makeCustomer();

  const res = await customer.get('/api/product/shop');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.products));
  assert.ok(res.body.products.every((p) => p.stock > 0));
  assert.ok(res.body.products.some((p) => p.productname === 'In Stock Item'));
});

// -------------------------------------------------------------- ordering

test('an order records the price from the database, ignoring a client-supplied price', async () => {
  const seller = await makeSeller();
  const product = await makeProduct(seller, { price: 999, stock: 5 });
  const customer = await makeCustomer();

  const buy = await customer
    .post(`/api/product/buy/${product._id}`)
    .send({ quantity: 2, address: '221B Baker Street', price: 1 });
  assert.equal(buy.status, 201);

  const orders = await customer.get('/api/user/get_products');
  assert.equal(orders.body.orders.length, 1);
  assert.equal(orders.body.orders[0].buyPrice, 999, 'client price must be ignored');
  assert.equal(orders.body.orders[0].quantity, 2);
});

test('stock is decremented when an order is placed', async () => {
  const seller = await makeSeller();
  const product = await makeProduct(seller, { stock: 5 });
  const customer = await makeCustomer();

  await customer.post(`/api/product/buy/${product._id}`).send({ quantity: 2, address: 'Somewhere' });

  const res = await customer.get(`/api/product/${product._id}`);
  assert.equal(res.body.product.stock, 3);
});

test('cannot order more units than are in stock', async () => {
  const seller = await makeSeller();
  const product = await makeProduct(seller, { stock: 2 });
  const customer = await makeCustomer();

  const res = await customer
    .post(`/api/product/buy/${product._id}`)
    .send({ quantity: 5, address: 'Somewhere' });
  assert.equal(res.status, 400);
  assert.match(res.body.error, /stock/i);
});

test('rejects a non-positive or fractional quantity', async () => {
  const seller = await makeSeller();
  const product = await makeProduct(seller, { stock: 10 });
  const customer = await makeCustomer();

  for (const quantity of [0, -1, 1.5]) {
    const res = await customer
      .post(`/api/product/buy/${product._id}`)
      .send({ quantity, address: 'Somewhere' });
    assert.equal(res.status, 400, `quantity ${quantity} should be rejected`);
  }
});

test('requires a shipping address', async () => {
  const seller = await makeSeller();
  const product = await makeProduct(seller, { stock: 10 });
  const customer = await makeCustomer();

  const res = await customer.post(`/api/product/buy/${product._id}`).send({ quantity: 1, address: '  ' });
  assert.equal(res.status, 400);
});

// ------------------------------------------------------- shipping address

test('an order stores the address as structured parts, not one blob', async () => {
  const seller = await makeSeller();
  const product = await makeProduct(seller, { stock: 5 });
  const customer = await makeCustomer();

  const buy = await customer
    .post(`/api/product/buy/${product._id}`)
    .send({ quantity: 1, shipping: validShipping() });
  assert.equal(buy.status, 201, buy.text);

  const orders = await customer.get('/api/user/get_products');
  const { shipping } = orders.body.orders[0];

  assert.equal(shipping.recipient, 'Ada Lovelace');
  assert.equal(shipping.line1, '221B Baker Street');
  assert.equal(shipping.line2, 'Flat 3');
  assert.equal(shipping.city, 'London');
  assert.equal(shipping.state, 'Greater London');
  assert.equal(shipping.postalCode, 'NW1 6XE');
  assert.equal(shipping.country, 'United Kingdom');
  assert.equal(shipping.phone, '+44 20 7946 0958');
});

test('the one-line address is derived from the parts and cannot be spoofed', async () => {
  const seller = await makeSeller();
  const product = await makeProduct(seller, { stock: 5 });
  const customer = await makeCustomer();

  await customer
    .post(`/api/product/buy/${product._id}`)
    // A client-supplied `address` alongside a structured one must be ignored.
    .send({ quantity: 1, shipping: validShipping(), address: 'Somewhere else entirely' });

  const orders = await customer.get('/api/user/get_products');
  const { address } = orders.body.orders[0];

  assert.equal(address, '221B Baker Street, Flat 3, London Greater London NW1 6XE, United Kingdom');
  assert.doesNotMatch(address, /Somewhere else/);
});

test('every required address part is validated, and the message names it', async () => {
  const seller = await makeSeller();
  const product = await makeProduct(seller, { stock: 20 });
  const customer = await makeCustomer();

  const cases = [
    ['recipient', 'Recipient name is required'],
    ['line1', 'Address line 1 is required'],
    ['city', 'City is required'],
    ['state', 'State or region is required'],
    ['postalCode', 'Postal code is required'],
    ['country', 'Country is required'],
  ];

  for (const [field, expected] of cases) {
    const before = (await customer.get(`/api/product/${product._id}`)).body.product.stock;

    const res = await customer
      .post(`/api/product/buy/${product._id}`)
      .send({ quantity: 1, shipping: validShipping({ [field]: '   ' }) });

    assert.equal(res.status, 400, `blank ${field} should be rejected`);
    assert.match(res.body.error, new RegExp(expected));

    // A rejected address must not cost the seller a unit of stock.
    const after = (await customer.get(`/api/product/${product._id}`)).body.product.stock;
    assert.equal(after, before, `stock changed despite a rejected ${field}`);
  }
});

test('address line 2 and phone stay optional', async () => {
  const seller = await makeSeller();
  const product = await makeProduct(seller, { stock: 5 });
  const customer = await makeCustomer();

  const res = await customer
    .post(`/api/product/buy/${product._id}`)
    .send({ quantity: 1, shipping: validShipping({ line2: '', phone: '' }) });
  assert.equal(res.status, 201, res.text);

  const { shipping } = (await customer.get('/api/user/get_products')).body.orders[0];
  assert.equal(shipping.line2, '');
  assert.equal(shipping.phone, '');
});

test('rejects an address part that is only whitespace or too short', async () => {
  const seller = await makeSeller();
  const product = await makeProduct(seller, { stock: 5 });
  const customer = await makeCustomer();

  const tooShort = await customer
    .post(`/api/product/buy/${product._id}`)
    .send({ quantity: 1, shipping: validShipping({ line1: '12' }) });
  assert.equal(tooShort.status, 400);
  assert.match(tooShort.body.error, /at least 4 characters/);

  const singleCharCity = await customer
    .post(`/api/product/buy/${product._id}`)
    .send({ quantity: 1, shipping: validShipping({ city: 'X' }) });
  assert.equal(singleCharCity.status, 400);
});

test('accepts the postal code formats different countries actually use', async () => {
  const seller = await makeSeller();
  const product = await makeProduct(seller, { stock: 10 });
  const customer = await makeCustomer();

  // Indian PIN, US ZIP, US ZIP+4, UK postcode, Canadian alphanumeric.
  for (const postalCode of ['400001', '94107', '94107-1234', 'NW1 6XE', 'K1A 0B1']) {
    const res = await customer
      .post(`/api/product/buy/${product._id}`)
      .send({ quantity: 1, shipping: validShipping({ postalCode }) });
    assert.equal(res.status, 201, `postal code "${postalCode}" should be accepted: ${res.text}`);
  }
});

test('rejects a postal code containing letters that cannot be posted', async () => {
  const seller = await makeSeller();
  const product = await makeProduct(seller, { stock: 5 });
  const customer = await makeCustomer();

  for (const postalCode of ['SW1A 1AAA!', '!!!!', '1']) {
    const res = await customer
      .post(`/api/product/buy/${product._id}`)
      .send({ quantity: 1, shipping: validShipping({ postalCode }) });
    assert.equal(res.status, 400, `postal code "${postalCode}" should be rejected`);
  }
});

test('an address field cannot smuggle extra keys into the order', async () => {
  const seller = await makeSeller();
  const product = await makeProduct(seller, { stock: 5 });
  const customer = await makeCustomer();

  await customer
    .post(`/api/product/buy/${product._id}`)
    .send({
      quantity: 1,
      shipping: validShipping({ _id: 'injected', __proto__polluted: true, isAdmin: true }),
    });

  const { shipping } = (await customer.get('/api/user/get_products')).body.orders[0];
  assert.equal(shipping._id, undefined);
  assert.equal(shipping.isAdmin, undefined);
});

test('the order receipt returns the structured address', async () => {
  const seller = await makeSeller();
  const product = await makeProduct(seller, { stock: 5 });
  const customer = await makeCustomer();

  const buy = await customer
    .post(`/api/product/buy/${product._id}`)
    .send({ quantity: 1, shipping: validShipping() });
  assert.equal(buy.status, 201, buy.text);

  const { orders } = (await customer.get('/api/user/get_products')).body;

  const receipt = await customer.post('/api/product/order_details').send({ order_id: orders[0]._id });
  assert.equal(receipt.status, 200, receipt.text);
  assert.equal(receipt.body.order.shipping.city, 'London');
  assert.equal(receipt.body.order.shipping.postalCode, 'NW1 6XE');
});

test('a legacy one-line address still places an order', async () => {
  const seller = await makeSeller();
  const product = await makeProduct(seller, { stock: 5 });
  const customer = await makeCustomer();

  const res = await customer
    .post(`/api/product/buy/${product._id}`)
    .send({ quantity: 1, address: '221B Baker Street' });
  assert.equal(res.status, 201, res.text);

  const { shipping, address } = (await customer.get('/api/user/get_products')).body.orders[0];
  assert.equal(shipping, undefined, 'a legacy order has no structured address');
  assert.equal(address, '221B Baker Street');
});

test('concurrent orders cannot oversell the last unit', async () => {
  const seller = await makeSeller();
  const product = await makeProduct(seller, { stock: 1 });

  const buyers = await Promise.all([makeCustomer(), makeCustomer(), makeCustomer()]);

  const results = await Promise.all(
    buyers.map((buyer) =>
      buyer.post(`/api/product/buy/${product._id}`).send({ quantity: 1, address: 'Somewhere' })
    )
  );

  const succeeded = results.filter((r) => r.status === 201).length;
  assert.equal(succeeded, 1, 'exactly one of three simultaneous buyers should succeed');

  const after = await request(app).get(`/api/product/${product._id}`);
  assert.equal(after.body.product.stock, 0);
});

// ---------------------------------------------------------------- wishlist

test('adding the same product twice keeps one wishlist entry', async () => {
  const seller = await makeSeller();
  const product = await makeProduct(seller);
  const customer = await makeCustomer();

  await customer.post(`/api/product/add_to_cart/${product._id}`);
  await customer.post(`/api/product/add_to_cart/${product._id}`);

  const res = await customer.get('/api/user/wishlist_products');
  const matching = res.body.wishlist.filter((w) => w._id === product._id);
  assert.equal(matching.length, 1);
});

test('removes a wishlist item', async () => {
  const seller = await makeSeller();
  const product = await makeProduct(seller);
  const customer = await makeCustomer();

  await customer.post(`/api/product/add_to_cart/${product._id}`);
  const removed = await customer.post(`/api/user/delete/wishlist_item/${product._id}`);
  assert.equal(removed.status, 200);

  const res = await customer.get('/api/user/wishlist_products');
  assert.equal(res.body.wishlist.length, 0);
});

test('cannot remove a wishlist item that is not yours', async () => {
  const seller = await makeSeller();
  const product = await makeProduct(seller);
  const customerA = await makeCustomer();
  const customerB = await makeCustomer();

  await customerA.post(`/api/product/add_to_cart/${product._id}`);
  const res = await customerB.post(`/api/user/delete/wishlist_item/${product._id}`);
  assert.equal(res.status, 404);

  const check = await customerA.get('/api/user/wishlist_products');
  assert.equal(check.body.wishlist.length, 1, "the other customer's item must survive");
});

// ----------------------------------------------------- seller permissions

test('a seller cannot touch another seller\'s products', async () => {
  const owner = await makeSeller();
  const product = await makeProduct(owner, { stock: 4 });
  const intruder = await makeSeller();

  const view = await intruder.get(`/api/product/show_seller/${product._id}`);
  assert.equal(view.status, 403);

  const price = await intruder
    .post(`/api/product/change_price/${product._id}`)
    .send({ newprice: 1 });
  assert.equal(price.status, 403);

  const restock = await intruder
    .post(`/api/product/restock/${product._id}`)
    .send({ newStock: 100 });
  assert.equal(restock.status, 403);

  const remove = await intruder.post('/api/seller/delete').send({ product_id: product._id });
  assert.equal(remove.status, 403);

  // Nothing should have changed.
  const after = await request(app).get(`/api/product/${product._id}`);
  assert.equal(after.body.product.price, 500);
  assert.equal(after.body.product.stock, 4);
});

test('a seller can manage their own product', async () => {
  const seller = await makeSeller();
  const product = await makeProduct(seller, { price: 500, stock: 4 });

  const price = await seller
    .post(`/api/product/change_price/${product._id}`)
    .send({ newprice: 750.5 });
  assert.equal(price.status, 200);
  assert.equal(price.body.product.price, 750.5);

  const restock = await seller.post(`/api/product/restock/${product._id}`).send({ newStock: 6 });
  assert.equal(restock.status, 200);
  assert.equal(restock.body.product.stock, 10);
});

test('a product with orders cannot be deleted', async () => {
  const seller = await makeSeller();
  const product = await makeProduct(seller);
  const customer = await makeCustomer();

  await customer.post(`/api/product/buy/${product._id}`).send({ quantity: 1, address: 'Somewhere' });

  const res = await seller.post('/api/seller/delete').send({ product_id: product._id });
  assert.equal(res.status, 400);
});

test('an un-ordered product is deleted', async () => {
  const seller = await makeSeller();
  const product = await makeProduct(seller);

  const res = await seller.post('/api/seller/delete').send({ product_id: product._id });
  assert.equal(res.status, 200);

  const check = await request(app).get(`/api/product/${product._id}`);
  assert.equal(check.status, 404);
});

// ------------------------------------------------------ profile editing

test('profile editing is restricted to an allowlist of fields', async () => {
  const customer = await makeCustomer();

  for (const field of ['password', 'wishlist', '_id', 'email ']) {
    const res = await customer.post(`/api/user/edit/${field}`).send({ newVal: 'hacked' });
    assert.equal(res.status, 400, `${field} must not be editable`);
  }
});

test('changing an email re-issues the session cookie', async () => {
  const customer = await makeCustomer();
  const newEmail = uniqueEmail('renamed');

  const res = await customer.post('/api/user/edit/email').send({ newVal: newEmail });
  assert.equal(res.status, 200);
  assert.ok(res.headers['set-cookie'], 'a new cookie should be issued');

  // The agent keeps cookies, so the session must still work.
  const profile = await customer.get('/api/user/profile');
  assert.equal(profile.status, 200);
  assert.equal(profile.body.user.email, newEmail);
});

test('password changes require the previous password and never return a hash', async () => {
  const seller = await makeSeller();

  const wrong = await seller.post('/api/seller/check_password').send({ prevpass: 'Nope12345' });
  assert.equal(wrong.body.result, false);

  const right = await seller.post('/api/seller/check_password').send({ prevpass: PASSWORD });
  assert.equal(right.body.result, true);

  const edit = await seller.post('/api/seller/edit/password').send({ newVal: 'NewPassword123' });
  assert.equal(edit.status, 200);
  assert.equal(edit.body.seller.password, undefined, 'password hash must not be returned');
});

// ------------------------------------------------------------- analytics

test('seller analytics report the right numbers', async () => {
  const seller = await makeSeller();
  const product = await makeProduct(seller, { price: 400, stock: 10 });
  const customer = await makeCustomer();

  await customer.post(`/api/product/buy/${product._id}`).send({ quantity: 2, address: 'Somewhere' });
  await customer.post(`/api/product/buy/${product._id}`).send({ quantity: 1, address: 'Elsewhere' });

  const revenue = await seller.get('/api/seller/monthly_revenue');
  assert.equal(revenue.status, 200);
  assert.equal(revenue.body.success, true);
  assert.equal(revenue.body.data_req.length, 1, 'orders are all in the current month');
  assert.equal(revenue.body.data_req[0].totalRevenue, 3 * 400);

  const orders = await seller.get('/api/seller/monthly_orders');
  assert.equal(orders.body.data_req[0].totalOrders, 3);

  const sold = await seller.get('/api/seller/prod_quantity');
  assert.equal(sold.body.success, true);
  assert.equal(sold.body.data_req[0].unitsSold, 3);

  const lowStock = await seller.get('/api/seller/low_stock');
  assert.equal(lowStock.body.success, true, 'low_stock must report success');
  assert.equal(lowStock.body.products[0].stock, 7);
});

test('analytics are scoped to the requesting seller', async () => {
  const sellerA = await makeSeller();
  const sellerB = await makeSeller();
  const product = await makeProduct(sellerA, { price: 400, stock: 10 });
  const customer = await makeCustomer();

  await customer.post(`/api/product/buy/${product._id}`).send({ quantity: 2, address: 'Somewhere' });

  const revenue = await sellerB.get('/api/seller/monthly_revenue');
  assert.equal(revenue.body.data_req.length, 0, "seller B must not see seller A's revenue");
});

// -------------------------------------------------------------- ordering

test('order details resolve by id and are scoped to the buyer', async () => {
  const seller = await makeSeller();
  const product = await makeProduct(seller, { stock: 5 });
  const buyer = await makeCustomer();
  const stranger = await makeCustomer();

  await buyer.post(`/api/product/buy/${product._id}`).send({ quantity: 2, address: 'Secret Lane 7' });

  const list = await buyer.get('/api/user/get_products');
  const orderId = list.body.orders[0]._id;

  const res = await buyer.post('/api/product/order_details').send({ order_id: orderId });
  assert.equal(res.status, 200);
  assert.equal(res.body.order.address, 'Secret Lane 7');

  const denied = await stranger.post('/api/product/order_details').send({ order_id: orderId });
  assert.equal(denied.status, 404);
});

test('logout clears the cookie so the session really ends', async () => {
  const customer = await makeCustomer();

  assert.equal((await customer.get('/api/user/profile')).status, 200);

  await customer.post('/api/user/logout');

  assert.equal((await customer.get('/api/user/profile')).status, 401);
});