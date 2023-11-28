const Category=require("../models/category");

exports.get_homepage=async (req, res)=>{
    return res.render("user/homepage", {
        title: "Homepage"
    })
}

exports.get_menu=async (req, res)=>{
    const categories=await Category.find();
    console.log("categories-------->", categories);
    return res.render("user/menu", {
        title: "menu",
        categories: categories
    })
}