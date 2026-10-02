const mongoose = require('mongoose');
const productModel = require('../models/productmodel');
const ownerModel = require('../models/ownermodel');
const orderModel = require('../models/ordermodel');
const { cloudinary, isConfigured } = require('../config/cloudinary');
const { generateToken } = require('../utils/generateToken');
const { setAuthCookie } = require('../utils/authCookie');
const { generatePassword, comparePassword } = require('../utils/generateUser');
const { asyncHandler, badRequest, forbidden, notFound } = require('../middlewares/errorHandler');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Standard Indian GSTIN: 2 digits + 5 letters + 4 digits + letter + alnum + Z + alnum.
const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/;

/** Products owned by the signed-in seller, newest first. */
const ownedProducts = (sellerId) =>
  productModel.find({ seller: sellerId }).sort({ createdAt: -1 });

/**
 * POST /api/seller/create
 *
 * Requires an uploaded image; previously `req.body.productname.length` was read
 * before checking that the body fields existed, so a missing field threw instead
 * of producing the intended validation message.
 */
const create = asyncHandler(async (req, res) => {
  const { productname, price, description, stock } = req.body ?? {};

  if (!req.file) throw badRequest('A product image is required');
  if (!productname?.trim() || !description?.trim()) {
    throw badRequest('Product name and description are required');
  }

  const numericPrice = Number(price);
  const numericStock = Number(stock);
  if (!Number.isFinite(numericPrice) || numericPrice < 0) {
    throw badRequest('Price must be zero or greater');
  }
  if (!Number.isInteger(numericStock) || numericStock < 0) {
    throw badRequest('Stock must be zero or a positive whole number');
  }

  const product = await productModel.create({
    productname: productname.trim(),
    description: description.trim(),
    price: Math.round(numericPrice * 100) / 100,
    stock: numericStock,
    // Cloudinary writes `public_id` to file.filename; the local fallback buffer
    // path has none, so fall back to the original filename.
    image: req.file.filename || req.file.originalname,
    seller: req.auth.id,
  });

  return res.status(201).json({ success: true, product });
});

/** GET /api/seller/products */
const products = asyncHandler(async (req, res) => {
  const products = await ownedProducts(req.auth.id).lean();
  return res.json({ success: true, products });
});

/** GET /api/seller/prod_names - product list for the seller dashboard. */
const prod_names = asyncHandler(async (req, res) => {
  const products = await ownedProducts(req.auth.id)
    .select('productname price description image stock createdAt')
    .lean();
  return res.json({ success: true, products });
});

/**
 * POST /api/seller/delete
 *
 * Two bugs fixed:
 *   - the removal index ran off the end of the array when the product was not
 *     in the seller's list, so `splice` silently deleted the seller's *last*
 *     product instead of reporting an error;
 *   - the document was only deleted when it had no customers, otherwise the
 *     seller's list and the products collection drifted apart.
 *
 * Deleting a product that has already been ordered is now refused outright,
 * which keeps order history intact.
 */
const delete_product = asyncHandler(async (req, res) => {
  const { product_id: productId } = req.body ?? {};
  if (!mongoose.Types.ObjectId.isValid(productId)) throw badRequest('A valid product_id is required');

  const product = await productModel.findOne({ _id: productId, seller: req.auth.id });

  if (!product) {
    // Distinguish "not yours / does not exist" from "has orders".
    const foreign = await productModel.findById(productId).lean();
    if (!foreign) throw notFound('Product not found');
    throw forbidden('You can only delete your own products');
  }

  const hasOrders = await orderModel.exists({ product: product._id });
  if (hasOrders) {
    throw badRequest('This product has orders and cannot be deleted. Set its stock to 0 instead.');
  }

  await productModel.deleteOne({ _id: product._id });

  // Remove the Cloudinary asset too; this was dead code before because it
  // looked for a file on local disk that no longer existed.
  if (isConfigured() && product.image) {
    try {
      await cloudinary.uploader.destroy(product.image);
    } catch (err) {
      console.warn('[cloudinary] could not remove image:', err.message);
    }
  }

  return res.json({ success: true });
});

/** GET /api/seller/profile */
const profile = asyncHandler(async (req, res) => {
  const seller = await ownerModel.findById(req.auth.id).select('fullname email gstin createdAt').lean();
  if (!seller) throw notFound('Seller not found');
  return res.json({ success: true, seller });
});

/** Fields a seller is allowed to change. Blocks mass assignment. */
const SELLER_EDITABLE = new Set(['fullname', 'email', 'gstin', 'password']);

/**
 * POST /api/seller/edit/:value
 *
 * The handler used to do `seller[req.params.value] = value`, so any document
 * field could be written - including `password` in cleartext or the internal
 * product list. Now only allowlisted fields are accepted, and the response no
 * longer echoes the document back (which leaked the password hash).
 */
const edit = asyncHandler(async (req, res) => {
  const field = String(req.params.value ?? '').toLowerCase();
  const newValue = req.body?.newVal;

  if (!SELLER_EDITABLE.has(field)) {
    throw badRequest(`Field "${field}" cannot be edited`);
  }
  if (newValue === undefined || newValue === null || String(newValue).trim() === '') {
    throw badRequest('A new value is required');
  }

  const update = {};
  if (field === 'password') {
    if (String(newValue).length < 8) throw badRequest('Password must be at least 8 characters');
    update.password = await generatePassword(String(newValue));
  } else if (field === 'email') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(newValue))) {
      throw badRequest('Please provide a valid email address');
    }
    update.email = String(newValue).toLowerCase();
  } else if (field === 'gstin') {
    if (!GSTIN_RE.test(String(newValue).toUpperCase())) {
      throw badRequest('GSTIN must be a valid 15-character GSTIN (e.g. 27ABCDE1234F1Z5)');
    }
    update.gstin = String(newValue).toUpperCase();
  } else {
    update.fullname = String(newValue).trim();
  }

  const seller = await ownerModel.findByIdAndUpdate(req.auth.id, update, { new: true });
  if (!seller) throw notFound('Seller not found');

  // Re-issue the token so it carries the updated email.
  if (field === 'email') setAuthCookie(res, generateToken(seller));

  return res.json({
    success: true,
    seller: { fullname: seller.fullname, email: seller.email, gstin: seller.gstin },
  });
});

/** POST /api/seller/check_password */
const check_password = asyncHandler(async (req, res) => {
  const previous = String(req.body?.prevpass ?? '');
  const seller = await ownerModel.findById(req.auth.id).select('+password');
  if (!seller) throw notFound('Seller not found');

  const result = await comparePassword(previous, seller.password);
  return res.json({ success: true, result });
});

/**
 * GET /api/seller/low_stock
 *
 * Used to return `success: false` even on success, which broke the chart that
 * reads it. Products are now filtered by the authoritative `stock` field.
 */
const low_stock = asyncHandler(async (req, res) => {
  const products = await ownedProducts(req.auth.id)
    .select('productname stock')
    .sort({ stock: 1 })
    .lean();

  return res.json({ success: true, products });
});

/**
 * GET /api/seller/prod_quantity - units sold per product.
 *
 * Was: load every user, loop every order, then `findOne` the product for each
 * one (N+1 across the whole database). Now a single aggregation.
 */
const prod_quantity = asyncHandler(async (req, res) => {
  const rows = await orderModel.aggregate([
    { $match: { seller: new mongoose.Types.ObjectId(req.auth.id) } },
    {
      $group: {
        _id: '$product',
        unitsSold: { $sum: '$quantity' },
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
    {
      $project: {
        _id: 0,
        productid: '$_id',
        productname: '$product.productname',
        unitsSold: 1,
      },
    },
    { $sort: { unitsSold: -1 } },
  ]);

  return res.json({ success: true, data_req: rows });
});

/**
 * GET /api/seller/monthly_revenue
 *
 * One aggregation replaces the whole "load all users, loop all orders, query
 * each product" pass.
 *
 * Also fixes the year formatting: `getFullYear().split('0')[1]` produced an
 * empty string for 2000-2009 and 2100+, and `Object.entries` returned months in
 * insertion order, so the chart axis was effectively random. Months are now
 * chronological.
 */
const monthly_revenue = asyncHandler(async (req, res) => {
  const data = await monthlyAggregate(req.auth.id, {
    total: { $sum: { $multiply: ['$quantity', '$buyPrice'] } },
  });

  return res.json({ success: true, data_req: toMonthSeries(data, 'totalRevenue') });
});

/** GET /api/seller/monthly_orders - units sold per month. */
const monthly_orders = asyncHandler(async (req, res) => {
  const data = await monthlyAggregate(req.auth.id, { total: { $sum: '$quantity' } });

  return res.json({ success: true, data_req: toMonthSeries(data, 'totalOrders') });
});

/**
 * Groups a seller's orders into calendar months.
 *
 * `accumulator` holds only the summing expression: the `_id` grouping key is
 * supplied here so a caller cannot accidentally overwrite it with `_id: null`.
 */
async function monthlyAggregate(sellerId, accumulator) {
  return orderModel.aggregate([
    { $match: { seller: new mongoose.Types.ObjectId(sellerId) } },
    {
      $group: {
        _id: {
          year: { $year: '$orderedAt' },
          month: { $month: '$orderedAt' },
        },
        ...accumulator,
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 24 },
  ]);
}

/** Turns `{ _id: { year, month }, total }` rows into a chronological series. */
function toMonthSeries(rows, valueKey) {
  return rows.map((row) => ({
    month: `${MONTHS[row._id.month - 1]}-${String(row._id.year).slice(-2)}`,
    [valueKey]: row.total,
  }));
}

module.exports = {
  create,
  products,
  prod_names,
  delete_product,
  profile,
  edit,
  check_password,
  low_stock,
  prod_quantity,
  monthly_revenue,
  monthly_orders,
};