const express=require("express");
const userController=require("../controllers/userControl");

const router=express.Router();

router.get("/menu", userController.get_menu);
router.get("/menu/:slug", userController.get_product_list);
router.get("/", userController.get_homepage);


module.exports=router;