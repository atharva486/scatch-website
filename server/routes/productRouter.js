const express = require('express');
const router= express.Router();
const {shop,show,buy,show_seller,change_price,restock,add_to_cart,stock, order_details,product_details} =require('../controllers/productController');
const {authMiddlewareSeller,authMiddlewareUser} = require('../middlewares/auth');

router.get('/shop',shop);

router.get('/:id',show);

router.post('/buy/:id',authMiddlewareUser,buy);

router.post('/change_price/:product_id',authMiddlewareSeller,change_price)

router.post('/restock/:product_id',authMiddlewareSeller,restock);

router.post('/add_to_cart/:id',add_to_cart);

router.get('/stock',stock);

router.post('/order_details',order_details);

router.get('/product_details/:product_id',product_details);

router.get('/show_seller/:id',authMiddlewareSeller, show_seller);

module.exports = router;