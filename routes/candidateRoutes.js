const express=require("express");
const router=express.Router();
const Candidate= require('./../models/candidate.js'); 
const {jwtAuthMiddleware,generateToken}=require('./../jwt');
const User = require("./../models/user.js");

const checkAdminRole=async(userID)=>{
   try{
    const user=await User.findById(userID);
     if(user.role === "admin"){
        return true;
     }
   }catch(err){
    return false;
   }
};
//POST route to add a candidate
router.post("/",jwtAuthMiddleware, async (req, res) => {
    try {
        if(! (await checkAdminRole(req.user.id)));
        return res.status(403).json({message:'user does not have admin role'});
        const data = req.body;//Assuming the request body contains the candidate data
        //Create a new candidate document using the mongoose model
        const newCandidate = new Candidate(data);
        //save the new user to the database
        const response = await newCandidate.save();
        console.log("data saved");
       
        res.status(200).json({response:response}); // Use res.status(201) for successful creation
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "internal server error" });
    }
});


router.put("/:candidateID",jwtAuthMiddleware,async(req,res)=>{
    try{
        if(!checkAdminRole(req.user.id));
        return res.status(403).json({message:'user does not have admin role'});
        //Extract the id from the token
        const candidateID=req.params.candidateID;
        const updatedCandidateData=req.body;
        const response=await Candidate.findByIdAndUpdate(candidateID,updatedCandidateData,{
            new:true,
            runValidators:true,
        })
        if(!response){
            return res.status(404).json({error:"Candidate not found"});
        }
       console.log("Candidate data updated");
       res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"internal server error"});
    }
});

router.delete("/:candidateID",jwtAuthMiddleware,async(req,res)=>{
    try{
        if(!checkAdminRole(req.user.id));
        return res.status(403).json({message:'user does not have admin role'});
        //Extract the id from the token
        const candidateID=req.params.candidateID;
        const response=await Candidate.findByIdAndDelete(candidateID);
    
        if(!response){
            return res.status(404).json({error:"Candidate not found"});
        }
       console.log("Candidate deleted");
       res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"internal server error"});
    }
});
//voting
router.get('/vote/:candidateID',jwtAuthMiddleware,async(req,res)=>{
    //no admin can vote
    //user can only vote once
    candidateID=req.params.candidateID;
    userId=req.user.id;
    try{
       //find the candidate document with the specified candidateID
        const candidate=await Candidate.findById(candidateID);
        if(!candidate){
        return res.status(404).json({message:"candidate not found"});
        };
        const user=await User.findById(userId);
        if(!user){
            return res.status(404).json({message:"user not found"});
        };
        if(user.isVoted){
            return res.status(400).json({message:"you have already voted"});
        };
        if(user.role == "admin"){
            return res.status(400).json({message:"admin is not allwed"});
        };
        //update the candidate document to record the vote
        candidate.votes.push({user:userId});
        candidate.voteCount++;
        await candidate.save();

        //update the user document
        user.isVoted=true;
        await user.save();
        return res.status(200).json({message:"vote recorded succesfully"});
    }catch(err){
        console.log(err);
        res.status(500).json({error:"internal server error"});
    }
});

//vote count
router.get('/vote/count',async(req,res)=>{
    try{
      //find all candidates an sort them byb votecount is descending order
      const candidate=await Candidate.find().sort({voteCount:'desc'});

      //Map the candidates to only return their name and voteCount
       const voteRecord=candidate.map((data)=>{
          return{
            party:data.party,
            count:data.voteCount
          }
       });
    }catch(err){
        console.log(err);
        res.status(500).json({error:"internal server error"});
    }
});

//candidate
router.get('/candidate',async(req,res)=>{
    try{
        //list of candidates
        const candidates=await Candidate.find({},'name party -_id');
        res.status(200).json(candidates);

    }catch(err){
        console.log(err);
        res.status(500).json({error:"internal server error"});
    }
});
module.exports=router;