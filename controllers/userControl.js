const {Category}=require("../models/category");
const {Product}=require("../models/product");

exports.get_homepage=async (req, res)=>{
    return res.render("user/homepage", {
        title: "Homepage"
    })
}

exports.get_menu=async (req, res)=>{
    const categories=await Category.find();
    return res.render("user/category-menu", {
        title: "Menus",
        categories: categories
    })
}

exports.get_product_list=async (req, res)=>{
    const url=req.params.slug;
    console.log(url)
    const products=await Category.findOne({url:url}).populate("products");
    console.log(products.products)
    return res.render("user/product-list", {
        title: products.categoryName,
        products: products.products
    })
}