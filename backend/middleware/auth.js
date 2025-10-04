const jwt =require('jsonwebtoken');
// JWT secret from environment
const User=require('../models/userModel.js');
const authMidddleware=async(req,res,next)=>{
  const token=req.cookies.token;
  if(!token){
    return res.status(401).json({message:"No token, authorization denied"});
  }
  try{
   const decoded=jwt.verify(token,"holululu");

   const user=await User.findById(decoded.userId).select("-password");
   //by middleware i am sending user to the next controller
    if(!user){  
      return res.status(401).json({message:"User not found"});
    }
   req.user=user;
  next(); 

  }catch(err){
    console.log(err);
    res.status(500).json({message:"Server error"});
  }
}
module.exports=authMidddleware;