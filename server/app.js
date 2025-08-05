const express = require('express');
const app= express();
const path = require('path');
const cookieParser = require('cookie-parser');
const db = require('./config/mongoose-connection');
const sellerRouter = require('./routes/sellerRouter');
const userRouter = require('./routes/userRouter');
const productRouter = require('./routes/productRouter');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const PORT = process.env.PORT || 3000;
require("dotenv").config();

app.use(cookieParser());
app.use(cors({origin:`${process.env.CLIENT_URL}`,credentials:true}))
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

app.use('/api/seller',sellerRouter);
app.use('/api/user',userRouter);
app.use('/api/product',productRouter);


app.listen(PORT);