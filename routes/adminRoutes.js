const express=require("express");
const adminController=require("../controllers/adminControl");
const imageUpload=require("../helpers/imageUpload");
const isAuth=require("../middlewares/isAuth");
const isAdmin=require("../middlewares/isAdmin");

const router=express.Router();

//category routes
router.post("/category/create",isAuth, isAdmin, imageUpload.upload.single("categoryImg"), adminController.post_category_create);
router.get("/category/edit/:slug", isAuth, isAdmin, adminController.get_category_edit);
router.post("/category/edit/:slug",imageUpload.upload.single("categoryImg"), isAuth, isAdmin, adminController.post_category_edit);
router.post("/category/remove/:productId", isAuth, isAdmin, adminController.post_product_remove_from_category);
router.post("/category/delete/:categoryId", isAuth, isAdmin, adminController.post_category_delete);
router.get("/categories", isAuth, isAdmin, adminController.get_categories);

//product routes
router.get("/product/create", isAuth, isAdmin, adminController.get_product_create);
router.post("/product/create", imageUpload.upload.single("productImg"),isAuth, isAdmin, adminController.post_product_create);
router.get("/product/edit/:slug", isAuth, isAdmin, adminController.get_product_edit);
router.post("/product/edit/:slug", imageUpload.upload.single("productImg"),isAuth, isAdmin, adminController.post_product_edit);
router.post("/product/delete/:productId",isAuth, isAdmin, adminController.post_product_delete);
router.get("/products", isAuth, isAdmin, adminController.get_products);

//role routes
router.post("/role/create", isAuth, isAdmin, adminController.post_role_create);
router.get("/role/edit/:slug", isAuth, isAdmin, adminController.get_role_edit);
router.post("/role/edit/:slug", isAuth, isAdmin, adminController.post_role_edit);
router.post("/role/remove/:id", isAuth, isAdmin, adminController.post_remove_user_from_role);
router.post("/role/delete/:id", isAuth, isAdmin, adminController.post_role_delete);
router.get("/roles", isAuth, isAdmin, adminController.get_roles);

//user routes
router.post("/user/edit/:id", isAuth, isAdmin, adminController.post_user_edit);
router.get("/users", isAuth, isAdmin, adminController.get_users);

//table routes
router.post("/table/create", isAuth, isAdmin, adminController.post_table_create);
router.post("/table/edit/:id", isAuth, isAdmin, adminController.post_table_edit);
router.post("/table/delete/:id", isAuth, isAdmin, adminController.post_table_delete);
router.get("/tables", isAuth, isAdmin, adminController.get_tables);


module.exports=router;