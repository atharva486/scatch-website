const express = require('express');
const router = express.Router();

const {
  shop,
  show,
  buy,
  show_seller,
  change_price,
  restock,
  add_to_cart,
  order_details,
  product_details,
} = require('../controllers/productController');

const { requireUser, requireSeller, optionalAuth } = require('../middlewares/auth');

/**
 * Route order matters here.
 *
 * `/:id` was registered before `/product_details/:product_id` and
 * `/show_seller/:id`, so those paths were swallowed by `show` with `id` set to
 * the literal string "product_details" / "show_seller" and always failed.
 * Concrete paths are declared before the catch-all parameter route.
 */

// Public / signed-in-readable
router.get('/shop', optionalAuth, shop);
router.get('/product_details/:product_id', product_details);
router.get('/show_seller/:id', requireSeller, show_seller);

// Customer-only, state-changing
router.post('/buy/:id', requireUser, buy);
router.post('/add_to_cart/:id', requireUser, add_to_cart);
router.post('/order_details', requireUser, order_details);

// Seller-only
router.post('/change_price/:product_id', requireSeller, change_price);
router.post('/restock/:product_id', requireSeller, restock);

// Catch-all parameter route last.
router.get('/:id', show);

module.exports = router;