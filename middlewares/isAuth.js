module.exports=(req,res,next)=>{
    if(!req.session.isAuth){
        req.session.message={text:"Firs of all you have to login for access this page", class:"warning"}
        return res.redirect("/auth/login?returnUrl="+req.originalUrl);
    }
    next();
}