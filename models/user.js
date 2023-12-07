const { Schema, model }=require("mongoose");
const Joi=require("joi");

const userSchmea=new Schema({
    userCode:String,
    fullname: {
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true,

    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
    },
    gender: Boolean,
    token: String,
    tokenExpiration: Date,
    createdDate:{
        type: Date,
        default: Date.now
    },
    updatedDate:{
        type: Date,
        default: Date.now
    },
    roles:[{type:Schema.Types.ObjectId, ref:"Role"}]
});

const User=model("User", userSchmea);

async function validateUserRegister(user){
    const schema=Joi.object({
        fullname: Joi.string().required().min(3).max(50),
        email: Joi.string().required().email(),
        password: Joi.string().required().min(6).max(15),
    });
    return schema.validate({fullname: user.fullname, email: user.email, password: user.password});
};

async function validateUserLogin(user){
    const schema=Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().required().min(6).max(15),
    });
    return schema.validate({email: user.email, password: user.password});
};

async function validateUserNewPassword(user){
    const schema=Joi.object({
        password: Joi.string().required().min(6).max(15),
    });
    return schema.validate(user);
};

module.exports={ User, validateUserRegister, validateUserLogin, validateUserNewPassword};