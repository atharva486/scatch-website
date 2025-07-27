const mongoose=require('mongoose');

const userSchema=mongoose.Schema({
    fullname:String,
    email:String,
    password:String,
    wishlist:[{productid : {type:mongoose.Schema.Types.ObjectId,ref:'product'},date: { type: Date, default: Date.now } }],
    orders: [{productid : {type:mongoose.Schema.Types.ObjectId,ref:'product'},date: { type: Date, default: Date.now },quantity : {type:Number} ,buy_price:{type:Number},address:{type:String}}],
    contact:Number,
    picture:String,

});
module.exports = mongoose.model("user",userSchema);