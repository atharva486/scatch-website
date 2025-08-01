const express = require('express');
const {authMiddlewareUser} = require('../middlewares/auth');
const { register_user,login_user,logout} = require('../controllers/authController');
const {edit,profile,check_password,get_products,wishlist_products,delete_wishlist_item} = require('../controllers/userController');
const router= express.Router();



router.post('/register',register_user);

router.post('/login', login_user)

router.post('/logout',logout);

router.get('/profile',authMiddlewareUser,profile)

router.get('/get_products',authMiddlewareUser,get_products);

router.post('/check_password',authMiddlewareUser,check_password);

router.get('/wishlist_products',wishlist_products);

router.post('/edit/:Value',authMiddlewareUser,edit);


router.post('/delete/wishlist_item/:id',delete_wishlist_item);

module.exports = router;