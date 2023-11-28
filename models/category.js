const { Schema, model }=require("mongoose");
const Joi=require("joi");

const categorySchema=new Schema({
    categoryCode: String,
    categoryImg: {
        type: String,
        default: "cay.jpg"
    },
    categoryName: {
        type: String,
        unique: true
    },
    url: String,
});

const Category=model("Category",categorySchema);

async function validateCategory(category){
    const schema=Joi.object({
        categoryName: Joi.string().required().min(2).max(30)
    })
    return schema.validate({categoryName: category.categoryName})
}

module.exports={ Category, validateCategory };