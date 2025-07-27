const productModel = require('../models/productmodel');
const userModel = require('../models/usermodel');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const {generateToken} = require('../utils/generateToken');
const {generatePassword} = require('../utils/generateUser');

module.exports.profile = async (req,res)=>{
  try{
  let token = req.cookies.token;
  let {email, id} = jwt.verify(token, process.env.JWT_KEY);
  let user= await userModel.findOne({_id:id}).select("-password");
  res.json({user,success:true});
  }
  catch{
    res.json({success:false});
  }
}

module.exports.edit = async (req,res)=>{
  try{
  let object_value = req.params.Value;
  let value = req.body.newVal;
  let token = req.cookies.token;
  let {email, id} = jwt.verify(token, process.env.JWT_KEY);
  let user = await userModel.findOne({_id:id});
  if(object_value==="password"){
    let pass = await generatePassword(value);
    user[object_value]= pass;
  }
  else
  user[object_value] = value;
  await user.save();
  if(object_value === "email"){
    let token = generateToken(user);
    res.cookie("token",token);
  }
  res.json({success:true});}
  catch{
    res.json({success:false});
  }
}

module.exports.check_password = async (req,res)=>{
  try{
    let enter_pass = req.body.prevpass;
    let token = req.cookies.token;
    let {email, id} = jwt.verify(token, process.env.JWT_KEY);
    let user = await userModel.findOne({_id:id});
    let result = await bcrypt.compare(enter_pass,user.password);
    res.json({result,success:true});
  }
  catch{
    res.json({success:false});
  }

}

module.exports.get_products = async (req,res)=>{
  try{
    let token = req.cookies.token;
    let {email, id} = jwt.verify(token, process.env.JWT_KEY);
    let user = await userModel.findOne({_id:id});
    let orders = user.orders;
    let products=[];

    for(item of orders){
      let prod = await productModel.findOne({_id:item.productid});
      let quantity = item.quantity;
      let buy_price = item.buy_price;
      let time = item.date.toISOString().split('T')[0];
      let [year,month,day] = time.split('-');
      time = day +'-' +month + '-' + year;
      products.push({prod,quantity,time,buy_price});
    }+
    res.json({products,success:true});
  }
  catch{
    res.json({success:false});
  }
}

module.exports.wishlist_products = async (req,res)=>{
  try{
    let token = req.cookies.token;
    let {email, id} = jwt.verify(token, process.env.JWT_KEY);
    let user = await userModel.findOne({_id:id});
    let wishlist = user.wishlist;
    let products=[];

    for(item of wishlist){
      let prod = await productModel.findOne({_id:item.productid});

      let time = item.date.toISOString().split('T')[0];
      let [year,month,day] = time.split('-');
      time = day +'-' +month + '-' + year;
      products.push({prod,time});
    }
    res.json({products,success:true});
  }
  catch{
    res.json({success:false});
  }

}

module.exports.delete_wishlist_item = async (req,res)=>{
  try{
    let product_id = req.params.id;
    let token = req.cookies.token;
    let {email, id} = jwt.verify(token, process.env.JWT_KEY);
    let user = await userModel.findOne({_id:id});
    const index = user.wishlist.findIndex(
      (item) => item.productid.toString() === product_id.toString()
    );
    if (index !== -1) {
      user.wishlist.splice(index, 1);
      await user.save();
      return res.json({ success: true, message: "Item removed from wishlist" });
    } else {
      return res.json({ success: false, message: "Item not found in wishlist" });
    }
    }
    catch{
      res.json({success:false});
    }
}

