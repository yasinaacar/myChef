const { Schema, model }=require("mongoose");
const Joi=require("joi");

const productSchema=new Schema({
    productCode: String,
    productImg:{
        type: String,
        default: "logo.jpg"
    },
    productName:{
        type: String,
        unique: true
    },
    productPrice: Number,
    productDescription:{
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    url: String,
    createdDate:{
        type: Date,
        default: Date.now 
    },
    categories:[{type:Schema.Types.ObjectId, ref:"Category"}]

});

const Product=model("Product", productSchema);

async function validateProduct(product){
    const schema=Joi.object({
        productName: Joi.string().required().min(2),
        productPrice: Joi.number().required()
    })

    return schema.validate({productName: product.productName, productPrice: product.productPrice})
}

module.exports= { Product, validateProduct }