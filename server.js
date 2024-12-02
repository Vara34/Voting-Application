const express=require('express');
const app=express();
const db = require("./DB.JS");
require('dotenv').config();

const bodyParser=require('body-parser');
app.use(bodyParser.json());
const PORT=process.env.PORT||8001;

//const {jwtAuthMiddleware}=require('./jwt');

const userRoutes=require("./routes/userRoutes");
app.use('/user',userRoutes);
const candidateRoutes=require("./routes/candidateRoutes");
app.use('/candidate',candidateRoutes);

app.listen(PORT,()=>{console.log('Listening on port 8001')});