const { Schema, model }=require("mongoose");

const categorySchema=new Schema({
    categoryCode: String,
    categoryImg: {
        type: String,
        default: "cay.jpg"
    },
    categoryName: String,
    url: String,
});

const Category=model("Category",categorySchema);

module.exports=Category;