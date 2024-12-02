const mongoose=require("mongoose");
require('dotenv').config();
const mongoURL="mongodb://localhost:27017/voting";

mongoose.connect(mongoURL,{
    // useNewUrlParser:true,
    // useUnifiedTopology:true
})

const db=mongoose.connection; 

db.on("connected",()=>{
    console.log("connected to mongodb server");
});

db.on("err",(err)=>{
    console.error("mongodb connection error:",err);
});

db.on("disconnected",()=>{
    console.log(" mongodb disconnected");
});


module.exports=db;