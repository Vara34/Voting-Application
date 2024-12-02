const jwt=require("jsonwebtoken");
require('dotenv').config();
const jwtAuthMiddleware=(req,res,next)=>{
   const authorization=req.headers.authorization;
   if(!authorization) return res.status(401).json({error:'token not found'});
    //Extract the jwt token from the request headers
    //const token=req.headers.authorization.split('')[1];
    const token = req.headers.authorization.split(' ')[1]; // 'Bearer <token>'

    if(!token) return res.status(401).json({error:'Unauthorized'});
    try{
        //verify the jwt token
        const decoded=jwt.verify(token,process.env.JWT_SECRET);

        //ATTACH THE USER INFORMATON TO THE REQUEST OBJECT

        req.user=decoded;
        next();
    }catch(err){
        console.error(err);
        res.status(401).json({error:'Invalid token'});
    }
};

//function to generate jwt token
const generateToken=(userData)=>{
    return jwt.sign(userData,process.env.JWT_SECRET,{expiresIn:'1hr'});
}

module.exports={jwtAuthMiddleware,generateToken};