function locals(req,res,next){
    res.locals.isAuth=req.session.isAuth;
    res.locals.fullname=req.session.fullname;
    res.locals.isAccess=req.session.roles ? req.session.roles.includes("admin") : false
    next();
}

module.exports=locals;