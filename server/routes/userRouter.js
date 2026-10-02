const express = require('express');
const router = express.Router();

const { requireUser } = require('../middlewares/auth');
const { register_user, login_user, logout } = require('../controllers/authController');
const {
  profile,
  edit,
  check_password,
  get_products,
  wishlist_products,
  delete_wishlist_item,
} = require('../controllers/userController');

// Public
router.post('/register', register_user);
router.post('/login', login_user);
router.post('/logout', logout);

// Everything below requires a valid customer session.
router.get('/profile', requireUser, profile);
router.get('/get_products', requireUser, get_products);
router.get('/wishlist_products', requireUser, wishlist_products);
router.post('/check_password', requireUser, check_password);
router.post('/edit/:Value', requireUser, edit);
router.post('/delete/wishlist_item/:id', requireUser, delete_wishlist_item);

module.exports = router;