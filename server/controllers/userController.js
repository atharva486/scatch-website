const userModel = require('../models/usermodel');
const orderModel = require('../models/ordermodel');
const productModel = require('../models/productmodel');
const { generateToken } = require('../utils/generateToken');
const { setAuthCookie } = require('../utils/authCookie');
const { generatePassword, comparePassword } = require('../utils/generateUser');
const { asyncHandler, badRequest, notFound } = require('../middlewares/errorHandler');

/** GET /api/user/profile */
const profile = asyncHandler(async (req, res) => {
  const user = await userModel
    .findById(req.auth.id)
    .select('fullname email contact picture createdAt')
    .lean();

  if (!user) throw notFound('User not found');
  return res.json({ success: true, user });
});

/** Fields a customer is allowed to change. Blocks mass assignment. */
const USER_EDITABLE = new Set(['fullname', 'email', 'contact', 'password']);

/**
 * POST /api/user/edit/:value
 *
 * Was `user[req.params.Value] = value`, so any field on the document could be
 * overwritten. Now restricted to an allowlist with per-field validation.
 */
const edit = asyncHandler(async (req, res) => {
  const field = String(req.params.Value ?? '').toLowerCase();
  const newValue = req.body?.newVal;

  if (!USER_EDITABLE.has(field)) {
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
  } else if (field === 'contact') {
    const contact = Number(newValue);
    if (!Number.isFinite(contact) || contact < 0) throw badRequest('Contact must be a number');
    update.contact = contact;
  } else {
    update.fullname = String(newValue).trim();
  }

  const user = await userModel.findByIdAndUpdate(req.auth.id, update, { new: true });
  if (!user) throw notFound('User not found');

  if (field === 'email') setAuthCookie(res, generateToken(user));

  return res.json({
    success: true,
    user: { fullname: user.fullname, email: user.email, contact: user.contact },
  });
});

/** POST /api/user/check_password */
const check_password = asyncHandler(async (req, res) => {
  const previous = String(req.body?.prevpass ?? '');
  const user = await userModel.findById(req.auth.id).select('+password');
  if (!user) throw notFound('User not found');

  const result = await comparePassword(previous, user.password);
  return res.json({ success: true, result });
});

/**
 * GET /api/user/get_products - order history.
 *
 * One populated query instead of one query per order, and it no longer crashes
 * the UI when a listed product has since been removed (`prod` was null and the
 * page read `prod.productname`).
 */
const get_products = asyncHandler(async (req, res) => {
  const orders = await orderModel
    .find({ buyer: req.auth.id })
    .populate('product', 'productname price image')
    .sort({ orderedAt: -1 })
    .lean();

  return res.json({
    success: true,
    orders: orders.map((order) => ({
      _id: order._id,
      product: order.product,
      quantity: order.quantity,
      buyPrice: order.buyPrice,
      address: order.address,
      orderedAt: order.orderedAt,
    })),
  });
});

/** GET /api/user/wishlist_products */
const wishlist_products = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.auth.id).select('wishlist').lean();
  if (!user) throw notFound('User not found');

  // One query for all wishlisted products rather than one per entry.
  const productIds = user.wishlist.map((entry) => entry.product).filter(Boolean);
  const products = productIds.length
    ? await productModel.find({ _id: { $in: productIds } }).select('productname price image').lean()
    : [];

  const byId = new Map(products.map((p) => [String(p._id), p]));

  return res.json({
    success: true,
    wishlist: productIds
      .map((id) => byId.get(String(id)))
      .filter(Boolean)
      .map((product) => ({
        _id: product._id,
        productname: product.productname,
        price: product.price,
        image: product.image,
      })),
  });
});

/** POST /api/user/delete/wishlist_item/:id */
const delete_wishlist_item = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await userModel.updateOne(
    { _id: req.auth.id, 'wishlist.product': id },
    { $pull: { wishlist: { product: id } } }
  );

  if (result.modifiedCount === 0) {
    throw notFound('That item is not in your wishlist');
  }
  return res.json({ success: true });
});

module.exports = {
  profile,
  edit,
  check_password,
  get_products,
  wishlist_products,
  delete_wishlist_item,
};