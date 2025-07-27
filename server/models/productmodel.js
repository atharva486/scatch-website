const mongoose=require('mongoose');

const productSchema=mongoose.Schema({    
    productname:String,
    price:Number,
    description:String,
    image:String,
    sellerid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'owner',   
    },
    stock:{type:Number , default:0},
    customer:[{customerid:{type:mongoose.Schema.Types.ObjectId, ref:'user'},quantity:{type:'Number'}}]   
    
});
module.exports = mongoose.model("product",productSchema);