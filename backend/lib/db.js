const mongoose=require('mongoose');
const connectDB=async()=>{
  try{
    await mongoose.connect("mongodb+srv://adarshchauhan1236_db_user:Adamul8@cluster0.mhkzikq.mongodb.net/chat_db?retryWrites=true&w=majority&appName=Cluster0");
    console.log("MongoDB connected");
  }catch(err){
    console.log(err);
  } 
}
module.exports=connectDB;


// mongodb+srv://adarshchauhan1236_db_user:Adamul8@cluster0.mhkzikq.mongodb.net/chat_db?retryWrites=true&w=majority&appName=Cluster0