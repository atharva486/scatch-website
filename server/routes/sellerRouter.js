const express = require('express');
const router = express.Router();
const {authMiddlewareSeller} = require('../middlewares/auth');
const {create,products,delete_product,profile,edit,check_password,low_stock, prod_quantity,monthly_revenue,monthly_orders,prod_names} = require('../controllers/sellerController');
const { register_seller,login_seller,logout} = require('../controllers/authController');
const upload = require('../middlewares/multer');


router.post('/login', login_seller);

router.post('/register', register_seller);

router.post('/create',authMiddlewareSeller,upload.single("image"),create);

router.get('/products',authMiddlewareSeller,products);

router.post('/delete',authMiddlewareSeller,delete_product)

router.get('/profile',authMiddlewareSeller,profile);

router.post(`/edit/:value`,authMiddlewareSeller,edit)

router.post(`/check_password`,check_password);


router.get('/prod_quantity',authMiddlewareSeller, prod_quantity);

router.get('/monthly_revenue',authMiddlewareSeller,monthly_revenue);

router.get('/monthly_orders',authMiddlewareSeller,monthly_orders);

router.get('/prod_names',prod_names)

router.get('/low_stock',authMiddlewareSeller,low_stock);

router.post('/logout',logout);

module.exports = router;
