const express=require("express");
const adminController=require("../controllers/adminControl");
const imageUpload=require("../helpers/imageUpload");
const isAuth=require("../middlewares/isAuth");
const isAccess=require("../middlewares/isAccess");

const router=express.Router();

//category routes
router.post("/category/create",isAuth, isAccess, imageUpload.upload.single("categoryImg"), adminController.post_category_create);
router.get("/category/edit/:slug", isAuth, isAccess, adminController.get_category_edit);
router.post("/category/edit/:slug",imageUpload.upload.single("categoryImg"), isAuth, isAccess, adminController.post_category_edit);
router.post("/category/remove/:productId", isAuth, isAccess, adminController.post_product_remove_from_category);
router.post("/category/delete/:categoryId", isAuth, isAccess, adminController.post_category_delete);
router.get("/categories", isAuth, isAccess, adminController.get_categories);

//product routes
router.get("/product/create", isAuth, isAccess, adminController.get_product_create);
router.post("/product/create", imageUpload.upload.single("productImg"),isAuth, isAccess, adminController.post_product_create);
router.get("/product/edit/:slug", isAuth, isAccess, adminController.get_product_edit);
router.post("/product/edit/:slug", imageUpload.upload.single("productImg"),isAuth, isAccess, adminController.post_product_edit);
router.post("/product/delete/:productId",isAuth, isAccess, adminController.post_product_delete);
router.get("/products", isAuth, isAccess, adminController.get_products);

//role routes
router.post("/role/create", isAuth, isAccess, adminController.post_role_create);
router.get("/role/edit/:slug", isAuth, isAccess, adminController.get_role_edit);
router.post("/role/edit/:slug", isAuth, isAccess, adminController.post_role_edit);
router.post("/role/delete/:id", isAuth, isAccess, adminController.post_role_delete);
router.get("/roles", isAuth, isAccess, adminController.get_roles);

//user routes
router.get("/users", isAuth, isAccess, adminController.get_users);


module.exports=router;