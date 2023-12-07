const generateCode=require("../public/js/genrateCode");
const slugfield=require("../helpers/slugfield");
const fs=require("fs");
const logger=require("../startup/logger");
const { Category, validateCategory }=require("../models/category");
const { Product, validateProduct }=require("../models/product");
const { Role, validateRole } = require("../models/role");
const { User, validateUser } = require("../models/user");
const { Table, validateTable } = require("../models/table");

//Category Operations
exports.post_category_create=async(req,res)=>{
    
    try {
        const isValidate=await validateCategory(req.body);
        if(isValidate.error){
            req.session.message={text:"Category Name must be minimum 2 character and maximum 30 character and can't pass empty", class: "warning"}
           return res.redirect("/admin/categories");
        }    
        const categoryName=req.body.categoryName;
        let categoryImg=req.file ? req.file.filename: "logo.jpg";
        const url=slugfield(categoryName);
        const category=await Category.create({categoryImg: categoryImg, categoryName: categoryName, url: url});
        const generatedCode=generateCode("CTG");
        category.categoryCode=generatedCode;
        await category.save();
        
        req.session.message={text:`"${categoryName}" added to categories`, class:"success"};
        return res.redirect("/admin/categories?action=create");        
    } catch (err) {
        if(err.code==11000){
            req.session.message={text:"Category Name is already exist", class: "warning"}
            return res.redirect("/admin/categories")
        }
    }

    
}
exports.get_category_edit=async(req,res)=>{
    const message=req.session.message;
    delete req.session.message
    const slug=req.params.slug;
    const category=await Category.findOne({url: slug});
    const products=await Product.find({categories:category._id}).populate("categories", "categoryName")
    return res.render("admin/category-edit",{
        title: "Category Edit",
        category: category,
        products: products,
        message: message
    });

}
exports.post_category_edit=async(req,res)=>{
    const categoryId=req.body.categoryId;
    const categoryName=req.body.categoryName;
    try {
        const isValidate=await validateCategory({categoryName});
        if(isValidate.error){
            const category=await Category.findById(categoryId);
            return res.render("admin/category-edit",{
                title: "Category Edit",
                category: category,
                message: {text:"Category Name must be minimum 2 character and maximum 30 character and can't pass empty", class: "warning"}
            });
        }    
    
        let categoryImg=req.body.categoryImg;
        if(req.file){
            categoryImg=req.file.filename;
        
            if(req.body.categoryImg != "logo.jpg"){
                fs.unlink("./public/images/"+req.body.categoryImg,err=>{
                    if(err){
                        logger.error("Category informations is edited but Category Image couldn't deleted", err);
                        logger.error("Undeleted Image: ", categoryImg);
                    }
                });
            }
        }
        const  categoryUrl=slugfield(categoryName);
        await Category.findByIdAndUpdate(categoryId, {categoryName: categoryName, categoryImg: categoryImg, url:categoryUrl});
        req.session.message={text:`Category of "${categoryName}" is updated `, class:"warning"};
        return res.redirect("/admin/categories?action=edit");

    } catch (err) {
        if(err.code==11000){
            const category=await Category.findById(categoryId);
            return res.render("admin/category-edit",{
                title: "Category Edit",
                category: category,
                message: {text:"Category Name is already exist", class: "warning"}
            });
        }
    }

    
}
exports.post_product_remove_from_category=async(req,res)=>{
    const productId=req.body.productId;
    const productName=req.body.productName;
    const categoryId=req.body.categoryId;
    console.log(productId);
    const categoryUrl=req.body.categoryUrl;

    await Category.findByIdAndUpdate(categoryId,{$pull: {products: productId}});
    await Product.findByIdAndUpdate(productId, {$pull: {categories: categoryId}});

    req.session.message={text: `${productName} removed from category`, class: "danger"};
    return res.redirect(`/admin/category/edit/${categoryUrl}`);
}
exports.post_category_delete=async(req,res)=>{
    const categoryId=req.body.categoryId;
    const categoryImg=req.body.categoryImg;
    if(categoryImg != "logo.jpg")
        fs.unlink("./public/images/"+categoryImg,err=>{
            if(err){
                logger.error("When deleting category  couldn't delete image",err)
            }
    })
    const category=await Category.findByIdAndDelete(categoryId);
    const products=await Product.find({categories: categoryId});
    for (const product of products) {
        await Product.findByIdAndUpdate(product._id,{$pull:{categories: categoryId}});
    }
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

//Product Operations
exports.get_product_create=async(req,res)=>{
    const message=req.session.message;
    delete req.session.message;
    const categories=await Category.find();
    return res.render("admin/product-create", {
        title: "Product Edit",
        message: message,
        categories: categories
    })
}
exports.post_product_create=async(req,res)=>{
    const productName=req.body.productName;
    const productPrice=req.body.productPrice;
    const productImg=req.file ? req.file.filename:"logo.jpg";
    const productDescription=req.body.productDescription;
    const isActive=req.body.isActive=="on" ? true:false;
    const categoryIds=req.body.categories;
    console.log(categoryIds);
    try {
        const validate=await validateProduct({productName, productPrice});
    
        if(validate.error){
            req.session.message={text:"Product Name and Price can't be empty also Product Name must be minimum 2 characters", class:"warning"};
            return res.redirect("/admin/product/create");
        }
        
        const url=slugfield(productName);

        const product=await Product.create({
            productImg: productImg,
            productName: productName,
            productDescription: productDescription,
            productPrice:productPrice,
            url:url,
            isActive: isActive,
            categories: categoryIds
        });
        const generatedCode=generateCode("PRD");
        product.productCode=generatedCode;
        await product.save();

        for (let categoryId of categoryIds) {
            await Category.findByIdAndUpdate(categoryId,{ $push: { products: product._id } });
        }

        return res.redirect("/admin/products");
    } catch (err) {
        if(err.code==11000){
            req.session.message={text:`Product name of ${productName} is already exist`, class:"warning"};
            return res.redirect("/admin/product/create");
        }
    }
}
exports.get_product_edit=async(req,res)=>{
    const url=req.params.slug;
    const message=req.session.message;
    delete req.session.message;
    const product=await Product.findOne({url: url}).populate("categories", "_id categoryName");
    const categories=await Category.find().select("_id categoryName");
    return res.render("admin/product-edit", {
        title: "Product Create",
        product: product,
        message: message,
        categories: categories
    })
}
exports.post_product_edit=async(req,res)=>{
    const productId=req.body.productId;
    const productName=req.body.productName;
    let productImg=req.body.productImg;
    const productDescription=req.body.productDescription;
    const productPrice=req.body.productPrice;
    const isActive=req.body.isActive=="on" ? true: false;
    let categoryIds=req.body.categoryIds;

    console.log(categoryIds)

    try {

        const validate=await validateProduct({productName, productPrice});

        if(validate.error){
            req.session.message={text:"Product Name and Price can't be empty also Product Name must be minimum 2 characters", class:"warning"};
            return res.redirect("/admin/product/create");
        }
        //image update and delete process
        if(req.file){
            productImg=req.file.filename;
            if(req.body.productImg != "logo.jpg"){
                fs.unlink("./public/images/"+req.body.productImg,err=>{
                    if(err){
                        logger.error("Category informations is edited but Category Image couldn't deleted", err);
                        logger.error(`Undeleted Image: ${productImg}`);
                    }
                });
            }
        }

        if(categoryIds==undefined){
            const categoryList=await Category.find({products: productId});
            categoryIds=[];
            for (const category of categoryList) {
                await Category.findByIdAndUpdate(category._id,{$pull : {products: productId}});
            }
        }
        await Product.findByIdAndUpdate(productId,{
            productName: productName,
            productPrice:productPrice,
            productImg:productImg,
            productDescription: productDescription,
            isActive: isActive,
            url: slugfield(productName),
            categories: categoryIds
        });
        for (let categoryId of categoryIds) {
            await Category.findByIdAndUpdate(categoryId,{ $push: { products: productId } });
        }
        req.session.message={text:`Product of "${productName}" is updated`, class:"success"};
        return res.redirect("/admin/products");
        
    } catch (err) {
        console.log(err)
        if(err.code==11000){
            const product=await Product.findOne({_id:productId}).select({url: 1, _id:0});
            req.session.message={text:`Product name of is already exist`, class:"warning"};
            return res.redirect(`/admin/product/edit/${product.url}`);
        }
    }
}
exports.post_product_delete=async(req,res)=>{
    const productId=req.body.productId;
    const productImg=req.body.productImg;

    await Product.findByIdAndDelete(productId);
    const categories=await Category.find({products: productId});
    for (const category of categories) {
        await Category.findByIdAndUpdate(category._id,{$pull: {products: productId}});
    }
    //image delete proccess
    if(productImg != "logo.jpg"){
        fs.unlink("./public/images/"+productImg,err=>{
            if(err){
                logger.error(`Product is deleted but productImg ${productImg} couldn't delete. ${err}`);
            }
        })
    };

    req.session.message={text:"Product is deleted", class:"danger"};
    return res.redirect("/admin/products");

}   
exports.get_products=async(req,res)=>{
    const message=req.session.message;
    delete req.session.message;
    const products= await Product.find().populate("categories","categoryName -_id");
    return res.render("admin/products", {
        title: "Products",
        products: products,
        message: message
    })
}

//Role Operations
exports.post_role_create=async(req,res)=>{
    try {
        const roleName=req.body.roleName;
        const validate=await validateRole(req.body);

        if(validate.error){
            req.session.message={text: "Role Name must contain minimum 2 maximum 30 character and not be empty", class:"warning"}
            return res.redirect("/admin/roles");
        }
        const role=await Role.create({roleName: roleName, url: slugfield(roleName)});
        const generatedCode=generateCode("ROL");
        role.roleCode=generatedCode;
        await role.save();
        return res.redirect("/admin/roles");

    } catch (err) {
        console.log(err);
        if(err.code==11000){
            req.session.message={text: "Role Name is already exist", class:"warning"};
            return res.redirect("/admin/roles");
        }
        return res.redirect("/admin/roles");
    }
}
exports.get_role_edit=async(req,res)=>{
    const message=req.session.message;
    delete req.session.message;
    const url=req.params.slug;
    const role=await Role.findOne({url:url});
    if(role._id=="656b0cb52c7c2a769ef56706" || role._id=="656b0caf2c7c2a769ef56702"){
        req.session.message={text:"This role can't be delete or edit", class:"warning"};
        return res.redirect("/admin/roles");
    }
    return res.render("admin/role-edit",{
        title: "Role Edit",
        role: role,
        message: message
    })
}
exports.post_role_edit=async(req,res)=>{
    const roleUrl=req.body.roleUrl;
    try {
        const roleName=req.body.roleName;
        const roleId=req.body.roleId;
        if(roleId=="656748837dde8369631d65e7" || roleId=="656748b34c29886e14ad11d2"){
            req.session.message={text:`This role can't delete`, class:"warning"}
            return res.redirect(`/admin/roles`);
        }
        const validate=await validateRole({roleName});
        if(validate.error){
            if(validate.error){
                req.session.message={text: "Role Name must contain minimum 2 maximum 30 character and not be empty", class:"warning"}
                return res.redirect(`/admin/role/edit/${roleUrl}`);
            }
        }
        const role=await Role.findByIdAndUpdate(roleId,{roleName: roleName});
        role.url=slugfield(roleName);
        await role.save();
        req.session.message={text:`${roleName} is updated`, class:"warning"};
        return res.redirect("/admin/roles");

    } catch (err) {
        if(err.code==11000){
            req.session.message={text: "Role Name is already exist", class:"warning"};
            return res.redirect(`/admin/role/edit/${roleUrl}`);
        }
    }
    
}
exports.post_role_delete=async(req,res)=>{
    const roleName=req.body.roleName;
    const roleId=req.body.roleId;
    if(roleId=="656b0cb52c7c2a769ef56706" || roleId=="656b0caf2c7c2a769ef56702"){
        req.session.message={text:"This role can't be delete or edit", class:"warning"};
        return res.redirect("/admin/roles");
    }
    await Role.findByIdAndDelete(roleId);
    req.session.message={text:`${roleName} is deleted`, class:"danger"}
    return res.redirect("/admin/roles"); 
}
exports.get_roles=async(req,res)=>{
    const message=req.session.message;
    delete req.session.message;
    const roles= await Role.find();
    return res.render("admin/roles", {
        title: "Roles",
        roles: roles,
        message: message
    })
}

//User Operations
exports.get_users=async(req,res)=>{
    const message=req.session.message;
    delete req.session.message;
    const users= await User.find().populate("roles", "roleName");
    const roles=await Role.find();
    return res.render("admin/users", {
        title: "Users",
        users: users,
        roles: roles,
        message: message
    })
}

//Table Operations
exports.post_table_create=async(req,res)=>{
    const tableName=req.body.tableName;
    try {

        const validate=await validateTable(req.body);

        if(validate.error){
            req.session.message={text:`Table Name not be empty and must contain minimum 1 character`, class:"warning"};
            return res.redirect("/admin/tables");
        }

        const table=await Table.create({tableName: tableName, url: slugfield(tableName)});
        table.tableCode=generateCode("TBL");
        await table.save();

        req.session.message={text:`${tableName} is added to table`, class:"success"};
        return res.redirect("/admin/tables");

        
    } catch (err) {
        if(err.code==11000){
            req.session.message={text:`"${tableName}" name is already exist to table. Note: İf u thinking have a error please contact developer`, class:"warning"};
            return res.redirect("/admin/tables");
        }
    }
};
exports.post_table_edit=async(req,res)=>{
    const tableId=req.body.tableId;
    const tableName=req.body.tableName;
    
    try {
        const validate=await validateTable({tableName});

        if(validate.error){
            req.session.message={text:`Table Name not be empty and must contain minimum 1 character`, class:"warning"};
            return res.redirect("/admin/tables");
        };

        await Table.findByIdAndUpdate(tableId,{tableName:tableName, url:slugfield(tableName)});

        req.session.message={text:`The table named ${tableName} is updated`, class:"success"};
        return res.redirect("/admin/tables")

    } catch (err) {
        console.log(err)
    }
};
exports.post_table_delete=async(req,res)=>{
    const tableId=req.body.tableId;
    
    await Table.findByIdAndDelete(tableId);
    const tableName=req.body.tableName;
    req.session.message={text:`The table named ${tableName} was deleted`, class:"danger"};
    return res.redirect("/admin/tables");
};
exports.get_tables=async(req,res)=>{
    const message=req.session.message;
    delete req.session.message;
    const tables=await Table.find();
    return res.render("admin/tables",{
        title: "Tables",
        message: message,
        tables: tables
    })
};