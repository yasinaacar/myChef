const express=require("express");
const adminController=require("../controllers/adminControl");
const imageUpload=require("../helpers/imageUpload");

const router=express.Router();

router.post("/category/create", imageUpload.upload.single("categoryImg"), adminController.post_category_create);
router.get("/category/edit/:slug", adminController.get_category_edit);
router.post("/category/edit/:slug",imageUpload.upload.single("categoryImg"), adminController.post_category_edit);
router.post("/category/delete/:categoryId", adminController.post_category_delete);
router.get("/categories", adminController.get_categories);

module.exports=router;