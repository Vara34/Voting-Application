const express=require("express");
const router=express.Router();
const User= require('./../models/user.js'); 
//const jwt = require('jsonwebtoken');
const {jwtAuthMiddleware,generateToken}=require('./../jwt');
//signup route
router.post("/signup", async (req, res) => {
    try {
        const data = req.body;//Assuming the request body contains the user data
        //Create a new user document using the mongoose model
        const newUser = new User(data);
        //save the new user to the database
        const response = await newUser.save();
        console.log("data saved");
        const payload={
            id:response.id
        }
        console.log(JSON.stringify(payload));
        const token=generateToken(payload);
        console.log("Token is : ",token);
        res.status(200).json({response:response,token:token}); // Use res.status(201) for successful creation
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "internal server error" });
    }
});
//Login Route
router.post('/login',async(req,res)=>{
    
    try{
        //Extract aadharCardNumber and password from the request body
        const {aadharCardNumber,password}=req.body;
        //find the user by aadharCardNumber
        const user=await User.findOne({aadharCardNumber:aadharCardNumber});
        //if user does not exist or password does not match,return error
        if(!user || !(await user.comparePassword(password))){
            return res.status(401).json({error:"Invalid username or password"});
        }
        //generate token
        const payload={
            id:user.id
        };
        const token=generateToken(payload);
        res.json(token);
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal server error'});

    }
});
//profile route
router.get('/profile',jwtAuthMiddleware,async(req,res)=>{
    try{
        const userData=req.user;
        const userId=userData.id;
        const user=await User.findById(userId);
        res.status(500).json({user});
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal server error'});
    }
});

router.put("/profile/password",async(req,res)=>{
    try{
        //Extract the id from the token
        const userId=req.user.id;
       const {currentPassword,newPassword}=req.body; //Extraxt current and new passwords from the request body

        //find the user by userId
        const user=await User.findOne({aaadharCardNumber:aadharCardNumber});
        //if  password does not match,return error
        if(!(await user.comparePassword(currentPassword))){
            return res.status(401).json({error:"Invalid  password"});
        }

        //update the user's password
        user.password=newPassword;
        await user.save();

       console.log("password updated");
       res.status(200).json({message:'password updated'});
    }catch(err){
        console.log(err);
        res.status(500).json({error:"internal server error"});
    }
});



module.exports=router;