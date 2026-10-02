const express = require('express');
const router = express.Router();

const upload = require('../middlewares/multer');
const { requireSeller } = require('../middlewares/auth');
const {
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
} = require('../controllers/sellerController');
const { register_seller, login_seller, logout } = require('../controllers/authController');

// Public
router.post('/register', register_seller);
router.post('/login', login_seller);
router.post('/logout', logout);

// Everything below requires a valid seller session.
router.get('/profile', requireSeller, profile);
router.get('/products', requireSeller, products);
router.get('/prod_names', requireSeller, prod_names);
router.get('/low_stock', requireSeller, low_stock);
router.get('/prod_quantity', requireSeller, prod_quantity);
router.get('/monthly_revenue', requireSeller, monthly_revenue);
router.get('/monthly_orders', requireSeller, monthly_orders);
router.post('/check_password', requireSeller, check_password);
router.post('/edit/:value', requireSeller, edit);
router.post('/delete', requireSeller, delete_product);
router.post('/create', requireSeller, upload.single('image'), create);

module.exports = router;