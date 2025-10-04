const express=require("express")
const authMiddleware=require("../middleware/auth")
const controller=require('../controllers/messageController')
const router=express.Router()
router.get("/users",authMiddleware,controller.getUsersForSidebar)
router.get("/:id",authMiddleware,controller.getMessages)
router.post("/send/:id",authMiddleware,controller.sendMessage)
module.exports=router;