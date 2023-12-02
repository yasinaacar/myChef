const express=require("express");
const adminController=require("../controllers/adminControl");
const imageUpload=require("../helpers/imageUpload");

const router=express.Router();

//category routes
router.post("/category/create", imageUpload.upload.single("categoryImg"), adminController.post_category_create);
router.get("/category/edit/:slug", adminController.get_category_edit);
router.post("/category/edit/:slug",imageUpload.upload.single("categoryImg"), adminController.post_category_edit);
router.post("/category/remove/:productId", adminController.post_product_remove_from_category);
router.post("/category/delete/:categoryId", adminController.post_category_delete);
router.get("/categories", adminController.get_categories);

//product routes
router.get("/product/create", adminController.get_product_create);
router.post("/product/create", imageUpload.upload.single("productImg"),adminController.post_product_create);
router.get("/product/edit/:slug", adminController.get_product_edit);
router.post("/product/edit/:slug", imageUpload.upload.single("productImg"),adminController.post_product_edit);
router.post("/product/delete/:productId",adminController.post_product_delete);
router.get("/products", adminController.get_products);

//role routes
router.post("/role/create", adminController.post_role_create);
router.get("/role/edit/:slug", adminController.get_role_edit);
router.post("/role/edit/:slug", adminController.post_role_edit);
router.post("/role/delete/:id", adminController.post_role_delete);
router.get("/roles", adminController.get_roles);

module.exports=router;