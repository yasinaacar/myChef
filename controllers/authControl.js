const {User, validateUserRegister, validateUserLogin, validateUserNewPassword}=require("../models/user");
const {Role}=require("../models/role");
const bcrypt=require("../helpers/bcrypt");
const generateCode=require("../public/js/genrateCode");
const emailSender=require("../helpers/emailSender");
const config=require("config");
const logger=require("../startup/logger");
const jwt=require("jsonwebtoken");
const isAuth = require("../middlewares/isAuth");

exports.get_register=async(req,res)=>{
    const message=req.session.message;
    delete req.session.message;
    return res.render("auth/register",{
        title: "Register",
        message: message,
    })
};

exports.post_register=async(req,res)=>{
    const fullname=req.body.fullname;
    const email=req.body.email;
    const phone=req.body.phone;
    const password=req.body.password;
    const passwordAgain=req.body.passwordAgain;
    const isAccept=req.body.isAccept=="on" ? true: false;

    try {

        const validate=await validateUserRegister({fullname, email, password});
        if(validate.error){
            req.session.message={text:`All input areas must contain value and must be accept terms & conditions. ${validate.error.details[0].message}`, class:"warning"};
            return res.redirect("/auth/register");
        }
        if(password==passwordAgain){
            req.session.message={text:"Password and Password Again must be same", class:"warning"};
            return res.redirect("/auth/register");
        }

        const hashedPassword=await bcrypt.hash(password);
        const user= await User.create({fullname: fullname, email: email, phone:phone, password: hashedPassword, isAccept: isAccept});
        user.userCode=generateCode("USR");
        user.updatedDate=Date.now();
        const role= await Role.findOne({roleName:"customer"}).select("_id");
        user.roles=role._id;
        await user.save();
        const sendedMail=await emailSender.sendMail({
            from: config.get("email.from"),
            to: user.email,
            subject: "Welcome To MyChef",
            html:"<h1>Welcome To myChef</h1><br><p>Now u can use web application and you can create order or make a payment</p>"
        });
        logger.info(`E-mail is sended to new user (${email}) More Info: ${sendedMail.messageId}`);
        return res.redirect("/auth/register");
    } catch (err) {
        console.log(err);
        if(err.code==11000){
            if(err.keyValue.email){
                req.session.message={text:`"${email} this email already exist"`, class:"warning"};
            }
            return res.redirect("/auth/register");
        }
    }

};

exports.get_login=async(req,res)=>{
    const message=req.session.message;
    delete req.session.message;
    return res.render("auth/login",{
        title: "Login",
        message: message,
    })
};
exports.post_login=async(req,res)=>{
    const url=req.query.returnUrl;
    const email=req.body.email;
    const password=req.body.password;
    

    const validate=await validateUserLogin(req.body);

    if(validate.error){
        req.session.message={text: `E-Mail and Password not be empty , ${validate.error.details[0].message}`, class:"warning"};
        return res.redirect("/auth/login")
    }

    const user=await User.findOne({email: email}).populate("roles", "_id roleName");

    if(!user){
        req.session.message={text: `No account for this ${email}`, class:"warning"};
        return res.redirect("/auth/login")
    }
    const match=await bcrypt.compare(password,user.password);
    if(!match){
        req.session.message={text: `Wrong Password `, class:"warning"};
        return res.redirect("/auth/login");
    }
    if(isAuth){
        req.session.isAuth=false;
    }
    req.session.isAuth=true;
    req.session.fullname=user.fullname;
    req.session.userId=user._id;
    req.session.roles=user.roles.map((role)=>role["roleName"]);
    if(req.session.roles.includes("admin")){
        req.session.isAdmin="admin"
    }
    return res.redirect(url==undefined ? "/menu":url);
};

exports.post_logout=async(req,res)=>{
    await req.session.destroy();
    return res.redirect("/auth/login")
};

exports.get_reset_password=async(req,res)=>{
    const message=req.session.message;
    delete req.session.message;
    return res.render("auth/reset-password",{
        title: "Reset Password",
        message: message
    });
};

exports.post_reset_password=async(req,res)=>{
    const email=req.body.email;
    const user=await User.findOne({email: email});
    const userId=user._id;
    if(!user){
        req.session.message={text: `No account for this address -->  ${email} `, class:"warning"};
        return res.redirect("/auth/reset-password")
    }
    const token=await jwt.sign({userId}, config.get("jwtKey"));
    user.token=token;
    user.tokenExpiration=Date.now() + (1000*60*4);
    await user.save();
    const sendedMail=await emailSender.sendMail({
        from: config.get("email.from"),
        to: email,
        subject: "reset Password || myChef",
        html:`<h1>Welcome To myChef</h1><br><p>Dear ${user.fullname}, you can reset your password with this <a href="http://127.0.0.1:3000/auth/new-password/${token}">link</a></p>`
    });
    logger.info(`E-mail is sended for reset password to this (${email}) adress More Info: ${sendedMail.messageId}`);
    req.session.message={text: `We sended you mail about reset password. Don't forget check the spam :) `, class:"warning"};

    return res.redirect("/auth/reset-password")

};

exports.get_new_password=async(req,res)=>{
    const message=req.session.message;
    delete req.session.message;
    return res.render("auth/new-password",{
        title: "New Password",
        message: message
    });
};

exports.post_new_password=async(req,res)=>{
    const token=req.params.token;
    const password=req.body.password;

    const user=await User.findOne({token: token});

    if(!user){
        req.session.message={text:"User couldn't find please try again", class:"warning"};
        return res.redirect("/auth/reset-password");
    };
    
    const now= new Date(); //for token expiration
    if(user.tokenExpiration<now){
        req.session.message={text: "Link time is ended, please try again and take new link", class:"danger"};
        user.token=null;
        user.tokenExpiration=null;
        await user.save();
        return res.redirect("/auth/reset-password");
    };
    const validate=await validateUserNewPassword(req.body);
     
    if(validate.error){
        req.session.message={text: `${validate.error.details[0].message}`, class:"warning"};
        return res.redirect("/auth/new-password");
    };

    user.password=await bcrypt.hash(password);
    user.token=null;
    user.tokenExpiration=null;
    await user.save();
    req.session.message={text: `Password is updated, You can login your account`, class:"success"};
    return res.redirect("/auth/login")

}