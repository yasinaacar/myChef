module.exports=(req, res, next)=>{
    if(!req.session.roles.includes("admin")){
        req.session.message={text: "you don't have access for this page, please login with access profile", class:"danger"};
        
        return res.redirect("/auth/login?returnUrl=" + req.originalUrl)

    }
    next()
}