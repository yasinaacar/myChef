const Category=require("../models/category");
const generateCode=require("../public/js/genrateCode");
const slugfield=require("../helpers/slugfield");
const fs=require("fs");
const logger=require("../startup/logger");

exports.post_category_create=async(req,res)=>{
    const categoryName=req.body.categoryName;
    const categoryImg=req.file.filename;
    const url=slugfield(categoryName);
    const category=await Category.create({categoryImg: categoryImg, categoryName: categoryName, url: url});
    const generatedCode=generateCode("CTG");
    category.categoryCode=generatedCode;
    await category.save();
    
    req.session.message={text:`"${categoryName}" added to categories`, class:"success"};
    return res.redirect("/admin/categories?action=create");
}
exports.get_category_edit=async(req,res)=>{
    const slug=req.params.slug;
    const category=await Category.findOne({url: slug});
    return res.render("admin/category-edit",{
        title: "Category Edit",
        category: category
    });
}
exports.post_category_edit=async(req,res)=>{
    const categoryId=req.body.categoryId;
    const categoryName=req.body.categoryName;
    let categoryImg=req.body.categoryImg;
    if(req.file){
        categoryImg=req.file.filename;

        fs.unlink("./public/images/"+req.body.categoryImg,err=>{
            if(err){
                logger.error("Category informations is edited but Category Image couldn't deleted", err);
                logger.error("Undeleted Image: ", categoryImg);
            }
        });
    }

    const  categoryUrl=slugfield(categoryName);
    await Category.findByIdAndUpdate(categoryId, {categoryName: categoryName, categoryImg: categoryImg, url:categoryUrl});
    req.session.message={text:`Category of "${categoryName}" is updated `, class:"warning"};
    return res.redirect("/admin/categories?action=edit");
}
exports.post_category_delete=async(req,res)=>{
    const categoryId=req.body.categoryId;
    const categoryImg=req.body.categoryImg;
    fs.unlink("./public/images/"+categoryImg,err=>{
        if(err){
            logger.error("When deleting category  couldn't delete image",err)
        }
    })
    const category=await Category.findByIdAndDelete(categoryId);
    req.session.message={text:`Category of "${category.categoryName}" has been deleted from categories`, class:"danger"}    
    return res.redirect("/admin/categories?action=delete");
}

exports.get_categories=async(req,res)=>{
    const message=req.session.message;
    delete req.session.message;
    const categories=await Category.find();
    return res.render("admin/categories",{
        title: "Categories",
        categories: categories,
        message: message
    })
}