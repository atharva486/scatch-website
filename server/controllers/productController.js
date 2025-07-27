const productModel = require('../models/productmodel');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const ownerModel = require('../models/ownermodel');
const userModel = require('../models/usermodel');


module.exports.shop = async (req,res)=>{
    try{
    let tokens = req.cookies.token;
    let {email,id} = jwt.verify(tokens,process.env.JWT_KEY);
    let products_req =  await productModel.aggregate([
        {$addFields: {totalOrderedQty: { $sum: "$customer.quantity" }}},
        {$match: {$expr: { $lt: ["$totalOrderedQty", "$stock"] }}}
    ]);
    let products = [];
    for(item of products_req){
        let seller = await ownerModel.findById(item.sellerid);
        if(seller.email.toString()!=email.toString())
            products.push(item);
    }
    
    res.json({products});
    }
    catch{
    res.json({success:false});}
};


module.exports.show = async (req,res)=>{
        let product_id =req.params.id;
        let quantity_used= 0;
        try{
        let product = await productModel.findOne({_id:product_id});
        const tok = req.cookies.token;
        const { email, id } = jwt.verify(tok, process.env.JWT_KEY);
        let user = await userModel.findById(id);
        for (item of user.orders){
            if (item.productid.toString() === product_id.toString())
                quantity_used=quantity_used + item.quantity;
        }

        res.json({success:true,product,quantity_used});
        }
        catch{
            res.json({success:false});
        }
}


module.exports.buy = async (req,res)=>{
    try{
    let product_id = req.params.id;
    let {quantity,data,address} = req.body;
    let price = data.price;
    const tok = req.cookies.token;
    const { email, id} = jwt.verify(tok, process.env.JWT_KEY);
    let product = await productModel.findOne({_id:product_id});
    let user = await userModel.findById(id);
    let f=0;
    for(item of product.customer){
        if(item.customerid.toString() === id){
            item.quantity = Number(item.quantity) + Number(quantity);
            f=1;
            await product.save();
            break;
        }
    }
        if(f==0)
    product.customer.push({customerid:id,quantity:quantity});
    user.orders.push({productid:product_id,quantity:quantity,buy_price:price,address});

    await user.save();
    await product.save();
    res.json({success:true});
    }
    catch{
        res.json({success:false});
    }
}

module.exports.show_seller = async (req,res)=>{
    try{
    let product_id = req.params.id;
    let quantity_used = 0;
    let product = await productModel.findOne({_id:product_id});
    for(item of product.customer){
        quantity_used = Number(quantity_used || 0) + Number(item.quantity || 0);
    }
   
    let stock_left = Number(product.stock) - quantity_used;
    await product.save();
    res.json({product,stock_left,success:true});
    }
    catch{
        res.json({success:false});
    }
}

module.exports.change_price = async (req,res)=>{
    try{
    let productId = req.params.product_id;
    let price = req.body.newprice;

    let product = await productModel.findOne({_id:productId});
    product.price = price;
    await product.save();
    res.json({success:true});
    }
    catch{
        res.json({success:false});
    }
}

module.exports.restock = async(req,res) =>{
    try{
    let productId = req.params.product_id;
    let newStock = req.body.newStock;
    let product = await productModel.findOne({_id:productId});
    product.stock = Number(product.stock)+ Number(newStock);
    await product.save();
    res.json({success:true});
    } 
    catch{
        res.json({success:false});
    }
}

module.exports.add_to_cart = async(req,res)=>{
    try{
    let product_id = req.params.id;
    const tok = req.cookies.token;
    const { email, id } = jwt.verify(tok, process.env.JWT_KEY);
    let user = await userModel.findById(id);
    user.wishlist.push({productid:product_id});
    await user.save();
    res.json({success:true});
    }
    catch{
        res.json({success:false});
    }

}

module.exports.stock = async (req,res)=>{
    try{
   let token = req.cookies.token;
   let {email,id} = jwt.verify(token,process.env.JWT_KEY);
   let seller = await ownerModel.findOne({email:email});
   res.json({seller,success:true});
    }
    catch{
        res.json({success:false})
    }
};

module.exports.order_details = async (req,res) =>{

        let {product_id,date,quantity_used} =req.body;

        try{
        let product = await productModel.findOne({_id:product_id});
        let data_req= product.toObject();
        const tok = req.cookies.token;
        const { email, id } = jwt.verify(tok, process.env.JWT_KEY);
        let user = await userModel.findById(id);
        for(item of user.orders){
            let time = item.date.toISOString().split('T')[0];
            let [year,month,day] = time.split('-');
            time = day +'-' +month + '-' + year;
            if((item.productid.toString() === product_id.toString()) && (item.quantity === Number(quantity_used)) && (time === date)){
                data_req['date'] = date;data_req['quantity_used'] = quantity_used;data_req['address'] = item.address;
                ;}
        }
        res.json({data_req,success:true});
        }
        catch(err){
            res.json({success:false});
        }
}

module.exports.product_details = async (req,res) =>{
    try{
    let product_id = req.params.product_id;

    let product = await productModel.findOne({_id:product_id});
    
    res.json({product,success:true});
    }
    catch{
        res.json({success:false});
    }
}




