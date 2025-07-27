const mongoose=require('mongoose');
const ownerSchema=mongoose.Schema({
    fullname:{type:String,minLength:3},
    email:String,
    password:String,
    products:[{type:mongoose.Schema.Types.ObjectId, ref:'product'}],
    gstin:String,
    
});
module.exports = mongoose.model("owner",ownerSchema);