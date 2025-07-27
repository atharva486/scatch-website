const productModel = require('../models/productmodel');
const ownerModel = require('../models/ownermodel');
const userModel = require('../models/usermodel');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const bcrypt= require('bcrypt');
const {generateToken} = require('../utils/generateToken');
const {generatePassword} = require('../utils/generateUser');
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fs = require('fs');
const path = require('path');


module.exports.create = async (req, res) => {
  try {
    if (!req.file || (req.body.productname.length==0 || req.body.price.length==0 || req.body.stock.length==0 || req.body.description.length==0 )) {

      return res.json({ success: false,message:true});
    }

    const tok = req.cookies.token;
    const { email, id } = jwt.verify(tok, process.env.JWT_KEY);

    const { productname, price, description, stock } = req.body;
    const imagePath = req.file.filename;
    const product = await productModel.create({
      productname,
      price,
      description,
      image: imagePath,
      sellerid: id,
      stock
    });
    let seller = await ownerModel.findOne({ _id: id });
    seller.products.push(product._id);
    await seller.save();
    res.json({ success: true, product,message:false });

  } catch (err) {
    res.json({ success: false, error: err.message });
  }
};

module.exports.products = async (req, res) => {
  try{
  let tokens = req.cookies.token;
  let { email, id } = jwt.verify(tokens, process.env.JWT_KEY);
  let seller = await ownerModel.findOne({ _id: id });
  let arr = seller.products;
  let products = [];
  for (const e of arr) {
    let product = await productModel.findOne({ _id: e });
    products.push(product);
  }
  res.json({ products,success:true });
}
catch{
  res.json({success:false});
}
}

module.exports.delete_product = async (req, res) => {
  try{
  let {product_id} = req.body;
  let product = await productModel.findOne({_id:product_id});
  let sellerid= product.sellerid;
  let seller = await ownerModel.findOne({_id:sellerid});
  let idx =0;
  for(let item of seller.products){
    if(item.toString()===product_id){
      break;
    }
    idx++;
  }
  seller.products.splice(idx,1);
  await seller.save();
  if(product.customer.length ===0){
    if (product.image) {
        const photoPath = path.join(__dirname,'..','public','images',product.image);
        if (fs.existsSync(photoPath)){
          fs.unlinkSync(photoPath);
        }
      }
    await productModel.findOneAndDelete({_id:product_id});
  }
  res.json({ success:true });
  }
  catch{
    res.json({success:false});
  }
}

module.exports.profile = async (req,res)=>{
  try{
  let token = req.cookies.token;
  let {email, id} = jwt.verify(token, process.env.JWT_KEY);
  let seller = await ownerModel.findOne({_id:id}).select("-password");
  res.json({seller,success:true});
  }
  catch{
    res.json({success:false});
  }
}

module.exports.edit = async (req,res)=>{
  try{
  let object_value = req.params.value;
  let value = req.body.newVal;

  let token = req.cookies.token;
  let {email, id} = jwt.verify(token, process.env.JWT_KEY);
  let seller = await ownerModel.findOne({_id:id});
  if(object_value==="password"){
    let pass = await generatePassword(value);
      seller[object_value]= pass;

  }
  else
  seller[object_value]= value;
  await seller.save();
  
  if(object_value ==="email"){
    let token = generateToken(seller);
    res.cookie("token",token);
  }
  res.json({seller,success:true});
  }
  catch{
    res.json({success:false})
  }
}

module.exports.check_password = async (req,res)=>{
  try{
    let enter_pass = req.body.prevpass;
    let token = req.cookies.token;
    let {email, id} = jwt.verify(token, process.env.JWT_KEY);
    let seller = await ownerModel.findOne({_id:id});
    let result = await bcrypt.compare(enter_pass,seller.password);
    res.json({result,success:true});
  }
  catch{
    res.json({success:false});
  }

}

module.exports.low_stock = async (req, res) => {
  try{
    let token = req.cookies.token;
    let { email, id } = jwt.verify(token, process.env.JWT_KEY);
    let seller = await ownerModel.findOne({_id: id }).populate('products');
    let products = [];
    for (const product of seller.products) {
      let quantity_left = product.stock;
      for(const stock of product.customer){
        quantity_left -= stock.quantity;
      }
      products.push({
        productname: product.productname,
        stock: quantity_left,
      });
    }
    res.json({ products,success:false });
  }
  catch{
    res.json({success:false});
  }
}
////////// delete this


module.exports.prod_quantity = async (req,res)=>{
  try{
  let token = req.cookies.token;
  let {email,id} = jwt.verify(token,process.env.JWT_KEY);
  let seller = await ownerModel.findOne({email:email}).populate("products");
  let products = seller.products;
    const data_req =[];
    for(let product  of products){
      let customer = product.customer;
      let stock_used = 0;
      for(let item of customer){
        stock_used = stock_used + Number(item.quantity);
      }
      
      let productname = product.productname;
      data_req.push({productname,unitsSold:stock_used});
    }
    res.json({data_req,success:true});
  }
  catch{
    res.json({success:false});
  }
}
module.exports.monthly_revenue = async (req,res)=>{
  try{
  let token = req.cookies.token;
  let {email,id} = jwt.verify(token,process.env.JWT_KEY);
  let users = await userModel.find({},{_id:1,orders:1});
  let orders = []
  for(let user of users){
    for(item of user.orders){
      let order = await productModel.findOne({_id:item.productid});
      let totalRevenue  = item.buy_price * item.quantity;
      orders.push({totalRevenue,sellerid:order.sellerid,date:item.date});
    }
  }

  let seller_orders = orders.filter(order=>{
    return (order.sellerid.toString() === id.toString())
  })
  let data_req= [];
  let monthly_data = {};
  seller_orders.forEach((order)=>{
    const date = new Date(order.date);
    let year = date.getFullYear().toString();
    year = year.split('0')[1];
    let month = monthNames[date.getMonth()];
    let date_req = `${month}-${year}`;
    if(monthly_data[date_req]){
      monthly_data[date_req] += order.totalRevenue;
    }
    else
      monthly_data[date_req] = order.totalRevenue;
  });
  Object.entries(monthly_data).map(([key,value])=>{
    data_req.push({month:key,totalRevenue:value});
  })
  res.json({data_req,success:true});
  }
  catch{
    res.json({success:false});
  }
}

module.exports.monthly_orders = async (req,res)=>{
  try{
  let token = req.cookies.token;
  let {email,id} = jwt.verify(token,process.env.JWT_KEY);
  let users = await userModel.find({},{_id:1,orders:1});
  let orders = []
  for(let user of users){
    for(item of user.orders){
      let order = await productModel.findOne({_id:item.productid});
      
      orders.push({quantity:item.quantity,sellerid:order.sellerid,date:item.date});
    }
  }

  let seller_orders = orders.filter(order=>{
    return (order.sellerid.toString() === id.toString())
  })
  let data_req= [];
  let monthly_data = {};
  seller_orders.forEach((order)=>{
    const date = new Date(order.date);
    let year = date.getFullYear().toString();
    year = year.split('0')[1];
    let month = monthNames[date.getMonth()];
    let date_req = `${month}-${year}`;
    if(monthly_data[date_req]){
      monthly_data[date_req] += order.quantity;
    }
    else
      monthly_data[date_req] = order.quantity;
  });
  Object.entries(monthly_data).map(([key,value])=>{
    data_req.push({month:key,totalOrders:value});
  })
  res.json({data_req,success:true});
  }
  catch{
    res.json({success:false});
  }
}

module.exports.prod_names = async (req,res)=>{
  try{
  let token = req.cookies.token;
  let {email,id} = jwt.verify(token,process.env.JWT_KEY);
  let seller = await ownerModel.findOne({_id:id}).populate('products');
  let products = seller.products;

  res.json({products,success:true});
  }
  catch{
    res.json({success:false});
  }
  
}