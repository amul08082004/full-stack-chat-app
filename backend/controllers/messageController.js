const User=require("../models/userModel")
const Message=require("../models/messageModel")
const cloudinary=require("../lib/cloudinary.js")

exports.getUsersForSidebar=async(req,res)=>{
try{
  const userId=req.user._id;
  const filteredUsers=  await User.find({_id:{$ne:userId}}).select("-password")
res.status(200).json(filteredUsers)
}catch(err){
console.log("error in getUSer  for sidebar",err.message)
res.status(501).json({message:"interal server error"})
}
}

exports.getMessages=async(req,res)=>{
  try{
  const{id}=req.params;
  const senderId=req.user._id;
  const messages=await Message.find({
    $or:[
      {senderId:senderId,receiverId:id},
      {senderId:id,receiverId:senderId}
    ]
  })
  res.status(200).json(messages)
}catch(err){
  console.log("error in getMessage controller")
  res.status(501).json({messages:"internal server error"})
}
}

exports.sendMessage=async(req,res)=>{
  try{
  const {text,image}=req.body;
  const {id}=req.params;
  const senderId=req.user._id;
  let imageUrl;
  if(image){
   const uploadResponse=await cloudinary.uploader.upload(image);
   imageUrl=uploadResponse.secure_url;
  }
  const newMessage=new Message({
    senderId,
   receiverId:id,
    text,
    image:imageUrl
  })
  await newMessage.save();
  res.status(201).json({newMessage})
  }catch(err){
    console.log("error in sendmesage controller",err.message)
  res.status(500).json({error:"internal server error"})
  }
}    