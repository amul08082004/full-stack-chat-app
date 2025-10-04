const express=require('express');
const controllers=require('../controllers/authController.js');
const authMiddleware=require('../middleware/auth.js'); 
const authRoutes=express.Router();
authRoutes.post("/signup",controllers.signup);
authRoutes.post("/login",controllers.login); 
authRoutes.post("/logout",controllers.logout);
authRoutes.put("/update-profile",authMiddleware,controllers.updateProfile);
authRoutes.get("/check",authMiddleware,controllers.checkAuth)
module.exports=authRoutes;
 