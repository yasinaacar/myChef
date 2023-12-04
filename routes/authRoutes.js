const express=require("express");

const authControl=require("../controllers/authControl");

const router=express.Router();

router.get("/register",authControl.get_register);
router.post("/register",authControl.post_register);

router.get("/login",authControl.get_login);
router.post("/login",authControl.post_login);

router.get("/logout",authControl.post_logout);

router.get("/reset-password", authControl.get_reset_password);
router.post("/reset-password", authControl.post_reset_password);

router.get("/new-password/:token", authControl.get_new_password);
router.post("/new-password/:token", authControl.post_new_password);


module.exports=router;