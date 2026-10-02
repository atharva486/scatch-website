const mongoose = require('mongoose');
const productModel = require('../models/productmodel');
const orderModel = require('../models/ordermodel');
const userModel = require('../models/usermodel');
const { asyncHandler, badRequest, forbidden, notFound } = require('../middlewares/errorHandler');

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

/** Strips fields that must never leave the server. */
const publicProduct = (product) => ({
  _id: product._id,
  productname: product.productname,
  price: product.price,
  description: product.description,
  image: product.image,
  stock: product.stock,
  seller: product.seller,
});

/**
 * GET /api/product/shop
 *
 * Storefront listing: everything a logged-in customer may buy.
 *
 * Was an aggregation followed by one `ownerModel.findById` per product (N+1),
 * and it threw if any seller had been deleted, failing the whole request.
 */
const shop = asyncHandler(async (req, res) => {
  const sellerId = req.auth?.id || null;

  const products = await productModel
    .find({ stock: { $gt: 0 }, ...(sellerId ? { seller: { $ne: sellerId } } : {}) })
    .select('productname price description image stock seller')
    .sort({ createdAt: -1 })
    .lean();

  return res.json({ success: true, products });
});

/** GET /api/product/:id - a single product, used by the buy page. */
const show = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw notFound('Product not found');

  const product = await productModel.findById(id).lean();
  if (!product) throw notFound('Product not found');

  return res.json({ success: true, product: publicProduct(product) });
});

/** GET /api/product/product_details/:product_id */
const product_details = asyncHandler(async (req, res) => {
  const { product_id: productId } = req.params;
  if (!isValidObjectId(productId)) throw notFound('Product not found');

  const product = await productModel.findById(productId).lean();
  if (!product) throw notFound('Product not found');

  return res.json({ success: true, product: publicProduct(product) });
});

/**
 * POST /api/product/buy/:id
 *
 * Fixes three correctness problems:
 *   - the price came from `req.body.data.price`, i.e. whatever the client sent,
 *     so a customer could buy any item for Rs 1;
 *   - stock was checked and written separately, letting two concurrent buyers
 *     oversell the last unit;
 *   - there was no check that the requested quantity was a positive integer.
 *
 * The stock decrement is now a single conditional `findOneAndUpdate`, so the
 * database itself refuses to go below zero.
 */
const buy = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const quantity = Number(req.body?.quantity);
  const address = String(req.body?.address ?? '').trim();

  if (!isValidObjectId(id)) throw notFound('Product not found');
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw badRequest('Quantity must be a whole number of at least 1');
  }
  if (!address) throw badRequest('Shipping address is required');

  const reserved = await productModel.findOneAndUpdate(
    { _id: id, stock: { $gte: quantity } },
    { $inc: { stock: -quantity } },
    { new: true }
  );

  if (!reserved) {
    // Either the product does not exist or not enough stock remains.
    const exists = await productModel.exists({ _id: id });
    throw exists
      ? badRequest(`Only ${await remainingStock(id)} unit(s) left in stock`)
      : notFound('Product not found');
  }

  try {
    await orderModel.create({
      product: reserved._id,
      buyer: req.auth.id,
      seller: reserved.seller,
      quantity,
      // Snapshot from the database, never from the request body.
      buyPrice: reserved.price,
      address,
    });
  } catch (err) {
    // Put the stock back if the order could not be recorded, otherwise the
    // units are lost forever.
    await productModel.updateOne({ _id: id }, { $inc: { stock: quantity } });
    throw err;
  }

  return res.status(201).json({ success: true });
});

async function remainingStock(productId) {
  const product = await productModel.findById(productId).select('stock').lean();
  return product ? product.stock : 0;
}

/**
 * POST /api/product/change_price/:product_id
 *
 * Now verifies the caller actually owns the product. Previously any logged-in
 * seller could rewrite any other seller's prices.
 */
const change_price = asyncHandler(async (req, res) => {
  const { product_id: productId } = req.params;
  const newPrice = Number(req.body?.newprice);

  if (!isValidObjectId(productId)) throw notFound('Product not found');
  if (!Number.isFinite(newPrice) || newPrice < 0) {
    throw badRequest('Price must be zero or greater');
  }

  // `findOneAndUpdate` (not `findByIdAndUpdate`) so the `seller` condition is
  // actually applied to the filter - passing a compound filter to
  // `findByIdAndUpdate` allowed any seller to rewrite anyone's price.
  const product = await productModel.findOneAndUpdate(
    { _id: productId, seller: req.auth.id },
    { $set: { price: Math.round(newPrice * 100) / 100 } },
    { new: true }
  );

  if (!product) throw forbidden('You can only change the price of your own products');
  return res.json({ success: true, product: publicProduct(product) });
});

/** POST /api/product/restock/:product_id - adds units to existing stock. */
const restock = asyncHandler(async (req, res) => {
  const { product_id: productId } = req.params;
  const newStock = Number(req.body?.newStock);

  if (!isValidObjectId(productId)) throw notFound('Product not found');
  if (!Number.isInteger(newStock) || newStock < 1) {
    throw badRequest('Stock to add must be a whole number of at least 1');
  }

  const product = await productModel.findOneAndUpdate(
    { _id: productId, seller: req.auth.id },
    { $inc: { stock: newStock } },
    { new: true }
  );

  if (!product) throw forbidden('You can only restock your own products');
  return res.json({ success: true, product: publicProduct(product) });
});

/** POST /api/product/add_to_cart/:id - adds to wishlist, ignoring duplicates. */
const add_to_cart = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw notFound('Product not found');

  const exists = await productModel.exists({ _id: id });
  if (!exists) throw notFound('Product not found');

  // `$addToSet` is not usable here: it compares whole subdocuments and every
// entry gets a different `addedAt`, so the same product was appended repeatedly.
// Filtering on "not already present" in the query makes this idempotent and
// still atomic against concurrent double clicks.
  const result = await userModel.updateOne(
    { _id: req.auth.id, wishlist: { $not: { $elemMatch: { product: id } } } },
    { $push: { wishlist: { product: id } } }
  );

  const alreadyInWishlist = result.matchedCount > 0 && result.modifiedCount === 0;
  return res.status(201).json({ success: true, alreadyInWishlist });
});

/** GET /api/product/show_seller/:id - seller's own view of a product. */
const show_seller = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw notFound('Product not found');

  const product = await productModel.findById(id).lean();
  if (!product) throw notFound('Product not found');
  if (String(product.seller) !== String(req.auth.id)) {
    throw forbidden('You can only view your own products');
  }

  return res.json({ success: true, product: publicProduct(product) });
});

/**
 * POST /api/product/order_details
 *
 * Looked the order up by matching product + quantity + formatted date, which
 * was ambiguous whenever a customer bought the same quantity of the same
 * product twice on one day. Orders now have their own id.
 */
const order_details = asyncHandler(async (req, res) => {
  const { order_id: orderId } = req.body ?? {};
  if (!isValidObjectId(orderId)) throw notFound('Order not found');

  const order = await orderModel
    .findOne({ _id: orderId, buyer: req.auth.id })
    .populate('product', 'productname price description image')
    .lean();

  if (!order) throw notFound('Order not found');

  return res.json({
    success: true,
    order: {
      _id: order._id,
      productname: order.product?.productname ?? 'Unavailable product',
      price: order.buyPrice,
      description: order.product?.description ?? '',
      image: order.product?.image ?? '',
      quantity: order.quantity,
      address: order.address,
      orderedAt: order.orderedAt,
    },
  });
});

module.exports = {
  shop,
  show,
  buy,
  show_seller,
  change_price,
  restock,
  add_to_cart,
  order_details,
  product_details,
};